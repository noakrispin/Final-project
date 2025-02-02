import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { BlurElements } from "../../components/shared/BlurElements";
import ProjectsTable from "../../components/admin/ProjectsTable";
import ProjectStats from "../../components/admin/ProjectStats";
import NotesModal from "../../components/actions/NotesModal";
import StudentDetailsModal from "../../components/ui/StudentDetailsModal";
import EditFieldModal from "../../components/actions/EditTitleModal";
import { useProjectModals } from "../../hooks/useProjectModals";
import { projectsApi } from "../../services/projectsAPI";
import { evaluatorsApi } from "../../services/evaluatorsAPI";
import { gradesApi } from "../../services/finalGradesAPI";

import { userApi } from "../../services/userAPI";
import { db } from "../../firebaseConfig";
import ConfirmationModal from "../../components/shared/ConfirmationModal";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { MdOutlineFileUpload } from "react-icons/md";
import LoadingScreen from "../../components/shared/LoadingScreen";
import * as XLSX from "xlsx";

const TABS = ["All Projects", "Part A", "Part B"];

const getTabDescription = (tab) => {
  switch (tab) {
    case "All Projects":
      return `Here you can view and manage all projects, including both Part A and Part B projects. Use the filters above to focus on specific project types. `;
    case "Part A":
      return `These are all Part A projects, typically focused on project planning and initial development phases. `;
    case "Part B":
      return `These are all Part B projects, usually involving implementation and completion phases.`;
    default:
      return "";
  }
};

const AdminProjects = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [supervisorMap, setSupervisorMap] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isProcessing: false,
  });
  const showWarningModal = (title, message) => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => setConfirmationModal({ isOpen: false }), // closes the modal
      isProcessing: false,
      isWarning: true,
    });
  };
  const {
    notesModal,
    studentModal,
    editModal,
    setEditModal,
    handleAddNote,
    handleStudentClick,
    handleEditField,
    handleSaveField,
    closeStudentModal,
    closeNotesModal,
  } = useProjectModals(projects, setProjects);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    project: null,
  });

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        // Fetch all projects
        const fetchedProjects = await projectsApi.getAllProjects();

        // Extract unique supervisor emails
        const supervisorEmails = [
          ...new Set(
            fetchedProjects
              .flatMap((project) => [project.supervisor1, project.supervisor2])
              .filter(Boolean) // Remove empty values
          ),
        ];

        // Fetch supervisor details
        const supervisorDetails = await Promise.all(
          supervisorEmails.map(async (email) => {
            try {
              const userResponse = await userApi.getUser(email);
              return {
                email: userResponse.email,
                fullName: userResponse.fullName || email, // Use email as fallback
              };
            } catch (error) {
              console.error(
                `Error fetching supervisor with ID ${email}:`,
                error
              );
              // If the user doesn't exist, just return the email.
              return { email, fullName: email };
            }
          })
        );

        // Create a map of supervisor emails to their full names
        const supervisorMapping = supervisorDetails.reduce(
          (acc, supervisor) => {
            acc[supervisor.email] = supervisor.fullName;
            return acc;
          },
          {}
        );

        setSupervisorMap(supervisorMapping); // Update the state

        // Map supervisor names, students, and formatted deadlines to projects
        const projectsWithDetails = fetchedProjects.map((project) => {
          const deadline =
            project.deadline && project.deadline._seconds
              ? new Date(project.deadline._seconds * 1000).toLocaleDateString()
              : "No Deadline";

          const students = [
            project.Student1 || null,
            project.Student2 || null,
          ].filter(Boolean); // Keep only valid student objects

          // Use supervisorMapping if available; otherwise, fallback to the email.
          const s1Full =
            supervisorMapping[project.supervisor1] || project.supervisor1;
          const s2Full = project.supervisor2
            ? supervisorMapping[project.supervisor2] || project.supervisor2
            : "";

          return {
            ...project,
            // For UI display
            supervisor1: s1Full,
            supervisor2: s2Full,
            // Additional fields for export purposes:
            supervisor1FullName: s1Full,
            supervisor1Email: project.supervisor1,
            supervisor2FullName: s2Full || "",
            supervisor2Email: project.supervisor2 || "",
            students,
            deadline,
          };
        });

        setProjects(projectsWithDetails);
      } catch (err) {
        console.error("Error fetching projects:", err.message);
        setError("Failed to load projects.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleMoveToPartB = () => {
    if (projects.some((project) => project.part === "B")) {
      showWarningModal(
        "Cannot Move to Part B",
        "Part B must be empty before transferring projects from Part A."
      );
      return;
    }

    setConfirmationModal({
      isOpen: true,
      title: "Confirm Move to Part B",
      message:
        "Are you sure you want to move all Part A projects to Part B? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmationModal((prev) => ({ ...prev, isProcessing: true }));
        await moveToPartB();
        setConfirmationModal({ isOpen: false, isProcessing: false });
      },
      isProcessing: false,
    });
  };

  const moveToPartB = async () => {
    try {
      const batch = [];

      const partAProjects = projects.filter((project) => project.part === "A");
      for (const project of partAProjects) {
        const projectCode = project.projectCode;
        if (!projectCode) {
          console.error("Skipping project with missing projectCode:", project);
          continue; // Skip if projectCode is undefined
        }

        // Step 1: Delete all evaluator records EXCEPT those with formID = "SupervisorForm"
        const evaluatorsQuery = query(
          collection(db, "evaluators"),
          where("projectCode", "==", projectCode)
        );
        const evaluatorsSnapshot = await getDocs(evaluatorsQuery);

        for (const evaluatorDoc of evaluatorsSnapshot.docs) {
          const evaluatorData = evaluatorDoc.data();
          if (evaluatorData.formID === "SupervisorForm") {
            // Reset supervisors' status to "Not Submitted" instead of deleting them
            await updateDoc(evaluatorDoc.ref, { status: "Not Submitted" });
            console.log(`Reset supervisor evaluator: ${evaluatorDoc.id}`);
          } else {
            // Delete all other evaluator records
            await deleteDoc(evaluatorDoc.ref);
            console.log(`Deleted evaluator with ID: ${evaluatorDoc.id}`);
          }
        }

        // Step 2: Reset finalGrades and update the 'part' field for the project
        const gradesQuery = query(
          collection(db, "finalGrades"),
          where("projectCode", "==", projectCode)
        );
        const gradesSnapshot = await getDocs(gradesQuery);

        for (const gradeDoc of gradesSnapshot.docs) {
          const gradeRef = gradeDoc.ref;
          await updateDoc(gradeRef, {
            CalculatedBookGrade: null,
            CalculatedPresentationGrade: null,
            CalculatedSupervisorGrade: null,
            finalGrade: null,
            part: "B", // Update the part field to "B"
            status: "Not graded",
          });
          console.log(
            `Updated grade with ID: ${gradeDoc.id} and set part to B`
          );
        }

        // Step 3: Delete all Evaluations and Responses in Forms Table linked to this project
        const formsQuery = collection(db, "forms");
        const formsSnapshot = await getDocs(formsQuery);

        for (const formDoc of formsSnapshot.docs) {
          // Delete evaluations subcollection
          const evaluationsRef = collection(formDoc.ref, "evaluations");
          const evaluationsSnapshot = await getDocs(
            query(evaluationsRef, where("projectCode", "==", projectCode))
          );

          for (const evaluationDoc of evaluationsSnapshot.docs) {
            await deleteDoc(evaluationDoc.ref);
            console.log(`Deleted evaluation for project: ${projectCode}`);
          }

          // Delete responses subcollection
          const responsesRef = collection(formDoc.ref, "responses");
          const responsesSnapshot = await getDocs(
            query(responsesRef, where("projectCode", "==", projectCode))
          );

          for (const responseDoc of responsesSnapshot.docs) {
            await deleteDoc(responseDoc.ref);
            console.log(`Deleted response for project: ${projectCode}`);
          }
        }

        // Step 4: Update the project's part to "B"
        const projectRef = doc(db, "projects", project.id);
        batch.push({ ref: projectRef, data: { part: "B" } });
      }

      // Commit batch updates for project part change
      for (const update of batch) {
        await updateDoc(update.ref, update.data);
        console.log(`Updated project to Part B: ${update.ref.id}`);
      }

      // Update local state
      setProjects((current) =>
        current.map((project) =>
          project.part === "A" ? { ...project, part: "B" } : project
        )
      );
      //show success modal
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000); // Auto-dismiss after 2s
    } catch (err) {
      console.error("Error moving projects to Part B:", err);
      alert("An error occurred while moving projects to Part B.");
    }
  };

  const handleExportAndDelete = () => {
    if (!projects.some((project) => project.part === "B")) {
      showWarningModal(
        "No Part B Projects Found",
        "There are no projects in Part B to export and delete."
      );
      return;
    }

    setConfirmationModal({
      isOpen: true,
      title: "Confirm Export & Delete",
      message:
        "Are you sure you want to export and delete all Part B projects?  Please ensure that you have exported the files from Grades tab. This action cannot be undone. ",
      onConfirm: async () => {
        setConfirmationModal((prev) => ({ ...prev, isProcessing: true }));
        await exportToExcel();
        setConfirmationModal({ isOpen: false, isProcessing: false });
      },
      isProcessing: false,
    });
  };

  const isPlaceholderRecord = (record) => {
    return (
      record.projectCode?.toLowerCase().includes("placeholder") ||
      record.studentID === null ||
      record.evaluatorID?.toLowerCase().includes("placeholder") ||
      record.evaluatorID?.toLowerCase() === null
    );
  };

  const exportToExcel = async () => {
    try {
      const partBProjects = projects.filter((project) => project.part === "B");

      if (partBProjects.length === 0) {
        alert("No projects in Part B to export.");
        return;
      }
      console.log("supervisor mapping:", supervisorMap);

      //export details of part B projects to excel
      // Export Part B Projects
      // ========================
      const projectExportData = partBProjects.map((project) => ({
        "Project Code": project.projectCode,
        "Project Title": project.title,
        "Project Description": project.description,
        "Project Type": project.type,
        "GitHub Link": project.gitLink|| "",
        "Special Notes": project.specialNotes || "",
        "Student 1 Full Name": project.Student1?.fullName || "",
        "Student 1 ID": project.Student1?.ID || "",
        "Student 1 Email": project.Student1?.Email || "",
        "Student 2 Full Name": project.Student2?.fullName || "",
        "Student 2 ID": project.Student2?.ID || "",
        "Student 2 Email": project.Student2?.Email || "",
        "Supervisor 1 Full Name": project.supervisor1FullName,
        "Supervisor 1 Email": project.supervisor1Email,
        "Supervisor 2 Full Name": project.supervisor2FullName|| "",
        "Supervisor 2 Email": project.supervisor2Email|| "",
      }));
      const projectSheet = XLSX.utils.json_to_sheet(projectExportData);
      const projectWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        projectWorkbook,
        projectSheet,
        "Part B Projects"
      );
      XLSX.writeFile(projectWorkbook, "PartB_Projects.xlsx");
      console.log("Exported Part B projects to Excel");


      // Export Final Grades
      const grades = await gradesApi.getAllGrades();
      // Filter out placeholder grade records
      const validGrades = grades.filter((grade) => !isPlaceholderRecord(grade));
      const finalGradesExportData = validGrades.map((grade) => {
        // Find the corresponding project by projectCode
        const project = projects.find(
          (p) => p.projectCode === grade.projectCode
        );
        let studentFullName = "Unknown Student";
        if (project) {
          // Check which student (Student1 or Student2) matches the grade's studentID
          if (project.Student1 && project.Student1.ID === grade.studentID) {
            studentFullName =
              project.Student1.fullName ||
              `${project.Student1.firstName || ""} ${
                project.Student1.lastName || ""
              }`.trim();
          } else if (
            project.Student2 &&
            project.Student2.ID === grade.studentID
          ) {
            studentFullName =
              project.Student2.fullName ||
              `${project.Student2.firstName || ""} ${
                project.Student2.lastName || ""
              }`.trim();
          }
        }
        return {
          "Project Code": grade.projectCode,
          "Student Full Name": studentFullName,
          "Student ID": grade.studentID,
          Part: grade.part,
          "Calculated Book Grade": grade.CalculatedBookGrade,
          "Calculated Presentation Grade": grade.CalculatedPresentationGrade,
          "Calculated Supervisor Grade": grade.CalculatedSupervisorGrade,
          "Final Grade": Math.round(grade.finalGrade),
        };
      });
      const gradesSheet = XLSX.utils.json_to_sheet(finalGradesExportData);
      const gradesWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(gradesWorkbook, gradesSheet, "Final Grades");
      XLSX.writeFile(gradesWorkbook, "FinalGrades.xlsx");
      console.log("Exported Final Grades to Excel");

    
      // Export Evaluators
      const evaluators = await evaluatorsApi.getAllEvaluators();
      const validEvaluators = evaluators.filter(
        (evaluator) => !isPlaceholderRecord(evaluator)
      );
      const evaluatorsExportData = validEvaluators.map((evaluator) => {
        return {
          "Project Code": evaluator.projectCode,
          "Evaluator Email": evaluator.evaluatorID,
          "Evaluator Full Name":
            supervisorMap[evaluator.evaluatorID] || evaluator.evaluatorID,
          "Form ID": evaluator.formID,
          Status: evaluator.status,
        };
      });
      const evaluatorSheet = XLSX.utils.json_to_sheet(evaluatorsExportData);
      const evaluatorWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        evaluatorWorkbook,
        evaluatorSheet,
        "Evaluators"
      );
      XLSX.writeFile(evaluatorWorkbook, "Evaluators.xlsx");
      console.log("Exported Evaluators to Excel");
      console.log("Exported Evaluators and Final Grades to Excel");

      // Delete related data for Part B Projects
      for (const project of partBProjects) {
        const projectCode = project.projectCode;

        // Fetch and delete evaluators
        const evaluatorsQuery = query(
          collection(db, "evaluators"),
          where("projectCode", "==", projectCode)
        );
        const evaluatorsSnapshot = await getDocs(evaluatorsQuery);

        for (const evaluatorDoc of evaluatorsSnapshot.docs) {
          await deleteDoc(doc(db, "evaluators", evaluatorDoc.id));
          console.log(`Deleted evaluator with ID: ${evaluatorDoc.id}`);
        }

        // Fetch and delete grades
        const gradesQuery = query(
          collection(db, "finalGrades"),
          where("projectCode", "==", projectCode)
        );
        const gradesSnapshot = await getDocs(gradesQuery);

        for (const gradeDoc of gradesSnapshot.docs) {
          await deleteDoc(doc(db, "finalGrades", gradeDoc.id));
          console.log(`Deleted grade with ID: ${gradeDoc.id}`);
        }

        // Delete evaluations and responses in the forms table
        const formsQuery = collection(db, "forms");
        const formsSnapshot = await getDocs(formsQuery);

        for (const formDoc of formsSnapshot.docs) {
          // Delete evaluations subcollection
          const evaluationsRef = collection(formDoc.ref, "evaluations");
          const evaluationsSnapshot = await getDocs(
            query(evaluationsRef, where("projectCode", "==", projectCode))
          );

          for (const evaluationDoc of evaluationsSnapshot.docs) {
            await deleteDoc(evaluationDoc.ref);
            console.log(
              `Deleted evaluation with ID: ${evaluationDoc.id} in forms`
            );
          }

          // Delete responses subcollection
          const responsesRef = collection(formDoc.ref, "responses");
          const responsesSnapshot = await getDocs(
            query(responsesRef, where("projectCode", "==", projectCode))
          );

          for (const responseDoc of responsesSnapshot.docs) {
            await deleteDoc(responseDoc.ref);
            console.log(`Deleted response with ID: ${responseDoc.id} in forms`);
          }
        }

        // Delete the project itself
        await deleteDoc(doc(db, "projects", project.id));
        console.log(`Deleted project with projectCode: ${projectCode}`);
      }

      // Update state to remove Part B projects
      setProjects((current) =>
        current.filter((project) => project.part !== "B")
      );

      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000); // Auto-dismiss after 2s
    } catch (err) {
      console.error("Error exporting and deleting Part B projects:", err);
      alert("An error occurred while exporting projects.");
    }
  };

  if (loading) {
    return (
      <LoadingScreen
        isLoading={loading}
        description="Looking for projects..."
      />
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Error: {error}
        <Button
          onClick={() => window.location.reload()}
          className="ml-4 bg-red-500 text-white"
        >
          Retry
        </Button>
      </div>
    );
  }
  const openDeleteModal = (project) => {
    if (!project || typeof project !== "object") {
      console.error("Invalid project passed to openDeleteModal:", project);
      return;
    }
    setDeleteModal({ isOpen: true, project });
  };

  // Close the delete modal
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, project: null });
  };

  // Handle project deletion
  const handleDeleteProject = async () => {
    if (!deleteModal.project) {
      console.error("No project is selected for deletion.");
      return;
    }

    const projectCode = deleteModal.project.projectCode;
    console.log(`Deleting Project: ${projectCode}`);

    setIsDeleting(true);

    try {
      // Fetch and delete evaluators for the project
      const evaluatorsQuery = query(
        collection(db, "evaluators"),
        where("projectCode", "==", projectCode)
      );
      const evaluatorsSnapshot = await getDocs(evaluatorsQuery);

      for (const evaluatorDoc of evaluatorsSnapshot.docs) {
        await deleteDoc(doc(db, "evaluators", evaluatorDoc.id));
        console.log(`Deleted evaluator with ID: ${evaluatorDoc.id}`);
      }

      // Fetch and delete grades for the project
      const gradesQuery = query(
        collection(db, "finalGrades"),
        where("projectCode", "==", projectCode)
      );
      const gradesSnapshot = await getDocs(gradesQuery);

      for (const gradeDoc of gradesSnapshot.docs) {
        await deleteDoc(doc(db, "finalGrades", gradeDoc.id));
        console.log(`Deleted grade with ID: ${gradeDoc.id}`);
      }

      // Delete evaluations and responses in the forms table
      const formsQuery = collection(db, "forms");
      const formsSnapshot = await getDocs(formsQuery);

      for (const formDoc of formsSnapshot.docs) {
        // Delete evaluations subcollection
        const evaluationsRef = collection(formDoc.ref, "evaluations");
        const evaluationsSnapshot = await getDocs(
          query(evaluationsRef, where("projectCode", "==", projectCode))
        );

        for (const evaluationDoc of evaluationsSnapshot.docs) {
          await deleteDoc(evaluationDoc.ref);
          console.log(
            `Deleted evaluation with ID: ${evaluationDoc.id} in forms`
          );
        }

        // Delete responses subcollection
        const responsesRef = collection(formDoc.ref, "responses");
        const responsesSnapshot = await getDocs(
          query(responsesRef, where("projectCode", "==", projectCode))
        );

        for (const responseDoc of responsesSnapshot.docs) {
          await deleteDoc(responseDoc.ref);
          console.log(`Deleted response with ID: ${responseDoc.id} in forms`);
        }
      }

      // Delete the project itself
      await deleteDoc(doc(db, "projects", deleteModal.project.id));
      console.log(`Deleted project with projectCode: ${projectCode}`);

      // Update state to reflect the deleted project
      setProjects((current) =>
        current.filter((project) => project.projectCode !== projectCode)
      );

      closeDeleteModal();
      console.log("Project deleted successfully.");
    } catch (error) {
      console.error("Error deleting project and related data:", error);
      alert(
        "An error occurred while deleting the project and its related data."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative bg-white min-h-screen overflow-hidden">
      <BlurElements />
      <div className="relative z-10">
        {/* Tabs */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center py-4">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  className={`inline-flex items-center px-3 pt-2 pb-3 border-b-2 text-base font-medium ${
                    activeTab === tab
                      ? "border-blue-900 text-blue-900"
                      : "border-transparent text-gray-500 hover:border-blue-900 hover:text-blue-900"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Description */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {getTabDescription(activeTab)}
                  </p>
                  {/* Additional explanation for Part A and Part B */}
                  {activeTab === "Part A" && (
                    <p className="mt-4 text-gray-500 text-base  leading-relaxed">
                      Part A projects cannot be transferred to Part B if Part B
                      already contains projects.
                    </p>
                  )}
                </div>
              </div>

              {/* Stats and Actions */}
              <div className="space-y-4">
                <ProjectStats projects={projects} activeTab={activeTab} />
                {activeTab === "Part A" && (
                  <div>
                    <Button
                      onClick={handleMoveToPartB}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Move to Part B
                    </Button>
                    <p className="mt-4 text-gray-600 text-base font-semibold text-center leading-relaxed">
                      {" "}
                      Please ensure Part B is empty before moving.
                    </p>
                  </div>
                )}
                {activeTab === "Part B" && (
                  <div>
                    <Button
                      onClick={handleExportAndDelete}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      Export & Delete
                    </Button>
                    <p className="mt-4 text-gray-600 text-base font-semibold text-center leading-relaxed">
                      {" "}
                      Please ensure Part A is managed appropriately before
                      moving.
                    </p>
                  </div>
                )}
                {activeTab === "All Projects" && (
                  <Button
                    onClick={() => navigate("/admin-upload")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <MdOutlineFileUpload />
                    Upload Excel File
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Projects Table */}

          <ProjectsTable
            projects={projects.filter((project) =>
              activeTab === "All Projects"
                ? true
                : project.part === activeTab.split(" ")[1]
            )}
            activeTab={activeTab}
            onEditField={handleEditField}
            onAddNote={handleAddNote}
            onStudentClick={handleStudentClick}
            onDelete={openDeleteModal} // Pass openDeleteModal as onDelete
          />
        </div>
      </div>

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete {deleteModal.project?.title}?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={closeDeleteModal}
                disabled={isDeleting} // Disable the button during deletion
                className={`px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 ${
                  isDeleting ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={isDeleting} // Disable the button during deletion
                className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ml-2 ${
                  isDeleting ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <NotesModal
        isOpen={notesModal.isOpen}
        onClose={closeNotesModal} // Hook-provided close function
        onSave={async (note) => {
          try {
            const projectRef = doc(db, "projects", notesModal.project.id); // Use projectCode as the ID
            await updateDoc(projectRef, { specialNotes: note });

            setProjects((current) =>
              current.map((project) =>
                project.id === notesModal.project.id
                  ? { ...project, specialNotes: note }
                  : project
              )
            );

            closeNotesModal(); // Close the modal after saving
          } catch (error) {
            console.error("Error saving note:", error);
          }
        }}
        initialNote={notesModal.project?.specialNotes || ""}
        projectTitle={notesModal.project?.title || ""}
      />

      <StudentDetailsModal
        isOpen={studentModal.isOpen}
        onClose={closeStudentModal}
        student={studentModal.student}
      />

      <EditFieldModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ ...editModal, isOpen: false })}
        onSave={handleSaveField}
        currentValue={editModal.value}
        projectId={editModal.projectId}
        fieldName={editModal.fieldName}
        fieldType={editModal.fieldType}
        options={editModal.options}
      />
      {/* Warning Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        onCancel={() => setConfirmationModal({ isOpen: false })}
        onConfirm={confirmationModal.onConfirm}
        isProcessing={confirmationModal.isProcessing}
        isWarning={confirmationModal.isWarning}
      />
      {/* Success Modal */}
      <ConfirmationModal
        isOpen={showSuccessModal}
        title="Success!"
        message="Successfully moved!"
        onCancel={() => setShowSuccessModal(false)}
        isSuccess={true}
      />
    </div>
  );
};

export default AdminProjects;

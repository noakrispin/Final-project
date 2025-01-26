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
import { userApi } from "../../services/userAPI";
import { evaluatorsApi } from "../../services/evaluatorsAPI";
import { gradesApi } from "../../services/finalGradesAPI";
import { db } from "../../firebaseConfig";
import { collection, collectionGroup, query, where, getDocs, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { MdOutlineFileUpload } from "react-icons/md";
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

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, project: null });

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
  
        // Fetch all projects
        const fetchedProjects = await projectsApi.getAllProjects();
        console.log("Fetched projects:", fetchedProjects);
  
        // Extract unique supervisor email
        const supervisorIds = [
          ...new Set(
            fetchedProjects
              .flatMap((project) => [project.supervisor1, project.supervisor2])
              .filter(Boolean)
          ),
        ];
        console.log("Supervisor IDs to fetch:", supervisorIds);
  
        // Fetch supervisor details
        const supervisorDetails = await Promise.all(
          supervisorIds.map(async (id) => {
            try {
              const userResponse = await userApi.getUser(id);
              console.log(`Fetched supervisor data for ID ${id}:`, userResponse);
              return {
                id,
                fullName: userResponse.fullName || `Unknown (${id})`,
              };
            } catch (error) {
              console.error(`Error fetching supervisor with ID ${id}:`, error);
              return { id, fullName: `Unknown (${id})` };
            }
          })
        );
  
        console.log("Fetched Supervisor Details:", supervisorDetails);
  
        // Create a map of supervisor IDs to their full names
        const supervisorMap = supervisorDetails.reduce((acc, supervisor) => {
          acc[supervisor.id] = supervisor.fullName;
          return acc;
        }, {});
  
        console.log("Supervisor Map:", supervisorMap);
  
        // Map supervisor names, students, and formatted deadlines to projects
        const projectsWithDetails = fetchedProjects.map((project) => {
          const deadline = project.deadline && project.deadline._seconds
              ? new Date(project.deadline._seconds * 1000).toLocaleDateString()
              : "No Deadline";
      
              const students = [
                project.Student1 || null,
                project.Student2 || null,
              ].filter(Boolean); // Keep only valid student objects
          console.log("Students :", students);
          return {
              ...project,
              supervisor1: supervisorMap[project.supervisor1] || "Unknown",
              supervisor2: supervisorMap[project.supervisor2] ,
              students,
              deadline,
          };
      });
  
        console.log("Projects with details:", projectsWithDetails);
  
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
  


  const moveToPartB = async () => {
    try {
      const partBProjects = projects.filter((project) => project.part === "B");
      if (partBProjects.length > 0) {
        alert("Part B must be empty before transferring projects from Part A.");
        return;
      }
  
      const batch = [];
  
      const partAProjects = projects.filter((project) => project.part === "A");
      for (const project of partAProjects) {
        const projectCode = project.projectCode;
  
        // Step 1: Delete existing evaluators for the project
        const evaluatorsQuery = query(collection(db, "evaluators"), where("projectCode", "==", projectCode));
        const evaluatorsSnapshot = await getDocs(evaluatorsQuery);
  
        for (const evaluatorDoc of evaluatorsSnapshot.docs) {
          await deleteDoc(evaluatorDoc.ref);
          console.log(`Deleted evaluator with ID: ${evaluatorDoc.id}`);
        }
  
        // Step 2: Reset the evaluators for the project
        if (project.supervisor1) {
          await addDoc(collection(db, "evaluators"), {
            formID: "SupervisorForm",
            evaluatorID: project.supervisor1,
            projectCode: projectCode,
            status: "Not Submitted", // Add the status field
          });
          console.log(`Created new evaluator for supervisor1: ${project.supervisor1}`);
        }
  
        if (project.supervisor2) {
          await addDoc(collection(db, "evaluators"), {
            formID: "SupervisorForm",
            evaluatorID: project.supervisor2,
            projectCode: projectCode,
            status: "Not Submitted", // Add the status field
          });
          console.log(`Created new evaluator for supervisor2: ${project.supervisor2}`);
        }
  
        // Step 3: Reset grades and update the 'part' field for the project
        const gradesQuery = query(collection(db, "finalGrades"), where("projectCode", "==", projectCode));
        const gradesSnapshot = await getDocs(gradesQuery);
  
        for (const gradeDoc of gradesSnapshot.docs) {
          const gradeRef = gradeDoc.ref;
          await updateDoc(gradeRef, {
            CalculatedBookGrade: null,
            CalculatedPresentationGrade: null,
            CalculatedSupervisorGrade: null,
            comments: null,
            finalGrade: null,
            value: null,
            part: "B", // Update the part field to "B"
          });
          console.log(`Updated grade with ID: ${gradeDoc.id} and set part to B`);
        }
  
        // Step 3: Delete Evaluations and Responses in Forms Table
      const formsQuery = collection(db, "forms");
      const formsSnapshot = await getDocs(formsQuery);

      for (const formDoc of formsSnapshot.docs) {
        // Delete evaluations subcollection
        const evaluationsRef = collection(formDoc.ref, "evaluations");
        const evaluationsSnapshot = await getDocs(query(evaluationsRef, where("evaluatorID", "in", [project.supervisor1, project.supervisor2])));

        for (const evaluationDoc of evaluationsSnapshot.docs) {
          await deleteDoc(evaluationDoc.ref);
          console.log(`Deleted evaluation in forms for evaluatorID: ${evaluationDoc.data().evaluatorID}`);
        }

        // Delete responses subcollection
        const responsesRef = collection(formDoc.ref, "responses");
        const responsesSnapshot = await getDocs(query(responsesRef, where("evaluatorID", "in", [project.supervisor1, project.supervisor2])));

        for (const responseDoc of responsesSnapshot.docs) {
          await deleteDoc(responseDoc.ref);
          console.log(`Deleted response in forms for evaluatorID: ${responseDoc.data().evaluatorID}`);
        }
      }
  
        // Step 6: Update the project's part to "B"
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
  
      alert("Projects moved to Part B, evaluators reset, grades updated, and evaluations/responses deleted successfully.");
    } catch (err) {
      console.error("Error moving projects to Part B:", err);
      alert("An error occurred while moving projects to Part B.");
    }
  };
  
    
  const exportToExcel = async () => {
    try {
      const partBProjects = projects.filter((project) => project.part === "B");
  
      if (partBProjects.length === 0) {
        alert("No projects in Part B to export.");
        return;
      }
  
      // Prepare data for Excel
      const worksheet = XLSX.utils.json_to_sheet(partBProjects);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Part B Projects");
  
      // Export to Excel
      XLSX.writeFile(workbook, "PartB_Projects.xlsx");
      console.log("Exported Part B projects to Excel");
  
      // Delete related data for Part B Projects
      for (const project of partBProjects) {
        const projectCode = project.projectCode;
  
        // Fetch and delete evaluators
        const evaluatorsQuery = query(collection(db, "evaluators"), where("projectCode", "==", projectCode));
        const evaluatorsSnapshot = await getDocs(evaluatorsQuery);
  
        for (const evaluatorDoc of evaluatorsSnapshot.docs) {
          await deleteDoc(doc(db, "evaluators", evaluatorDoc.id));
          console.log(`Deleted evaluator with ID: ${evaluatorDoc.id}`);
        }
  
        // Fetch and delete grades
        const gradesQuery = query(collection(db, "finalGrades"), where("projectCode", "==", projectCode));
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
          const evaluationsSnapshot = await getDocs(query(evaluationsRef, where("projectCode", "==", projectCode)));
  
          for (const evaluationDoc of evaluationsSnapshot.docs) {
            await deleteDoc(evaluationDoc.ref);
            console.log(`Deleted evaluation with ID: ${evaluationDoc.id} in forms`);
          }
  
          // Delete responses subcollection
          const responsesRef = collection(formDoc.ref, "responses");
          const responsesSnapshot = await getDocs(query(responsesRef, where("projectCode", "==", projectCode)));
  
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
  
      alert("Part B projects and related data exported and deleted successfully.");
    } catch (err) {
      console.error("Error exporting and deleting Part B projects:", err);
      alert("An error occurred while exporting projects.");
    }
  };
  
  
  
  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
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
    const evaluatorsQuery = query(collection(db, "evaluators"), where("projectCode", "==", projectCode));
    const evaluatorsSnapshot = await getDocs(evaluatorsQuery);

    for (const evaluatorDoc of evaluatorsSnapshot.docs) {
      await deleteDoc(doc(db, "evaluators", evaluatorDoc.id));
      console.log(`Deleted evaluator with ID: ${evaluatorDoc.id}`);
    }

    // Fetch and delete grades for the project
    const gradesQuery = query(collection(db, "finalGrades"), where("projectCode", "==", projectCode));
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
      const evaluationsSnapshot = await getDocs(query(evaluationsRef, where("projectCode", "==", projectCode)));

      for (const evaluationDoc of evaluationsSnapshot.docs) {
        await deleteDoc(evaluationDoc.ref);
        console.log(`Deleted evaluation with ID: ${evaluationDoc.id} in forms`);
      }

      // Delete responses subcollection
      const responsesRef = collection(formDoc.ref, "responses");
      const responsesSnapshot = await getDocs(query(responsesRef, where("projectCode", "==", projectCode)));

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
    alert("An error occurred while deleting the project and its related data.");
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    <p className="mt-4 text-gray-500 text-base leading-relaxed">
                      Part A projects cannot be transferred to Part B if Part B already contains projects. Please ensure Part B is empty before transferring.
                    </p>
                  )}
                  {activeTab === "Part B" && (
                    <p className="mt-4 text-gray-500 text-base leading-relaxed">
                      Part B is reserved for projects in their implementation and completion phases. Ensure Part A is managed appropriately before transferring.
                    </p>
                  )}
                </div>
              </div>

              {/* Stats and Actions */}
              <div className="space-y-4">
                <ProjectStats projects={projects} activeTab={activeTab} />
                {activeTab === "Part A" && (
                  <Button
                    onClick={moveToPartB}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Move to Part B
                  </Button>
                )}
                {activeTab === "Part B" && (
                  <Button
                    onClick={exportToExcel}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    Export & Delete
                  </Button>
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
    </div>
  );
};

export default AdminProjects;

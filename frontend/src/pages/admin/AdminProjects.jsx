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
import { db } from "../../firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  writeBatch,
  updateDoc,
} from "firebase/firestore";
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
    setNotesModal,
    setStudentModal,
    setEditModal,
    handleAddNote,
    handleSaveNote,
    handleStudentClick,
    handleEditField,
    handleSaveField,
    closeStudentModal,
    closeNotesModal,
  } = useProjectModals(projects, setProjects);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
  
        // Fetch all projects
        const fetchedProjects = await projectsApi.getAllProjects();
        console.log("Fetched projects:", fetchedProjects);
  
        // Extract unique supervisor IDs
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
              supervisor2: supervisorMap[project.supervisor2] || "Unknown",
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
      // Check if there are already projects in Part B
      const partBProjects = projects.filter((project) => project.part === "B");
      if (partBProjects.length > 0) {
        alert("Cannot move projects to Part B because Part B is not empty.");
        return;
      }

      const batch = writeBatch(db);
      const partAProjects = projects.filter((project) => project.part === "A");

      partAProjects.forEach((project) => {
        const projectRef = doc(db, "projects", project.id);
        batch.update(projectRef, { part: "B" });
      });

      await batch.commit();

      setProjects((current) =>
        current.map((project) =>
          project.part === "A" ? { ...project, part: "B" } : project
        )
      );
    } catch (err) {
      console.error("Error moving projects to Part B:", err);
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

      // Delete Part B Projects from Firestore
      const batch = writeBatch(db);
      partBProjects.forEach((project) => {
        const projectRef = doc(db, "projects", project.id);
        batch.delete(projectRef);
      });
      await batch.commit();

      // Update state to remove Part B projects
      setProjects((current) =>
        current.filter((project) => project.part !== "B")
      );
      alert("Part B projects exported and deleted successfully.");
    } catch (err) {
      console.error("Error exporting Part B projects:", err);
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
                <Button
                  onClick={() => navigate("/admin-upload")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <MdOutlineFileUpload />
                  Upload Excel File
                </Button>
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
          />
        </div>
      </div>

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

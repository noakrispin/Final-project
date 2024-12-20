import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { BlurElements } from '../../components/shared/BlurElements';
import NotesModal from '../../components/actions/NotesModal';
import StudentDetailsModal from '../../components/ui/StudentDetailsModal';
import EditFieldModal from '../../components/actions/EditTitleModal';
import ProjectsTable from '../../components/admin/ProjectsTable';
import ProjectStats from '../../components/admin/ProjectStats';
import { useProjectModals } from '../../hooks/useProjectModals';
import projectsAdminData from '../../data/projectsAdmin.json';

const TABS = ['All Projects', 'Part A', 'Part B'];

const getTabDescription = (tab) => {
  const interactiveFeatures = "Click on any cell in the table to edit its content directly. Student names are clickable to view detailed student information.";
  
  switch(tab) {
    case 'All Projects':
      return `Here you can view and manage all projects, including both Part A and Part B projects. Use the filters above to focus on specific project types. ${interactiveFeatures}`;
    case 'Part A':
      return `These are all Part A projects, typically focused on project planning and initial development phases. ${interactiveFeatures}`;
    case 'Part B':
      return `These are all Part B projects, usually involving implementation and completion phases. ${interactiveFeatures}`;
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
    handleSaveField
  } = useProjectModals(projects, setProjects);

  useEffect(() => {
    try {
      setProjects(projectsAdminData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading projects:', error);
      setError(error.message);
      setLoading(false);
    }
  }, []);

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
              {TABS.map(tab => (
                <button
                  key={tab}
                  className={`inline-flex items-center px-6 py-2 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
          <div className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Description */}
              <div className="lg:col-span-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Here you can view and manage all projects, including both Part A and Part B projects. 
                    Use the filters above to focus on specific project types. Click on any cell in the table 
                    to edit its content directly. Student names are clickable to view detailed student information.
                  </p>
                </div>
              </div>

              {/* Stats and Actions */}
              <div className="lg:col-span-4 space-y-4">
                <ProjectStats 
                  projects={projects} 
                  activeTab={activeTab} 
                />
                <Button 
                  onClick={() => navigate('/admin-upload')}
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                >
                  Upload Excel File
                </Button>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <ProjectsTable
            projects={projects}
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
        onClose={() => setNotesModal({ isOpen: false, project: null })}
        onSave={handleSaveNote}
        initialNote={notesModal.project?.specialNotes || ''}
        projectTitle={notesModal.project?.title || ''}
      />

      <StudentDetailsModal
        isOpen={studentModal.isOpen}
        onClose={() => setStudentModal({ isOpen: false, student: null })}
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






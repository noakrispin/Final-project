import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { BlurElements } from '../../components/shared/BlurElements';
import NotesModal from '../../components/actions/NotesModal';
import StudentDetailsModal from '../../components/ui/StudentDetailsModal';
import EditFieldModal from '../../components/actions/EditTitleModal';
import projectsAdminData from '../../data/projectsAdmin.json';

const TABS = ['All Projects', 'Part A', 'Part B'];

const AdminProjects = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editModal, setEditModal] = useState({
    isOpen: false,
    field: '',
    fieldName: '',
    value: '',
    projectId: null,
    fieldType: 'text',
    options: []
  });

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

  const handleAddNote = (project) => {
    setSelectedProject(project);
    setIsNotesModalOpen(true);
  };

  const handleSaveNote = async (note) => {
    if (!selectedProject) return;

    try {
      // This would be your API call to update the database
      // await api.updateProjectNotes(selectedProject.id, note);
      
      // Update local state
      setProjects(currentProjects =>
        currentProjects.map(project =>
          project.id === selectedProject.id
            ? { ...project, specialNotes: note }
            : project
        )
      );
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setIsStudentModalOpen(true);
  };

  const handleEditField = (project, field, fieldName, fieldType = 'text', options = []) => {
    setEditModal({
      isOpen: true,
      field,
      fieldName,
      value: project[field] || '',  // Ensure we pass the current value
      projectId: project.id,
      fieldType,
      options
    });
  };

  const handleSaveField = async (newValue) => {
    const { field, projectId } = editModal;
    
    try {
      // This would be your API call to update the database
      // await api.updateProjectField(projectId, field, newValue);
      
      // Update local state
      setProjects(currentProjects =>
        currentProjects.map(project =>
          project.id === projectId
            ? { ...project, [field]: newValue }
            : project
        )
      );
    } catch (error) {
      console.error('Error updating field:', error);
    }
  };

  const renderEditableCell = (value, row, field, fieldName, fieldType = 'text', options = []) => (
  <button
    onClick={() => handleEditField(row, field, fieldName, fieldType, options)}
    className="w-full text-left hover:text-blue-600 transition-colors"
  >
    {value}
  </button>
);

  const processProjectData = (tab) => {
    const filteredProjects = projects.filter(project => {
      switch(tab) {
        case 'All Projects':
          return true;
        case 'Part A':
          return project.part === 'A';
        case 'Part B':
          return project.part === 'B';
        default:
          return true;
      }
    });

    return filteredProjects.map((project, index) => ({
      ...project,
      number: index + 1,
      studentsDisplay: (
        <div className="space-y-1">
          <button
            onClick={() => handleStudentClick(project.student1)}
            className="text-blue-600 hover:text-blue-700 transition-colors text-left block"
          >
            {project.student1.name}
          </button>
          {project.student2 && (
            <button
              onClick={() => handleStudentClick(project.student2)}
              className="text-blue-600 hover:text-blue-700 transition-colors text-left block"
            >
              {project.student2.name}
            </button>
          )}
        </div>
      )
    }));
  };

  const projectColumns = [
    { 
      key: 'number',
      header: '#',
      sortable: true
    },
    { 
      key: 'projectCode',
      header: 'Project Code',
      sortable: true,
      render: (value, row) => renderEditableCell(value, row, 'projectCode', 'Project Code')
    },
    { 
      key: 'title',
      header: 'Project Title',
      sortable: true,
      render: (value, row) => renderEditableCell(value, row, 'title', 'Project Title')
    },
    { 
      key: 'studentsDisplay',
      header: 'Students',
      sortable: false
    },
    { 
      key: 'supervisor1',
      header: 'Supervisor',
      sortable: true,
      render: (value, row) => renderEditableCell(
        row.supervisor2 ? `${value}, ${row.supervisor2}` : value,
        row,
        'supervisor1',
        'Supervisor'
      )
    },
    { 
      key: 'part',
      header: 'Part',
      sortable: true,
      render: (value, row) => renderEditableCell(
        value,
        row,
        'part',
        'Part',
        'select',
        ['A', 'B']
      )
    },
    { 
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (value, row) => renderEditableCell(
        value,
        row,
        'type',
        'Type',
        'select',
        ['Development', 'Research']
      )
    },
    { 
      key: 'deadline',
      header: 'Deadline',
      sortable: true,
      render: (value, row) => renderEditableCell(
        value || '-',
        row,
        'deadline',
        'Deadline',
        'date'
      )
    },
    { 
      key: 'specialNotes',
      header: 'Special Notes',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => handleAddNote(row)}
            className="w-full text-left hover:text-blue-600 transition-colors"
          >
            {value || 'Add note'}
          </button>
        </div>
      )
    }
  ];

  const projectData = useMemo(() => processProjectData(activeTab), [projects, activeTab]);

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
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center py-4">
              {TABS.map(tab => (
                <button
                  key={tab}
                  className={`inline-flex items-center px-3 pt-2 pb-3 border-b-2 text-base font-medium ${
                    activeTab === tab
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:border-purple-500 hover:text-foreground'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">{activeTab} Overview</h1>
              <Button 
                onClick={() => navigate('/admin-upload')}
                className="bg-[#6366F1] hover:bg-[#5558E1] text-white"
              >
                Upload Excel File
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <div className="p-4">
                  <h2 className="text-lg font-semibold">Total Projects</h2>
                  <p className="text-3xl font-bold text-blue-600">{projectData.length}</p>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{activeTab} Projects</h2>
              <Table
                columns={projectColumns}
                data={projectData}
              />
            </Card>
          </div>
        </div>
      </div>

      <NotesModal
        isOpen={isNotesModalOpen}
        onClose={() => {
          setIsNotesModalOpen(false);
          setSelectedProject(null);
        }}
        onSave={handleSaveNote}
        initialNote={selectedProject?.specialNotes || ''}
        projectTitle={selectedProject?.title || ''}
      />

      <StudentDetailsModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
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


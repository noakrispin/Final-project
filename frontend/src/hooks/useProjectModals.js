import { useState, useCallback } from 'react';

export const useProjectModals = (projects, setProjects) => {
  const [notesModal, setNotesModal] = useState({ isOpen: false, project: null });
  const [studentModal, setStudentModal] = useState({ isOpen: false, student: null });
  const [editModal, setEditModal] = useState({
    isOpen: false,
    field: '',
    fieldName: '',
    value: '',
    projectId: null,
    fieldType: 'text',
    options: []
  });

  const handleAddNote = useCallback((project) => {
    setNotesModal({ isOpen: true, project });
  }, []);

  const handleSaveNote = useCallback(async (note) => {
    if (!notesModal.project) return;

    try {
      // This would be your API call
      // await api.updateProjectNotes(notesModal.project.id, note);
      
      setProjects(currentProjects =>
        currentProjects.map(project =>
          project.id === notesModal.project.id
            ? { ...project, specialNotes: note }
            : project
        )
      );
    } catch (error) {
      console.error('Error updating note:', error);
    }
  }, [notesModal.project, setProjects]);

  const handleStudentClick = useCallback((student) => {
    setStudentModal({ isOpen: true, student });
  }, []);

  const handleEditField = useCallback((project, field, fieldName, fieldType = 'text', options = []) => {
    setEditModal({
      isOpen: true,
      field,
      fieldName,
      value: project[field] || '',
      projectId: project.id,
      fieldType,
      options
    });
  }, []);

  const handleSaveField = useCallback(async (newValue) => {
    const { field, projectId } = editModal;
    
    try {
      // This would be your API call
      // await api.updateProjectField(projectId, field, newValue);
      
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
  }, [editModal, setProjects]);

  return {
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
  };
};


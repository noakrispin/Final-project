import { useState, useCallback } from 'react';
import { api } from '../services/api';

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

    const previousProjects = [...projects];
    const projectId = notesModal.project.id;

    try {
      // Optimistic update
      setProjects(currentProjects =>
        currentProjects.map(project =>
          project.id === projectId
            ? { ...project, specialNotes: note }
            : project
        )
      );

      // Update in the backend
      const result = await api.updateProjectNote(projectId, note);

      if (!result.success) {
        throw new Error('Failed to update note');
      }

    } catch (error) {
      console.error('Error updating note:', error);
      // Rollback on failure
      setProjects(previousProjects);
    }
  }, [notesModal.project, projects, setProjects]);

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
    
    // Store the previous state for rollback
    const previousProjects = [...projects];

    try {
      // Optimistic update
      setProjects(currentProjects =>
        currentProjects.map(project =>
          project.id === projectId
            ? { ...project, [field]: newValue }
            : project
        )
      );

      // In the future, this will be an actual API call
      // const result = await ProjectService.updateProjectField(projectId, field, newValue);
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error('Error updating field:', error);
      // Rollback on failure
      setProjects(previousProjects);
      // You might want to show an error notification here
    }
  }, [editModal, projects, setProjects]);

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


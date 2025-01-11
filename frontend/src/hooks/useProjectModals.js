import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const useProjectModals = (projects, setProjects) => {
  const [editModal, setEditModal] = useState({
    isOpen: false,
    field: '',
    fieldName: '',
    value: '',
    projectId: null,
    fieldType: 'text',
    options: [],
  });

  const [studentModal, setStudentModal] = useState({
    isOpen: false,
    student: null,
  });

  const [notesModal, setNotesModal] = useState({
    isOpen: false,
    project: null,
  });

  const handleEditField = (project, field, fieldName, fieldType = 'text', options = []) => {
    setEditModal({
      isOpen: true,
      field, // e.g., "projectCode" or "title"
      fieldName, // e.g., "Project Code" or "Project Title"
      value: project[field] || '', // Ensure the correct value for the field is set
      projectId: project.id, // Use the project's unique ID
      fieldType,
      options,
    });
  };

  const handleSaveField = async (newValue) => {
    const { field, projectId } = editModal;
  
    try {
      // Update Firestore
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, { [field]: newValue });
  
      // Update State
      setProjects(currentProjects =>
        currentProjects.map(project =>
          project.id === projectId ? { ...project, [field]: newValue } : project
        )
      );
    } catch (error) {
      console.error('Error updating project field:', error);
    } finally {
      setEditModal({ ...editModal, isOpen: false });
    }
  };

  const handleStudentClick = (student) => {
    setStudentModal({
      isOpen: true,
      student,
    });
  };

  const closeStudentModal = () => {
    setStudentModal({
      isOpen: false,
      student: null,
    });
  };

  const handleAddNote = (project) => {
    setNotesModal({
      isOpen: true,
      project,
    });
  };

  const closeNotesModal = () => {
    setNotesModal({
      isOpen: false,
      project: null,
    });
  };

  return {
    editModal,
    setEditModal,
    handleEditField,
    handleSaveField,
    studentModal,
    handleStudentClick,
    closeStudentModal,
    notesModal,
    handleAddNote,
    closeNotesModal,
  };
};

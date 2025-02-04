/**
 * This module provides custom hooks for managing project-related modals.
 * It includes functionalities for editing fields, handling student clicks, and adding notes.
 */
import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Timestamp } from "firebase/firestore";

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

  /**
   * Opens the edit modal for a specific field.
   */
  const handleEditField = (project, field, fieldName, fieldType = 'text', options = []) => {
    let fieldValue = project[field];
    if (typeof fieldValue === "object" && fieldValue !== null) {
      fieldValue = fieldValue.text || "";
    }
    setEditModal({
      isOpen: true,
      field,
      fieldName,
      value: fieldValue,
      projectId: project.id,
      fieldType,
      options,
    });
  };

  /**
   * Saves the edited field value to Firestore.
   */
  const handleSaveField = async (newValue) => {
    const { field, projectId, fieldType } = editModal;
    try {
      const projectRef = doc(db, "projects", projectId);
      let updatedValue = newValue;
      if (fieldType === "date") {
        updatedValue = Timestamp.fromDate(new Date(newValue));
      }
      await updateDoc(projectRef, { [field]: updatedValue });
      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === projectId ? { ...project, [field]: updatedValue } : project
        )
      );
      console.log(`Successfully updated ${field} for project ${projectId}`);
    } catch (error) {
      console.error(`Error updating project field (${field}):`, error);
    } finally {
      setEditModal({ ...editModal, isOpen: false });
    }
  };

  /**
   * Opens the student modal for a specific student.
   */
  const handleStudentClick = (student) => {
    console.log("Student clicked:", student);
    setStudentModal({
      isOpen: true,
      student,
    });
  };

  /**
   * Closes the student modal.
   */
  const closeStudentModal = () => {
    setStudentModal({
      isOpen: false,
      student: null,
    });
  };

  /**
   * Opens the notes modal for a specific project.
   */
  const handleAddNote = (project) => {
    setNotesModal({
      isOpen: true,
      project,
    });
  };

  /**
   * Closes the notes modal.
   */
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

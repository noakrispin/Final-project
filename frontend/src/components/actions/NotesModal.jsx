import React, { useState } from 'react';
import PropTypes from 'prop-types';

const NotesModal = ({ isOpen, onClose, onSave, initialNote, projectTitle }) => {
  const [note, setNote] = useState(initialNote || '');

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      await onSave(note); // Save note via the provided onSave function
    } catch (error) {
      console.error('Error saving note:', error);
    }
    onClose(); // Close the modal
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <h2 className="text-lg font-bold">Edit Notes for {projectTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        <div className="p-4">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full h-32 border rounded-lg p-2"
            placeholder="Enter your notes here..."
          />
        </div>
        <div className="flex justify-end px-4 py-2 border-t">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-2 hover:bg-gray-400"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

NotesModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initialNote: PropTypes.string,
  projectTitle: PropTypes.string,
};

export default NotesModal;

import React, { useState, useEffect  } from 'react';
import PropTypes from 'prop-types';

const EditFieldModal = ({
  isOpen,
  onClose,
  onSave,
  currentValue,
  fieldName,
  fieldType = 'text',
  options = [],
}) => {
  const [value, setValue] = useState(currentValue || '');

  useEffect(() => {
    setValue(currentValue || ''); // Reset value when modal opens
  }, [currentValue]);


  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(value); // Save field via the provided onSave function
    } catch (error) {
      console.error(`Error updating ${fieldName}:`, error);
    }
    onClose(); // Close the modal
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <h2 className="text-lg font-bold">Edit {fieldName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          {fieldType === 'select' ? (
            <select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={fieldType}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full border rounded-lg p-2"
              placeholder={`Edit ${fieldName}`} // Updated placeholder for clarity
            />
          )}
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-2 hover:bg-gray-400"
            >
              Close
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditFieldModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  currentValue: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired, // Ensure this field is passed correctly
  fieldType: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.string),
};

export default EditFieldModal;

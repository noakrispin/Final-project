/**
 * This component provides a dynamic modal for editing various fields of a row.
 * 
 * Props:
 * - isOpen: Boolean indicating if the modal is open.
 * - onClose: Function to close the modal.
 * - onSave: Function to save the edited data.
 * - rowData: The current data of the row being edited.
 * - dbFields: Array of field configurations for the form.
 */
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X } from "lucide-react";
import { Button } from "../ui/Button";

const DynamicEditModal = ({ isOpen, onClose, onSave, rowData, dbFields }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (rowData) {
      setFormData(rowData); // Initialize form data with row data
    }
  }, [rowData]);

  /**
   * Handles input changes and updates form data.
   */
  const handleChange = (key, value) => {
    setFormData({
      ...formData,
      [key]: value,
    });
    setErrors({
      ...errors,
      [key]: undefined, // Clear errors on change
    });
  };

  /**
   * Validates the form data based on field settings.
   */
  const validate = () => {
    const newErrors = {};

    // Dynamic validation based on field settings
    dbFields.forEach((field) => {
      if (field.validation) {
        const error = field.validation(formData[field.key]);
        if (error) {
          newErrors[field.key] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission to save the edited data.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave(formData); // Send the updated data back to the parent
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-4xl max-h-[85vh] bg-white rounded-lg shadow-lg z-50 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-transform transform hover:scale-105 focus-visible:outline focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <X className="h-6 w-6 text-gray-600" />
        </button>
        <div className="p-6 border-b border-blue-300/50 bg-gradient-to-r from-sky-500 to-blue-400 text-white shadow-lg">
          <h2 className="text-2xl font-bold">Edit Details</h2>
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-96px)] p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {dbFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="block text-base font-medium text-blue-900">
                    {field.header}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={formData[field.key] || ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className={`w-full border ${
                        errors[field.key] ? "border-red-500" : "border-gray-300"
                      } rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition`}
                      rows={4} // Adjust the number of rows for the textarea
                      {...field.props} // Additional properties if needed
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={formData[field.key] || ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    >
                      {field.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || "text"}
                      value={formData[field.key] || ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className={`w-full border ${
                        errors[field.key] ? "border-red-500" : "border-gray-300"
                      } rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition`}
                      {...field.props} // Additional properties like min, max, step, etc.
                    />
                  )}
                  {errors[field.key] && (
                    <p className="text-red-500 text-sm">{errors[field.key]}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-base font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-6 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

DynamicEditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  rowData: PropTypes.object,
  dbFields: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      header: PropTypes.string.isRequired,
      type: PropTypes.string, // Type of field (e.g., "text", "number", "select", "textarea")
      options: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          value: PropTypes.any.isRequired,
        })
      ), // Options for select fields
      validation: PropTypes.func, // Custom validation logic
      props: PropTypes.object, // Additional properties for inputs
    })
  ).isRequired,
};

export default DynamicEditModal;

import React from 'react';
import { X } from 'lucide-react';

const StudentDetailsModal = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Student Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm text-gray-500">Name</label>
              <p className="text-base font-medium">{student.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Student ID</label>
              <p className="text-base font-medium">{student.id}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="text-base font-medium">{student.email}</p>
            </div>
          </div>

          <div className="flex justify-end p-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDetailsModal;
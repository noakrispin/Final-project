import React from "react";

export default function ConfirmationModal({ isOpen, title, message, onCancel, onConfirm, isProcessing }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <p>{message}</p>
        <div className="flex justify-end mt-4">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className={`px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 ${
              isProcessing ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ml-2 ${
              isProcessing ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect } from "react";

export default function ConfirmationModal({ 
  isOpen, 
  title, 
  message, 
  onCancel, 
  onConfirm, 
  isProcessing,  
  isWarning = false,  
  isSuccess = false 
}) {
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        onCancel(); 
      }, 2000); // Dismiss after 2s
  
      return () => clearTimeout(timer); 
    }
  }, [isSuccess, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
        
        {/* Dynamic title styling */}
        <h2 className={`text-2xl font-extrabold mb-4 ${
          isSuccess ? "text-green-700" : isWarning ? "text-yellow-700" : "text-red-700"
        }`}>
          {title}
        </h2>

        <p className="text-gray-700 text-lg">{message}</p>

        {/* Loading animation when processing */}
        {isProcessing && (
          <div className="flex justify-center items-center mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
          </div>
        )}

        {/* Buttons for warnings & confirmations (not for success messages) */}
        {!isSuccess && !isProcessing && (
          <div className="flex justify-center mt-6">
            {!isWarning && (
              <button
                onClick={onCancel}
                disabled={isProcessing}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            )}
            <button
              onClick={onConfirm} 
              disabled={isProcessing}
              className={`px-4 py-2 text-white font-medium rounded-md ml-2 text-lg ${
                isWarning ? "bg-yellow-600 hover:bg-yellow-700" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                isWarning ? "OK" : "Confirm"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

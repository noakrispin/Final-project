import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ExcelUploader from "../../components/admin/ExcelUploader";
import { Button } from "../../components/ui/Button";
import { processExcelFile } from "../../services/fileProcessingService";

const AdminEvaluatorUpload = () => {
  const navigate = useNavigate();
  const tabs = ["Projects", "Evaluators"];
  const [activeTab, setActiveTab] = useState("Evaluators");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState(null);

  // API Call to add or update an evaluator
  const addOrUpdateEvaluator = async (evaluator) => {
    try {
      const response = await fetch("/api/evaluators", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(evaluator),
      });
      if (!response.ok) {
        throw new Error(`Failed to add/update evaluator. Status: ${response.status}`);
      }
      console.log("Evaluator added/updated successfully.");
    } catch (err) {
      console.error("Error adding/updating evaluator:", err.message);
      throw err;
    }
  };

  const handleFileSelect = async (file) => {
    setIsUploading(true);
    setError(null);
    setUploadSuccess(false);

    try {
      // Process the Excel file and get the evaluator records
      const evaluators = await processExcelFile(file);

      // Iterate over the parsed evaluator data and send it to the API
      for (const evaluator of evaluators) {
        const { projectCode, presentationEvaluator, bookEvaluator } = evaluator;

        // Add the presentation evaluator
        if (presentationEvaluator) {
          await addOrUpdateEvaluator({
            evaluatorID: presentationEvaluator,
            formID: "PresentationForm",
            projectCode,
            status: "Not Submitted",
          });
        }

        // Add the book evaluator
        if (bookEvaluator) {
          await addOrUpdateEvaluator({
            evaluatorID: bookEvaluator,
            formID: "BookForm",
            projectCode,
            status: "Not Submitted",
          });
        }
      }

      setUploadSuccess(true);
      console.log("Evaluators successfully uploaded.");
    } catch (err) {
      setError(err.message || "An error occurred while uploading the file.");
      console.error("Error uploading evaluators:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Tabs Navigation */}
        <div className="flex justify-center py-6 bg-white shadow-md">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`inline-flex items-center px-5 py-3 text-lg font-medium border-b-4 ${
                activeTab === tab
                  ? "border-blue-900 text-blue-900"
                  : "border-transparent text-gray-500 hover:border-blue-900 hover:text-blue-900"
              }`}
              onClick={() => {
                setActiveTab(tab);
                if (tab === "Projects") {
                  navigate("/admin-upload");
                }
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "Evaluators" && (
          <div className="p-6 bg-slate-200 border border-blue-100 rounded-lg shadow-sm">
            <div className="mb-6 text-center">
              <h2 className="text-2xl text-blue-900 font-bold mb-2">
                Required File Format for Evaluators
              </h2>
              <div className="text-gray-600 mb-4 max-w-3xl mx-auto break-words leading-relaxed text-center">
                <p>Please ensure your Excel file includes the following columns:</p>
                <ul className="list-disc list-inside text-left mt-2">
                  <li>Project Code (Required)</li>
                  <li>Presentation Evaluator </li>
                  <li>Book Evaluator</li>
                </ul>
                <p>If there are too many or too few columns, the file will not be processed.</p>
              </div>
            </div>

            {/* Upload Section */}
            <ExcelUploader
              onFileSelect={handleFileSelect}
              isUploading={isUploading}
              isSuccess={uploadSuccess}
              error={error}
            />

            {/* Success/Error Messages */}
            {uploadSuccess && (
              <div className="mt-4 text-green-600 text-center">
                File uploaded successfully!
              </div>
            )}
            {error && (
              <div className="mt-4 text-red-600 text-center">{error}</div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center mt-6">
              <Button
                onClick={() => navigate("/admin-evaluators-list")}
                className="w-64 bg-blue-900 hover:bg-blue-800 text-white"
              >
                View Evaluators
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEvaluatorUpload;

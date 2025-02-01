import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ExcelUploader from "../../components/admin/ExcelUploader";
import { Button } from "../../components/ui/Button";
import { processExcelFile } from "../../services/fileProcessingService";
import { ExcelDatabaseService } from "../../services/ExcelDatabaseService";

const AdminEvaluatorUpload = () => {
  const navigate = useNavigate();
  const tabs = ["Projects", "Evaluators"];
  const [activeTab, setActiveTab] = useState("Evaluators");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = async (file) => {
    setIsUploading(true);
    setError(null);
    setUploadSuccess(false);

    try {
      const processedData = await processExcelFile(file); // Process and validate the file
      console.log("Processed data:", processedData);

      await ExcelDatabaseService.insertEvaluators(processedData); // Pass processed data, not the file
      console.log("Evaluators uploaded successfully to DB:", processedData);

      setUploadSuccess(true);
      setTimeout(() => {
        navigate("/admin-reminders");
      }, 2000);
    } catch (err) {
      setError(
        err.message.includes("Unrecognized Excel format")
          ? "Invalid file format. Please check your file structure and try again."
          : err.message
      );
      console.error("Error uploading file:", err);
    }
  };

  return (
    <div className="min-h-screen p-0">
      <div className="max-w-4xl mx-auto">
        {/* Tabs Section */}
        <div className="relative z-10 bg-white border-b border-gray-300">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-center py-4">

                {tabs.map((tab) => (
                  <button
                    key={tab}
                    className={`inline-flex items-center px-3 pt-2 pb-3 border-b-2 text-base font-medium ${
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
            </div>
          </div>
        

        {/* Tab Content */}
        {activeTab === "Evaluators" && (
          <div className="p-6 bg-slate-200 border border-blue-100 rounded-lg shadow-sm">
            <div className="mb-6 text-center">
              <h2 className="text-2xl text-blue-900 font-bold mb-2">
                Evaluators Assignment Upload
              </h2>
              <div className="text-gray-600 mb-4 max-w-3xl mx-auto break-words leading-relaxed text-center">
                <p>
                  Please ensure your Excel file includes the following columns:
                </p>
                <ul className="list-disc list-inside text-left mt-2">
                  <li>Column 1: Project Code (Required)</li>
                  <li>Column 2: Presentation Evaluator Email</li>
                  <li>Column 3: Book Evaluator Email</li>
                </ul>
                <p>
                  If there are too many or too few columns, the file will not be
                  processed.
                </p>
              </div>
            </div>

            {/* Upload Section */}
            <ExcelUploader
              onFileSelect={handleFileSelect}
              isUploading={isUploading}
              isSuccess={uploadSuccess}
              error={error}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEvaluatorUpload;

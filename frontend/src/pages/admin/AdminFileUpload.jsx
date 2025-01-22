import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ExcelUploader from "../../components/admin/ExcelUploader";
import { Button } from "../../components/ui/Button";
import { processExcelFile } from "../../services/fileProcessingService";
import { ExcelDatabaseService } from "../../services/ExcelDatabaseService";
import { getAuth } from "firebase/auth";

const AdminFileUpload = () => {
  const navigate = useNavigate();
  const [uploadedProjects, setUploadedProjects] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Projects");

  const auth = getAuth();
  console.log("Authenticated user:", auth.currentUser);

  const tabs = ["Projects", "Evaluators"];

  const handleFileSelect = async (file) => {
    setIsUploading(true);
    setError(null);
    setUploadSuccess(false);

    try {
      const processedData = await processExcelFile(file);
      await ExcelDatabaseService.insertProjects(processedData);
      console.log("Projects uploaded successfully:", processedData);

      await ExcelDatabaseService.insertSupervisorsEvaluators(processedData);
      console.log("Evaluators uploaded successfully:", processedData);

      setUploadedProjects(processedData);
      setUploadSuccess(true);

      setTimeout(() => {
        navigate("/admin-projects");
      }, 2000);
    } catch (err) {
      setError(err.message);
      console.error("Error uploading file:", err);
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
                if (tab === "Evaluators") {
                  navigate("/admin-evaluators");
                }
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "Projects" && (
          <div className="p-6 bg-slate-200 border border-blue-100 rounded-lg shadow-sm">
            <div className="mb-6 text-center">
              <h2 className="text-2xl text-blue-900 font-bold mb-2">
                Required File Format
              </h2>
              <p className="text-gray-600 mb-4 max-w-3xl mx-auto break-words leading-relaxed text-center">
                Please ensure your Excel file follows the format below before uploading.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="max-w-xl mx-auto">
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Column 1: Project Code (Required)</li>
                    <li>Column 2: Student 1 First Name (Required)</li>
                    <li>Column 3: Student 1 Last Name (Required)</li>
                    <li>Column 4: Student 1 ID (Required - 9 digits)</li>
                    <li>Column 5: Student 1 Email (Required - @e.braude.ac.il)</li>
                    <li>Column 6: Student 2 First Name (Optional)</li>
                    <li>Column 7: Student 2 Last Name (Optional)</li>
                    <li>Column 8: Student 2 ID (Optional - 9 digits)</li>
                    <li>Column 9: Student 2 Email (Optional - @e.braude.ac.il)</li>
                    <li>Column 10: Supervisor 1 ID (Required)</li>
                    <li>Column 11: Supervisor 2 ID (Optional)</li>
                    <li>Column 12: Project Title (Required)</li>
                    <li>Column 13: Project Description (Optional)</li>
                    <li>Column 14: Part (Required - A or B)</li>
                    <li>Column 15: Type (Required - Development or Research)</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <ExcelUploader
                  onFileSelect={handleFileSelect}
                  isUploading={isUploading}
                  isSuccess={uploadSuccess}
                  error={error}
                />
              </div>

              <div className="flex justify-center mt-6">
                <Button
                  onClick={() => navigate("/admin-projects")}
                  className="w-64 bg-blue-900 hover:bg-blue-800 text-white"
                >
                  View Projects
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Evaluators" && (
          <div className="p-6 bg-gray-100 border border-gray-300 rounded-lg shadow-sm text-center">
            <h2 className="text-2xl text-blue-900 font-bold mb-2">Evaluators</h2>
            <p className="text-gray-600">
              Coming Soon: A separate page will handle uploading evaluator files.
            </p>
            <Button
              onClick={() => navigate("/admin-evaluators")}
              className="mt-4 bg-blue-900 hover:bg-blue-800 text-white"
            >
              Go to Evaluators Page
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFileUpload;

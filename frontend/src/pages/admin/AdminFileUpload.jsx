import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExcelUploader from '../../components/admin/ExcelUploader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { BlurElements } from '../../components/shared/BlurElements';
import { processExcelFile } from '../../services/fileProcessingService';
import { mockDatabaseService } from '../../services/mockDatabaseService';

const AdminFileUpload = () => {
  const navigate = useNavigate();
  const [uploadedProjects, setUploadedProjects] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState(null);

  const projectColumns = [
    { header: 'Project Code', accessor: 'projectCode' },
    { header: 'Student 1 Name', accessor: row => row.student1?.name || '' },
    { header: 'Student 1 ID', accessor: row => row.student1?.id || '' },
    { header: 'Student 1 Email', accessor: row => row.student1?.email || '' },
    { header: 'Student 2 Name', accessor: row => row.student2?.name || '' },
    { header: 'Student 2 ID', accessor: row => row.student2?.id || '' },
    { header: 'Student 2 Email', accessor: row => row.student2?.email || '' },
    { header: 'Supervisor 1', accessor: 'supervisor1' },
    { header: 'Supervisor 2', accessor: 'supervisor2' },
    { header: 'Project Title', accessor: 'title' },
    { header: 'Part', accessor: 'part' },
    { header: 'Type', accessor: 'type' }
  ];

  const handleFileSelect = async (file) => {
    setIsUploading(true);
    setError(null);
    setUploadSuccess(false);

    try {
      const processedData = await processExcelFile(file);
      await mockDatabaseService.insertProjects(processedData);
      setUploadedProjects(processedData);
      setUploadSuccess(true);
      console.log("Projects uploaded successfully:", processedData);
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
        <div className="p-6 bg-slate-200 border border-blue-100 rounded-lg shadow-sm">
          <div className="mb-6 text-center">
            <h2 className="text-2xl text-blue-900 font-bold mb-2">Required File Format</h2>
            <p className="text-gray-600 mb-4 max-w-3xl mx-auto break-words leading-relaxed text-center">
              Please ensure your Excel file follows the format below before uploading.
            </p>
          </div>

          <div className="space-y-6">
            {/* File Format Requirements */}
            <div className="space-y-4">
              <div className="max-w-xl mx-auto">
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Column 1: Project Code (Required)</li>
                  <li>Column 2: Student 1 Name (Required)</li>
                  <li>Column 3: Student 1 ID (Required - 9 digits)</li>
                  <li>Column 4: Student 1 Email (Required - @e.braude.ac.il)</li>
                  <li>Column 5: Student 2 Name (Optional)</li>
                  <li>Column 6: Student 2 ID (Optional - 9 digits)</li>
                  <li>Column 7: Student 2 Email (Optional - @e.braude.ac.il)</li>
                  <li>Column 8: Supervisor 1 (Required)</li>
                  <li>Column 9: Supervisor 2 (Optional)</li>
                  <li>Column 10: Project Title (Required)</li>
                  <li>Column 11: Project Description (Optional)</li>
                  <li>Column 12: Part (Required - A or B)</li>
                  <li>Column 13: Type (Required - Development or Research)</li>
                </ul>
              </div>
            </div>

            {/* Upload Section */}
            <div className="space-y-6">
              <ExcelUploader 
                onFileSelect={handleFileSelect}
                isUploading={isUploading}
                isSuccess={uploadSuccess}
                error={error}
              />

              {uploadedProjects.length > 0 && (
                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-semibold text-blue-900">Uploaded Projects Preview</h3>
                  <Table
                    columns={projectColumns}
                    data={uploadedProjects}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center mt-6">
              <Button 
                onClick={() => navigate('/admin-projects')}
                className="w-64 bg-blue-900 hover:bg-blue-800 text-white"
              >
                View Projects
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFileUpload;


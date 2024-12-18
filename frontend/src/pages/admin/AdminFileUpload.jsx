import React, { useState } from 'react';
import ExcelUploader from '../../components/admin/ExcelUploader';
import { Card } from '../../components/ui/Card';
import { BlurElements } from '../../components/shared/BlurElements';

const TABS = ['Part A', 'Part B'];

const AdminFileUpload = () => {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const handleFileSelect = (file) => {
    console.log("Selected file:", file);
    // We'll implement the file processing logic later
  };

  return (
    <div className="relative bg-white min-h-screen overflow-hidden">
      <BlurElements />

      <div className="relative z-10">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center py-4">
              {TABS.map(tab => (
                <button
                  key={tab}
                  className={`inline-flex items-center px-3 pt-2 pb-3 border-b-2 text-base font-medium ${
                    activeTab === tab
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:border-purple-500 hover:text-foreground'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'Part A' ? (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-2">Upload Projects - Part A</h2>
              <p className="text-gray-600 mb-6">
                To load projects, please upload an Excel file (.xlsx) with the following format:
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium mb-2">Required Excel Format:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Column 1: Student 1</li>
                  <li>Column 2: Student 2</li>
                  <li>Column 3: Supervisor 1</li>
                  <li>Column 4: Supervisor 2 (Optional)</li>
                </ul>
              </div>

              <ExcelUploader onFileSelect={handleFileSelect} />
            </Card>
          ) : (
            <Card className="p-6">
              <h2 className="text-xl font-semibold">Part B Projects</h2>
              <p className="text-gray-600">Part B content will be implemented in the next phase.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFileUpload;


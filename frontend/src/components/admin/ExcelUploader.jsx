import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

const ExcelUploader = ({ onFileSelect, isUploading, isSuccess, error }) => {
  const validateFile = (file) => {
    if (!file) return false;
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid Excel or CSV file");
      return false;
    }

    return true;
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative flex flex-col items-center justify-center w-full max-w-sm h-40 sm:h-48 md:h-56 lg:h-64 border-2 border-dashed rounded-lg transition-colors
          ${isUploading ? 'opacity-50' : ''}
          ${isSuccess ? 'border-green-500' : error ? 'border-red-500' : 'border-gray-300'}`}
      >
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => {
            const file = e.target.files[0];
            if (validateFile(file)) onFileSelect(file);
          }}
          disabled={isUploading}
        />
        <p className="text-sm sm:text-base">{isUploading ? 'Uploading...' : 'Drag and drop or click to upload'}</p>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {isSuccess && <p className="text-green-500">File uploaded successfully!</p>}
    </div>
  );
};

export default ExcelUploader;
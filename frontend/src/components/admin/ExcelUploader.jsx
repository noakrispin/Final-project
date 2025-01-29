import React, { useState } from "react";
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { processExcelFile } from "../../services/fileProcessingService"; 

const ExcelUploader = ({ onFileSelect, isUploading, isSuccess, error }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const validateFile = (file) => {
    if (!file) return false;
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];

    return validTypes.includes(file.type);
  };

  const handleFileSelect = async (file) => {
    setUploadError(null);
    
    // Check if file is valid
    if (!validateFile(file)) {
      setUploadError("Invalid file type. Please upload an Excel or CSV file.");
      return;
    }

    try {
      // Determine the correct page type based on the URL
      const pageType = window.location.pathname.includes("evaluators")
        ? "evaluators"
        : "projects";

      const processedData = await processExcelFile(file, pageType);

      if (!processedData || processedData.length === 0) {
        setUploadError("The uploaded file contains no valid data.");
        return;
      }

      onFileSelect(file);
    } catch (error) {
      setUploadError(` ${error.message}`);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Upload Box */}
      <div
        className={`relative flex flex-col items-center justify-center w-full max-w-md h-48 border-2 border-dashed rounded-lg transition-all
          ${isUploading ? "opacity-50 cursor-wait" : "cursor-pointer"}
          ${isSuccess ? "border-green-500" : error ? "border-red-500" : "border-gray-300"}
          ${dragOver ? "bg-blue-50 border-blue-400" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => handleFileSelect(e.target.files[0])}
          disabled={isUploading}
        />
        {isUploading ? (
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        ) : isSuccess ? (
          <CheckCircle className="w-10 h-10 text-green-500" />
        ) : error ? (
          <AlertCircle className="w-10 h-10 text-red-500" />
        ) : (
          <Upload className="w-10 h-10 text-gray-500" />
        )}
        <p className="mt-3 text-sm text-gray-600 sm:text-base">
          {isUploading
            ? "Uploading..."
            : dragOver
            ? "Drop your file here"
            : "Drag & drop or click to upload"}
        </p>
      </div>

      {/* Error / Success Messages */}
      {uploadError && <p className="text-red-500 text-base">{uploadError}</p>}
      {isSuccess && <p className="text-green-500 text-base">File uploaded successfully!</p>}
    </div>
  );
};

export default ExcelUploader;

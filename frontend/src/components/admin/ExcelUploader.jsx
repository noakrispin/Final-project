import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

const ExcelUploader = ({ onFileSelect, isUploading, isSuccess, error }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = React.useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (validateFile(file)) {
      onFileSelect(file);
    }
  };

  const validateFile = (file) => {
    if (!file) return false;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'application/vnd.ms-excel', // xls
      'text/csv' // csv
    ];

    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid Excel or CSV file");
      return false;
    }

    return true;
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div 
        className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg transition-colors
          ${dragActive ? 'border-[#6366F1] bg-[#6366F1]/5' : 'border-gray-300 bg-gray-50'}
          ${isUploading ? 'opacity-50' : ''} 
          hover:bg-gray-100 cursor-pointer`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".xlsx,.xls,.csv"
          onChange={handleChange}
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {isSuccess ? (
            <CheckCircle className="w-10 h-10 mb-3 text-green-500" />
          ) : (
            <Upload className={`w-10 h-10 mb-3 ${error ? 'text-red-500' : 'text-gray-400'}`} />
          )}
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">Excel or CSV file</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {isSuccess && (
        <div className="flex items-center gap-2 text-green-500 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>File uploaded successfully!</span>
        </div>
      )}
    </div>
  );
};

export default ExcelUploader;


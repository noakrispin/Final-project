import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '../ui/Button';

const ExcelUploader = ({ onFileSelect }) => {
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
    if (file && file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      onFileSelect(file);
    } else {
      alert("Please upload a valid Excel file (.xlsx)");
    }
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      onFileSelect(file);
    } else {
      alert("Please upload a valid Excel file (.xlsx)");
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div 
      className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg transition-colors
        ${dragActive ? 'border-[#6366F1] bg-[#6366F1]/5' : 'border-gray-300 bg-gray-50'}
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
        accept=".xlsx"
        onChange={handleChange}
      />
      
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <Upload className="w-10 h-10 mb-3 text-gray-400" />
        <p className="mb-2 text-sm text-gray-500">
          <span className="font-semibold">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-500">Excel file (.xlsx)</p>
      </div>
    </div>
  );
};

export default ExcelUploader;


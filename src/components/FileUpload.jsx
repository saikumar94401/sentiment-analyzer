import React, { useRef } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

const FileUpload = ({ onFileUpload, isProcessing }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        alert('Please upload a CSV file');
        return;
      }
      onFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        alert('Please upload a CSV file');
        return;
      }
      onFileUpload(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2" />
        Batch Analysis (CSV Upload)
      </h3>
      
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isProcessing 
            ? 'border-gray-300 bg-gray-50' 
            : 'border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 cursor-pointer'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          disabled={isProcessing}
        />
        
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600">Processing CSV file...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-12 h-12 text-blue-500 mb-3" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop your CSV file here or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              CSV should have a 'text' column with content to analyze
            </p>
            <div className="flex items-center text-xs text-gray-400">
              <AlertCircle className="w-4 h-4 mr-1" />
              Maximum file size: 5MB
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
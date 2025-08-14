import React from 'react';
import FileUpload from '../components/FileUpload';
import BatchResults from '../components/BatchResults';

const BatchAnalysis = ({ onFileUpload, batchResults, isBatchProcessing, error }) => (
  <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
    <h2 className="text-2xl font-bold mb-4">Batch Sentiment Analysis (CSV)</h2>
    <FileUpload onFileUpload={onFileUpload} />
    {isBatchProcessing && <div className="text-blue-600">Processing CSV...</div>}
    {error && <div className="text-red-600 mt-4">{error}</div>}
    {batchResults.length > 0 && <BatchResults results={batchResults} />}
  </div>
);

export default BatchAnalysis;

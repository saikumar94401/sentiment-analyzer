import React from 'react';
import FileUpload from '../components/FileUpload';

const SingleAnalysis = ({ inputText, setInputText, onAnalyze, isLoading, results, error }) => (
  <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
    <h2 className="text-2xl font-bold mb-4">Single Sentiment Analysis</h2>
    <textarea
      className="w-full p-4 border rounded-xl mb-4"
      rows={5}
      value={inputText}
      onChange={e => setInputText(e.target.value)}
      placeholder="Enter text to analyze..."
    />
    <button
      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold"
      onClick={onAnalyze}
      disabled={isLoading || !inputText.trim()}
    >
      {isLoading ? 'Analyzing...' : 'Analyze'}
    </button>
    {error && <div className="text-red-600 mt-4">{error}</div>}
    {results.length > 0 && (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Result:</h3>
        <div className="bg-gray-50 p-4 rounded-xl">
          {results.map((r, i) => (
            <div key={i} className="mb-2">
              <span className="font-bold">{r.label}:</span> {Math.round(r.score * 100)}%
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default SingleAnalysis;

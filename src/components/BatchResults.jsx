import React from 'react';
import { Download, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react';

const BatchResults = ({ results, onDownload }) => {
  const getSentimentColor = (label) => {
    const normalizedLabel = label.toLowerCase();
    if (normalizedLabel.includes('positive')) return 'text-green-600';
    if (normalizedLabel.includes('negative')) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getSentimentBg = (label) => {
    const normalizedLabel = label.toLowerCase();
    if (normalizedLabel.includes('positive')) return 'bg-green-50 border-green-200';
    if (normalizedLabel.includes('negative')) return 'bg-red-50 border-red-200';
    return 'bg-yellow-50 border-yellow-200';
  };

  const getSentimentIcon = (label) => {
    const normalizedLabel = label.toLowerCase();
    if (normalizedLabel.includes('positive')) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (normalizedLabel.includes('negative')) return <AlertCircle className="w-4 h-4 text-red-600" />;
    return <MessageCircle className="w-4 h-4 text-yellow-600" />;
  };

  if (!results || results.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Batch Analysis Results ({results.length} items)
        </h3>
        <button
          onClick={onDownload}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <Download className="w-4 h-4" />
          <span>Download Results</span>
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-3">
        {results.map((item, index) => (
          <div key={index} className={`p-4 rounded-lg border ${getSentimentBg(item.sentiment.label)}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 mr-4">
                <p className="text-sm text-gray-700 line-clamp-2">{item.text}</p>
              </div>
              <div className="flex items-center space-x-2">
                {getSentimentIcon(item.sentiment.label)}
                <span className={`font-medium text-sm ${getSentimentColor(item.sentiment.label)}`}>
                  {item.sentiment.label.toUpperCase()}
                </span>
                <span className={`font-bold ${getSentimentColor(item.sentiment.label)}`}>
                  {Math.round(item.sentiment.score * 100)}%
                </span>
              </div>
            </div>
            
            {/* Show all sentiment scores */}
            {item.allScores && item.allScores.length > 1 && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {item.allScores.map((score, scoreIndex) => (
                    <div key={scoreIndex} className="flex justify-between">
                      <span className="text-gray-600">{score.label}:</span>
                      <span className={`font-medium ${getSentimentColor(score.label)}`}>
                        {Math.round(score.score * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BatchResults;
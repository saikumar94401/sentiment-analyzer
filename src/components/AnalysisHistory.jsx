import React from 'react';
import { History, Trash2, CheckCircle, AlertCircle, MessageCircle, Clock } from 'lucide-react';

const AnalysisHistory = ({ history, onClearHistory, onSelectFromHistory }) => {
  const getSentimentColor = (label) => {
    const normalizedLabel = label.toLowerCase();
    if (normalizedLabel.includes('positive')) return 'text-green-600';
    if (normalizedLabel.includes('negative')) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getSentimentIcon = (label) => {
    const normalizedLabel = label.toLowerCase();
    if (normalizedLabel.includes('positive')) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (normalizedLabel.includes('negative')) return <AlertCircle className="w-4 h-4 text-red-600" />;
    return <MessageCircle className="w-4 h-4 text-yellow-600" />;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!history || history.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 space-y-8 mt-3">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-100">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <History className="w-6 h-6" />
          Analysis History <span className="ml-2 px-2 py-1 text-xs bg-indigo-100 text-indigo-600 rounded-full">{history.length}</span>
        </h3>
        <button
          onClick={onClearHistory}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors duration-200 font-semibold"
        >
          <Trash2 className="w-5 h-5" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto flex flex-col gap-6">
        {history.map((item, index) => (
          <div 
            key={index} 
            className="p-6 border border-gray-200 rounded-2xl bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200 flex flex-col gap-4 shadow-sm"
            onClick={() => onSelectFromHistory(item.text)}
          >
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-2">
              <div className="flex-1 mr-4">
                <p className="text-base text-gray-700 line-clamp-2">{item.text}</p>
              </div>
              <div className="flex items-center gap-3">
                {getSentimentIcon(item.topSentiment.label)}
                <span className={`font-semibold text-base ${getSentimentColor(item.topSentiment.label)}`}>
                  {item.topSentiment.label.toUpperCase()}
                </span>
                <span className={`font-bold text-lg ${getSentimentColor(item.topSentiment.label)}`}>
                  {Math.round(item.topSentiment.score * 100)}%
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatDate(item.timestamp)}</span>
              </div>

              {/* Show all sentiment percentages */}
              <div className="flex flex-wrap gap-4">
                {item.allResults.map((result, resultIndex) => (
                  <span key={resultIndex} className={getSentimentColor(result.label)}>
                    {result.label}: {Math.round(result.score * 100)}%
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisHistory;
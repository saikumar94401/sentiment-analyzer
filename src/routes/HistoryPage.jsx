
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import AnalysisHistory from '../components/AnalysisHistory';


const HistoryPage = ({ history, onClearHistory, onSelectFromHistory }) => {
  const location = useLocation();
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">Analysis History</h2>
      <AnalysisHistory history={history} onClearHistory={onClearHistory} onSelectFromHistory={onSelectFromHistory} />
    </div>
  );
};

export default HistoryPage;

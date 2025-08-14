
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import AnalysisHistory from '../components/AnalysisHistory';

const tabs = [
  {
    name: 'Batch CSV',
  },
  {
    name: 'History',
  },
];

const HistoryPage = ({ history, onClearHistory, onSelectFromHistory }) => {
  const location = useLocation();
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <nav className="flex justify-center mb-8">
        <div className="flex gap-2 p-1 bg-white/80 backdrop-blur-lg rounded-2xl border border-yellow-200 w-fit">
          {tabs.map(tab => {
            const isActive = location.pathname === tab.to;
            return (
              <NavLink
                key={tab.name}
                to={tab.to}
                className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-white shadow-lg text-orange-600 scale-105'
                    : 'text-yellow-700 hover:text-yellow-800 hover:bg-white/60'
                }`}
              >
                <span>{tab.name}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
      <h2 className="text-2xl font-bold mb-6">Analysis History</h2>
      <AnalysisHistory history={history} onClearHistory={onClearHistory} onSelectFromHistory={onSelectFromHistory} />
    </div>
  );
};

export default HistoryPage;

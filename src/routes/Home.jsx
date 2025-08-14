

import React from 'react';
import { FileText, Upload, History } from 'lucide-react';

const Home = () => {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <nav className="flex justify-center mb-8">
        <div className="flex gap-2 p-1 bg-white/80 backdrop-blur-lg rounded-2xl border border-yellow-200 w-fit">
          <div className="flex items-center px-6 py-3 rounded-xl font-semibold text-orange-600 bg-white shadow-lg scale-105">
            <FileText className="w-5 h-5 mr-2" />
            <span>Single Analysis</span>
          </div>
          <div className="flex items-center px-6 py-3 rounded-xl font-semibold text-yellow-700 hover:text-yellow-800 hover:bg-white/60">
            <Upload className="w-5 h-5 mr-2" />
            <span>Batch CSV</span>
          </div>
          <div className="flex items-center px-6 py-3 rounded-xl font-semibold text-yellow-700 hover:text-yellow-800 hover:bg-white/60">
            <History className="w-5 h-5 mr-2" />
            <span>History</span>
          </div>
        </div>
      </nav>
      {/* Single Analysis Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Single Sentiment Analysis</h2>
        {/* Place your single analysis form and result here */}
      </section>
      {/* Batch CSV Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Batch Sentiment Analysis (CSV)</h2>
        {/* Place your batch CSV upload and results here */}
      </section>
      {/* History Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Analysis History</h2>
        {/* Place your history component here */}
      </section>
    </div>
  );
};

export default Home;

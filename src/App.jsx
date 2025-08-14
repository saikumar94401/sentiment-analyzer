import React, { useState } from 'react';
import { MessageCircle, Sparkles, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import FileUpload from './components/FileUpload';
import BatchResults from './components/BatchResults';
import AnalysisHistory from './components/AnalysisHistory';

function App() {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState([]);
  const [batchResults, setBatchResults] = useState([]);
  const [analysisHistory, setAnalysisHistory] = useState(() => {
    const saved = localStorage.getItem('sentimentHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [error, setError] = useState(null);

  const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;

  const sampleTexts = [
    "I love this product! It's amazing and works perfectly.",
    "I hate waiting in long lines. It's so frustrating.",
    "The weather is okay today, nothing special.",
    "This movie made me cry tears of joy!",
    "I'm disappointed with the service quality."
  ];

  // Save to history
  const saveToHistory = (text, results) => {
    const historyItem = {
      text,
      allResults: results,
      topSentiment: results[0],
      timestamp: Date.now()
    };
    
    const newHistory = [historyItem, ...analysisHistory.slice(0, 49)]; // Keep last 50
    setAnalysisHistory(newHistory);
    localStorage.setItem('sentimentHistory', JSON.stringify(newHistory));
  };

  // Parse CSV content
  const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const textColumnIndex = headers.findIndex(h => 
      h.includes('text') || h.includes('content') || h.includes('message')
    );
    
    if (textColumnIndex === -1) {
      throw new Error('CSV must contain a column named "text", "content", or "message"');
    }
    
    return lines.slice(1).map(line => {
      const columns = line.split(',');
      return columns[textColumnIndex]?.trim().replace(/^"|"$/g, '') || '';
    }).filter(text => text.length > 0);
  };

  // Handle CSV file upload
  const handleFileUpload = async (file) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File size must be less than 5MB');
      return;
    }

    setIsBatchProcessing(true);
    setError(null);
    setBatchResults([]);

    try {
      const csvText = await file.text();
      const texts = parseCSV(csvText);
      
      if (texts.length === 0) {
        throw new Error('No valid text found in CSV file');
      }

      if (texts.length > 100) {
        throw new Error('Maximum 100 texts allowed per batch');
      }

      const results = [];
      
      // Process in batches of 5 to avoid rate limiting
      for (let i = 0; i < texts.length; i += 5) {
        const batch = texts.slice(i, i + 5);
        const batchPromises = batch.map(async (text) => {
          try {
            const response = await fetch(
              "https://router.huggingface.co/hf-inference/models/tabularisai/multilingual-sentiment-analysis",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${HF_TOKEN}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ inputs: text }),
              }
            );

            if (!response.ok) {
              throw new Error(`API Error: ${response.status}`);
            }

            const result = await response.json();
            return {
              text,
              sentiment: result[0][0],
              allScores: result[0]
            };
          } catch (err) {
            return {
              text,
              sentiment: { label: 'ERROR', score: 0 },
              allScores: [],
              error: err.message
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Small delay between batches
        if (i + 5 < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setBatchResults(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsBatchProcessing(false);
    }
  };

  // Download batch results as CSV
  const downloadBatchResults = () => {
    const csvContent = [
      ['Text', 'Sentiment', 'Confidence', 'All Scores'].join(','),
      ...batchResults.map(item => [
        `"${item.text.replace(/"/g, '""')}"`,
        item.sentiment.label,
        Math.round(item.sentiment.score * 100) + '%',
        `"${item.allScores.map(s => `${s.label}: ${Math.round(s.score * 100)}%`).join('; ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentiment_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  async function analyzeSentiment(text) {
    if (!text.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    if (!HF_TOKEN) {
      setError('Hugging Face API token is not configured. Please add VITE_HF_TOKEN to your environment variables.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://router.huggingface.co/hf-inference/models/tabularisai/multilingual-sentiment-analysis",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: text }),
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Invalid or expired Hugging Face API token. Please check your token permissions.');
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (Array.isArray(result) && result.length > 0) {
        const sentimentResults = result[0];
        setResults(sentimentResults);
        saveToHistory(text, sentimentResults);
      } else {
        throw new Error('Unexpected API response format');
      }
    } catch (err) {
      console.error('Sentiment analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze sentiment');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  const getSentimentColor = (label) => {
    const normalizedLabel = label.toLowerCase();
    if (normalizedLabel.includes('positive')) return 'text-green-600';
    if (normalizedLabel.includes('negative')) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getAllSentimentColors = (results) => {
    return results.map(result => ({
      ...result,
      color: getSentimentColor(result.label)
    }));
  };

  const getSentimentBg = (label) => {
    const normalizedLabel = label.toLowerCase();
    if (normalizedLabel.includes('positive')) return 'bg-green-50 border-green-200';
    if (normalizedLabel.includes('negative')) return 'bg-red-50 border-red-200';
    return 'bg-yellow-50 border-yellow-200';
  };

  const getSentimentIcon = (label) => {
    const normalizedLabel = label.toLowerCase();
    if (normalizedLabel.includes('positive')) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (normalizedLabel.includes('negative')) return <AlertCircle className="w-5 h-5 text-red-600" />;
    return <MessageCircle className="w-5 h-5 text-yellow-600" />;
  };

  const handleSampleClick = (sample) => {
    setInputText(sample);
    setError(null);
    setResults([]);
  };

  const handleSelectFromHistory = (text) => {
    setInputText(text);
    setError(null);
    setResults([]);
  };

  const clearHistory = () => {
    setAnalysisHistory([]);
    localStorage.removeItem('sentimentHistory');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-4">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Advanced Sentiment Analysis
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the emotional tone of any text using advanced AI. Analyze individual texts or upload CSV files for batch processing.
          </p>
        </div>

        {/* File Upload Section */}
        <FileUpload 
          onFileUpload={handleFileUpload} 
          isProcessing={isBatchProcessing}
        />

        {/* Batch Results */}
        <BatchResults 
          results={batchResults}
          onDownload={downloadBatchResults}
        />

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* Input Section */}
          <div className="mb-6">
            <label htmlFor="text-input" className="block text-lg font-semibold text-gray-800 mb-3">
              Enter text to analyze
            </label>
            <div className="relative">
              <textarea
                id="text-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or paste your text here..."
                className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none text-gray-800 placeholder-gray-400"
                maxLength={1000}
              />
              <div className="absolute bottom-3 right-3 text-sm text-gray-400">
                {inputText.length}/1000
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => analyzeSentiment(inputText)}
            disabled={isLoading || !inputText.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing sentiment...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>Analyze Sentiment</span>
              </div>
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Results Display */}
          {results.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Detailed Sentiment Analysis
              </h3>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 ${getSentimentBg(result.label)} transition-all duration-200 hover:shadow-md`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getSentimentIcon(result.label)}
                        <div>
                          <span className={`font-semibold text-lg ${getSentimentColor(result.label)}`}>
                            {result.label.toUpperCase()}
                          </span>
                          <div className="text-sm text-gray-500">Primary Sentiment</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getSentimentColor(result.label)}`}>
                          {Math.round(result.score * 100)}%
                        </div>
                        <div className="text-sm text-gray-500">confidence</div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            result.label.toLowerCase().includes('positive')
                              ? 'bg-green-500'
                              : result.label.toLowerCase().includes('negative')
                              ? 'bg-red-500'
                              : 'bg-yellow-500'
                          }`}
                          style={{ width: `${result.score * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* All Sentiment Scores */}
              {results.length > 1 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-semibold text-gray-800 mb-3">All Sentiment Confidence Scores</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {getAllSentimentColors(results).map((result, index) => (
                      <div key={index} className="text-center">
                        <div className={`text-2xl font-bold ${result.color} mb-1`}>
                          {Math.round(result.score * 100)}%
                        </div>
                        <div className="text-sm text-gray-600 font-medium">
                          {result.label.toUpperCase()}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              result.label.toLowerCase().includes('positive')
                                ? 'bg-green-500'
                                : result.label.toLowerCase().includes('negative')
                                ? 'bg-red-500'
                                : 'bg-yellow-500'
                            }`}
                            style={{ width: `${result.score * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sample Texts */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Try these examples:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sampleTexts.map((sample, index) => (
              <button
                key={index}
                onClick={() => handleSampleClick(sample)}
                className="text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-gray-700 hover:text-blue-700"
              >
                <span className="text-sm">{sample}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Analysis History */}
        <AnalysisHistory 
          history={analysisHistory}
          onClearHistory={clearHistory}
          onSelectFromHistory={handleSelectFromHistory}
        />

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Powered by Hugging Face AI • Supports multiple languages • Batch processing available
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
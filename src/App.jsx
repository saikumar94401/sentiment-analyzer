import React, { useState } from 'react';
import { Upload, Download, History, BarChart3, FileText, Trash2, Calendar, Sparkles, TrendingUp, Brain } from 'lucide-react';

const SentimentAnalyzer = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('single');
  const [csvData, setCsvData] = useState([]);
  const [csvResults, setCsvResults] = useState([]);
  const [processingCsv, setProcessingCsv] = useState(false);
  
  // Enhanced tokenizer with comprehensive vocabulary
  const tokenizeText = (text) => {
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(word => word.length > 0);

    const vocab = {
      // Ultra positive (5 points)
      
      'excellent': 5, 'amazing': 5, 'outstanding': 5, 'fantastic': 5, 'wonderful': 5,
      'brilliant': 5, 'perfect': 5, 'awesome': 5, 'incredible': 5, 'superb': 5,
      'extraordinary': 5, 'phenomenal': 5, 'spectacular': 5, 'magnificent': 5,
      
      // Strong positive (4 points)
      'great': 4, 'impressive': 4, 'delightful': 4, 'terrific': 4, 'marvelous': 4,
      'fabulous': 4, 'splendid': 4, 'remarkable': 4, 'love': 4,
      
      // Moderate positive (3 points)
      'good': 3, 'nice': 3, 'pleasant': 3, 'enjoyable': 3, 'satisfying': 3,
      'happy': 3, 'satisfied': 3, 'positive': 3, 'cheerful': 3, 'content': 3,
      
      // Mild positive (2 points)
      'like': 2, 'pretty': 2, 'decent': 2, 'solid': 2, 'fine': 2,
      'comfortable': 2, 'pleased': 2, 'glad': 2, 'better': 2,
      
      // Slightly positive (1 point)
      'okay': 1, 'alright': 1, 'fair': 1, 'adequate': 1, 'acceptable': 1,
      
      // Ultra negative (-5 points)
      'terrible': -5, 'awful': -5, 'horrible': -5, 'disgusting': -5, 'worst': -5,
      'hate': -5, 'despise': -5, 'atrocious': -5, 'dreadful': -5, 'appalling': -5,
      'nightmare': -5, 'disaster': -5,
      
      // Strong negative (-4 points)
      'bad': -4, 'poor': -4, 'disappointing': -4, 'unpleasant': -4, 'annoying': -4,
      'frustrating': -4, 'irritating': -4, 'ridiculous': -4, 'pathetic': -4,
      
      // Moderate negative (-3 points)
      'sad': -3, 'angry': -3, 'upset': -3, 'negative': -3, 'wrong': -3,
      'failed': -3, 'broken': -3, 'boring': -3, 'dull': -3,
      
      // Mild negative (-2 points)
      'dislike': -2, 'slow': -2, 'limited': -2, 'mediocre': -2, 'average': -2,
      
      // Slightly negative (-1 point)
      'meh': -1, 'lacking': -1, 'missing': -1, 'incomplete': -1,
      
      // Intensifiers
      'very': 1.6, 'extremely': 2.0, 'really': 1.4, 'quite': 1.3,
      'absolutely': 2.2, 'totally': 1.8, 'completely': 1.9, 'incredibly': 2.0,
      
      // Negators
      'not': -1.2, 'never': -1.4, 'no': -0.8, 'nothing': -1.1, 'none': -1.0
    };
    
    let scores = [];
    let multiplier = 1;
    let negationActive = false;
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const baseScore = vocab[word] || 0;
      
      // Handle intensifiers
      if (['very', 'extremely', 'really', 'quite', 'absolutely', 'totally', 'completely', 'incredibly'].includes(word)) {
        multiplier = vocab[word];
        continue;
      }
      
      // Handle negators
      if (['not', 'never', 'no', 'nothing', 'none'].includes(word)) {
        negationActive = true;
        continue;
      }
      
      if (baseScore !== 0) {
        let finalScore = baseScore * multiplier;
        if (negationActive) {
          finalScore = -finalScore * 0.8;
        }
        scores.push(finalScore);
        multiplier = 1;
        negationActive = false;
      }
    }

    
    
    return scores.length > 0 ? scores : [0];
  };

  // Advanced sentiment analysis
  const analyzeSentiment = (text) => {
    if (!text.trim()) return { 
      sentiment: 'Neutral', 
      confidences: { Positive: 33, Neutral: 34, Negative: 33 },
      overall_confidence: 0,
      textStats: { words: 0, sentences: 0 }
    };

    const tokens = tokenizeText(text);
    const totalScore = tokens.reduce((sum, token) => sum + token, 0);
    const avgScore = totalScore / tokens.length;
    
    // Text statistics
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const textStats = {
      words: words.length,
      sentences: sentences.length
    };
    
    // Calculate probabilities
    let posScore = Math.max(0, avgScore);
    let negScore = Math.max(0, -avgScore);
    let neutScore = 1 / (1 + Math.abs(avgScore));
    
    // Normalize probabilities
    const totalProb = posScore + negScore + neutScore + 0.1;
    let posProb = posScore / totalProb;
    let negProb = negScore / totalProb;
    let neutProb = neutScore / totalProb;
    
    // Convert to percentages
    const confidences = {
      Positive: Math.round(posProb * 100),
      Negative: Math.round(negProb * 100),
      Neutral: Math.round(neutProb * 100)
    };
    
    // Ensure sum = 100
    const sum = confidences.Positive + confidences.Negative + confidences.Neutral;
    if (sum !== 100) {
      const diff = 100 - sum;
      const maxKey = Object.keys(confidences).reduce((a, b) => 
        confidences[a] > confidences[b] ? a : b
      );
      confidences[maxKey] += diff;
    }
    
    // Determine primary sentiment
    const maxConfidence = Math.max(confidences.Positive, confidences.Negative, confidences.Neutral);
    let sentiment = 'Neutral';
    if (confidences.Positive === maxConfidence && maxConfidence > 40) sentiment = 'Positive';
    else if (confidences.Negative === maxConfidence && maxConfidence > 40) sentiment = 'Negative';
    
    return { 
      sentiment, 
      confidences,
      overall_confidence: maxConfidence,
      score: avgScore,
      textStats,
      sentimentStrength: Math.abs(avgScore) > 2 ? 'Strong' : Math.abs(avgScore) > 1 ? 'Moderate' : 'Mild'
    };
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    
    setTimeout(() => {
      const analysis = analyzeSentiment(text);
      setResult(analysis);
      
      const historyItem = {
        id: Date.now(),
        text: text.trim(),
        result: analysis,
        timestamp: new Date().toLocaleString(),
        type: 'single'
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 99)]);
      
      setLoading(false);
    }, 1200);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          alert('CSV must have at least a header row and one data row');
          return;
        }
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        const data = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row = { id: index + 1 };
          headers.forEach((header, i) => {
            row[header] = values[i] || '';
          });
          return row;
        }).filter(row => Object.values(row).some(val => val && val !== ''));
        
        setCsvData(data);
        setCsvResults([]);
      } catch (error) {
        alert('Error parsing CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const processCsvBatch = async () => {
    if (csvData.length === 0) return;
    
    setProcessingCsv(true);
    setCsvResults([]);
    
    const textColumns = Object.keys(csvData[0]).filter(key => {
      const keyLower = key.toLowerCase();
      return keyLower.includes('text') || keyLower.includes('comment') || 
             keyLower.includes('review') || keyLower.includes('message') ||
             keyLower.includes('content');
    });
    
    const textColumn = textColumns[0] || Object.keys(csvData[0]).find(key => key !== 'id') || Object.keys(csvData[0])[0];
    
    const results = [];
    
    for (let i = 0; i < csvData.length; i++) {
      setTimeout(() => {
        const row = csvData[i];
        const text = row[textColumn] || '';
        const analysis = analyzeSentiment(text);
        
        const result = {
          ...row,
          analyzed_text: text,
          sentiment: analysis.sentiment,
          sentiment_strength: analysis.sentimentStrength,
          positive_confidence: analysis.confidences.Positive,
          negative_confidence: analysis.confidences.Negative,
          neutral_confidence: analysis.confidences.Neutral,
          overall_confidence: analysis.overall_confidence,
          word_count: analysis.textStats.words
        };
        
        results.push(result);
        setCsvResults([...results]);
        
        if (results.length === csvData.length) {
          setProcessingCsv(false);
          
          const summary = {
            total: results.length,
            positive: results.filter(r => r.sentiment === 'Positive').length,
            negative: results.filter(r => r.sentiment === 'Negative').length,
            neutral: results.filter(r => r.sentiment === 'Neutral').length
          };
          
          const historyItem = {
            id: Date.now(),
            text: `Batch analysis: ${csvData.length} items from ${textColumn}`,
            result: {
              sentiment: 'Batch',
              batch_results: results,
              summary: summary
            },
            timestamp: new Date().toLocaleString(),
            type: 'batch'
          };
          setHistory(prev => [historyItem, ...prev.slice(0, 99)]);
        }
      }, i * 200);
    }
  };

  const downloadResults = () => {
    if (csvResults.length === 0) return;
    
    const headers = Object.keys(csvResults[0]).join(',');
    const csvContent = [headers, ...csvResults.map(row => 
      Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    )].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentiment_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'Positive': return 'text-emerald-600';
      case 'Negative': return 'text-rose-600';
      case 'Batch': return 'text-indigo-600';
      default: return 'text-slate-600';
    }
  };

  const getSentimentBg = (sentiment) => {
    switch (sentiment) {
      case 'Positive': return 'bg-emerald-50 border-emerald-200';
      case 'Negative': return 'bg-rose-50 border-rose-200';
      case 'Batch': return 'bg-indigo-50 border-indigo-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'Positive': return '🌟';
      case 'Negative': return '⚡';
      case 'Batch': return '📊';
      default: return '⚖️';
    }
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'Strong': return 'text-purple-600 bg-purple-100';
      case 'Moderate': return 'text-blue-600 bg-blue-100';
      case 'Mild': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const examples = [
    "I absolutely love this new restaurant! The food was incredible and the service was outstanding.",
    "This product is completely terrible. Worst purchase I've ever made, totally disappointed.",
    "The presentation was okay. Nothing special but not bad either, pretty average overall.",
    "I'm so excited about the new features! This update is amazingly well thought out.",
    "The customer service was frustrating and unhelpful. Really disappointed with the experience."
  ];

  return (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      {/* Header */}
  <header className="bg-white/90 backdrop-blur-xl border-b border-yellow-200 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 via-yellow-600 to-pink-500 bg-clip-text text-transparent">
                  Sentiment Analysis
                </h1>
               
              </div>
            </div>
            
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-2 p-1 bg-white/80 backdrop-blur-lg rounded-2xl border border-yellow-200 w-fit">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex items-center px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'single'
                ? 'bg-white shadow-lg text-orange-600 scale-105'
                : 'text-yellow-700 hover:text-yellow-800 hover:bg-white/60'
            }`}
          >
            <FileText className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Single Analysis</span>
            <span className="sm:hidden">Single</span>
          </button>
          
          <button
            onClick={() => setActiveTab('batch')}
            className={`flex items-center px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'batch'
                ? 'bg-white shadow-lg text-orange-600 scale-105'
                : 'text-yellow-700 hover:text-yellow-800 hover:bg-white/60'
            }`}
          >
            <Upload className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Batch CSV</span>
            <span className="sm:hidden">Batch</span>
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'history'
                ? 'bg-white shadow-lg text-orange-600 scale-105'
                : 'text-yellow-700 hover:text-yellow-800 hover:bg-white/60'
            }`}
          >
            <History className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">History</span>
            <span className="sm:hidden">History</span>
            {history.length > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-indigo-100 text-indigo-600 rounded-full">
                {history.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        
        {/* Single Analysis Tab */}
        {activeTab === 'single' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-lg mr-3">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Text Analysis</h3>
                </div>
                
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700">
                    Enter your text for sentiment analysis
                  </label>
                  <div className="relative">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Share your thoughts, reviews, feedback, or any text you'd like analyzed..."
                      className="w-full h-40 p-4 text-slate-700 bg-white/70 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 resize-none placeholder:text-slate-400 shadow-inner"
                      maxLength={2000}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                      {text.length}/2000
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleAnalyze}
                      disabled={!text.trim() || loading}
                      className="flex-1 relative px-8 py-4 bg-gradient-to-r from-orange-500 via-yellow-400 to-pink-400 text-white font-semibold rounded-2xl hover:from-orange-600 hover:via-yellow-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 shadow-lg hover:shadow-2xl hover:scale-105 transform"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Analyzing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <Sparkles className="w-5 h-5" />
                          <span>Analyze Sentiment</span>
                          <TrendingUp className="w-5 h-5" />
                        </div>
                      )}
                    </button>
                    <button
                      onClick={() => setText('')}
                      className="px-6 py-4 bg-yellow-100 text-yellow-700 font-medium rounded-2xl hover:bg-yellow-200 transition-all duration-300"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* Examples */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-yellow-200 p-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Try These Examples</h3>
                <div className="grid gap-3">
                  {examples.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setText(example)}
                      className="w-full text-left p-4 text-sm bg-gradient-to-r from-slate-50 to-white hover:from-indigo-50 hover:to-purple-50 rounded-xl transition-all duration-300 border border-slate-200 hover:border-indigo-200 hover:shadow-md"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-lg">
                          {index < 2 ? '✨' : index < 4 ? '⚡' : '⚖️'}
                        </span>
                        <span className="text-slate-700">{example}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {result ? (
                <>
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-yellow-200 p-8 transform hover:scale-105 transition-all duration-500">
                    <div className="text-center">
                      <div className="text-8xl mb-6 animate-bounce">
                        {getSentimentIcon(result.sentiment)}
                      </div>
                      
                      <div className="space-y-4">
                        <h2 className={`text-4xl font-bold ${getSentimentColor(result.sentiment)}`}>
                          {result.sentiment}
                        </h2>
                        
                        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStrengthColor(result.sentimentStrength)}`}>
                          {result.sentimentStrength} Sentiment
                        </div>
                        
                        <div className="bg-white/60 rounded-2xl p-4 space-y-2">
                          <div className="flex justify-between text-sm text-slate-600">
                            <span>Overall Confidence</span>
                            <span className="font-semibold">{result.overall_confidence}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-1000 ${
                                result.sentiment === 'Positive' ? 'bg-emerald-500' :
                                result.sentiment === 'Negative' ? 'bg-rose-500' : 'bg-slate-500'
                              }`}
                              style={{ width: `${result.overall_confidence}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-yellow-200 p-8">
                    <h3 className="text-xl font-semibold text-slate-800 mb-6">Confidence Breakdown</h3>
                    
                    <div className="space-y-6">
                      {/* Positive */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">🌟</span>
                            <span className="font-semibold text-emerald-600">Positive</span>
                          </div>
                          <span className="text-lg font-bold text-emerald-600">{result.confidences.Positive}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-4">
                          <div 
                            className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-4 rounded-full transition-all duration-1000 shadow-inner"
                            style={{ width: `${result.confidences.Positive}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Negative */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">⚡</span>
                            <span className="font-semibold text-rose-600">Negative</span>
                          </div>
                          <span className="text-lg font-bold text-rose-600">{result.confidences.Negative}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-4">
                          <div 
                            className="bg-gradient-to-r from-rose-400 to-rose-600 h-4 rounded-full transition-all duration-1000 shadow-inner"
                            style={{ width: `${result.confidences.Negative}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Neutral */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">⚖️</span>
                            <span className="font-semibold text-slate-600">Neutral</span>
                          </div>
                          <span className="text-lg font-bold text-slate-600">{result.confidences.Neutral}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-4">
                          <div 
                            className="bg-gradient-to-r from-slate-400 to-slate-600 h-4 rounded-full transition-all duration-1000 shadow-inner"
                            style={{ width: `${result.confidences.Neutral}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Text Stats */}
                    <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                      <h4 className="font-semibold text-slate-700 mb-2">Text Statistics</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Words:</span>
                          <span className="ml-2 font-semibold">{result.textStats.words}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Sentences:</span>
                          <span className="ml-2 font-semibold">{result.textStats.sentences}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-yellow-200 p-8 text-center">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">Ready to Analyze</h3>
                  <p className="text-slate-500">Enter some text and click "Analyze Sentiment" to get started!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Batch CSV Tab */}
        {activeTab === 'batch' && (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-yellow-200 p-8">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg mr-3">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">Upload CSV File</h3>
                </div>
                
                <div className="border-2 border-dashed border-yellow-300 rounded-2xl p-8 text-center hover:border-orange-400 transition-all duration-300">
                  <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="mb-4"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer text-orange-600 hover:text-orange-700 font-semibold">
                    Choose CSV file
                  </label>
                  <p className="text-sm text-slate-500 mt-2">
                    Upload a CSV with text data to analyze in batch
                  </p>
                </div>
                
                {csvData.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <p className="text-yellow-700 font-semibold">
                        ✅ Successfully loaded {csvData.length} rows
                      </p>
                      <p className="text-sm text-yellow-600 mt-1">
                        Columns: {Object.keys(csvData[0]).join(', ')}
                      </p>
                    </div>
                    <button
                      onClick={processCsvBatch}
                      disabled={processingCsv}
                      className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-semibold rounded-2xl hover:from-orange-600 hover:to-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      {processingCsv ? (
                        <div className="flex items-center justify-center space-x-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Processing... ({csvResults.length}/{csvData.length})</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <BarChart3 className="w-5 h-5" />
                          <span>Process Batch Analysis</span>
                        </div>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Results Summary */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-yellow-200 p-8">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg mr-3">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">Batch Results</h3>
                </div>
                
                {csvResults.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200">
                        <div className="text-3xl font-bold text-emerald-600 mb-1">
                          {csvResults.filter(r => r.sentiment === 'Positive').length}
                        </div>
                        <div className="text-sm font-medium text-emerald-700">Positive</div>
                        <div className="text-xs text-emerald-600">
                          {Math.round((csvResults.filter(r => r.sentiment === 'Positive').length / csvResults.length) * 100)}%
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
                        <div className="text-3xl font-bold text-slate-600 mb-1">
                          {csvResults.filter(r => r.sentiment === 'Neutral').length}
                        </div>
                        <div className="text-sm font-medium text-slate-700">Neutral</div>
                        <div className="text-xs text-slate-600">
                          {Math.round((csvResults.filter(r => r.sentiment === 'Neutral').length / csvResults.length) * 100)}%
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl border border-rose-200">
                        <div className="text-3xl font-bold text-rose-600 mb-1">
                          {csvResults.filter(r => r.sentiment === 'Negative').length}
                        </div>
                        <div className="text-sm font-medium text-rose-700">Negative</div>
                        <div className="text-xs text-rose-600">
                          {Math.round((csvResults.filter(r => r.sentiment === 'Negative').length / csvResults.length) * 100)}%
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={downloadResults}
                      className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-semibold rounded-2xl hover:from-orange-600 hover:to-yellow-500 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                    >
                      <Download className="w-5 h-5" />
                      <span>Download Enhanced CSV</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-slate-600 mb-2">No Results Yet</h4>
                    <p className="text-slate-500">Upload and process a CSV file to see results here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Results Table */}
            {csvResults.length > 0 && (
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-yellow-200 p-8">
                <h3 className="text-xl font-semibold text-slate-800 mb-6">Detailed Analysis Results</h3>
                <div className="overflow-x-auto">
                  <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 sticky top-0">
                        <tr>
                          <th className="text-left p-3 font-semibold text-slate-700">ID</th>
                          <th className="text-left p-3 font-semibold text-slate-700">Text Preview</th>
                          <th className="text-center p-3 font-semibold text-slate-700">Sentiment</th>
                          <th className="text-center p-3 font-semibold text-slate-700">Strength</th>
                          <th className="text-center p-3 font-semibold text-emerald-700">Pos%</th>
                          <th className="text-center p-3 font-semibold text-slate-700">Neu%</th>
                          <th className="text-center p-3 font-semibold text-rose-700">Neg%</th>
                          <th className="text-center p-3 font-semibold text-slate-700">Words</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {csvResults.map((row, index) => (
                          <tr key={index} className="hover:bg-slate-50 transition-colors duration-200">
                            <td className="p-3 font-medium">{row.id}</td>
                            <td className="p-3 max-w-xs">
                              <div className="truncate text-slate-600">
                                {row.analyzed_text}
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center space-x-1">
                                <span>{getSentimentIcon(row.sentiment)}</span>
                                <span className={`font-semibold ${getSentimentColor(row.sentiment)}`}>
                                  {row.sentiment}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStrengthColor(row.sentiment_strength)}`}>
                                {row.sentiment_strength}
                              </span>
                            </td>
                            <td className="p-3 text-center font-semibold text-emerald-600">
                              {row.positive_confidence}%
                            </td>
                            <td className="p-3 text-center font-semibold text-slate-600">
                              {row.neutral_confidence}%
                            </td>
                            <td className="p-3 text-center font-semibold text-rose-600">
                              {row.negative_confidence}%
                            </td>
                            <td className="p-3 text-center text-slate-600">
                              {row.word_count}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Analysis History</h3>
                <p className="text-slate-600 mt-1">Your recent sentiment analysis results</p>
              </div>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="px-6 py-3 bg-rose-100 text-rose-600 rounded-2xl hover:bg-rose-200 transition-all duration-300 flex items-center space-x-2 font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {history.length > 0 ? (
              <div className="grid gap-6">
                {history.map((item, index) => (
                  <div key={item.id} className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border p-6 hover:shadow-xl transition-all duration-300 ${getSentimentBg(item.result.sentiment)}`}>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{getSentimentIcon(item.result.sentiment)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`text-lg font-bold ${getSentimentColor(item.result.sentiment)}`}>
                              {item.result.sentiment}
                            </span>
                            {item.type === 'single' && item.result.sentimentStrength && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStrengthColor(item.result.sentimentStrength)}`}>
                                {item.result.sentimentStrength}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-700 text-sm mb-3 line-clamp-2">{item.text}</p>
                          <div className="flex items-center text-xs text-slate-500 space-x-4">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{item.timestamp}</span>
                            </div>
                            <span className="px-2 py-1 bg-slate-100 rounded-full">
                              {item.type === 'single' ? 'Single Analysis' : 'Batch Analysis'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col lg:items-end space-y-2 lg:min-w-0 lg:w-64">
                        {item.type === 'single' && item.result.confidences && (
                          <div className="grid grid-cols-3 gap-2 w-full lg:w-48">
                            <div className="text-center p-2 bg-emerald-50 rounded-lg">
                              <div className="text-xs font-medium text-emerald-700">Positive</div>
                              <div className="text-sm font-bold text-emerald-600">{item.result.confidences.Positive}%</div>
                            </div>
                            <div className="text-center p-2 bg-slate-50 rounded-lg">
                              <div className="text-xs font-medium text-slate-700">Neutral</div>
                              <div className="text-sm font-bold text-slate-600">{item.result.confidences.Neutral}%</div>
                            </div>
                            <div className="text-center p-2 bg-rose-50 rounded-lg">
                              <div className="text-xs font-medium text-rose-700">Negative</div>
                              <div className="text-sm font-bold text-rose-600">{item.result.confidences.Negative}%</div>
                            </div>
                          </div>
                        )}
                        
                        {item.type === 'batch' && item.result.summary && (
                          <div className="grid grid-cols-2 gap-2 w-full lg:w-48">
                            <div className="text-center p-2 bg-indigo-50 rounded-lg">
                              <div className="text-xs font-medium text-indigo-700">Total Items</div>
                              <div className="text-sm font-bold text-indigo-600">{item.result.summary.total}</div>
                            </div>
                            <div className="text-center p-2 bg-emerald-50 rounded-lg">
                              <div className="text-xs font-medium text-emerald-700">Positive</div>
                              <div className="text-sm font-bold text-emerald-600">{item.result.summary.positive}</div>
                            </div>
                            <div className="text-center p-2 bg-rose-50 rounded-lg">
                              <div className="text-xs font-medium text-rose-700">Negative</div>
                              <div className="text-sm font-bold text-rose-600">{item.result.summary.negative}</div>
                            </div>
                            <div className="text-center p-2 bg-slate-50 rounded-lg">
                              <div className="text-xs font-medium text-slate-700">Neutral</div>
                              <div className="text-sm font-bold text-slate-600">{item.result.summary.neutral}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-12 text-center">
                <div className="text-6xl mb-6">📝</div>
                <h3 className="text-2xl font-semibold text-slate-700 mb-3">No History Yet</h3>
                <p className="text-slate-500 mb-6">Your analyzed texts and batch processing results will appear here</p>
                <button
                  onClick={() => setActiveTab('single')}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300"
                >
                  Start Your First Analysis
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      
    </div>
  );
};

export default SentimentAnalyzer;
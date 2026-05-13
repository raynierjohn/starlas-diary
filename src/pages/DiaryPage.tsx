import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import Starla from '../components/Starla';
import DiaryEntry from '../components/DiaryEntry';
import { format } from 'date-fns';
import { showSuccess, showError } from '../components/Toast';

const LoadingSpin: React.FC = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
  </div>
);

interface DiaryPageProps {
  user: any;
}

const DiaryPage: React.FC<DiaryPageProps> = ({ user }) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isWriting, setIsWriting] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isStarlaSpeaking, setIsStarlaSpeaking] = useState(false);
  const [lastSavedEntry, setLastSavedEntry] = useState<any>(null);
  const [entryFormKey, setEntryFormKey] = useState(0);

  const API_URL = import.meta.env.VITE_SUPABASE_URL 
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-text`
    : 'https://jqcdrguaydkefhwcssww.supabase.co/functions/v1/analyze-text';
  const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .order('entry_date', { ascending: false });
      
      if (!error && data) setEntries(data);
    } catch (err) {
      console.error('Load entries error:', err);
    }
  };

  const handleAnalyze = async (content: string) => {
    setAnalyzing(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: content })
      });

      if (!response.ok) throw new Error('Analysis failed');
      
      const data = await response.json();
      setAiInsight(data.aiCommentary);
      setIsStarlaSpeaking(true);
      setTimeout(() => setIsStarlaSpeaking(false), 3500);
      return data;
    } catch (err: any) {
      showError(err.message);
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveEntry = async (entry: any) => {
    const analysis = await handleAnalyze(entry.content);
    
    const entryData = {
      user_id: user.id,
      title: entry.title,
      content: entry.content,
      sentiment: analysis?.sentiment || 'neutral',
      sentiment_score: analysis?.sentimentScore || 0.5,
      keywords: analysis?.keywords || [],
      topics: analysis?.topics || [],
      ai_insight: analysis?.aiCommentary || null,
      entry_date: format(selectedDate, 'yyyy-MM-dd')
    };

    const { error } = entry.id
      ? await supabase.from('diary_entries').update(entryData).eq('id', entry.id)
      : await supabase.from('diary_entries').insert([entryData]);
    
    if (!error) {
      await loadEntries();
      setIsWriting(true);
      setSelectedEntry(null);
      setLastSavedEntry(entryData);
      setAiInsight(analysis?.aiCommentary || null);
      setEntryFormKey(prev => prev + 1);
      showSuccess(entry.id ? '✨ Entry updated! ✨' : '🌟 Entry saved! 🌟');
    } else {
      showError(error.message);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm('Delete this entry?')) return;
    
    const { error } = await supabase.from('diary_entries').delete().eq('id', id);
    if (!error) {
      await loadEntries();
      setSelectedEntry(null);
      if (lastSavedEntry?.id === id) {
        setLastSavedEntry(null);
        setAiInsight(null);
      }
      showSuccess('Entry deleted');
    } else {
      showError(error.message);
    }
  };

  const getSentimentEmoji = (sentiment: string): string => {
    const map: Record<string, string> = {
      positive: '😊', negative: '😔', neutral: '😐',
      'very positive': '🎉', 'slightly positive': '🙂',
      'slightly negative': '😕', 'very negative': '😢'
    };
    return map[sentiment] || '😐';
  };

  const getSentimentColor = (sentiment: string): string => {
    if (sentiment.includes('positive')) return 'bg-green-900/50 text-green-300 border-green-800';
    if (sentiment.includes('negative')) return 'bg-red-900/50 text-red-300 border-red-800';
    return 'bg-gray-800/50 text-gray-300 border-gray-700';
  };

  const viewEntry = (entry: any) => {
    setSelectedEntry(entry);
    setIsWriting(false);
    setAiInsight(entry.ai_insight);
  };

  const startNewEntry = () => {
    setSelectedEntry(null);
    setIsWriting(true);
    setAiInsight(null);
    setLastSavedEntry(null);
    setEntryFormKey(prev => prev + 1);
  };

  // Star background component
  const StarBackground = () => (
    <>
      <div className="absolute inset-0">
        {[...Array(400)].map((_, i) => (
          <div key={i} className="absolute bg-white rounded-full"
            style={{
              width: `${Math.random() * 2 + 0.5}px`,
              height: `${Math.random() * 2 + 0.5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0">
        {[...Array(120)].map((_, i) => (
          <div key={i} className="absolute bg-white rounded-full"
            style={{
              width: `${Math.random() * 3 + 1.5}px`,
              height: `${Math.random() * 3 + 1.5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
              animation: `twinkle ${2 + Math.random() * 3}s infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="absolute w-0.5 h-0.5 bg-white rounded-full"
          style={{
            top: `${Math.random() * 60}%`,
            left: `${Math.random() * 100}%`,
            animation: `shootingStar ${15 + Math.random() * 10}s linear infinite`,
            animationDelay: `${Math.random() * 20}s`
          }}
        />
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 relative overflow-hidden">
      <StarBackground />

      <div className="relative z-10 container mx-auto px-4">
        {/* Quick Entry Bar */}
        <div className="pt-6">
          <div className="flex items-center justify-between gap-4 bg-gray-900/30 backdrop-blur-md rounded-xl p-3 border border-yellow-800/30">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xl">✏️</span>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Ready to write?</p>
                <p className="text-white text-sm font-medium">Share your thoughts with Starla</p>
              </div>
            </div>
            <button
              onClick={startNewEntry}
              className="px-6 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:shadow-yellow-500/25 hover:shadow-lg transition-all font-medium"
            >
              Write Entry ✨
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 py-6">
          {/* Left Column - Diary Entry */}
          <div className="space-y-6">
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-gray-700/30">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  {selectedEntry 
                    ? format(new Date(selectedEntry.entry_date), 'MMMM d, yyyy')
                    : format(selectedDate, 'MMMM d, yyyy')}
                </h2>
                {selectedEntry && !isWriting && (
                  <div className="flex gap-2">
                    <button onClick={() => { setIsWriting(true); setSelectedEntry(null); }} className="px-3 py-1 text-yellow-400 hover:bg-yellow-900/50 rounded-lg text-sm">✏️ Edit</button>
                    <button onClick={() => handleDeleteEntry(selectedEntry.id)} className="px-3 py-1 text-red-400 hover:bg-red-900/50 rounded-lg text-sm">🗑️ Delete</button>
                    <button onClick={startNewEntry} className="px-3 py-1 text-gray-400 hover:bg-gray-800 rounded-lg text-sm">New Entry</button>
                  </div>
                )}
              </div>

              {isWriting ? (
                <DiaryEntry 
                  key={entryFormKey}
                  entry={selectedEntry} 
                  onSave={handleSaveEntry} 
                  onCancel={startNewEntry} 
                />
              ) : selectedEntry && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getSentimentEmoji(selectedEntry.sentiment)}</span>
                    <span className="text-lg font-semibold capitalize text-white">{selectedEntry.sentiment}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getSentimentColor(selectedEntry.sentiment)}`}>
                      {(selectedEntry.sentiment_score * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{selectedEntry.title}</h3>
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{selectedEntry.content}</p>
                  {selectedEntry.keywords?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.keywords.slice(0, 8).map((kw: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-gray-800 text-gray-300 rounded-full text-xs border border-gray-700">#{kw}</span>
                      ))}
                    </div>
                  )}
                  {selectedEntry.ai_insight && (
                    <div className="p-4 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg border border-yellow-800/50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">⭐</span>
                        <span className="font-semibold text-yellow-400">Starla's Insight</span>
                      </div>
                      <p className="text-gray-300 text-sm">{selectedEntry.ai_insight}</p>
                    </div>
                  )}
                </div>
              )}

              {analyzing && (
                <div className="mt-4 text-center text-gray-400 flex items-center justify-center gap-2">
                  <LoadingSpin />
                  <span>✨ Starla is reading... ✨</span>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
              <h3 className="text-sm font-semibold text-yellow-400 mb-2">💡 Writing Tips</h3>
              <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                <span>✨ Be honest with your feelings</span>
                <span>📝 Write regularly</span>
                <span>🎯 Focus on what matters</span>
              </div>
            </div>
          </div>

          {/* Right Column - Starla */}
          <div className="space-y-6">
            <div className="flex justify-center">
              <Starla 
                isSpeaking={isStarlaSpeaking} 
                sentiment={entries[0]?.sentiment || lastSavedEntry?.sentiment || 'neutral'}
                isVisible={true}
              />
            </div>

            {/* Starla's Message */}
            <div className="relative bg-gray-900/60 backdrop-blur-md rounded-2xl p-5 border border-yellow-800/30">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gray-900/60 border-t-2 border-l-2 border-yellow-800/30 rotate-45"></div>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xl">⭐</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white">Starla</span>
                    {isStarlaSpeaking && <span className="text-xs text-yellow-400 animate-pulse">✨ twinkling... ✨</span>}
                  </div>
                  <p className="text-gray-300 text-sm">
                    {aiInsight || lastSavedEntry?.ai_insight || "✨ Write about your day and I'll share my thoughts! 🌟"}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Entries */}
            {entries.length > 0 && (
              <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
                <h3 className="text-sm font-semibold text-yellow-400 mb-3">📖 Recent Entries</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {entries.slice(0, 5).map((entry) => (
                    <button key={entry.id} onClick={() => viewEntry(entry)} className="w-full text-left p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{getSentimentEmoji(entry.sentiment)}</span>
                          <span className="text-sm text-gray-300">{entry.title}</span>
                        </div>
                        <span className="text-xs text-gray-500">{format(new Date(entry.entry_date), 'MMM d')}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {lastSavedEntry && isWriting && (
              <div className="text-center animate-fadeIn">
                <div className="inline-flex items-center gap-2 bg-yellow-900/50 text-yellow-300 px-4 py-2 rounded-full text-xs border border-yellow-700/30">
                  ✓ ✨ Entry saved! ✨
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes twinkle { 0%,100% { opacity: 0.2; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
        @keyframes shootingStar { 0% { transform: translateX(0) translateY(0); opacity: 0.8; } 100% { transform: translateX(-250px) translateY(120px); opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default DiaryPage;
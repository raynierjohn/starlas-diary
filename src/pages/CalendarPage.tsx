import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import MoodCalendar from '../components/MoodCalendar';
import MoodStats from '../components/MoodStats';
import { format } from 'date-fns';
import { showSuccess, showError } from '../components/Toast';

const LoadingSpin: React.FC = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
  </div>
);

interface CalendarPageProps {
  onNavigateToDiary: () => void;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ onNavigateToDiary }) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntries, setSelectedEntries] = useState<any[]>([]);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    const emojiMap: Record<string, string> = {
      positive: '😊', negative: '😔', neutral: '😐',
      'very positive': '🎉', 'slightly positive': '🙂',
      'slightly negative': '😕', 'very negative': '😢'
    };
    return emojiMap[sentiment] || '😐';
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment.includes('positive')) return 'bg-green-900/50 text-green-300 border-green-800';
    if (sentiment.includes('negative')) return 'bg-red-900/50 text-red-300 border-red-800';
    return 'bg-gray-800/50 text-gray-300 border-gray-700';
  };

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const entriesForDate = entries.filter(entry => 
      format(new Date(entry.entry_date), 'yyyy-MM-dd') === dateStr
    );
    setSelectedEntries(entriesForDate);
    setSelectedDate(date);
    setShowEntryModal(true);
    setEditingEntry(null);
  };

  const handleEditEntry = (entry: any) => {
    setEditingEntry(entry);
    setEditTitle(entry.title);
    setEditContent(entry.content);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      showError('Title and content cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('diary_entries')
        .update({ 
          title: editTitle, 
          content: editContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingEntry.id);

      if (error) throw error;

      await loadEntries();
      
      const updatedEntries = selectedEntries.map(entry => 
        entry.id === editingEntry.id 
          ? { ...entry, title: editTitle, content: editContent }
          : entry
      );
      setSelectedEntries(updatedEntries);
      
      setEditingEntry(null);
      showSuccess('✨ Entry updated! ✨');
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!window.confirm('Delete this entry?')) return;

    try {
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      await loadEntries();
      
      const updatedEntries = selectedEntries.filter(entry => entry.id !== entryId);
      setSelectedEntries(updatedEntries);
      
      if (updatedEntries.length === 0) setShowEntryModal(false);
      
      showSuccess('Entry deleted');
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleAddEntry = () => {
    setShowEntryModal(false);
    onNavigateToDiary();
  };

  const handleCancelEdit = () => setEditingEntry(null);

  // Star background component
  const StarBackground = () => (
    <>
      <div className="absolute inset-0">
        {[...Array(300)].map((_, i) => (
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
        {[...Array(80)].map((_, i) => (
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
    </>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 flex items-center justify-center">
        <LoadingSpin />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 relative overflow-hidden">
      <StarBackground />

      <div className="relative z-10 container mx-auto px-4 py-6 md:py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Calendar */}
          <div className="lg:col-span-2">
            <MoodCalendar entries={entries} onSelectDate={handleDateClick} />
          </div>

          {/* Right Column - Stats & Info */}
          <div className="space-y-6">
            <MoodStats entries={entries} />
            
            {/* Tips Card */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-yellow-800/30">
              <h3 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                <span>💫</span> Starla's Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">📅 Click any date to view entries</li>
                <li className="flex items-center gap-2">✏️ Edit or delete entries as needed</li>
                <li className="flex items-center gap-2">🎨 Colors show your emotional state</li>
                <li className="flex items-center gap-2">✨ Each star tells your story</li>
              </ul>
            </div>
            
            <button
              onClick={handleAddEntry}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 rounded-xl shadow-lg hover:shadow-yellow-500/25 hover:shadow-xl transition-all font-semibold transform hover:scale-[1.02]"
            >
              ✨ Write New Entry ✨
            </button>
          </div>
        </div>

        {/* Entry Modal */}
        {showEntryModal && selectedDate && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-yellow-800/30">
              <div className="sticky top-0 bg-gray-900 border-b border-yellow-800/30 p-4 flex justify-between items-center rounded-t-2xl">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {format(selectedDate, 'MMMM d, yyyy')}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {selectedEntries.length} {selectedEntries.length === 1 ? 'entry' : 'entries'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowEntryModal(false);
                    setEditingEntry(null);
                  }}
                  className="text-gray-400 hover:text-gray-200 transition-colors text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {selectedEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No entries for this date</p>
                    <button
                      onClick={handleAddEntry}
                      className="mt-3 text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      Write an entry →
                    </button>
                  </div>
                ) : (
                  selectedEntries.map((entry, index) => (
                    <div key={entry.id} className="space-y-3 pb-4 border-b border-gray-800 last:border-b-0">
                      {editingEntry?.id === entry.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white text-lg font-semibold"
                            placeholder="Title"
                          />
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={6}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white"
                            placeholder="Content"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveEdit}
                              disabled={isSaving}
                              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                            >
                              {isSaving ? 'Saving...' : 'Save ✨'}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{getSentimentEmoji(entry.sentiment)}</span>
                                <span className="text-md font-semibold capitalize text-white">
                                  {entry.sentiment}
                                </span>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs ${getSentimentColor(entry.sentiment)}`}>
                                {(entry.sentiment_score * 100).toFixed(0)}% confidence
                              </span>
                              <span className="text-xs text-gray-500">#{index + 1}</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditEntry(entry)}
                                className="px-3 py-1 text-yellow-400 hover:bg-yellow-900/50 rounded-lg transition-colors text-sm"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="px-3 py-1 text-red-400 hover:bg-red-900/50 rounded-lg transition-colors text-sm"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-bold text-white">{entry.title}</h3>
                          <p className="text-gray-300 text-sm leading-relaxed">{entry.content}</p>
                          
                          {entry.keywords?.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {entry.keywords.slice(0, 6).map((kw: string, i: number) => (
                                <span key={i} className="px-2 py-1 bg-gray-800 text-gray-400 rounded-full text-xs border border-gray-700">
                                  #{kw}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {entry.ai_insight && (
                            <div className="mt-2 p-3 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg border border-yellow-800/50">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm">⭐</span>
                                <span className="font-semibold text-yellow-400 text-sm">Starla's Insight</span>
                              </div>
                              <p className="text-gray-300 text-xs leading-relaxed">{entry.ai_insight}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default CalendarPage;
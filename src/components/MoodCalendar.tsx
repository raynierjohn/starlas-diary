import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, subMonths, addMonths } from 'date-fns';

interface DiaryEntry {
  id: string;
  sentiment: string;
  sentiment_score: number;
  entry_date: string;
}

interface MoodCalendarProps {
  entries: DiaryEntry[];
  onSelectDate: (date: Date) => void;
}

const MoodCalendar: React.FC<MoodCalendarProps> = ({ entries, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const getSentimentEmoji = (sentiment: string): string => {
    const sentimentMap: Record<string, string> = {
      positive: '😊',
      negative: '😔',
      neutral: '😐',
      'very positive': '🎉',
      'slightly positive': '🙂',
      'slightly negative': '😕',
      'very negative': '😢'
    };
    return sentimentMap[sentiment] || '😐';
  };

  const getSentimentColor = (sentiment: string): string => {
    const colorMap: Record<string, string> = {
      positive: 'bg-green-200 dark:bg-green-800',
      negative: 'bg-red-200 dark:bg-red-800',
      neutral: 'bg-gray-200 dark:bg-gray-700',
      'very positive': 'bg-green-300 dark:bg-green-700',
      'slightly positive': 'bg-green-100 dark:bg-green-900',
      'slightly negative': 'bg-red-100 dark:bg-red-900',
      'very negative': 'bg-red-300 dark:bg-red-700'
    };
    return colorMap[sentiment] || 'bg-gray-100 dark:bg-gray-800';
  };

  const getEntriesForDate = (date: Date): DiaryEntry[] => {
    return entries.filter(entry => isSameDay(new Date(entry.entry_date), date));
  };

  const getDominantMoodForDate = (date: Date): string => {
    const dayEntries = getEntriesForDate(date);
    if (dayEntries.length === 0) return 'neutral';
    
    const sentimentCount: Record<string, number> = {};
    dayEntries.forEach(entry => {
      sentimentCount[entry.sentiment] = (sentimentCount[entry.sentiment] || 0) + 1;
    });
    
    const sorted = Object.entries(sentimentCount).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'neutral';
  };

  const goToPreviousMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 transition-colors duration-200">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
        >
          ←
        </button>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const dayEntries = getEntriesForDate(day);
          const entryCount = dayEntries.length;
          const dominantMood = getDominantMoodForDate(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          
          return (
            <button
              key={idx}
              onClick={() => onSelectDate(day)}
              className={`aspect-square p-2 rounded-lg transition-all hover:scale-105 relative ${
                isCurrentMonth 
                  ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700' 
                  : 'bg-gray-50 dark:bg-gray-900 opacity-50'
              } ${entryCount > 0 ? getSentimentColor(dominantMood) : ''}`}
            >
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{format(day, 'd')}</div>
                {entryCount > 0 && (
                  <div className="flex flex-col items-center mt-1">
                    <div className="text-lg">
                      {getSentimentEmoji(dominantMood)}
                    </div>
                    {entryCount > 1 && (
                      <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-black/50 rounded-full px-1">
                        +{entryCount - 1}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center flex flex-wrap justify-center gap-3">
          <span><span className="inline-block w-3 h-3 bg-green-200 dark:bg-green-800 rounded-full mx-1"></span> Positive</span>
          <span><span className="inline-block w-3 h-3 bg-red-200 dark:bg-red-800 rounded-full mx-1"></span> Negative</span>
          <span><span className="inline-block w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-full mx-1"></span> Neutral</span>
          <span><span className="inline-block w-3 h-3 bg-yellow-200 dark:bg-yellow-900 rounded-full mx-1"></span> Multiple entries</span>
        </div>
      </div>
    </div>
  );
};

export default MoodCalendar;
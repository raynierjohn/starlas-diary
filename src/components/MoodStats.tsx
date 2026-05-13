import React from 'react';

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  sentiment: string;
  sentiment_score: number;
  keywords: string[];
  topics: string[];
  ai_insight: string;
  entry_date: string;
  created_at: string;
}

interface MoodStatsProps {
  entries: DiaryEntry[];
}

const MoodStats: React.FC<MoodStatsProps> = ({ entries }) => {
  const sentimentCounts = entries.reduce<Record<string, number>>((acc, entry) => {
    const sentiment = entry.sentiment || 'neutral';
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {});

  const totalEntries = entries.length;
  
  const topSentiments = Object.entries(sentimentCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const sentimentEmojis: Record<string, string> = {
    positive: '😊',
    negative: '😔',
    neutral: '😐',
    'very positive': '🎉',
    'slightly positive': '🙂',
    'slightly negative': '😕',
    'very negative': '😢'
  };

  const sentimentLabels: Record<string, string> = {
    positive: 'Positive',
    negative: 'Negative',
    neutral: 'Neutral',
    'very positive': 'Very Positive',
    'slightly positive': 'Slightly Positive',
    'slightly negative': 'Slightly Negative',
    'very negative': 'Very Negative'
  };

  const get7DayPositivityScore = () => {
    if (entries.length === 0) return null;
    
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
    );
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const last7DaysEntries = sortedEntries.filter(entry => 
      new Date(entry.entry_date) >= sevenDaysAgo
    );
    
    if (last7DaysEntries.length === 0) return null;
    
    const getMoodValue = (sentiment: string): number => {
      const valueMap: Record<string, number> = {
        'very positive': 90,
        'positive': 75,
        'slightly positive': 60,
        'neutral': 50,
        'slightly negative': 40,
        'negative': 25,
        'very negative': 10
      };
      return valueMap[sentiment] || 50;
    };
    
    const totalMood = last7DaysEntries.reduce((sum, entry) => {
      return sum + getMoodValue(entry.sentiment);
    }, 0);
    
    return totalMood / last7DaysEntries.length;
  };

  const get7DayMoodTrend = () => {
    if (entries.length === 0) {
      return { 
        trend: '📝 No Data', 
        message: 'Write your first diary entry to start tracking your mood! ✨',
        direction: 'neutral',
        entriesCount: 0
      };
    }

    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
    );
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const last7DaysEntries = sortedEntries.filter(entry => 
      new Date(entry.entry_date) >= sevenDaysAgo
    );
    
    const entriesCount = last7DaysEntries.length;
    
    if (entriesCount === 0) {
      return { 
        trend: '📝 No Data', 
        message: 'No entries in the last 7 days. Write something to see your trend! 📔',
        direction: 'neutral',
        entriesCount: 0
      };
    }
    
    const getMoodValue = (sentiment: string): number => {
      const valueMap: Record<string, number> = {
        'very positive': 90,
        'positive': 75,
        'slightly positive': 60,
        'neutral': 50,
        'slightly negative': 40,
        'negative': 25,
        'very negative': 10
      };
      return valueMap[sentiment] || 50;
    };
    
    if (entriesCount === 1) {
      const mood = last7DaysEntries[0].sentiment;
      const moodDisplay = sentimentLabels[mood] || mood;
      return { 
        trend: '📊 Starting Point', 
        message: `You have 1 entry this week with ${moodDisplay} sentiment. Keep writing to see your trend! 🌱`,
        direction: 'neutral',
        entriesCount: 1
      };
    }
    
    if (entriesCount === 2) {
      const firstMood = last7DaysEntries[0].sentiment;
      const lastMood = last7DaysEntries[1].sentiment;
      const firstValue = getMoodValue(firstMood);
      const lastValue = getMoodValue(lastMood);
      const change = lastValue - firstValue;
      
      if (change > 10) {
        return { 
          trend: '⬆️ Improving', 
          message: `Your mood has improved over your last 2 entries! Keep going! 🌟`,
          direction: 'up',
          entriesCount: 2
        };
      } else if (change < -10) {
        return { 
          trend: '⬇️ Declining', 
          message: `Your mood has shifted. Consider what might be affecting your emotions. 💙`,
          direction: 'down',
          entriesCount: 2
        };
      } else {
        return { 
          trend: '➡️ Stable', 
          message: `Your mood has been consistent across your last 2 entries. ⚖️`,
          direction: 'stable',
          entriesCount: 2
        };
      }
    }
    
    const midPoint = Math.floor(entriesCount / 2);
    const firstHalf = last7DaysEntries.slice(0, midPoint);
    const secondHalf = last7DaysEntries.slice(midPoint);
    
    const getAverageMoodValue = (entriesList: DiaryEntry[]) => {
      if (entriesList.length === 0) return 50;
      const sum = entriesList.reduce((total, entry) => total + getMoodValue(entry.sentiment), 0);
      return sum / entriesList.length;
    };
    
    const firstHalfAvg = getAverageMoodValue(firstHalf);
    const secondHalfAvg = getAverageMoodValue(secondHalf);
    const change = secondHalfAvg - firstHalfAvg;
    
    let trend = '➡️ Stable';
    let direction = 'stable';
    let message = '';
    
    if (change > 8) {
      trend = '⬆️ Improving Mood';
      direction = 'up';
      message = `Your mood has been trending upward over your last ${entriesCount} entries! Keep up the positive momentum! 🌟`;
    } else if (change < -8) {
      trend = '⬇️ Declining Mood';
      direction = 'down';
      message = `Your mood has been trending downward. Take time for self-care and reflection. 💙`;
    } else {
      trend = '➡️ Stable Mood';
      direction = 'stable';
      message = `Your mood has remained stable over your last ${entriesCount} entries. Good emotional balance! ⚖️`;
    }
    
    return { trend, message, direction, entriesCount };
  };

  const getMostCommonMood = () => {
    if (entries.length === 0) return 'No entries yet';
    const sorted = Object.entries(sentimentCounts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'Unknown';
  };

  const sevenDayScore = get7DayPositivityScore();
  const moodTrend = get7DayMoodTrend();
  const mostCommonMood = getMostCommonMood();

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'from-green-500 to-green-600';
    if (score >= 50) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return "You're feeling exceptional this week! 🌟";
    if (score >= 70) return "You've had a positive week! 😊";
    if (score >= 60) return "Generally positive week! Keep it up! 🙂";
    if (score >= 50) return "A balanced week emotionally 😐";
    if (score >= 40) return "Room for improvement this week 💪";
    return "A challenging week - be kind to yourself 💙";
  };

  const getTrendColor = (direction: string) => {
    if (direction === 'up') return 'text-green-600 dark:text-green-400';
    if (direction === 'down') return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getTrendBgColor = (direction: string) => {
    if (direction === 'up') return 'bg-green-50 dark:bg-green-900/20';
    if (direction === 'down') return 'bg-red-50 dark:bg-red-900/20';
    return 'bg-yellow-50 dark:bg-yellow-900/20';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 transition-colors duration-200">
      <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">📊 Emotional Insights</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalEntries}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Entries</div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-sm font-semibold text-purple-600 dark:text-purple-400 capitalize">
              {sentimentLabels[mostCommonMood] || mostCommonMood}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Most Common Mood</div>
          </div>
        </div>

        {/* 7-Day Positivity Score */}
        <div className="text-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Last 7 Days Positivity</div>
          {sevenDayScore ? (
            <>
              <div className="text-4xl font-bold mb-2" style={{ color: sevenDayScore >= 70 ? '#10b981' : sevenDayScore >= 50 ? '#f59e0b' : '#ef4444' }}>
                {Math.round(sevenDayScore)}%
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getScoreColor(sevenDayScore)} rounded-full transition-all duration-500`}
                  style={{ width: `${sevenDayScore}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {getScoreMessage(sevenDayScore)}
              </div>
            </>
          ) : (
            <div className="py-4">
              <div className="text-gray-500 dark:text-gray-400">No entries in the last 7 days</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Write an entry to see your 7-day score!</div>
            </div>
          )}
        </div>

        {/* 7-Day Mood Trend */}
        <div className={`text-center p-3 rounded-lg ${getTrendBgColor(moodTrend.direction)}`}>
          <div className={`text-lg font-bold ${getTrendColor(moodTrend.direction)}`}>
            {moodTrend.trend}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {moodTrend.message}
          </div>
          {moodTrend.entriesCount > 0 && (
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Based on {moodTrend.entriesCount} {moodTrend.entriesCount === 1 ? 'entry' : 'entries'} in the last 7 days
            </div>
          )}
        </div>

        {/* Emotion Breakdown */}
        {topSentiments.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 text-sm text-gray-700 dark:text-gray-300">All-Time Emotion Breakdown</h4>
            <div className="space-y-2">
              {topSentiments.map(([sentiment, count]) => (
                <div key={sentiment} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{sentimentEmojis[sentiment] || '😐'}</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{sentimentLabels[sentiment] || sentiment}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 dark:bg-blue-600 rounded-full"
                        style={{ width: `${(count / totalEntries) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Summary */}
        {entries.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold mb-2 text-sm text-gray-700 dark:text-gray-300">📝 Weekly Reflection</h4>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>📊 Showing data from the last 7 days only</div>
              <div>🎯 Your most common mood all-time: {sentimentLabels[mostCommonMood] || mostCommonMood}</div>
              <div>💡 {sevenDayScore && sevenDayScore >= 70 ? 'This has been a positive week! 🌟' : 
                         sevenDayScore && sevenDayScore >= 50 ? "You're doing well this week! ⚖️" : 
                         'Every week is a new opportunity - you\'ve got this! 💪'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodStats;
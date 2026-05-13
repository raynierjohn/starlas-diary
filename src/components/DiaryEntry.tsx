import React, { useState } from 'react';

interface DiaryEntryProps {
  entry?: {
    id?: string;
    title: string;
    content: string;
  };
  onSave: (entry: any) => void;
  onCancel: () => void;
  darkMode?: boolean;
}

const DiaryEntry: React.FC<DiaryEntryProps> = ({ entry, onSave, onCancel, darkMode = false }) => {
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [wordCount, setWordCount] = useState(0);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    const words = newContent.trim().split(/\s+/).filter(w => w.length > 0).length;
    setWordCount(words);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSave({ title, content, ...(entry?.id && { id: entry.id }) });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-700 text-white transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Diary Entry
        </label>
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Write your thoughts here... Starla will analyze your emotions automatically! ⭐"
          rows={10}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-700 text-white transition-colors"
          required
        />
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-400">
            ⭐ Starla will analyze your entry and detect your emotions automatically
          </p>
          <p className="text-xs text-gray-400">
            {wordCount} words
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-2 rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-colors"
        >
          Save Entry ✨
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-700 text-gray-300 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default DiaryEntry;
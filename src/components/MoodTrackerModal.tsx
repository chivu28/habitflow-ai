import React, { useState, useEffect } from 'react';
import { MoodType, MoodLog } from '../types';
import { X, Sparkles, Heart } from 'lucide-react';

interface MoodTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  currentMoodLog?: MoodLog;
  onSave: (date: string, data: {
    mood: MoodType;
    energy: number;
    notes?: string;
    tags?: string[];
  }) => Promise<void>;
}

const MOODS: { id: MoodType; label: string; emoji: string; color: string; desc: string }[] = [
  { id: 'ecstatic', label: 'Ecstatic', emoji: '🤩', color: 'from-amber-400 to-yellow-500', desc: 'Peak energy & motivation' },
  { id: 'happy', label: 'Happy', emoji: '😊', color: 'from-emerald-400 to-teal-500', desc: 'Positive & grounded' },
  { id: 'neutral', label: 'Balanced', emoji: '😌', color: 'from-blue-400 to-indigo-500', desc: 'Steady & calm' },
  { id: 'tired', label: 'Tired', emoji: '😴', color: 'from-purple-400 to-violet-600', desc: 'Low battery / sluggish' },
  { id: 'stressed', label: 'Stressed', emoji: '⚡', color: 'from-rose-400 to-pink-600', desc: 'High friction or overwhelm' }
];

const COMMON_TAGS = [
  'Deep Work', 'Sound Sleep', 'Cardio / Gym', 'Clean Eating',
  'Meditation', 'Family & Friends', 'Outdoors', 'Reading',
  'Too Much Screen', 'Late Bedtime'
];

export const MoodTrackerModal: React.FC<MoodTrackerModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  currentMoodLog,
  onSave
}) => {
  const [mood, setMood] = useState<MoodType>('happy');
  const [energy, setEnergy] = useState<number>(4);
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentMoodLog) {
      setMood(currentMoodLog.mood);
      setEnergy(currentMoodLog.energy || 3);
      setNotes(currentMoodLog.notes || '');
      setSelectedTags(currentMoodLog.tags || []);
    } else {
      setMood('happy');
      setEnergy(4);
      setNotes('');
      setSelectedTags([]);
    }
  }, [currentMoodLog, isOpen]);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(selectedDate, {
        mood,
        energy,
        notes: notes.trim(),
        tags: selectedTags
      });
      onClose();
    } catch (err) {
      console.error('Failed to save mood log:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-pink-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Daily Mood & Energy Check-in
              </h2>
              <p className="text-xs text-slate-400">
                Reflecting on {selectedDate} • Earn +30 XP
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          {/* Mood Grid */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              How are you feeling overall?
            </label>
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMood(m.id)}
                  className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all duration-200 border ${
                    mood === m.id
                      ? 'bg-blue-600/30 border-blue-400 shadow-lg shadow-blue-500/20 scale-105'
                      : 'bg-slate-800/40 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-2xl filter drop-shadow">{m.emoji}</span>
                  <span className="text-[11px] font-semibold tracking-tight">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Energy Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Energy Level
              </label>
              <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-2.5 py-0.5 rounded-full border border-cyan-400/20">
                {energy} / 5 {energy >= 4 ? '⚡ High Vitality' : energy === 3 ? '🔋 Steady' : '🪫 Low'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
              <span>1 - Exhausted</span>
              <span>3 - Moderate</span>
              <span>5 - Supercharged</span>
            </div>
          </div>

          {/* Influencing Factor Tags */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Influencing Factors
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm'
                        : 'bg-slate-800/60 border-white/10 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reflection note */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Daily Reflection & Note
            </label>
            <textarea
              rows={3}
              placeholder="What went well today? What created friction or flow?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800/80 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              Save Check-in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

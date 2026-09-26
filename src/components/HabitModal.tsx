import React, { useState, useEffect } from 'react';
import { Habit, HabitCategory, FrequencyType } from '../types';
import { HABIT_ICONS, HabitIcon } from './IconHelper';
import { X, Sparkles } from 'lucide-react';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: {
    title: string;
    description: string;
    category: HabitCategory;
    icon: string;
    color: string;
    frequency: FrequencyType;
    targetCount: number;
    unit: string;
    reminderTime: string;
  }) => Promise<void>;
  editingHabit?: Habit | null;
}

const CATEGORIES: { id: HabitCategory; label: string }[] = [
  { id: 'health', label: 'Health' },
  { id: 'focus', label: 'Focus & Work' },
  { id: 'mindfulness', label: 'Mind & Zen' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'learning', label: 'Learning' },
  { id: 'creativity', label: 'Creativity' },
  { id: 'routine', label: 'Daily Routine' }
];

const COLOR_PRESETS = [
  '#06b6d4', // Cyan
  '#3b82f6', // Electric Blue
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#14b8a6'  // Teal
];

const POPULAR_ICONS = [
  'Sun', 'Activity', 'Zap', 'BookOpen', 'Droplets',
  'Heart', 'Target', 'Flame', 'Dumbbell', 'Coffee',
  'Code', 'Briefcase', 'Music', 'Bed', 'Smile'
];

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingHabit
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('health');
  const [icon, setIcon] = useState('Sun');
  const [color, setColor] = useState('#06b6d4');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [targetCount, setTargetCount] = useState(1);
  const [unit, setUnit] = useState('times');
  const [reminderTime, setReminderTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingHabit) {
      setTitle(editingHabit.title);
      setDescription(editingHabit.description || '');
      setCategory(editingHabit.category);
      setIcon(editingHabit.icon);
      setColor(editingHabit.color);
      setFrequency(editingHabit.frequency);
      setTargetCount(editingHabit.targetCount || 1);
      setUnit(editingHabit.unit || 'times');
      setReminderTime(editingHabit.reminderTime || '');
    } else {
      setTitle('');
      setDescription('');
      setCategory('health');
      setIcon('Sun');
      setColor('#06b6d4');
      setFrequency('daily');
      setTargetCount(1);
      setUnit('times');
      setReminderTime('');
    }
  }, [editingHabit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        category,
        icon,
        color,
        frequency,
        targetCount: Math.max(1, Number(targetCount) || 1),
        unit: unit.trim() || 'times',
        reminderTime
      });
      onClose();
    } catch (err) {
      console.error('Failed to save habit:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${color}20`, color }}
            >
              <HabitIcon name={icon} className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {editingHabit ? 'Edit Habit' : 'Create New Habit'}
              </h2>
              <p className="text-xs text-slate-400">
                Design a clear, automatic anchor routine
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Habit Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Morning Sunlight & Hydration"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Motivation / Intention (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., 500ml water and 15 mins of direct morning sun"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                    category === cat.id
                      ? 'bg-blue-600/30 border-blue-400 text-white shadow-sm'
                      : 'bg-slate-800/50 border-white/10 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color & Icon Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Color picker */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Accent Glow Color
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={`Select color ${c}`}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      color === c ? 'scale-125 ring-2 ring-white shadow-lg' : 'hover:scale-110 opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Icon picker */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Icon
              </label>
              <div className="flex items-center gap-1.5 flex-wrap max-h-24 overflow-y-auto p-1 bg-slate-800/40 rounded-xl border border-white/5">
                {POPULAR_ICONS.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    aria-label={`Select icon ${iconName}`}
                    className={`p-2 rounded-lg transition-all ${
                      icon === iconName
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                    }`}
                  >
                    <HabitIcon name={iconName} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Target Count & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Daily Target
              </label>
              <input
                type="number"
                min="1"
                max="999"
                value={targetCount}
                onChange={(e) => setTargetCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Unit (e.g. times, pages, mins)
              </label>
              <input
                type="text"
                placeholder="times"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* Frequency & Reminder */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as FrequencyType)}
                className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="daily">Every Day</option>
                <option value="weekdays">Weekdays (Mon-Fri)</option>
                <option value="weekends">Weekends Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Reminder Time
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {editingHabit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

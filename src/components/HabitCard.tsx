import React from 'react';
import { Habit, HabitLog } from '../types';
import { HabitIcon, CATEGORY_COLORS } from './IconHelper';
import { Flame, Check, Plus, Minus, MoreVertical, Edit2, Trash2 } from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  log?: HabitLog;
  onToggle: (habit: Habit, customCount?: number) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  log,
  onToggle,
  onEdit,
  onDelete
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const isCompleted = log?.completed || false;
  const currentCount = log?.count || 0;
  const targetCount = habit.targetCount || 1;
  const categoryStyle = CATEGORY_COLORS[habit.category] || CATEGORY_COLORS.routine;

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = Math.min(targetCount, currentCount + 1);
    onToggle(habit, next);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = Math.max(0, currentCount - 1);
    onToggle(habit, next);
  };

  return (
    <div
      className={`group relative rounded-2xl p-5 border transition-all duration-300 ${
        isCompleted
          ? 'bg-slate-900/80 border-blue-500/40 shadow-lg shadow-blue-950/40'
          : 'bg-slate-900/50 hover:bg-slate-900/70 border-white/10 hover:border-blue-400/30 shadow-md'
      } backdrop-blur-xl`}
    >
      {/* Top subtle highlight glow */}
      <div 
        className="absolute top-0 left-6 right-6 h-[1px] opacity-40 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(90deg, transparent, ${habit.color || '#38bdf8'}, transparent)`
        }}
      />

      <div className="flex items-start justify-between gap-4">
        {/* Left: Icon & Info */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-105 duration-300"
            style={{
              backgroundColor: `${habit.color}18` || '#3b82f618',
              color: habit.color || '#38bdf8',
              border: `1px solid ${habit.color}35` || 'rgba(56, 189, 248, 0.25)'
            }}
          >
            <HabitIcon name={habit.icon} className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-semibold text-base tracking-tight truncate ${
                isCompleted ? 'text-white line-through opacity-85' : 'text-white'
              }`}>
                {habit.title}
              </h3>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border} capitalize`}>
                {habit.category}
              </span>
            </div>

            {habit.description && (
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                {habit.description}
              </p>
            )}

            {/* Streak & Details bar */}
            <div className="flex items-center gap-3 mt-3 text-xs">
              <div className="flex items-center gap-1 font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{habit.currentStreak || 0} day streak</span>
              </div>

              {habit.frequency && (
                <span className="text-slate-400 capitalize hidden sm:inline-block">
                  • {habit.frequency}
                </span>
              )}

              {habit.reminderTime && (
                <span className="text-slate-400 hidden sm:inline-block">
                  • {habit.reminderTime}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Multi-step counter or simple check */}
          {targetCount > 1 ? (
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center bg-slate-800/80 rounded-xl border border-white/10 p-1">
                <button
                  type="button"
                  onClick={handleDecrement}
                  aria-label="Decrease count"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700/60 active:scale-95 transition-all"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-white px-2.5">
                  {currentCount} / {targetCount} {habit.unit || ''}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  aria-label="Increase count"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700/60 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => onToggle(habit)}
                className={`text-[11px] font-medium transition-colors ${
                  isCompleted ? 'text-blue-400 hover:text-blue-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isCompleted ? 'Mark Incomplete' : 'Complete All'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onToggle(habit)}
              aria-label={isCompleted ? `Mark ${habit.title} incomplete` : `Mark ${habit.title} complete`}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 transform active:scale-90 ${
                isCompleted
                  ? 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/40 ring-2 ring-blue-400/30'
                  : 'bg-slate-800/80 hover:bg-slate-700 border border-white/15 text-slate-400 hover:text-white'
              }`}
            >
              <Check className={`w-5 h-5 transition-transform duration-300 ${isCompleted ? 'scale-110' : 'scale-90 opacity-60'}`} />
            </button>
          )}

          {/* More options menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Habit options"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-9 z-50 w-36 py-1 bg-slate-900 border border-white/15 rounded-xl shadow-2xl backdrop-blur-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(habit);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-slate-300 hover:text-white hover:bg-blue-600/20 flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Habit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(habit.id);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Habit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

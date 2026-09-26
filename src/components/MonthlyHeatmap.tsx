import React, { useState } from 'react';
import { Habit, HabitLog, MoodLog } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from 'lucide-react';

interface MonthlyHeatmapProps {
  habits: Habit[];
  logs: HabitLog[];
  moods: MoodLog[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const MonthlyHeatmap: React.FC<MonthlyHeatmapProps> = ({
  habits,
  logs,
  moods,
  selectedDate,
  onSelectDate
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthName = currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleCurrentMonth = () => {
    setCurrentMonthDate(new Date());
  };

  // Generate calendar days
  const calendarCells = React.useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];

    // Empty slots before month start
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ empty: true, key: `empty-${i}` });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayLogs = logs.filter(l => l.date === dateStr);
      const completedCount = dayLogs.filter(l => l.completed).length;
      const totalCount = habits.length;
      const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      const mood = moods.find(m => m.date === dateStr);

      cells.push({
        empty: false,
        day: d,
        dateStr,
        completedCount,
        totalCount,
        percentage,
        mood,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        key: dateStr
      });
    }

    return cells;
  }, [year, month, logs, habits, moods, selectedDate]);

  // Heatmap color generator
  const getCellColor = (percentage: number, isEmpty: boolean) => {
    if (isEmpty) return 'transparent';
    if (percentage === 0) return 'bg-slate-800/40 border-white/5 text-slate-400';
    if (percentage < 40) return 'bg-blue-900/60 border-blue-800/60 text-blue-200';
    if (percentage < 75) return 'bg-blue-600/70 border-blue-500/70 text-white';
    if (percentage < 100) return 'bg-cyan-500/80 border-cyan-400 text-slate-900 font-bold';
    return 'bg-gradient-to-br from-emerald-500 to-teal-400 border-emerald-300 text-slate-950 font-extrabold shadow-sm shadow-emerald-500/30';
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-7 relative overflow-hidden">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <CalendarIcon className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white tracking-tight">
              Monthly Consistency Heatmap
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize your overall habit rhythm across each day
          </p>
        </div>

        {/* Month Selector Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCurrentMonth}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-white/10 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center bg-slate-800/80 rounded-xl border border-white/10 p-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-white px-3 min-w-[130px] text-center select-none">
              {monthName}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 sm:gap-2.5 mt-6 mb-2 text-center">
        {weekdays.map((wd) => (
          <div key={wd} className="text-xs font-semibold text-slate-400 py-1">
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
        {calendarCells.map((cell) => {
          if (cell.empty) {
            return <div key={cell.key} className="h-10 sm:h-12 rounded-xl" />;
          }

          const cellColorClass = getCellColor(cell.percentage || 0, false);

          return (
            <div
              key={cell.key}
              onClick={() => cell.dateStr && onSelectDate(cell.dateStr)}
              className={`group relative h-10 sm:h-12 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all duration-200 select-none ${cellColorClass} ${
                cell.isSelected ? 'ring-2 ring-white scale-105 z-10 shadow-lg' : 'hover:scale-105 hover:z-10'
              }`}
            >
              <span className="text-xs sm:text-sm">{cell.day}</span>

              {/* Mood mini dot */}
              {cell.mood && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute bottom-1 shadow-sm" />
              )}

              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
                <div className="bg-slate-900 border border-white/20 text-white rounded-xl py-1.5 px-3 text-xs shadow-2xl min-w-[130px] text-center">
                  <div className="font-bold text-[11px] text-slate-300">{cell.dateStr}</div>
                  <div className="font-semibold text-cyan-400 text-xs mt-0.5">
                    {cell.completedCount} / {cell.totalCount} completed ({cell.percentage}%)
                  </div>
                  {cell.mood && (
                    <div className="text-[10px] text-amber-300 mt-0.5 capitalize">
                      Mood: {cell.mood.mood} (Energy {cell.mood.energy}/5)
                    </div>
                  )}
                </div>
                {/* Arrow */}
                <div className="w-2 h-2 bg-slate-900 border-r border-b border-white/20 rotate-45 -mt-1" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Heatmap Legend */}
      <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Consistency Level:</span>
        </div>

        <div className="flex items-center gap-2">
          <span>0%</span>
          <div className="w-3.5 h-3.5 rounded-md bg-slate-800/40 border border-white/10" />
          <div className="w-3.5 h-3.5 rounded-md bg-blue-900/60 border border-blue-800/60" />
          <div className="w-3.5 h-3.5 rounded-md bg-blue-600/70 border border-blue-500/70" />
          <div className="w-3.5 h-3.5 rounded-md bg-cyan-500/80 border border-cyan-400" />
          <div className="w-3.5 h-3.5 rounded-md bg-emerald-500 border border-emerald-300" />
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

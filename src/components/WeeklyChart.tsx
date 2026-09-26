import React from 'react';
import { Habit, HabitLog } from '../types';
import { TrendingUp, Award, Calendar } from 'lucide-react';

interface WeeklyChartProps {
  habits: Habit[];
  logs: HabitLog[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({
  habits,
  logs,
  selectedDate,
  onSelectDate,
}) => {
  // Compute past 7 days ending at today or selected week
  const days = React.useMemo(() => {
    const list = [];
    const base = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();

      // Find logs for this day
      const dayLogs = logs.filter(l => l.date === dateStr);
      const completedCount = dayLogs.filter(l => l.completed).length;
      const totalCount = habits.length;
      const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      list.push({
        dateStr,
        dayName,
        dayNum,
        completedCount,
        totalCount,
        percentage,
        isToday: i === 0,
        isSelected: dateStr === selectedDate
      });
    }
    return list;
  }, [habits, logs, selectedDate]);

  const averageRate = React.useMemo(() => {
    if (days.length === 0) return 0;
    const sum = days.reduce((acc, d) => acc + d.percentage, 0);
    return Math.round(sum / days.length);
  }, [days]);

  const bestDay = React.useMemo(() => {
    return [...days].sort((a, b) => b.percentage - a.percentage)[0];
  }, [days]);

  const totalCompletedWeekly = React.useMemo(() => {
    return days.reduce((acc, d) => acc + d.completedCount, 0);
  }, [days]);

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-7 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white tracking-tight">
              Weekly Consistency
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Past 7-day flow and performance rhythm
          </p>
        </div>

        {/* Quick summary chips */}
        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-white/10 flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs text-slate-400">Weekly Avg:</span>
            <span className="text-xs font-bold text-white">{averageRate}%</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-white/10 flex items-center gap-2 hidden sm:flex">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-slate-400">Habits Done:</span>
            <span className="text-xs font-bold text-white">{totalCompletedWeekly}</span>
          </div>
        </div>
      </div>

      {/* Chart visualization */}
      <div className="mt-6">
        <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-4 pb-2 px-1">
          {days.map((item) => {
            const barHeight = Math.max(8, item.percentage);
            return (
              <div
                key={item.dateStr}
                onClick={() => onSelectDate(item.dateStr)}
                className={`group flex-1 flex flex-col items-center cursor-pointer transition-all duration-300 ${
                  item.isSelected ? 'scale-105' : 'hover:scale-102'
                }`}
              >
                {/* Tooltip on hover / selected */}
                <div className="mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-slate-900 border border-white/20 text-[10px] font-bold text-white px-2 py-0.5 rounded-md shadow-xl whitespace-nowrap">
                    {item.completedCount}/{item.totalCount} ({item.percentage}%)
                  </div>
                </div>

                {/* Bar container */}
                <div className="w-full max-w-[48px] h-32 bg-slate-800/40 rounded-2xl p-1 relative flex flex-col justify-end border border-white/5 group-hover:border-blue-400/40 transition-colors">
                  {/* Fill Bar */}
                  <div
                    className={`w-full rounded-xl transition-all duration-700 ease-out relative ${
                      item.percentage === 100
                        ? 'bg-gradient-to-t from-emerald-600 to-cyan-400 shadow-md shadow-emerald-500/30'
                        : item.percentage >= 50
                        ? 'bg-gradient-to-t from-blue-600 to-cyan-400 shadow-md shadow-blue-500/20'
                        : 'bg-gradient-to-t from-slate-700 to-blue-500/70'
                    }`}
                    style={{ height: `${barHeight}%` }}
                  >
                    {/* Top shine */}
                    <div className="w-full h-1 bg-white/40 rounded-t-xl" />
                  </div>
                </div>

                {/* Day Labels */}
                <div className="mt-3 text-center">
                  <span className={`block text-xs font-semibold ${
                    item.isSelected ? 'text-blue-400 font-bold' : item.isToday ? 'text-white' : 'text-slate-400'
                  }`}>
                    {item.dayName}
                  </span>
                  <span className={`block text-[11px] ${
                    item.isToday
                      ? 'w-5 h-5 mx-auto mt-0.5 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center'
                      : 'text-slate-500'
                  }`}>
                    {item.dayNum}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer insight */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <span>Click any day to inspect or toggle its habit completions</span>
          {bestDay && (
            <span className="text-cyan-300 hidden sm:inline">
              Strongest rhythm on <span className="font-semibold">{bestDay.dayName}</span> ({bestDay.percentage}%)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

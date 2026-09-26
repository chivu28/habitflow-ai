import React from 'react';
import { UserProfile, Habit } from '../types';
import { Flame, Trophy, CheckCircle, Zap } from 'lucide-react';
import { calculateLevel } from '../utils/gamification';

interface StatsOverviewProps {
  todayPercentage: number;
  todayCompletedCount: number;
  todayTotalCount: number;
  habits: Habit[];
  userProfile: UserProfile | null;
  onOpenMood: () => void;
  hasMoodToday: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  todayPercentage,
  todayCompletedCount,
  todayTotalCount,
  habits,
  userProfile,
  onOpenMood,
  hasMoodToday
}) => {
  const xp = userProfile?.xp || 0;
  const levelInfo = calculateLevel(xp);

  // Highest streak among habits
  const highestStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak || 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Today's Progress */}
      <div className="glass-panel-interactive rounded-2xl p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Daily Target</span>
          <span className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <CheckCircle className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {todayPercentage}%
            </span>
            <span className="text-xs text-blue-300 font-medium">
              ({todayCompletedCount}/{todayTotalCount})
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${todayPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Current Max Streak */}
      <div className="glass-panel-interactive rounded-2xl p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Top Streak</span>
          <span className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Flame className="w-4 h-4 fill-amber-400" />
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-tight">
              {highestStreak}
            </span>
            <span className="text-xs text-slate-400 font-medium">Days active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {highestStreak > 0 ? 'Momentum building strong!' : 'Complete a habit to ignite streak'}
          </p>
        </div>
      </div>

      {/* 3. Level & XP */}
      <div className="glass-panel-interactive rounded-2xl p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Current Level</span>
          <span className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Lv. {levelInfo.level}
            </span>
            <span className="text-xs text-cyan-400 font-semibold truncate">
              {levelInfo.title}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
            <span>{levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP</span>
            <span>{levelInfo.progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* 4. Mood & Mind Check-in */}
      <div 
        onClick={onOpenMood}
        className="glass-panel-interactive rounded-2xl p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Mind & Mood</span>
          <span className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
            hasMoodToday 
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
              : 'bg-pink-500/10 border border-pink-500/20 text-pink-400'
          }`}>
            <Zap className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-white tracking-tight">
              {hasMoodToday ? 'Logged Today ✓' : 'Daily Check-in'}
            </span>
          </div>
          <p className="text-[11px] text-cyan-400 group-hover:underline mt-1">
            {hasMoodToday ? 'Tap to edit mood reflection' : '+30 XP • Tap to record today'}
          </p>
        </div>
      </div>
    </div>
  );
};

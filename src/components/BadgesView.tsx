import React, { useState } from 'react';
import { UserProfile, Badge } from '../types';
import { ALL_BADGES, calculateLevel } from '../utils/gamification';
import { Trophy, Award, Lock, CheckCircle2, Sparkles, Flame, Zap, Crown, ShieldCheck, HeartHandshake, Layers } from 'lucide-react';

interface BadgesViewProps {
  userProfile: UserProfile | null;
}

const BADGE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Sparkles,
  Flame,
  Zap,
  Crown,
  CheckCircle2,
  ShieldCheck,
  Award,
  HeartHandshake,
  Trophy,
  Layers
};

export const BadgesView: React.FC<BadgesViewProps> = ({ userProfile }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const xp = userProfile?.xp || 0;
  const levelInfo = calculateLevel(xp);
  const unlockedIds = userProfile?.unlockedBadges || [];

  const categories = [
    { id: 'all', label: 'All Badges' },
    { id: 'streak', label: 'Streaks' },
    { id: 'volume', label: 'Milestones' },
    { id: 'mastery', label: 'Mastery' },
    { id: 'mind', label: 'Mind & Zen' },
  ];

  const filteredBadges = ALL_BADGES.filter((b) => {
    if (selectedCategory === 'all') return true;
    return b.category === selectedCategory;
  });

  const unlockedCount = ALL_BADGES.filter(b => unlockedIds.includes(b.id)).length;

  return (
    <div className="space-y-6">
      {/* Level & XP Progression Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-600/20 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* Level Emblem */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 p-0.5 shadow-xl shadow-blue-500/30 flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                    {levelInfo.level}
                  </span>
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    LEVEL
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 bg-amber-400 text-slate-950 rounded-full shadow-lg">
                <Crown className="w-3.5 h-3.5 fill-slate-950" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  Status Rank
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-400">{unlockedCount} / {ALL_BADGES.length} Badges</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
                {levelInfo.title}
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Earn XP by checking off daily habits (+50 XP), logging your mood (+30 XP), and maintaining consistency streaks.
              </p>
            </div>
          </div>

          {/* XP Progress Box */}
          <div className="w-full md:w-80 bg-slate-900/80 rounded-2xl p-4 border border-white/10 shadow-inner">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-300">Level {levelInfo.level} Progress</span>
              <span className="font-bold text-cyan-400">
                {levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP ({levelInfo.progressPercent}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-300 transition-all duration-700 ease-out shadow-sm shadow-cyan-400/50"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
              <span>Total XP: <strong className="text-white">{xp}</strong></span>
              <span>Next Level: <strong className="text-cyan-300">Level {levelInfo.level + 1}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => {
          const isUnlocked = unlockedIds.includes(badge.id);
          const IconComponent = BADGE_ICONS[badge.icon] || Trophy;

          return (
            <div
              key={badge.id}
              className={`relative rounded-2xl p-5 border transition-all duration-300 backdrop-blur-xl ${
                isUnlocked
                  ? 'bg-slate-900/80 border-cyan-500/40 shadow-lg shadow-cyan-950/30'
                  : 'bg-slate-900/40 border-white/5 opacity-65 hover:opacity-90'
              }`}
            >
              {/* Badge top status chip */}
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform ${
                    isUnlocked
                      ? 'bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-400/30 shadow-inner'
                      : 'bg-slate-800 text-slate-500 border border-white/5'
                  }`}
                >
                  <IconComponent className="w-6 h-6" />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    +{badge.xpReward} XP
                  </span>
                  {isUnlocked ? (
                    <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400" title="Unlocked">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="p-1 rounded-full bg-slate-800 text-slate-500" title="Locked">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div className="mt-4">
                <h3 className={`text-base font-bold tracking-tight ${isUnlocked ? 'text-white' : 'text-slate-300'}`}>
                  {badge.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* Tier indicator */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 capitalize">{badge.category}</span>
                <span className={`font-semibold capitalize ${
                  badge.tier === 'diamond' ? 'text-cyan-300' :
                  badge.tier === 'gold' ? 'text-amber-400' :
                  badge.tier === 'silver' ? 'text-slate-300' : 'text-amber-600'
                }`}>
                  {badge.tier} Tier
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { firebaseSignOut, auth } from '../firebase';
import { UserProfile, AppUser } from '../types';
import { calculateLevel } from '../utils/gamification';
import { 
  Sparkles, 
  Plus, 
  Crown, 
  LogOut, 
  LogIn, 
  LayoutDashboard, 
  BarChart2, 
  Award, 
  BrainCircuit,
  Heart,
  Cloud
} from 'lucide-react';

interface NavbarProps {
  user: AppUser | null;
  userProfile: UserProfile | null;
  activeTab: 'dashboard' | 'analytics' | 'badges' | 'insights';
  onChangeTab: (tab: 'dashboard' | 'analytics' | 'badges' | 'insights') => void;
  onOpenNewHabit: () => void;
  onOpenAuth: () => void;
  onOpenMood: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  userProfile,
  activeTab,
  onChangeTab,
  onOpenNewHabit,
  onOpenAuth,
  onOpenMood
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const xp = userProfile?.xp || 0;
  const levelInfo = calculateLevel(xp);

  const handleSignOut = async () => {
    setShowUserMenu(false);
    await firebaseSignOut(auth);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#070b14]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <div 
            onClick={() => onChangeTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                Habit<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Flow</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block -mt-0.5">
                Peak Discipline
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-2xl border border-white/5">
            <button
              type="button"
              onClick={() => onChangeTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => onChangeTab('analytics')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Consistency & Heatmap
            </button>

            <button
              type="button"
              onClick={() => onChangeTab('badges')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'badges'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Badges & Level
            </button>

            <button
              type="button"
              onClick={() => onChangeTab('insights')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'insights'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              AI Insights
            </button>
          </nav>
        </div>

        {/* Right Section: Level progress + Actions */}
        <div className="flex items-center gap-3">
          {/* Mood Check-in Quick Button */}
          <button
            type="button"
            onClick={onOpenMood}
            aria-label="Open mood check-in"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/20 text-xs font-semibold transition-all"
          >
            <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
            <span>Mood Log</span>
          </button>

          {/* Level Pill */}
          <div
            onClick={() => onChangeTab('badges')}
            className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-cyan-400/40 cursor-pointer transition-colors"
          >
            <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-slate-950 font-black text-[10px]">
              <Crown className="w-3 h-3 fill-slate-950" />
            </div>
            <div className="text-left">
              <div className="text-[11px] font-bold text-white leading-tight">
                Lv. {levelInfo.level} • {levelInfo.title}
              </div>
              <div className="w-24 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Add Habit Primary Action */}
          <button
            type="button"
            onClick={onOpenNewHabit}
            className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Habit</span>
            <span className="sm:hidden">Add</span>
          </button>

          {/* User Account / Profile Menu */}
          <div className="relative">
            {user ? (
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-9 h-9 rounded-xl bg-slate-800 border border-white/15 flex items-center justify-center overflow-hidden hover:border-blue-400 transition-colors"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-cyan-300">
                    {user.isAnonymous ? 'G' : (user.displayName?.[0] || 'U').toUpperCase()}
                  </span>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* User Dropdown */}
            {showUserMenu && user && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-11 z-50 w-56 py-2 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-2xl">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-xs font-bold text-white truncate">
                      {user.displayName || (user.isAnonymous ? 'Guest User' : 'User')}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {user.email || (user.isAnonymous ? 'Temporary session' : '')}
                    </p>
                  </div>

                  {(user.isGuest || user.isAnonymous) ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAuth();
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-cyan-400 hover:bg-slate-800 flex items-center gap-2 border-b border-white/5"
                    >
                      <Cloud className="w-3.5 h-3.5" />
                      Sign In to Cloud Sync
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {user.isGuest ? 'Reset Session' : 'Sign Out'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-white/5 py-2 px-2 bg-slate-950/70">
        <button
          type="button"
          onClick={() => onChangeTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-3 rounded-lg ${
            activeTab === 'dashboard' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>

        <button
          type="button"
          onClick={() => onChangeTab('analytics')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-3 rounded-lg ${
            activeTab === 'analytics' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Heatmap
        </button>

        <button
          type="button"
          onClick={() => onChangeTab('badges')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-3 rounded-lg ${
            activeTab === 'badges' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400'
          }`}
        >
          <Award className="w-4 h-4" />
          Badges
        </button>

        <button
          type="button"
          onClick={() => onChangeTab('insights')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-3 rounded-lg ${
            activeTab === 'insights' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          AI Insights
        </button>
      </div>
    </header>
  );
};

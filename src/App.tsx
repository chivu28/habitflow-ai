import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, auth } from './firebase';
import { Habit, HabitLog, MoodLog, UserProfile, HabitCategory, AppUser } from './types';
import { 
  getLocalDateString,
  getOrCreateGuestId,
  migrateGuestDataToFirebase,
  subscribeUserHabits,
  subscribeUserLogs,
  subscribeMoodLogs,
  subscribeUserProfile,
  initializeUserProfile,
  populateInitialHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitLog,
  saveMoodLog
} from './services/habitService';
import { generateSmartInsights } from './services/aiInsightsService';
import { triggerCelebration } from './utils/gamification';

import { Navbar } from './components/Navbar';
import { CircularProgress } from './components/CircularProgress';
import { HabitCard } from './components/HabitCard';
import { HabitModal } from './components/HabitModal';
import { MoodTrackerModal } from './components/MoodTrackerModal';
import { AuthModal } from './components/AuthModal';
import { WeeklyChart } from './components/WeeklyChart';
import { MonthlyHeatmap } from './components/MonthlyHeatmap';
import { BadgesView } from './components/BadgesView';
import { AIInsightsSection } from './components/AIInsightsSection';
import { StatsOverview } from './components/StatsOverview';
import { DateNavigator } from './components/DateNavigator';

import { 
  Search, 
  Filter, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Flame, 
  Heart, 
  ArrowRight,
  Loader2
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [moods, setMoods] = useState<MoodLog[]>([]);
  const [loadingHabits, setLoadingHabits] = useState(true);

  // App UI State
  const [selectedDate, setSelectedDate] = useState<string>(() => getLocalDateString(new Date()));
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'badges' | 'insights'>('dashboard');
  
  // Modals state
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Notification toast for XP or badge unlocks
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle: string } | null>(null);

  const showToast = (title: string, subtitle: string) => {
    setToastMessage({ title, subtitle });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 1. Initialize Auth safely
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
          isAnonymous: currentUser.isAnonymous,
          isGuest: false
        });
        setAuthChecked(true);

        try {
          await migrateGuestDataToFirebase(currentUser.uid);
          await initializeUserProfile({
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL
          });
        } catch (err) {
          console.error('Error initializing user profile:', err);
        }
      } else {
        // Fall back cleanly to a local guest session without invoking admin-restricted anonymous auth
        const guestUid = getOrCreateGuestId();
        setUser({
          uid: guestUid,
          displayName: 'Guest Flow User',
          email: null,
          photoURL: null,
          isAnonymous: true,
          isGuest: true
        });
        setAuthChecked(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time subscriptions when user is authenticated
  useEffect(() => {
    if (!user) return;

    setLoadingHabits(true);

    const unsubProfile = subscribeUserProfile(user.uid, (profile) => {
      setUserProfile(profile);
    });

    const unsubHabits = subscribeUserHabits(user.uid, async (userHabits) => {
      // If user has zero habits, seed delightful sample data so the dashboard is immediately rich
      if (userHabits.length === 0) {
        try {
          await populateInitialHabits(user.uid);
        } catch (err) {
          console.error('Error seeding initial habits:', err);
        }
      } else {
        setHabits(userHabits);
      }
      setLoadingHabits(false);
    });

    const unsubLogs = subscribeUserLogs(user.uid, (userLogs) => {
      setLogs(userLogs);
    });

    const unsubMoods = subscribeMoodLogs(user.uid, (userMoods) => {
      setMoods(userMoods);
    });

    return () => {
      unsubProfile();
      unsubHabits();
      unsubLogs();
      unsubMoods();
    };
  }, [user]);

  // Selected date's mood entry
  const todayMood = useMemo(() => {
    return moods.find(m => m.date === selectedDate);
  }, [moods, selectedDate]);

  // Compute logs map for the selected date
  const logsForSelectedDate = useMemo(() => {
    const map = new Map<string, HabitLog>();
    logs.forEach(l => {
      if (l.date === selectedDate) {
        map.set(l.habitId, l);
      }
    });
    return map;
  }, [logs, selectedDate]);

  // Daily completions stats
  const activeHabits = useMemo(() => habits.filter(h => !h.isArchived), [habits]);
  const completedHabitsCount = useMemo(() => {
    return activeHabits.filter(h => logsForSelectedDate.get(h.id)?.completed).length;
  }, [activeHabits, logsForSelectedDate]);

  const dailyPercentage = useMemo(() => {
    if (activeHabits.length === 0) return 0;
    return Math.round((completedHabitsCount / activeHabits.length) * 100);
  }, [activeHabits, completedHabitsCount]);

  // Filtered habits for the list
  const filteredHabits = useMemo(() => {
    return activeHabits.filter((h) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = h.title.toLowerCase().includes(query);
        const matchesDesc = (h.description || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Category
      if (selectedCategory !== 'all' && h.category !== selectedCategory) {
        return false;
      }

      // Status
      const isCompleted = logsForSelectedDate.get(h.id)?.completed;
      if (statusFilter === 'completed' && !isCompleted) return false;
      if (statusFilter === 'pending' && isCompleted) return false;

      return true;
    });
  }, [activeHabits, searchQuery, selectedCategory, statusFilter, logsForSelectedDate]);

  // AI Insights
  const smartInsights = useMemo(() => {
    return generateSmartInsights(
      activeHabits,
      logs,
      moods,
      userProfile?.level || 1
    );
  }, [activeHabits, logs, moods, userProfile?.level]);

  // Handle Habit Toggle
  const handleToggleHabit = async (habit: Habit, customCount?: number) => {
    if (!user) return;
    const currentLog = logsForSelectedDate.get(habit.id);

    try {
      const result = await toggleHabitLog(
        user.uid,
        habit,
        selectedDate,
        currentLog,
        customCount
      );

      if (result.completed) {
        // Did we hit 100% completion for today?
        const newCompletedCount = completedHabitsCount + (currentLog?.completed ? 0 : 1);
        if (newCompletedCount === activeHabits.length && activeHabits.length > 0) {
          triggerCelebration('fireworks');
          showToast('100% Daily Mastery!', '+100 XP Daily Flawless Bonus earned!');
        } else {
          triggerCelebration('subtle');
          showToast(`+${result.xpEarned} XP Earned!`, `Great job on "${habit.title}"!`);
        }

        // Newly unlocked badges?
        if (result.newlyUnlockedBadges && result.newlyUnlockedBadges.length > 0) {
          triggerCelebration('full');
          showToast('Achievement Unlocked!', 'Check the Badges tab to view your trophy!');
        }
      }
    } catch (err) {
      console.error('Error toggling habit:', err);
    }
  };

  // Habit CRUD handlers
  const handleSaveHabit = async (data: any) => {
    if (!user) return;
    if (editingHabit) {
      await updateHabit(editingHabit.id, data);
      showToast('Habit Updated', `"${data.title}" updated successfully.`);
    } else {
      await createHabit(user.uid, data);
      triggerCelebration('subtle');
      showToast('New Habit Created', `Ready to build consistency with "${data.title}"!`);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!user) return;
    if (window.confirm('Are you sure you want to delete this habit?')) {
      await deleteHabit(habitId, user.uid);
      showToast('Habit Removed', 'Habit was deleted from your routine.');
    }
  };

  const handleSaveMood = async (date: string, data: any) => {
    if (!user) return;
    const res = await saveMoodLog(user.uid, date, data);
    triggerCelebration('subtle');
    if (res.xpEarned > 0) {
      showToast('Mood Reflection Saved', `+${res.xpEarned} XP recorded for daily mindfulness!`);
    } else {
      showToast('Mood Reflection Updated', 'Your daily energy logs have been updated.');
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-sm font-semibold tracking-wide text-slate-400">
          Loading HabitFlow...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-blue-600/30 selection:text-blue-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-bounce duration-300">
          <div className="glass-panel border-cyan-400/50 bg-slate-900/95 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-cyan-300">{toastMessage.title}</div>
              <div className="text-[11px] text-slate-300">{toastMessage.subtitle}</div>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        user={user}
        userProfile={userProfile}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenNewHabit={() => {
          setEditingHabit(null);
          setIsHabitModalOpen(true);
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenMood={() => setIsMoodModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-7">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-7 animate-fadeIn">
            {/* Top Stats Overview Grid */}
            <StatsOverview
              todayPercentage={dailyPercentage}
              todayCompletedCount={completedHabitsCount}
              todayTotalCount={activeHabits.length}
              habits={activeHabits}
              userProfile={userProfile}
              onOpenMood={() => setIsMoodModalOpen(true)}
              hasMoodToday={Boolean(todayMood)}
            />

            {/* Hero Progress and Date Bar */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-600/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                {/* Circular Progress & Today Status */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 text-center sm:text-left">
                  <div className="shrink-0 p-2 rounded-full bg-slate-900/60 border border-white/10 shadow-2xl">
                    <CircularProgress
                      percentage={dailyPercentage}
                      completedCount={completedHabitsCount}
                      totalCount={activeHabits.length}
                      size={160}
                      strokeWidth={13}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-cyan-300 border border-blue-500/20 text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {dailyPercentage === 100
                          ? 'Flawless Execution!'
                          : dailyPercentage >= 60
                          ? 'Strong Momentum'
                          : 'Daily Flow in Progress'}
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {dailyPercentage === 100
                        ? "You've Completed All Habits!"
                        : `${activeHabits.length - completedHabitsCount} Habits Remaining`}
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-400 max-w-lg leading-relaxed">
                      {dailyPercentage === 100
                        ? 'Every anchor routine for this date has been accomplished. Consistency compounds into mastery.'
                        : 'Checking off daily habits reinforces neural pathways and earns you XP to climb the mastery ranks.'}
                    </p>

                    {/* Quick mood pill */}
                    <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={() => setIsMoodModalOpen(true)}
                        className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-750 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5 text-pink-400" />
                        <span>
                          {todayMood ? `Mood: ${todayMood.mood.toUpperCase()} (Energy ${todayMood.energy}/5)` : 'Log Daily Mood'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Date Navigator */}
                <div className="flex flex-col items-center lg:items-end gap-3 shrink-0">
                  <DateNavigator
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                  />
                  <span className="text-[11px] text-slate-400">
                    Switch days to view or log completions
                  </span>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Category pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {[
                  { id: 'all', label: 'All Habits' },
                  { id: 'health', label: 'Health' },
                  { id: 'focus', label: 'Focus' },
                  { id: 'mindfulness', label: 'Mind' },
                  { id: 'fitness', label: 'Fitness' },
                  { id: 'learning', label: 'Learning' },
                  { id: 'routine', label: 'Routine' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search & Status Toggle */}
              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search habits..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                {/* Status Toggle */}
                <div className="flex items-center bg-slate-900/80 rounded-xl border border-white/10 p-0.5">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      statusFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('pending')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      statusFilter === 'pending' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('completed')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      statusFilter === 'completed' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>

            {/* Habits Grid */}
            {loadingHabits ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
                <p className="text-xs">Syncing your habits...</p>
              </div>
            ) : filteredHabits.length === 0 ? (
              <div className="glass-panel rounded-3xl p-12 text-center max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">No Habits Found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  {searchQuery || selectedCategory !== 'all' || statusFilter !== 'all'
                    ? 'No habits match your active filters. Try adjusting the search or category.'
                    : 'Start building your routine by creating your first atomic habit.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingHabit(null);
                    setIsHabitModalOpen(true);
                  }}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold inline-flex items-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  <Plus className="w-4 h-4" />
                  Create New Habit
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredHabits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    log={logsForSelectedDate.get(habit.id)}
                    onToggle={handleToggleHabit}
                    onEdit={(h) => {
                      setEditingHabit(h);
                      setIsHabitModalOpen(true);
                    }}
                    onDelete={handleDeleteHabit}
                  />
                ))}
              </div>
            )}

            {/* Bottom Quick Row: Weekly Chart Preview + AI Spotlight */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
              <div className="lg:col-span-2">
                <WeeklyChart
                  habits={activeHabits}
                  logs={logs}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
              </div>

              {/* AI Quick Spotlight */}
              <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-400/10 px-2.5 py-0.5 rounded-full border border-cyan-400/20">
                      Adaptive Insight
                    </span>
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </div>
                  {smartInsights[0] && (
                    <div className="mt-4">
                      <h4 className="text-base font-bold text-white tracking-tight">
                        {smartInsights[0].title}
                      </h4>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        {smartInsights[0].message}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('insights')}
                  className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-cyan-300 border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Explore Full AI Insights</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ANALYTICS & MONTHLY HEATMAP */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fadeIn">
            <WeeklyChart
              habits={activeHabits}
              logs={logs}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            <MonthlyHeatmap
              habits={activeHabits}
              logs={logs}
              moods={moods}
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setActiveTab('dashboard');
              }}
            />
          </div>
        )}

        {/* TAB 3: BADGES & GAMIFICATION */}
        {activeTab === 'badges' && (
          <div className="animate-fadeIn">
            <BadgesView userProfile={userProfile} />
          </div>
        )}

        {/* TAB 4: AI INSIGHTS */}
        {activeTab === 'insights' && (
          <div className="animate-fadeIn">
            <AIInsightsSection
              insights={smartInsights}
              onRefresh={() => {
                showToast('Patterns Recalculated', 'Fresh behavioral analytics generated.');
              }}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 mt-12 bg-slate-950/60 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">HabitFlow</span>
            <span>— Precision habit architecture with Firebase & AI</span>
          </div>
          <div>
            <span>Cloud synced in real-time</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => {
          setIsHabitModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        editingHabit={editingHabit}
      />

      <MoodTrackerModal
        isOpen={isMoodModalOpen}
        onClose={() => setIsMoodModalOpen(false)}
        selectedDate={selectedDate}
        currentMoodLog={todayMood}
        onSave={handleSaveMood}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

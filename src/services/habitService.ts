import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { Habit, HabitLog, MoodLog, UserProfile } from '../types';
import { XP_RULES, calculateLevel, evaluateBadges } from '../utils/gamification';

// Helper to get formatted local date YYYY-MM-DD
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Storage keys for guest mode
const GUEST_HABITS_KEY = 'habitflow_guest_habits';
const GUEST_LOGS_KEY = 'habitflow_guest_logs';
const GUEST_MOODS_KEY = 'habitflow_guest_moods';
const GUEST_PROFILE_KEY = 'habitflow_guest_profile';
const GUEST_UID_KEY = 'habitflow_guest_uid';

export function isGuestUser(userId: string): boolean {
  return !userId || userId.startsWith('guest_');
}

export function getOrCreateGuestId(): string {
  let id = localStorage.getItem(GUEST_UID_KEY);
  if (!id) {
    id = `guest_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(GUEST_UID_KEY, id);
  }
  return id;
}

function notifyGuestStorageUpdate() {
  window.dispatchEvent(new CustomEvent('habitflow_storage_update'));
}

// Get guest data helpers
function getGuestHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(GUEST_HABITS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function getGuestLogs(): HabitLog[] {
  try {
    const raw = localStorage.getItem(GUEST_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function getGuestMoods(): MoodLog[] {
  try {
    const raw = localStorage.getItem(GUEST_MOODS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function getGuestProfile(guestId: string): UserProfile {
  try {
    const raw = localStorage.getItem(GUEST_PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  const defaultProfile: UserProfile = {
    uid: guestId,
    displayName: 'Flow Guest',
    email: '',
    photoURL: '',
    xp: 750,
    level: 3,
    totalCompletions: 42,
    currentStreak: 5,
    longestStreak: 14,
    unlockedBadges: ['first_step', 'streak_3', 'multi_disciplinary'],
    createdAt: new Date().toISOString()
  };
  localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(defaultProfile));
  return defaultProfile;
}

// Subscribe to habits of a user
export function subscribeUserHabits(
  userId: string,
  callback: (habits: Habit[]) => void,
  onError?: (error: Error) => void
) {
  if (isGuestUser(userId)) {
    const loadGuestHabits = () => {
      let habits = getGuestHabits();
      if (habits.length === 0) {
        populateInitialGuestData(userId);
        habits = getGuestHabits();
      }
      callback(habits);
    };

    const handler = () => loadGuestHabits();
    window.addEventListener('habitflow_storage_update', handler);
    // Fire initially
    loadGuestHabits();

    return () => {
      window.removeEventListener('habitflow_storage_update', handler);
    };
  }

  // Firestore for authenticated users
  const q = query(collection(db, 'habits'), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const habits: Habit[] = [];
      snapshot.forEach((docSnap) => {
        habits.push({ id: docSnap.id, ...(docSnap.data() as Omit<Habit, 'id'>) });
      });
      habits.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      callback(habits);
    },
    (err) => {
      console.error('Error in subscribeUserHabits:', err);
      onError?.(err);
    }
  );
}

// Subscribe to habit logs for a user
export function subscribeUserLogs(
  userId: string,
  callback: (logs: HabitLog[]) => void,
  onError?: (error: Error) => void
) {
  if (isGuestUser(userId)) {
    const loadGuestLogs = () => {
      callback(getGuestLogs());
    };

    const handler = () => loadGuestLogs();
    window.addEventListener('habitflow_storage_update', handler);
    loadGuestLogs();

    return () => {
      window.removeEventListener('habitflow_storage_update', handler);
    };
  }

  const q = query(collection(db, 'habitLogs'), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const logs: HabitLog[] = [];
      snapshot.forEach((docSnap) => {
        logs.push({ id: docSnap.id, ...(docSnap.data() as Omit<HabitLog, 'id'>) });
      });
      callback(logs);
    },
    (err) => {
      console.error('Error in subscribeUserLogs:', err);
      onError?.(err);
    }
  );
}

// Subscribe to mood logs for a user
export function subscribeMoodLogs(
  userId: string,
  callback: (moods: MoodLog[]) => void,
  onError?: (error: Error) => void
) {
  if (isGuestUser(userId)) {
    const loadGuestMoods = () => {
      callback(getGuestMoods());
    };

    const handler = () => loadGuestMoods();
    window.addEventListener('habitflow_storage_update', handler);
    loadGuestMoods();

    return () => {
      window.removeEventListener('habitflow_storage_update', handler);
    };
  }

  const q = query(collection(db, 'moodLogs'), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const moods: MoodLog[] = [];
      snapshot.forEach((docSnap) => {
        moods.push({ id: docSnap.id, ...(docSnap.data() as Omit<MoodLog, 'id'>) });
      });
      callback(moods);
    },
    (err) => {
      console.error('Error in subscribeMoodLogs:', err);
      onError?.(err);
    }
  );
}

// Subscribe to user profile
export function subscribeUserProfile(
  userId: string,
  callback: (profile: UserProfile | null) => void,
  onError?: (error: Error) => void
) {
  if (isGuestUser(userId)) {
    const loadGuestProfile = () => {
      callback(getGuestProfile(userId));
    };

    const handler = () => loadGuestProfile();
    window.addEventListener('habitflow_storage_update', handler);
    loadGuestProfile();

    return () => {
      window.removeEventListener('habitflow_storage_update', handler);
    };
  }

  const userDocRef = doc(db, 'users', userId);
  return onSnapshot(
    userDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as UserProfile);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.error('Error in subscribeUserProfile:', err);
      onError?.(err);
    }
  );
}

// Create or initialize user profile
export async function initializeUserProfile(user: {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}): Promise<UserProfile> {
  if (isGuestUser(user.uid)) {
    return getGuestProfile(user.uid);
  }

  const userDocRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userDocRef);

  if (snap.exists()) {
    return snap.data() as UserProfile;
  }

  const initialProfile: UserProfile = {
    uid: user.uid,
    displayName: user.displayName || 'Flow Traveler',
    email: user.email || '',
    photoURL: user.photoURL || '',
    xp: 0,
    level: 1,
    totalCompletions: 0,
    currentStreak: 0,
    longestStreak: 0,
    unlockedBadges: [],
    createdAt: new Date().toISOString()
  };

  await setDoc(userDocRef, initialProfile);
  return initialProfile;
}

// Add a new habit
export async function createHabit(
  userId: string,
  data: Omit<Habit, 'id' | 'userId' | 'currentStreak' | 'longestStreak' | 'totalCompletions' | 'createdAt'>
): Promise<string> {
  const newHabit: Habit = {
    ...data,
    id: `habit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    isArchived: false,
    createdAt: new Date().toISOString()
  };

  if (isGuestUser(userId)) {
    const habits = getGuestHabits();
    habits.unshift(newHabit);
    localStorage.setItem(GUEST_HABITS_KEY, JSON.stringify(habits));
    notifyGuestStorageUpdate();
    return newHabit.id;
  }

  const docRef = await addDoc(collection(db, 'habits'), newHabit);
  return docRef.id;
}

// Update an existing habit
export async function updateHabit(habitId: string, updates: Partial<Habit>, userId?: string) {
  if (userId && isGuestUser(userId)) {
    const habits = getGuestHabits();
    const idx = habits.findIndex(h => h.id === habitId);
    if (idx !== -1) {
      habits[idx] = { ...habits[idx], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(GUEST_HABITS_KEY, JSON.stringify(habits));
      notifyGuestStorageUpdate();
    }
    return;
  }

  // Check guest habits anyway if not found in firestore
  const habits = getGuestHabits();
  const idx = habits.findIndex(h => h.id === habitId);
  if (idx !== -1) {
    habits[idx] = { ...habits[idx], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(GUEST_HABITS_KEY, JSON.stringify(habits));
    notifyGuestStorageUpdate();
    return;
  }

  const docRef = doc(db, 'habits', habitId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
}

// Delete a habit and its logs
export async function deleteHabit(habitId: string, userId: string) {
  if (isGuestUser(userId)) {
    const habits = getGuestHabits().filter(h => h.id !== habitId);
    localStorage.setItem(GUEST_HABITS_KEY, JSON.stringify(habits));
    const logs = getGuestLogs().filter(l => l.habitId !== habitId);
    localStorage.setItem(GUEST_LOGS_KEY, JSON.stringify(logs));
    notifyGuestStorageUpdate();
    return;
  }

  await deleteDoc(doc(db, 'habits', habitId));
}

// Toggle habit completion for a specific date
export async function toggleHabitLog(
  userId: string,
  habit: Habit,
  date: string,
  currentLog?: HabitLog,
  customCount?: number
): Promise<{ completed: boolean; xpEarned: number; newlyUnlockedBadges: string[] }> {
  const logId = `${habit.id}_${date}`;
  const targetCount = habit.targetCount || 1;
  let nextCount = 0;
  let isNowCompleted = false;

  if (customCount !== undefined) {
    nextCount = customCount;
    isNowCompleted = nextCount >= targetCount;
  } else {
    if (currentLog?.completed) {
      nextCount = 0;
      isNowCompleted = false;
    } else {
      nextCount = targetCount;
      isNowCompleted = true;
    }
  }

  const logData: HabitLog = {
    id: logId,
    userId,
    habitId: habit.id,
    date,
    completed: isNowCompleted,
    count: nextCount,
    completedAt: isNowCompleted ? new Date().toISOString() : ''
  };

  let xpChange = 0;
  if (!currentLog?.completed && isNowCompleted) {
    xpChange = XP_RULES.HABIT_COMPLETION;
  } else if (currentLog?.completed && !isNowCompleted) {
    xpChange = -XP_RULES.HABIT_COMPLETION;
  }

  let newCurrentStreak = habit.currentStreak || 0;
  if (isNowCompleted && !currentLog?.completed) {
    newCurrentStreak += 1;
  } else if (!isNowCompleted && currentLog?.completed) {
    newCurrentStreak = Math.max(0, newCurrentStreak - 1);
  }
  const newLongestStreak = Math.max(habit.longestStreak || 0, newCurrentStreak);
  const newTotal = Math.max(0, (habit.totalCompletions || 0) + (isNowCompleted ? 1 : currentLog?.completed ? -1 : 0));

  // GUEST MODE
  if (isGuestUser(userId)) {
    // 1. Update logs
    const logs = getGuestLogs();
    const existingLogIdx = logs.findIndex(l => l.id === logId);
    if (existingLogIdx !== -1) {
      logs[existingLogIdx] = logData;
    } else {
      logs.push(logData);
    }
    localStorage.setItem(GUEST_LOGS_KEY, JSON.stringify(logs));

    // 2. Update habit
    const habits = getGuestHabits();
    const habitIdx = habits.findIndex(h => h.id === habit.id);
    if (habitIdx !== -1) {
      habits[habitIdx] = {
        ...habits[habitIdx],
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        totalCompletions: newTotal,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(GUEST_HABITS_KEY, JSON.stringify(habits));
    }

    // 3. Update profile
    const profile = getGuestProfile(userId);
    const updatedXp = Math.max(0, (profile.xp || 0) + xpChange);
    const updatedTotalCompletions = Math.max(0, (profile.totalCompletions || 0) + (isNowCompleted ? 1 : currentLog?.completed ? -1 : 0));
    const levelInfo = calculateLevel(updatedXp);

    const newlyUnlockedBadges = evaluateBadges({
      totalCompletions: updatedTotalCompletions,
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      level: levelInfo.level,
      perfectDaysCount: isNowCompleted ? 1 : 0,
      moodLogsCount: 1,
      distinctCategoriesCount: 3,
      alreadyUnlocked: profile.unlockedBadges || []
    });

    const combinedBadges = Array.from(new Set([...(profile.unlockedBadges || []), ...newlyUnlockedBadges]));
    const updatedProfile: UserProfile = {
      ...profile,
      xp: updatedXp,
      level: levelInfo.level,
      totalCompletions: updatedTotalCompletions,
      currentStreak: Math.max(profile.currentStreak || 0, newCurrentStreak),
      longestStreak: Math.max(profile.longestStreak || 0, newLongestStreak),
      unlockedBadges: combinedBadges,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(updatedProfile));

    notifyGuestStorageUpdate();

    return {
      completed: isNowCompleted,
      xpEarned: xpChange,
      newlyUnlockedBadges
    };
  }

  // FIRESTORE MODE
  const logRef = doc(db, 'habitLogs', logId);
  await setDoc(logRef, logData);

  const habitRef = doc(db, 'habits', habit.id);
  await updateDoc(habitRef, {
    totalCompletions: newTotal,
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    updatedAt: new Date().toISOString()
  });

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  let newlyUnlockedBadges: string[] = [];

  if (userSnap.exists()) {
    const profile = userSnap.data() as UserProfile;
    const updatedXp = Math.max(0, (profile.xp || 0) + xpChange);
    const updatedTotalCompletions = Math.max(0, (profile.totalCompletions || 0) + (isNowCompleted ? 1 : currentLog?.completed ? -1 : 0));
    const levelInfo = calculateLevel(updatedXp);

    newlyUnlockedBadges = evaluateBadges({
      totalCompletions: updatedTotalCompletions,
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      level: levelInfo.level,
      perfectDaysCount: isNowCompleted ? 1 : 0,
      moodLogsCount: 1,
      distinctCategoriesCount: 3,
      alreadyUnlocked: profile.unlockedBadges || []
    });

    const combinedBadges = Array.from(new Set([...(profile.unlockedBadges || []), ...newlyUnlockedBadges]));

    await updateDoc(userRef, {
      xp: updatedXp,
      level: levelInfo.level,
      totalCompletions: updatedTotalCompletions,
      currentStreak: Math.max(profile.currentStreak || 0, newCurrentStreak),
      longestStreak: Math.max(profile.longestStreak || 0, newLongestStreak),
      unlockedBadges: combinedBadges,
      updatedAt: new Date().toISOString()
    });
  }

  return {
    completed: isNowCompleted,
    xpEarned: xpChange,
    newlyUnlockedBadges
  };
}

// Save or update mood log
export async function saveMoodLog(
  userId: string,
  date: string,
  data: Omit<MoodLog, 'id' | 'userId' | 'date'>
): Promise<{ xpEarned: number }> {
  const logId = `${userId}_${date}`;

  if (isGuestUser(userId)) {
    const moods = getGuestMoods();
    const existingIdx = moods.findIndex(m => m.date === date);
    const isFirstTimeToday = existingIdx === -1;

    const entry: MoodLog = {
      id: logId,
      userId,
      date,
      ...data,
      updatedAt: new Date().toISOString()
    };

    if (existingIdx !== -1) {
      moods[existingIdx] = entry;
    } else {
      moods.push(entry);
    }
    localStorage.setItem(GUEST_MOODS_KEY, JSON.stringify(moods));

    let xpEarned = 0;
    if (isFirstTimeToday) {
      xpEarned = XP_RULES.MOOD_LOG;
      const profile = getGuestProfile(userId);
      const updatedXp = (profile.xp || 0) + xpEarned;
      const levelInfo = calculateLevel(updatedXp);
      localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify({
        ...profile,
        xp: updatedXp,
        level: levelInfo.level,
        updatedAt: new Date().toISOString()
      }));
    }

    notifyGuestStorageUpdate();
    return { xpEarned };
  }

  const logRef = doc(db, 'moodLogs', logId);
  const snap = await getDoc(logRef);
  const isFirstTimeToday = !snap.exists();

  await setDoc(logRef, {
    id: logId,
    userId,
    date,
    ...data,
    updatedAt: new Date().toISOString()
  });

  let xpEarned = 0;
  if (isFirstTimeToday) {
    xpEarned = XP_RULES.MOOD_LOG;
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const profile = userSnap.data() as UserProfile;
      const updatedXp = (profile.xp || 0) + xpEarned;
      const levelInfo = calculateLevel(updatedXp);
      await updateDoc(userRef, {
        xp: updatedXp,
        level: levelInfo.level,
        updatedAt: new Date().toISOString()
      });
    }
  }

  return { xpEarned };
}

// Generate base sample data
function createSampleHabitsTemplate(userId: string) {
  return [
    {
      id: `sample_habit_1_${userId}`,
      userId,
      title: 'Morning Sunlight & Hydration',
      description: 'Drink 500ml water and get 15 mins of direct morning sun',
      category: 'health' as const,
      icon: 'Sun',
      color: '#06b6d4',
      frequency: 'daily' as const,
      targetCount: 1,
      unit: 'times',
      reminderTime: '07:30',
      currentStreak: 5,
      longestStreak: 12,
      totalCompletions: 18,
      isArchived: false,
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
    },
    {
      id: `sample_habit_2_${userId}`,
      userId,
      title: 'Deep Work Focus Block',
      description: '45 minutes uninterrupted flow without tabs or phone',
      category: 'focus' as const,
      icon: 'Zap',
      color: '#3b82f6',
      frequency: 'weekdays' as const,
      targetCount: 1,
      unit: 'sessions',
      reminderTime: '10:00',
      currentStreak: 4,
      longestStreak: 9,
      totalCompletions: 15,
      isArchived: false,
      createdAt: new Date(Date.now() - 18 * 86400000).toISOString()
    },
    {
      id: `sample_habit_3_${userId}`,
      userId,
      title: 'Physical Training & Cardio',
      description: 'Strength workout, run, or high-tempo bodyweight routine',
      category: 'fitness' as const,
      icon: 'Activity',
      color: '#10b981',
      frequency: 'daily' as const,
      targetCount: 1,
      unit: 'sessions',
      reminderTime: '17:30',
      currentStreak: 3,
      longestStreak: 7,
      totalCompletions: 14,
      isArchived: false,
      createdAt: new Date(Date.now() - 16 * 86400000).toISOString()
    },
    {
      id: `sample_habit_4_${userId}`,
      userId,
      title: 'Evening Reading & Reflection',
      description: 'Read 15 pages of non-fiction book and quiet reflection',
      category: 'mindfulness' as const,
      icon: 'BookOpen',
      color: '#8b5cf6',
      frequency: 'daily' as const,
      targetCount: 15,
      unit: 'pages',
      reminderTime: '21:30',
      currentStreak: 6,
      longestStreak: 14,
      totalCompletions: 20,
      isArchived: false,
      createdAt: new Date(Date.now() - 22 * 86400000).toISOString()
    }
  ];
}

// Populate sample data for guest mode instantly
function populateInitialGuestData(guestId: string) {
  const habits = createSampleHabitsTemplate(guestId);
  const logs: HabitLog[] = [];
  const moods: MoodLog[] = [];
  const today = new Date();

  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);

    habits.forEach((h, index) => {
      const completed = (i + index) % 4 !== 0;
      if (completed) {
        logs.push({
          id: `${h.id}_${dateStr}`,
          userId: guestId,
          habitId: h.id,
          date: dateStr,
          completed: true,
          count: h.targetCount,
          completedAt: new Date(d.getTime() + 36000000).toISOString()
        });
      }
    });

    if (i % 2 === 0) {
      const moodList: Array<'ecstatic' | 'happy' | 'neutral'> = ['ecstatic', 'happy', 'neutral'];
      moods.push({
        id: `${guestId}_${dateStr}`,
        userId: guestId,
        date: dateStr,
        mood: moodList[i % 3],
        energy: (i % 3) + 3,
        notes: i === 2 ? 'Great momentum today! Hit workout and deep focus.' : 'Felt balanced and productive.',
        tags: ['Exercise', 'Deep Work', 'Sleep'],
        updatedAt: d.toISOString()
      });
    }
  }

  localStorage.setItem(GUEST_HABITS_KEY, JSON.stringify(habits));
  localStorage.setItem(GUEST_LOGS_KEY, JSON.stringify(logs));
  localStorage.setItem(GUEST_MOODS_KEY, JSON.stringify(moods));
  getGuestProfile(guestId);
  notifyGuestStorageUpdate();
}

// Populate initial habits for Firestore user
export async function populateInitialHabits(userId: string) {
  if (isGuestUser(userId)) {
    populateInitialGuestData(userId);
    return;
  }

  const batch = writeBatch(db);
  const today = new Date();
  const sampleHabits = createSampleHabitsTemplate(userId);
  const createdHabitIds: string[] = [];

  for (const h of sampleHabits) {
    const { id, ...data } = h;
    const habitRef = doc(collection(db, 'habits'));
    batch.set(habitRef, data);
    createdHabitIds.push(habitRef.id);
  }

  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);

    createdHabitIds.forEach((hId, index) => {
      const completed = (i + index) % 4 !== 0;
      if (completed) {
        const logRef = doc(db, 'habitLogs', `${hId}_${dateStr}`);
        batch.set(logRef, {
          id: `${hId}_${dateStr}`,
          userId,
          habitId: hId,
          date: dateStr,
          completed: true,
          count: 1,
          completedAt: new Date(d.getTime() + 36000000).toISOString()
        });
      }
    });

    if (i % 2 === 0) {
      const moodList: Array<'ecstatic' | 'happy' | 'neutral'> = ['ecstatic', 'happy', 'neutral'];
      const moodRef = doc(db, 'moodLogs', `${userId}_${dateStr}`);
      batch.set(moodRef, {
        id: `${userId}_${dateStr}`,
        userId,
        date: dateStr,
        mood: moodList[i % 3],
        energy: (i % 3) + 3,
        notes: i === 2 ? 'Great momentum today! Hit workout and deep focus.' : 'Felt balanced and productive.',
        tags: ['Exercise', 'Deep Work', 'Sleep'],
        updatedAt: d.toISOString()
      });
    }
  }

  const userRef = doc(db, 'users', userId);
  batch.set(
    userRef,
    {
      uid: userId,
      displayName: 'Flow Traveler',
      xp: 750,
      level: 3,
      totalCompletions: 42,
      currentStreak: 5,
      longestStreak: 14,
      unlockedBadges: ['first_step', 'streak_3', 'multi_disciplinary'],
      createdAt: new Date().toISOString()
    },
    { merge: true }
  );

  await batch.commit();
}

// Migrate guest data to Firebase upon sign in
export async function migrateGuestDataToFirebase(firebaseUserId: string) {
  const guestHabits = getGuestHabits();
  if (guestHabits.length === 0) return;

  try {
    // Check if user already has habits in Firestore
    // If not, we can import guest habits
    const batch = writeBatch(db);
    const guestLogs = getGuestLogs();
    const guestMoods = getGuestMoods();
    const guestProfile = getGuestProfile('guest');

    for (const h of guestHabits) {
      const { id, ...hData } = h;
      const ref = doc(collection(db, 'habits'));
      batch.set(ref, {
        ...hData,
        userId: firebaseUserId
      });
    }

    for (const m of guestMoods) {
      const ref = doc(db, 'moodLogs', `${firebaseUserId}_${m.date}`);
      batch.set(ref, {
        ...m,
        id: `${firebaseUserId}_${m.date}`,
        userId: firebaseUserId
      });
    }

    const userRef = doc(db, 'users', firebaseUserId);
    batch.set(userRef, {
      uid: firebaseUserId,
      xp: guestProfile.xp || 750,
      level: guestProfile.level || 3,
      totalCompletions: guestProfile.totalCompletions || 42,
      currentStreak: guestProfile.currentStreak || 5,
      longestStreak: guestProfile.longestStreak || 14,
      unlockedBadges: guestProfile.unlockedBadges || ['first_step', 'streak_3', 'multi_disciplinary'],
      updatedAt: new Date().toISOString()
    }, { merge: true });

    await batch.commit();

    // Clean up guest local storage
    localStorage.removeItem(GUEST_HABITS_KEY);
    localStorage.removeItem(GUEST_LOGS_KEY);
    localStorage.removeItem(GUEST_MOODS_KEY);
  } catch (err) {
    console.error('Migration error:', err);
  }
}

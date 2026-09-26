export type HabitCategory = 
  | 'health' 
  | 'focus' 
  | 'mindfulness' 
  | 'fitness' 
  | 'learning' 
  | 'creativity' 
  | 'routine';

export type FrequencyType = 'daily' | 'weekdays' | 'weekends' | 'custom';

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: HabitCategory;
  icon: string;
  color: string; // hex or tailwind identifier
  frequency: FrequencyType;
  targetDays?: number[]; // 0 = Sun, 1 = Mon ... 6 = Sat
  targetCount: number; // e.g. 1 for simple boolean or 8 for glasses of water
  unit?: string; // e.g. 'times', 'glasses', 'pages', 'mins'
  reminderTime?: string; // e.g. "08:30"
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  isArchived?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface HabitLog {
  id: string; // e.g. `${habitId}_${date}`
  userId: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  count: number;
  notes?: string;
  completedAt?: string;
}

export type MoodType = 'ecstatic' | 'happy' | 'neutral' | 'tired' | 'stressed';

export interface MoodLog {
  id: string; // `${userId}_${date}`
  userId: string;
  date: string; // YYYY-MM-DD
  mood: MoodType;
  energy: number; // 1 to 5
  notes?: string;
  tags?: string[];
  updatedAt?: string;
}

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
  isGuest?: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  xp: number;
  level: number;
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  unlockedBadges: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'starter' | 'streak' | 'volume' | 'mastery' | 'mind';
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  xpReward: number;
  isUnlocked?: boolean;
  unlockedAt?: string;
  progressPercent?: number;
}

export interface AIInsight {
  id: string;
  type: 'streak' | 'correlation' | 'tip' | 'warning' | 'celebration';
  title: string;
  message: string;
  metric?: string;
  actionLabel?: string;
  actionFilter?: string;
  impactScore?: number; // 1-100
}

export interface DayStats {
  date: string; // YYYY-MM-DD
  totalHabits: number;
  completedHabits: number;
  percentage: number;
  mood?: MoodType;
  energy?: number;
}

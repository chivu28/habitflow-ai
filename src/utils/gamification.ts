import confetti from 'canvas-confetti';
import { Badge, UserProfile } from '../types';

export const XP_RULES = {
  HABIT_COMPLETION: 50,
  ALL_HABITS_BONUS: 100,
  MOOD_LOG: 30,
  STREAK_MILESTONE_3: 150,
  STREAK_MILESTONE_7: 350,
  STREAK_MILESTONE_30: 1000,
};

// Calculate level and progress from XP
export function calculateLevel(xp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
  title: string;
} {
  // Base scaling: level L requires 200 * (L ^ 1.5) total XP
  let level = 1;
  while (getTotalXpForLevel(level + 1) <= xp) {
    level++;
  }

  const currentLevelBase = getTotalXpForLevel(level);
  const nextLevelBase = getTotalXpForLevel(level + 1);
  const xpInCurrentLevel = Math.max(0, xp - currentLevelBase);
  const xpNeededForNext = nextLevelBase - currentLevelBase;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100));

  const titles = [
    'Novice Starter',
    'Habit Apprentice',
    'Momentum Builder',
    'Consistency Pioneer',
    'Routine Alchemist',
    'Focus Master',
    'Zen Strategist',
    'Iron Will Titan',
    'Flow Grandmaster',
    'HabitFlow Legend'
  ];

  const titleIndex = Math.min(level - 1, titles.length - 1);

  return {
    level,
    currentLevelXp: xpInCurrentLevel,
    nextLevelXp: xpNeededForNext,
    progressPercent,
    title: titles[titleIndex] || 'Ascendant Master'
  };
}

function getTotalXpForLevel(lvl: number): number {
  if (lvl <= 1) return 0;
  return Math.round(180 * Math.pow(lvl - 1, 1.6));
}

// Master Badges definition
export const ALL_BADGES: Badge[] = [
  {
    id: 'first_step',
    title: 'First Spark',
    description: 'Complete your very first habit in HabitFlow.',
    icon: 'Sparkles',
    category: 'starter',
    tier: 'bronze',
    xpReward: 100
  },
  {
    id: 'streak_3',
    title: 'Ignition',
    description: 'Maintain a 3-day active streak across your habits.',
    icon: 'Flame',
    category: 'streak',
    tier: 'bronze',
    xpReward: 200
  },
  {
    id: 'streak_7',
    title: 'Unstoppable Flow',
    description: 'Hold a 7-day streak without missing a day.',
    icon: 'Zap',
    category: 'streak',
    tier: 'silver',
    xpReward: 400
  },
  {
    id: 'streak_30',
    title: 'Titan of Will',
    description: 'Hit a formidable 30-day streak milestone.',
    icon: 'Crown',
    category: 'streak',
    tier: 'gold',
    xpReward: 1000
  },
  {
    id: 'perfect_day',
    title: 'Flawless Synchrony',
    description: 'Complete 100% of scheduled habits in a single day.',
    icon: 'CheckCircle2',
    category: 'mastery',
    tier: 'bronze',
    xpReward: 150
  },
  {
    id: 'centurion',
    title: 'Centurion Club',
    description: 'Log 100 total habit completions.',
    icon: 'ShieldCheck',
    category: 'volume',
    tier: 'gold',
    xpReward: 800
  },
  {
    id: 'half_centurion',
    title: 'Rising Star',
    description: 'Log 25 total habit completions.',
    icon: 'Award',
    category: 'volume',
    tier: 'silver',
    xpReward: 300
  },
  {
    id: 'mindful_soul',
    title: 'Inner Harmonizer',
    description: 'Log your mood and reflections for 5 days.',
    icon: 'HeartHandshake',
    category: 'mind',
    tier: 'silver',
    xpReward: 250
  },
  {
    id: 'level_5',
    title: 'Routine Alchemist',
    description: 'Reach Level 5 in HabitFlow.',
    icon: 'Trophy',
    category: 'mastery',
    tier: 'diamond',
    xpReward: 500
  },
  {
    id: 'multi_disciplinary',
    title: 'Renaissance Mind',
    description: 'Have active habits spanning at least 3 distinct categories.',
    icon: 'Layers',
    category: 'starter',
    tier: 'bronze',
    xpReward: 150
  }
];

// Check which badges should be unlocked based on stats
export function evaluateBadges(params: {
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  perfectDaysCount: number;
  moodLogsCount: number;
  distinctCategoriesCount: number;
  alreadyUnlocked: string[];
}): string[] {
  const newUnlocked: string[] = [];

  const checkAndAdd = (badgeId: string, condition: boolean) => {
    if (condition && !params.alreadyUnlocked.includes(badgeId)) {
      newUnlocked.push(badgeId);
    }
  };

  checkAndAdd('first_step', params.totalCompletions >= 1);
  checkAndAdd('streak_3', Math.max(params.currentStreak, params.longestStreak) >= 3);
  checkAndAdd('streak_7', Math.max(params.currentStreak, params.longestStreak) >= 7);
  checkAndAdd('streak_30', Math.max(params.currentStreak, params.longestStreak) >= 30);
  checkAndAdd('perfect_day', params.perfectDaysCount >= 1);
  checkAndAdd('rising_star', params.totalCompletions >= 25);
  checkAndAdd('centurion', params.totalCompletions >= 100);
  checkAndAdd('mindful_soul', params.moodLogsCount >= 5);
  checkAndAdd('level_5', params.level >= 5);
  checkAndAdd('multi_disciplinary', params.distinctCategoriesCount >= 3);

  return newUnlocked;
}

// Confetti triggers
export function triggerCelebration(type: 'subtle' | 'full' | 'fireworks' = 'full') {
  if (type === 'subtle') {
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#38bdf8', '#818cf8', '#34d399', '#fbbf24']
    });
    return;
  }

  if (type === 'fireworks') {
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 40 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#60a5fa', '#a855f7', '#38bdf8'] });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#f59e0b', '#ec4899', '#10b981'] });
    }, 250);
    return;
  }

  // Full default celebration
  confetti({
    particleCount: 90,
    spread: 80,
    origin: { y: 0.65 },
    colors: ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981']
  });
}

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

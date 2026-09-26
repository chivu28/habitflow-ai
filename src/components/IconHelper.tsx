import React from 'react';
import {
  Sun,
  Moon,
  Zap,
  Activity,
  BookOpen,
  Droplets,
  Heart,
  Smile,
  Target,
  Sparkles,
  Flame,
  CheckCircle2,
  Trophy,
  Crown,
  ShieldCheck,
  Award,
  Layers,
  HeartHandshake,
  Check,
  Dumbbell,
  Coffee,
  Code,
  Compass,
  Briefcase,
  Music,
  Bed,
  type LucideProps
} from 'lucide-react';

export const HABIT_ICONS: Record<string, React.FC<LucideProps>> = {
  Sun,
  Moon,
  Zap,
  Activity,
  BookOpen,
  Droplets,
  Heart,
  Smile,
  Target,
  Sparkles,
  Flame,
  CheckCircle2,
  Trophy,
  Crown,
  ShieldCheck,
  Award,
  Layers,
  HeartHandshake,
  Dumbbell,
  Coffee,
  Code,
  Compass,
  Briefcase,
  Music,
  Bed
};

export const HabitIcon: React.FC<{ name: string; className?: string }> = ({ name, className = 'w-5 h-5' }) => {
  const IconComponent = HABIT_ICONS[name] || Target;
  return <IconComponent className={className} />;
};

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  health: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'rgba(16, 185, 129, 0.3)' },
  focus: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', glow: 'rgba(59, 130, 246, 0.3)' },
  mindfulness: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30', glow: 'rgba(139, 92, 246, 0.3)' },
  fitness: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', glow: 'rgba(245, 158, 11, 0.3)' },
  learning: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', glow: 'rgba(6, 182, 212, 0.3)' },
  creativity: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30', glow: 'rgba(236, 72, 153, 0.3)' },
  routine: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30', glow: 'rgba(99, 102, 241, 0.3)' }
};

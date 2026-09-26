import React, { useState } from 'react';
import { AIInsight } from '../types';
import { Sparkles, BrainCircuit, RefreshCw, Zap, TrendingUp, AlertTriangle, PartyPopper } from 'lucide-react';

interface AIInsightsSectionProps {
  insights: AIInsight[];
  onRefresh: () => void;
  onFilterCategory?: (category: string) => void;
}

export const AIInsightsSection: React.FC<AIInsightsSectionProps> = ({
  insights,
  onRefresh,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'streak':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'correlation':
        return <TrendingUp className="w-5 h-5 text-cyan-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      case 'celebration':
        return <PartyPopper className="w-5 h-5 text-emerald-400" />;
      default:
        return <BrainCircuit className="w-5 h-5 text-blue-400" />;
    }
  };

  const getInsightTheme = (type: AIInsight['type']) => {
    switch (type) {
      case 'streak':
        return 'border-amber-500/30 bg-amber-500/5 hover:border-amber-400/50';
      case 'correlation':
        return 'border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-400/50';
      case 'warning':
        return 'border-rose-500/30 bg-rose-500/5 hover:border-rose-400/50';
      case 'celebration':
        return 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-400/50';
      default:
        return 'border-blue-500/30 bg-blue-500/5 hover:border-blue-400/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-l from-indigo-500/20 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-400/10 px-2.5 py-0.5 rounded-full border border-cyan-400/20">
                  Adaptive Intelligence
                </span>
                <span className="text-xs text-slate-400">Live Analysis</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
                Cognitive Flow & Habit Insights
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Pattern recognition evaluating your completion history, mood correlations, and energy triggers.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-white bg-slate-800/90 hover:bg-slate-750 border border-white/10 flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Recalculate Patterns</span>
          </button>
        </div>
      </div>

      {/* Insight Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => {
          const theme = getInsightTheme(insight.type);
          const icon = getInsightIcon(insight.type);

          return (
            <div
              key={insight.id}
              className={`rounded-2xl p-5 border transition-all duration-300 backdrop-blur-xl ${theme} shadow-lg`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 shadow-sm">
                  {icon}
                </div>

                {insight.metric && (
                  <span className="text-xs font-bold text-white bg-slate-800/90 px-3 py-1 rounded-full border border-white/10">
                    {insight.metric}
                  </span>
                )}
              </div>

              <div className="mt-4">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {insight.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {insight.message}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  Impact Score: <strong className="text-cyan-300">{insight.impactScore || 85}/100</strong>
                </span>
                {insight.actionLabel && (
                  <span className="text-blue-400 font-semibold text-[11px]">
                    {insight.actionLabel} →
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

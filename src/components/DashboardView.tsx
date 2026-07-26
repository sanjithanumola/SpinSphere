import React, { useState } from 'react';
import { Wheel, SpinRecord, AIInsightsData } from '../types';
import {
  BarChart3,
  Sparkles,
  Trophy,
  History,
  FolderHeart,
  Brain,
  Trash2,
  Copy,
  Star,
  Download,
  Upload,
  Plus,
  RefreshCw,
  Lightbulb,
  Zap,
} from 'lucide-react';

interface DashboardViewProps {
  wheels: Wheel[];
  activeWheelId: string;
  spinHistory: SpinRecord[];
  onSelectWheel: (id: string) => void;
  onCreateWheel: () => void;
  onDeleteWheel: (id: string) => void;
  onDuplicateWheel: (wheel: Wheel) => void;
  onToggleFavorite: (id: string) => void;
  onClearHistory: () => void;
  activeWheel: Wheel;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  wheels,
  activeWheelId,
  spinHistory,
  onSelectWheel,
  onCreateWheel,
  onDeleteWheel,
  onDuplicateWheel,
  onToggleFavorite,
  onClearHistory,
  activeWheel,
}) => {
  const [insights, setInsights] = useState<AIInsightsData | null>(null);
  const [loadingInsights, setLoadingInsights] = useState<boolean>(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  // Compute metrics
  const totalSpins = spinHistory.length;
  const favoriteWheelsCount = wheels.filter((w) => w.isFavorite).length;

  // Most used wheel
  const wheelCounts: Record<string, number> = {};
  spinHistory.forEach((rec) => {
    wheelCounts[rec.wheelTitle] = (wheelCounts[rec.wheelTitle] || 0) + 1;
  });
  let mostUsedName = 'N/A';
  let maxCount = 0;
  Object.entries(wheelCounts).forEach(([name, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostUsedName = name;
    }
  });

  // Call Server AI API for Insights
  const handleFetchAIInsights = async () => {
    setLoadingInsights(true);
    setInsightError(null);

    try {
      const res = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wheelTitle: activeWheel.title,
          options: activeWheel.options.map((o) => ({ label: o.label, weight: o.weight })),
          spinHistory: spinHistory.slice(0, 20),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate insights.');
      }

      const data = await res.json();
      setInsights(data);
    } catch (err: any) {
      console.error('Error fetching AI insights:', err);
      setInsightError(err.message || 'Could not connect to AI server.');
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-xl flex flex-col gap-1">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-cyan-400" /> Total Spins
          </span>
          <p className="text-2xl font-black text-white">{totalSpins}</p>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-xl flex flex-col gap-1">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" /> Most Used Wheel
          </span>
          <p className="text-lg font-bold text-slate-200 truncate">{mostUsedName}</p>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-xl flex flex-col gap-1">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <FolderHeart className="w-4 h-4 text-purple-400" /> Saved Wheels
          </span>
          <p className="text-2xl font-black text-white">{wheels.length}</p>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-xl flex flex-col gap-1">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <Star className="w-4 h-4 text-yellow-400" /> Favorites
          </span>
          <p className="text-2xl font-black text-white">{favoriteWheelsCount}</p>
        </div>
      </div>

      {/* AI SMART DECISION INSIGHTS SECTION */}
      <div className="p-6 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600/20 border border-purple-400/30 rounded-2xl text-purple-300">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">Smart Decision Insights</h3>
                <span className="px-2.5 py-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 text-slate-950 font-extrabold text-[10px] rounded-full uppercase">
                  AI Powered
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Analyzes spin probabilities, momentum patterns, and decision trends
              </p>
            </div>
          </div>

          <button
            onClick={handleFetchAIInsights}
            disabled={loadingInsights}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
          >
            {loadingInsights ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing History...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-yellow-300" /> Generate AI Insights
              </>
            )}
          </button>
        </div>

        {/* AI Results Panel */}
        {insightError && (
          <div className="mt-4 p-3 bg-rose-950/50 border border-rose-800/50 rounded-xl text-rose-300 text-xs">
            {insightError}
          </div>
        )}

        {insights ? (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Persona & Luck */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
              <span className="text-xs text-slate-400 font-semibold uppercase">Decision Persona</span>
              <div className="px-3 py-2 bg-purple-950/50 border border-purple-500/40 text-purple-300 font-bold text-sm rounded-xl">
                🎭 {insights.personalityType}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Luck Index</span>
                  <span className="text-cyan-400 font-bold">{insights.luckIndex}/100</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, Math.max(0, insights.luckIndex))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Summary & Advice */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3 md:col-span-2">
              <span className="text-xs text-slate-400 font-semibold uppercase">Trend Analysis</span>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {insights.trendSummary}
              </p>

              {insights.actionableAdvice && (
                <div className="flex items-start gap-2 p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs text-cyan-200">
                  <Lightbulb className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>{insights.actionableAdvice}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          !loadingInsights && (
            <div className="mt-4 text-center py-6 text-xs text-slate-500 italic">
              Click "Generate AI Insights" above to perform a real-time Gemini AI analysis on your decision patterns.
            </div>
          )
        )}
      </div>

      {/* SAVED WHEELS MANAGER */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderHeart className="w-5 h-5 text-purple-400" />
            Saved Decision Wheels ({wheels.length})
          </h3>
          <button
            onClick={onCreateWheel}
            className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create Blank Wheel
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {wheels.map((wheel) => {
            const isActive = wheel.id === activeWheelId;
            return (
              <div
                key={wheel.id}
                onClick={() => onSelectWheel(wheel.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between gap-3 ${
                  isActive
                    ? 'bg-gradient-to-b from-cyan-950/60 to-slate-900 border-cyan-500 ring-1 ring-cyan-500/50'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                      {wheel.category || 'Custom'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(wheel.id);
                      }}
                      className="text-slate-500 hover:text-yellow-400"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          wheel.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''
                        }`}
                      />
                    </button>
                  </div>
                  <h4 className="text-base font-bold text-white mt-1 line-clamp-1">{wheel.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{wheel.options.length} options</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-500">
                    {new Date(wheel.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateWheel(wheel);
                      }}
                      title="Duplicate Wheel"
                      className="p-1 text-slate-400 hover:text-cyan-300"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {wheels.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteWheel(wheel.id);
                        }}
                        title="Delete Wheel"
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SPIN HISTORY LOG */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            Spin History Log
          </h3>
          {spinHistory.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
            >
              Clear Log
            </button>
          )}
        </div>

        {spinHistory.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 italic">
            No spin records yet. Spin a wheel to log your history!
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {spinHistory.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: rec.winnerColor }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{rec.winnerLabel}</span>
                      {rec.spinnerNameTag && (
                        <span className="px-1.5 py-0.5 bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-extrabold text-[9px] rounded-md">
                          Tag: {rec.spinnerNameTag}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Wheel: {rec.wheelTitle} • Mode: {rec.mode}
                    </p>
                  </div>
                </div>
                <span className="text-slate-500 font-mono text-[10px]">
                  {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

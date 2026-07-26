import React, { useState } from 'react';
import { WheelOption } from '../types';
import { Sparkles, X, Loader2, Check } from 'lucide-react';

interface AISuggestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyOptions: (options: WheelOption[]) => void;
}

export const AISuggestModal: React.FC<AISuggestModalProps> = ({
  isOpen,
  onClose,
  onApplyOptions,
}) => {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai-suggest-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, count }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to suggest options.');
      }

      const data = await res.json();
      if (!Array.isArray(data.options) || data.options.length === 0) {
        throw new Error('No options returned.');
      }

      const presetColors = [
        '#06b6d4',
        '#8b5cf6',
        '#ec4899',
        '#3b82f6',
        '#10b981',
        '#f59e0b',
        '#f43f5e',
        '#84cc16',
      ];

      const formatted: WheelOption[] = data.options.map((item: any, idx: number) => ({
        id: 'opt-ai-' + idx + '-' + Date.now(),
        label: item.label || `Option ${idx + 1}`,
        weight: item.weight || 1,
        color: item.color || presetColors[idx % presetColors.length],
      }));

      onApplyOptions(formatted);
      onClose();
    } catch (err: any) {
      console.error('Error generating AI options:', err);
      setError(err.message || 'Failed to reach AI service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-300">
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI Option Generator</h3>
              <p className="text-xs text-slate-400">Generate creative choices with Gemini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="text-xs text-slate-300 font-semibold mb-1 block">
              What topic or decision do you need options for?
            </label>
            <input
              type="text"
              placeholder="e.g. Board games for 4 players, Quick lunch ideas, Date night"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 p-3 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-semibold mb-1 block">
              Number of options:
            </label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 text-white p-2.5 rounded-xl text-xs font-bold focus:outline-none"
            >
              {[4, 6, 8, 10, 12].map((num) => (
                <option key={num} value={num}>
                  {num} Options
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-950/60 border border-rose-800/50 rounded-xl text-rose-300 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating Magic Options...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" /> Generate Wheel Options
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

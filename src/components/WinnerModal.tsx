import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { WheelOption, DecisionMode } from '../types';
import { Trophy, RotateCcw, Trash2, Share2, X, Sparkles, Check } from 'lucide-react';

interface WinnerModalProps {
  winner: WheelOption | null;
  mode: DecisionMode;
  onClose: () => void;
  onSpinAgain: () => void;
  onRemoveWinner: (optionId: string) => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  winner,
  mode,
  onClose,
  onSpinAgain,
  onRemoveWinner,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (winner) {
      // Trigger canvas confetti celebration
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#8b5cf6', '#ec4899', '#facc15', '#10b981'],
        });
      } catch {
        // Fallback
      }
    }
  }, [winner]);

  if (!winner) return null;

  const handleShareResult = () => {
    const text = `🎉 SpinSphere selected: "${winner.label}"!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {/* Background glow */}
      <div className="absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Winner Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-center flex flex-col items-center gap-5 transform animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Trophy Icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
            </div>
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-pulse" />
        </div>

        {/* Header Title */}
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full">
            WE HAVE A WINNER! ({mode.toUpperCase()} MODE)
          </span>
          <h2 className="text-3xl font-black text-white mt-3 leading-tight tracking-tight">
            {winner.label}
          </h2>
        </div>

        {/* Color Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
          <div
            className="w-3.5 h-3.5 rounded-full shadow-sm"
            style={{ backgroundColor: winner.color }}
          />
          Selected Option
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full mt-2">
          <button
            onClick={onSpinAgain}
            className="py-3 px-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4" /> Spin Again
          </button>

          <button
            onClick={handleShareResult}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold rounded-2xl flex items-center justify-center gap-2 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Share Result'}
          </button>
        </div>

        {/* Eliminate Winner Button */}
        <button
          onClick={() => {
            onRemoveWinner(winner.id);
            onClose();
          }}
          className="w-full py-2.5 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/50 rounded-xl flex items-center justify-center gap-1.5 transition"
        >
          <Trash2 className="w-3.5 h-3.5" /> Remove "{winner.label}" from wheel
        </button>
      </div>
    </div>
  );
};

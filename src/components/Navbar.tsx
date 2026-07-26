import React from 'react';
import { Wheel, ExtraTool, UserNameTag } from '../types';
import { NameTagBadge } from './NameTagBadge';
import { sound } from '../utils/sound';
import {
  Compass,
  Layers,
  Dices,
  BarChart3,
  Share2,
  Volume2,
  VolumeX,
  Download,
  Sparkles,
  ChevronDown,
  Check,
} from 'lucide-react';

interface NavbarProps {
  wheels: Wheel[];
  activeWheel: Wheel;
  onSelectWheel: (id: string) => void;
  activeTool: ExtraTool;
  setActiveTool: (tool: ExtraTool) => void;
  onShareWheel: () => void;
  onExportImage: () => void;
  onNameTagChange?: (tag: UserNameTag) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  wheels,
  activeWheel,
  onSelectWheel,
  activeTool,
  setActiveTool,
  onShareWheel,
  onExportImage,
  onNameTagChange,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [showWheelSelector, setShowWheelSelector] = React.useState(false);

  const handleShareClick = () => {
    onShareWheel();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-xl px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-cyan-400 animate-spin-slow" />
              </div>
            </div>
            <div className="absolute -inset-1 bg-cyan-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition pointer-events-none" />
          </div>

          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-1">
              SpinSphere
              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 bg-cyan-950 border border-cyan-500/40 text-cyan-300 rounded-md">
                PRO
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Interactive Decision Maker</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <button
            onClick={() => setActiveTool('wheel')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTool === 'wheel'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" /> Spin Wheel
          </button>

          <button
            onClick={() => setActiveTool('dice')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              ['coin', 'dice', 'number', 'namepicker', 'teamgen'].includes(activeTool)
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dices className="w-4 h-4" /> Extra Tools
          </button>

          <button
            onClick={() => setActiveTool('dashboard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTool === 'dashboard'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Dashboard
          </button>
        </nav>

        {/* Quick Wheel Switcher, Name Tag Badge & Actions */}
        <div className="flex items-center gap-2">
          {/* Active Name Tag Badge */}
          <NameTagBadge onNameTagChange={onNameTagChange} />

          {/* Quick Active Wheel Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowWheelSelector(!showWheelSelector)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 transition"
            >
              <span className="truncate max-w-[120px]">{activeWheel.title}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showWheelSelector && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Switch Wheel</span>
                <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                  {wheels.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => {
                        onSelectWheel(w.id);
                        setShowWheelSelector(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                        w.id === activeWheel.id
                          ? 'bg-cyan-950 text-cyan-300 font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">{w.title}</span>
                      {w.id === activeWheel.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Share Button */}
          <button
            onClick={handleShareClick}
            title="Share Wheel URL"
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 rounded-xl transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Export PNG */}
          <button
            onClick={onExportImage}
            title="Export Wheel Image"
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-purple-400 rounded-xl transition"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

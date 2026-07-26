import React, { useState } from 'react';
import { WheelOption, Wheel, WheelTheme } from '../types';
import { WHEEL_THEMES } from '../data/presets';
import {
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Palette,
  FileText,
  Sparkles,
  Sliders,
  Check,
  RefreshCw,
  Edit2,
} from 'lucide-react';

interface WheelEditorProps {
  wheel: Wheel;
  onUpdateWheel: (updated: Wheel) => void;
  onOpenAISuggest: () => void;
}

export const WheelEditor: React.FC<WheelEditorProps> = ({
  wheel,
  onUpdateWheel,
  onOpenAISuggest,
}) => {
  const [newLabel, setNewLabel] = useState('');
  const [newWeight, setNewWeight] = useState(1);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(wheel.title);

  const activeTheme = WHEEL_THEMES.find((t) => t.id === wheel.themeId) || WHEEL_THEMES[0];
  const totalWeight = wheel.options.reduce((sum, o) => sum + (o.weight || 1), 0);

  // Color Swatches
  const presetColors = [
    '#06b6d4',
    '#8b5cf6',
    '#ec4899',
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#f43f5e',
    '#84cc16',
    '#a855f7',
    '#eab308',
  ];

  const handleAddOption = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newLabel.trim()) return;

    const newOption: WheelOption = {
      id: 'opt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      label: newLabel.trim(),
      weight: newWeight,
      color: presetColors[wheel.options.length % presetColors.length],
    };

    onUpdateWheel({
      ...wheel,
      options: [...wheel.options, newOption],
      updatedAt: Date.now(),
    });

    setNewLabel('');
    setNewWeight(1);
  };

  const handleUpdateOption = (id: string, fields: Partial<WheelOption>) => {
    const updated = wheel.options.map((opt) => (opt.id === id ? { ...opt, ...fields } : opt));
    onUpdateWheel({ ...wheel, options: updated, updatedAt: Date.now() });
  };

  const handleDeleteOption = (id: string) => {
    if (wheel.options.length <= 2) {
      alert('A wheel requires at least 2 options.');
      return;
    }
    const updated = wheel.options.filter((opt) => opt.id !== id);
    onUpdateWheel({ ...wheel, options: updated, updatedAt: Date.now() });
  };

  const handleDuplicateOption = (option: WheelOption) => {
    const copy: WheelOption = {
      ...option,
      id: 'opt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      label: `${option.label} (Copy)`,
    };
    onUpdateWheel({ ...wheel, options: [...wheel.options, copy], updatedAt: Date.now() });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= wheel.options.length) return;

    const updated = [...wheel.options];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onUpdateWheel({ ...wheel, options: updated, updatedAt: Date.now() });
  };

  const handleBulkImport = () => {
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      alert('Please enter at least 2 lines of options.');
      return;
    }

    const newOptions: WheelOption[] = lines.map((line, i) => ({
      id: 'opt-bulk-' + i + '-' + Date.now(),
      label: line,
      weight: 1,
      color: presetColors[i % presetColors.length],
    }));

    onUpdateWheel({ ...wheel, options: newOptions, updatedAt: Date.now() });
    setShowBulkImport(false);
    setBulkText('');
  };

  const handleSaveTitle = () => {
    if (titleInput.trim()) {
      onUpdateWheel({ ...wheel, title: titleInput.trim(), updatedAt: Date.now() });
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl flex flex-col gap-5">
      {/* Header & Title Editing */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        {isEditingTitle ? (
          <div className="flex items-center gap-2 w-full">
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="bg-slate-800 text-white font-bold text-lg px-3 py-1.5 rounded-lg border border-cyan-500/50 focus:outline-none w-full"
              autoFocus
            />
            <button
              onClick={handleSaveTitle}
              className="p-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition"
            >
              <Check className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
            <h2 className="text-xl font-bold text-white tracking-wide">{wheel.title}</h2>
            <Edit2 className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition" />
          </div>
        )}

        <button
          onClick={onOpenAISuggest}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition transform hover:scale-105"
        >
          <Sparkles className="w-4 h-4 text-cyan-300" />
          AI Option Generator
        </button>
      </div>

      {/* Add New Option Form */}
      <form onSubmit={handleAddOption} className="flex gap-2">
        <input
          type="text"
          placeholder="Add option (e.g. Pizza, Alex, Option A)"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          className="flex-1 bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-400 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={!newLabel.trim()}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-sm rounded-xl transition flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </form>

      {/* Options List */}
      <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
        {wheel.options.map((option, index) => {
          const prob = totalWeight > 0 ? Math.round(((option.weight || 1) / totalWeight) * 100) : 0;
          return (
            <div
              key={option.id}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition ${
                option.eliminated
                  ? 'bg-slate-950/40 border-slate-800/50 opacity-40 line-through'
                  : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              {/* Color Swatch Picker */}
              <input
                type="color"
                value={option.color}
                onChange={(e) => handleUpdateOption(option.id, { color: e.target.value })}
                className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0 p-0"
              />

              {/* Label */}
              <input
                type="text"
                value={option.label}
                onChange={(e) => handleUpdateOption(option.id, { label: e.target.value })}
                className="flex-1 bg-transparent text-sm font-medium text-slate-200 focus:outline-none focus:border-b focus:border-cyan-400"
              />

              {/* Weight & Probability */}
              <div className="flex items-center gap-2 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-700/60 text-xs">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Weight:</span>
                <select
                  value={option.weight || 1}
                  onChange={(e) => handleUpdateOption(option.id, { weight: Number(e.target.value) })}
                  className="bg-slate-800 text-slate-200 font-bold rounded px-1 py-0.5 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((w) => (
                    <option key={w} value={w}>
                      {w}x
                    </option>
                  ))}
                </select>
                <span className="text-cyan-400 font-semibold">{prob}%</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="p-1 hover:bg-slate-700 disabled:opacity-20 rounded text-slate-400"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === wheel.options.length - 1}
                  className="p-1 hover:bg-slate-700 disabled:opacity-20 rounded text-slate-400"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDuplicateOption(option)}
                  title="Duplicate Segment"
                  className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-cyan-300"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteOption(option.id)}
                  title="Delete Option"
                  className="p-1 hover:bg-rose-950 rounded text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Theme Selector */}
      <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
          <span className="flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-cyan-400" />
            Wheel Color Palette
          </span>
          <span className="text-slate-300 font-bold">{activeTheme.name}</span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {WHEEL_THEMES.map((theme) => {
            const isSelected = theme.id === wheel.themeId;
            return (
              <button
                key={theme.id}
                onClick={() => onUpdateWheel({ ...wheel, themeId: theme.id, updatedAt: Date.now() })}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition ${
                  isSelected ? 'border-cyan-400 bg-cyan-950/30 ring-1 ring-cyan-400' : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                }`}
              >
                <div className="flex h-3 w-full rounded-full overflow-hidden">
                  {theme.colors.slice(0, 4).map((c, i) => (
                    <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className="text-[10px] text-slate-300 font-medium truncate w-full text-center">
                  {theme.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bulk Import Toggle */}
      <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
        <button
          onClick={() => setShowBulkImport(!showBulkImport)}
          className="flex items-center gap-1 text-slate-300 hover:text-cyan-400 transition"
        >
          <FileText className="w-3.5 h-3.5" />
          {showBulkImport ? 'Close Bulk Import' : 'Import List from Text'}
        </button>

        <span className="text-slate-500">{wheel.options.length} segments</span>
      </div>

      {/* Bulk Import Drawer */}
      {showBulkImport && (
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
          <p className="text-xs text-slate-400">Paste your options below (one item per line):</p>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={4}
            placeholder={`Option 1\nOption 2\nOption 3`}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs p-2.5 rounded-lg focus:outline-none focus:border-cyan-500 font-mono"
          />
          <button
            onClick={handleBulkImport}
            className="w-full py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition"
          >
            Import Options List
          </button>
        </div>
      )}
    </div>
  );
};

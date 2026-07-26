import React, { useState, useEffect } from 'react';
import { UserNameTag } from '../types';
import { User, Tag, Sparkles, Edit3, Check, X, Shield, Award, UserCheck } from 'lucide-react';
import { sound } from '../utils/sound';

const DEFAULT_NAMETAG: UserNameTag = {
  name: 'Spinner Host',
  role: 'Decision Maker',
  color: '#06b6d4',
};

const PRESET_ROLES = [
  'Decision Maker',
  'Game Host',
  'Team Lead',
  'Lucky Spinner',
  'Classroom Teacher',
  'Event Organizer',
];

const PRESET_COLORS = [
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Indigo', hex: '#6366f1' },
];

interface NameTagBadgeProps {
  onNameTagChange?: (tag: UserNameTag) => void;
  compact?: boolean;
}

export const NameTagBadge: React.FC<NameTagBadgeProps> = ({ onNameTagChange, compact = false }) => {
  const [nameTag, setNameTag] = useState<UserNameTag>(() => {
    try {
      const saved = localStorage.getItem('spinsphere_nametag');
      return saved ? JSON.parse(saved) : DEFAULT_NAMETAG;
    } catch {
      return DEFAULT_NAMETAG;
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(nameTag.name);
  const [tempRole, setTempRole] = useState(nameTag.role || 'Decision Maker');
  const [tempColor, setTempColor] = useState(nameTag.color || '#06b6d4');

  useEffect(() => {
    try {
      localStorage.setItem('spinsphere_nametag', JSON.stringify(nameTag));
    } catch (e) {
      console.error('Failed to save name tag', e);
    }
    if (onNameTagChange) {
      onNameTagChange(nameTag);
    }
  }, [nameTag, onNameTagChange]);

  const handleSave = () => {
    if (!tempName.trim()) return;
    const updated: UserNameTag = {
      name: tempName.trim(),
      role: tempRole.trim(),
      color: tempColor,
    };
    setNameTag(updated);
    setIsEditing(false);
    sound.playButtonClick();
  };

  return (
    <div className="relative inline-block">
      {/* Name Tag Badge Trigger */}
      <button
        onClick={() => {
          setTempName(nameTag.name);
          setTempRole(nameTag.role || 'Decision Maker');
          setTempColor(nameTag.color || '#06b6d4');
          setIsEditing(true);
        }}
        title="Click to edit your Name Tag"
        className="group relative flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 backdrop-blur-md shadow-md transition-all duration-200"
      >
        {/* Name Tag Icon / Badge Color Dot */}
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-950 font-black text-xs shadow-inner transition-transform group-hover:scale-105"
          style={{ backgroundColor: nameTag.color || '#06b6d4' }}
        >
          <Tag className="w-3.5 h-3.5 text-slate-950" />
        </div>

        {/* Text Content */}
        <div className="text-left flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] uppercase font-extrabold tracking-widest text-slate-400 leading-none">
              NAME TAG
            </span>
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: nameTag.color || '#06b6d4' }}
            />
          </div>
          <span className="text-xs font-black text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
            {nameTag.name}
          </span>
        </div>

        {!compact && (
          <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-extrabold bg-slate-800 border border-slate-700/80 text-slate-300 rounded-lg ml-1">
            {nameTag.role}
          </span>
        )}

        <Edit3 className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition ml-0.5" />
      </button>

      {/* Interactive Name Tag Editor Modal / Popover */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative z-10 w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-5 shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div
                  className="p-2 rounded-xl text-slate-950"
                  style={{ backgroundColor: tempColor }}
                >
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Customize Name Tag</h3>
                  <p className="text-[11px] text-slate-400">Personalize your spinner identity</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Name Tag Preview Card (Classic Badge Look) */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden shadow-inner text-center space-y-1">
              <div
                className="absolute top-0 left-0 right-0 h-2"
                style={{ backgroundColor: tempColor }}
              />
              <span className="text-[9px] uppercase tracking-widest font-black text-slate-500">
                HELLO, MY NAME IS
              </span>
              <h4 className="text-lg font-black text-white tracking-wide truncate">
                {tempName || 'Your Name'}
              </h4>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-950" style={{ backgroundColor: tempColor }}>
                {tempRole || 'Decision Maker'}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Your Name</label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="e.g. Alex, Ram, Captain"
                  maxLength={24}
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 p-2.5 rounded-xl font-bold focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Role / Title Tag</label>
                <input
                  type="text"
                  value={tempRole}
                  onChange={(e) => setTempRole(e.target.value)}
                  placeholder="e.g. Decision Maker, Game Host"
                  maxLength={24}
                  className="w-full bg-slate-800 border border-slate-700 text-white p-2.5 rounded-xl font-semibold focus:outline-none focus:border-cyan-500"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {PRESET_ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setTempRole(role)}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border transition ${
                        tempRole === role
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Badge Accent Color</label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setTempColor(c.hex)}
                      className={`w-7 h-7 rounded-xl transition-transform flex items-center justify-center ${
                        tempColor === c.hex ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {tempColor === c.hex && <Check className="w-4 h-4 text-slate-950 font-extrabold" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!tempName.trim()}
                className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save Name Tag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

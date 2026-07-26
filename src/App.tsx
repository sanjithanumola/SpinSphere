import React, { useState, useEffect, useRef } from 'react';
import { Wheel, WheelOption, SpinRecord, DecisionMode, ExtraTool, UserNameTag } from './types';
import { PRESET_WHEELS } from './data/presets';
import {
  loadSavedWheels,
  saveWheels,
  loadActiveWheelId,
  saveActiveWheelId,
  loadSpinHistory,
  addSpinRecord,
  saveSpinHistory,
} from './utils/storage';
import { encodeWheelToUrl, decodeWheelFromUrl, exportWheelAsImage } from './utils/share';
import { sound } from './utils/sound';

import { ParticleBackground } from './components/ParticleBackground';
import { Navbar } from './components/Navbar';
import { SpinWheel } from './components/SpinWheel';
import { WheelEditor } from './components/WheelEditor';
import { DecisionModesView } from './components/DecisionModesView';
import { ExtraToolsView } from './components/ExtraToolsView';
import { DashboardView } from './components/DashboardView';
import { WinnerModal } from './components/WinnerModal';
import { AISuggestModal } from './components/AISuggestModal';

export default function App() {
  const [wheels, setWheels] = useState<Wheel[]>([]);
  const [activeWheelId, setActiveWheelId] = useState<string>('');
  const [spinHistory, setSpinHistory] = useState<SpinRecord[]>([]);
  const [activeTool, setActiveTool] = useState<ExtraTool>('wheel');
  const [currentMode, setCurrentMode] = useState<DecisionMode>('classic');
  const [activeNameTag, setActiveNameTag] = useState<UserNameTag>({
    name: 'Spinner Host',
    role: 'Decision Maker',
    color: '#06b6d4',
  });

  const [winnerModalOption, setWinnerModalOption] = useState<WheelOption | null>(null);
  const [isAISuggestOpen, setIsAISuggestOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize state on mount
  useEffect(() => {
    // Check if shared wheel URL exists
    const sharedWheel = decodeWheelFromUrl();
    let initialWheels = loadSavedWheels();

    if (sharedWheel) {
      // Add shared wheel if not existing
      initialWheels = [sharedWheel, ...initialWheels];
      saveWheels(initialWheels);
      setActiveWheelId(sharedWheel.id);
      saveActiveWheelId(sharedWheel.id);
    } else {
      const savedActiveId = loadActiveWheelId();
      setActiveWheelId(savedActiveId);
    }

    setWheels(initialWheels);
    setSpinHistory(loadSpinHistory());
  }, []);

  const activeWheel =
    wheels.find((w) => w.id === activeWheelId) || wheels[0] || PRESET_WHEELS[0];

  // Update wheel handler
  const handleUpdateWheel = (updated: Wheel) => {
    const updatedWheels = wheels.map((w) => (w.id === updated.id ? updated : w));
    setWheels(updatedWheels);
    saveWheels(updatedWheels);
  };

  // Select wheel handler
  const handleSelectWheel = (id: string) => {
    setActiveWheelId(id);
    saveActiveWheelId(id);
    sound.playButtonClick();
  };

  // Create new blank wheel
  const handleCreateWheel = () => {
    const newWheel: Wheel = {
      id: 'wheel-' + Date.now(),
      title: 'New Custom Wheel',
      description: 'Created with SpinSphere',
      themeId: 'cyberpunk',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isFavorite: false,
      options: [
        { id: '1', label: 'Option 1', weight: 1, color: '#06b6d4' },
        { id: '2', label: 'Option 2', weight: 1, color: '#8b5cf6' },
        { id: '3', label: 'Option 3', weight: 1, color: '#ec4899' },
        { id: '4', label: 'Option 4', weight: 1, color: '#f59e0b' },
      ],
    };

    const updated = [newWheel, ...wheels];
    setWheels(updated);
    saveWheels(updated);
    setActiveWheelId(newWheel.id);
    saveActiveWheelId(newWheel.id);
    sound.playButtonClick();
  };

  // Delete wheel
  const handleDeleteWheel = (id: string) => {
    if (wheels.length <= 1) {
      alert('You must keep at least one saved wheel.');
      return;
    }
    const filtered = wheels.filter((w) => w.id !== id);
    setWheels(filtered);
    saveWheels(filtered);
    if (activeWheelId === id) {
      setActiveWheelId(filtered[0].id);
      saveActiveWheelId(filtered[0].id);
    }
    sound.playButtonClick();
  };

  // Duplicate wheel
  const handleDuplicateWheel = (wheel: Wheel) => {
    const copy: Wheel = {
      ...wheel,
      id: 'wheel-' + Date.now(),
      title: `${wheel.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [copy, ...wheels];
    setWheels(updated);
    saveWheels(updated);
    setActiveWheelId(copy.id);
    saveActiveWheelId(copy.id);
    sound.playButtonClick();
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    const updated = wheels.map((w) =>
      w.id === id ? { ...w, isFavorite: !w.isFavorite } : w
    );
    setWheels(updated);
    saveWheels(updated);
  };

  // Handle spin finish
  const handleSpinEnd = (winner: WheelOption) => {
    // Create history record
    const record: SpinRecord = {
      id: 'rec-' + Date.now(),
      wheelId: activeWheel.id,
      wheelTitle: activeWheel.title,
      winnerOptionId: winner.id,
      winnerLabel: winner.label,
      winnerColor: winner.color,
      timestamp: Date.now(),
      mode: currentMode,
      spinnerNameTag: activeNameTag.name,
    };

    const updatedHistory = addSpinRecord(record);
    setSpinHistory(updatedHistory);

    // If elimination mode, mark item as eliminated
    if (currentMode === 'elimination') {
      const updatedOpts = activeWheel.options.map((o) =>
        o.id === winner.id ? { ...o, eliminated: true } : o
      );
      handleUpdateWheel({ ...activeWheel, options: updatedOpts });
    }

    setWinnerModalOption(winner);
  };

  // Reset elimination state
  const handleResetElimination = () => {
    const updatedOpts = activeWheel.options.map((o) => ({ ...o, eliminated: false }));
    handleUpdateWheel({ ...activeWheel, options: updatedOpts });
    sound.playButtonClick();
  };

  // Remove winner from wheel
  const handleRemoveWinner = (optionId: string) => {
    const updatedOpts = activeWheel.options.filter((o) => o.id !== optionId);
    if (updatedOpts.length >= 2) {
      handleUpdateWheel({ ...activeWheel, options: updatedOpts });
    } else {
      alert('A wheel requires at least 2 options.');
    }
  };

  // Share URL
  const handleShareWheel = () => {
    const shareUrl = encodeWheelToUrl(activeWheel);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  // Export PNG Image
  const handleExportImage = () => {
    if (canvasRef.current) {
      exportWheelAsImage(canvasRef.current, activeWheel.title);
    }
  };

  // Apply AI Generated Options
  const handleApplyAIOptions = (aiOptions: WheelOption[]) => {
    handleUpdateWheel({
      ...activeWheel,
      options: aiOptions,
      updatedAt: Date.now(),
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-x-hidden flex flex-col">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Top Navbar */}
      <Navbar
        wheels={wheels}
        activeWheel={activeWheel}
        onSelectWheel={handleSelectWheel}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        onShareWheel={handleShareWheel}
        onExportImage={handleExportImage}
        onNameTagChange={setActiveNameTag}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 z-10 space-y-6">
        {activeTool === 'wheel' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left/Center: Interactive Wheel Stage */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl relative min-h-[520px]">
              <SpinWheel
                options={activeWheel.options}
                themeId={activeWheel.themeId}
                onSpinEnd={handleSpinEnd}
                isSpinning={isSpinning}
                setIsSpinning={setIsSpinning}
                canvasRefOut={canvasRef}
                activeNameTag={activeNameTag}
              />
            </div>

            {/* Right: Smart Option Editor */}
            <div className="lg:col-span-5">
              <WheelEditor
                wheel={activeWheel}
                onUpdateWheel={handleUpdateWheel}
                onOpenAISuggest={() => setIsAISuggestOpen(true)}
              />
            </div>

            {/* Bottom: Decision Modes Toolbar */}
            <div className="lg:col-span-12">
              <DecisionModesView
                wheel={activeWheel}
                currentMode={currentMode}
                onChangeMode={setCurrentMode}
                onResetElimination={handleResetElimination}
                onUpdateWheel={handleUpdateWheel}
              />
            </div>
          </div>
        )}

        {/* EXTRA DECISION TOOLS VIEW */}
        {['coin', 'dice', 'number', 'namepicker', 'teamgen'].includes(activeTool) && (
          <ExtraToolsView />
        )}

        {/* DASHBOARD VIEW */}
        {activeTool === 'dashboard' && (
          <DashboardView
            wheels={wheels}
            activeWheelId={activeWheelId}
            spinHistory={spinHistory}
            onSelectWheel={handleSelectWheel}
            onCreateWheel={handleCreateWheel}
            onDeleteWheel={handleDeleteWheel}
            onDuplicateWheel={handleDuplicateWheel}
            onToggleFavorite={handleToggleFavorite}
            onClearHistory={() => {
              setSpinHistory([]);
              saveSpinHistory([]);
            }}
            activeWheel={activeWheel}
          />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="py-4 border-t border-slate-900 z-10 text-center text-xs text-slate-500">
        SpinSphere • Interactive Decision Maker & Analytics Engine
      </footer>

      {/* Modals */}
      <WinnerModal
        winner={winnerModalOption}
        mode={currentMode}
        onClose={() => setWinnerModalOption(null)}
        onSpinAgain={() => {
          setWinnerModalOption(null);
          // Spin trigger
        }}
        onRemoveWinner={handleRemoveWinner}
      />

      <AISuggestModal
        isOpen={isAISuggestOpen}
        onClose={() => setIsAISuggestOpen(false)}
        onApplyOptions={handleApplyAIOptions}
      />
    </div>
  );
}

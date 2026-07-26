import React, { useState } from 'react';
import { Wheel, DecisionMode, WheelOption } from '../types';
import {
  RotateCcw,
  Swords,
  Trophy,
  Users,
  GraduationCap,
  Sparkles,
  Shuffle,
  CheckCircle2,
  ListOrdered,
  Layers,
} from 'lucide-react';

interface DecisionModesViewProps {
  wheel: Wheel;
  currentMode: DecisionMode;
  onChangeMode: (mode: DecisionMode) => void;
  onResetElimination: () => void;
  onUpdateWheel: (updated: Wheel) => void;
}

export const DecisionModesView: React.FC<DecisionModesViewProps> = ({
  wheel,
  currentMode,
  onChangeMode,
  onResetElimination,
  onUpdateWheel,
}) => {
  const [teamCount, setTeamCount] = useState<number>(2);
  const [generatedTeams, setGeneratedTeams] = useState<
    { name: string; members: WheelOption[] }[]
  >([]);
  const [tournamentMatches, setTournamentMatches] = useState<
    { id: string; a: WheelOption; b: WheelOption; winner?: WheelOption }[]
  >([]);
  const [tournamentChampion, setTournamentChampion] = useState<WheelOption | null>(null);

  const activeOptions = wheel.options.filter((o) => !o.eliminated);
  const eliminatedOptions = wheel.options.filter((o) => o.eliminated);

  // Generate Teams
  const handleGenerateTeams = () => {
    const shuffled = [...activeOptions].sort(() => Math.random() - 0.5);
    const teams: { name: string; members: WheelOption[] }[] = Array.from({ length: teamCount }).map(
      (_, i) => ({
        name: `Team ${String.fromCharCode(65 + i)}`,
        members: [],
      })
    );

    shuffled.forEach((opt, idx) => {
      teams[idx % teamCount].members.push(opt);
    });

    setGeneratedTeams(teams);
  };

  // Setup Tournament Bracket
  const handleStartTournament = () => {
    if (activeOptions.length < 2) {
      alert('At least 2 non-eliminated options required for Tournament.');
      return;
    }
    const shuffled = [...activeOptions].sort(() => Math.random() - 0.5);
    const matches = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        matches.push({
          id: `match-${i}`,
          a: shuffled[i],
          b: shuffled[i + 1],
        });
      }
    }
    setTournamentMatches(matches);
    setTournamentChampion(null);
  };

  const handlePickMatchWinner = (matchId: string, winner: WheelOption) => {
    const updatedMatches = tournamentMatches.map((m) =>
      m.id === matchId ? { ...m, winner } : m
    );
    setTournamentMatches(updatedMatches);

    // If all matches finished, advance round
    const winners = updatedMatches.map((m) => m.winner).filter(Boolean) as WheelOption[];
    if (updatedMatches.length > 0 && winners.length === updatedMatches.length) {
      if (winners.length === 1) {
        setTournamentChampion(winners[0]);
      } else {
        // Next round
        const nextMatches = [];
        for (let i = 0; i < winners.length; i += 2) {
          if (i + 1 < winners.length) {
            nextMatches.push({
              id: `match-r2-${i}`,
              a: winners[i],
              b: winners[i + 1],
            });
          }
        }
        setTournamentMatches(nextMatches);
      }
    }
  };

  const modeTabs: { id: DecisionMode; label: string; icon: any; desc: string }[] = [
    {
      id: 'classic',
      label: 'Classic Wheel',
      icon: Layers,
      desc: 'Standard probability spin to pick 1 winner',
    },
    {
      id: 'elimination',
      label: 'Elimination',
      icon: ListOrdered,
      desc: 'Removes selected item after each spin until 1 remains',
    },
    {
      id: 'tournament',
      label: 'Tournament',
      icon: Swords,
      desc: 'Head-to-head 1v1 bracket knockout matches',
    },
    {
      id: 'luckydraw',
      label: 'Lucky Draw',
      icon: Trophy,
      desc: 'Multi-winner podium draw sequence',
    },
    {
      id: 'team',
      label: 'Team Selector',
      icon: Users,
      desc: 'Partition wheel options into equal teams',
    },
    {
      id: 'classroom',
      label: 'Classroom',
      icon: GraduationCap,
      desc: 'Fair student caller with callout tracker',
    },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl flex flex-col gap-5">
      {/* Mode Selector Switcher */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {modeTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeMode(tab.id)}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-left ${
                isActive
                  ? 'bg-gradient-to-b from-cyan-950 to-slate-900 border-cyan-500 ring-1 ring-cyan-500/50 text-white'
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span className="text-xs font-bold truncate w-full text-center">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mode Specific Controls & Display */}
      {currentMode === 'elimination' && (
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-cyan-400" />
              Elimination Mode Status
            </h3>
            {eliminatedOptions.length > 0 && (
              <button
                onClick={onResetElimination}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-lg transition flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restore All Items
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-slate-400">Remaining in Wheel:</span>
              <p className="text-lg font-bold text-emerald-400">{activeOptions.length} items</p>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-slate-400">Eliminated Items:</span>
              <p className="text-lg font-bold text-rose-400">{eliminatedOptions.length} items</p>
            </div>
          </div>

          {eliminatedOptions.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs text-slate-400">Elimination Order:</span>
              <div className="flex flex-wrap gap-1.5">
                {eliminatedOptions.map((opt, i) => (
                  <span
                    key={opt.id}
                    className="px-2.5 py-1 bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs rounded-md line-through"
                  >
                    #{i + 1} {opt.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {currentMode === 'tournament' && (
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Swords className="w-4 h-4 text-purple-400" />
              Tournament Knockout Bracket
            </h3>
            <button
              onClick={handleStartTournament}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1"
            >
              <Shuffle className="w-3.5 h-3.5" /> Start Tournament
            </button>
          </div>

          {tournamentChampion ? (
            <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-xl text-center space-y-2">
              <Trophy className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
              <h4 className="text-lg font-bold text-amber-300">
                ULTIMATE TOURNAMENT CHAMPION: {tournamentChampion.label}
              </h4>
            </div>
          ) : tournamentMatches.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tournamentMatches.map((m, i) => (
                <div
                  key={m.id}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs"
                >
                  <span className="text-slate-400 font-semibold">Match #{i + 1}</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handlePickMatchWinner(m.id, m.a)}
                      className={`p-2 rounded-lg border text-center font-bold transition ${
                        m.winner?.id === m.a.id
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-200 hover:border-cyan-500'
                      }`}
                    >
                      {m.a.label}
                    </button>
                    <button
                      onClick={() => handlePickMatchWinner(m.id, m.b)}
                      className={`p-2 rounded-lg border text-center font-bold transition ${
                        m.winner?.id === m.b.id
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-200 hover:border-cyan-500'
                      }`}
                    >
                      {m.b.label}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Click "Start Tournament" to generate 1v1 bracket matchups from your wheel options.
            </p>
          )}
        </div>
      )}

      {currentMode === 'team' && (
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300 font-semibold">Number of Teams:</span>
            <select
              value={teamCount}
              onChange={(e) => setTeamCount(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-white font-bold text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              {[2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} Teams
                </option>
              ))}
            </select>
            <button
              onClick={handleGenerateTeams}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition"
            >
              Generate Random Teams
            </button>
          </div>

          {generatedTeams.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {generatedTeams.map((team) => (
                <div key={team.name} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-cyan-400 border-b border-slate-800 pb-1">
                    {team.name} ({team.members.length})
                  </h4>
                  <ul className="space-y-1">
                    {team.members.map((m) => (
                      <li key={m.id} className="text-xs text-slate-300 flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: m.color }}
                        />
                        {m.label}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {currentMode === 'classroom' && (
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              Classroom Random Student Picker
            </h3>
            <span className="text-xs text-slate-400">
              {activeOptions.length} Students Active
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Spin the wheel to call out students fairly. Selected students can be automatically marked as called.
          </p>
        </div>
      )}
    </div>
  );
};

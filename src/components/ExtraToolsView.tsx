import React, { useState } from 'react';
import { sound } from '../utils/sound';
import {
  CircleDollarSign,
  Dices,
  Hash,
  Sparkles,
  Users,
  RotateCcw,
  Volume2,
  Copy,
  Check,
  Zap,
} from 'lucide-react';

export const ExtraToolsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'coin' | 'dice' | 'number' | 'namepicker' | 'teamgen'>('coin');

  // Coin Flip State
  const [headsLabel, setHeadsLabel] = useState('HEADS');
  const [tailsLabel, setTailsLabel] = useState('TAILS');
  const [coinResult, setCoinResult] = useState<'HEADS' | 'TAILS' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinHistory, setCoinHistory] = useState<string[]>([]);

  // Dice Roller State
  const [diceType, setDiceType] = useState<4 | 6 | 10 | 20>(6);
  const [diceCount, setDiceCount] = useState<number>(2);
  const [diceResults, setDiceResults] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);

  // Random Number State
  const [minNum, setMinNum] = useState(1);
  const [maxNum, setMaxNum] = useState(100);
  const [numQuantity, setNumQuantity] = useState(1);
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);

  // Random Name Picker State
  const [namesText, setNamesText] = useState('Alex\nSarah\nJordan\nTaylor\nMorgan\nChris');
  const [pickedName, setPickedName] = useState<string | null>(null);
  const [isPickingName, setIsPickingName] = useState(false);

  // Coin Flip Trigger
  const handleFlipCoin = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    sound.playCoinFlip();

    setTimeout(() => {
      const outcome = Math.random() > 0.5 ? 'HEADS' : 'TAILS';
      setCoinResult(outcome);
      setCoinHistory((prev) => [outcome === 'HEADS' ? headsLabel : tailsLabel, ...prev]);
      setIsFlipping(false);
      sound.playWinFanfare();
    }, 1200);
  };

  // Roll Dice Trigger
  const handleRollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    sound.playDiceRoll();

    setTimeout(() => {
      const results = Array.from({ length: diceCount }).map(
        () => Math.floor(Math.random() * diceType) + 1
      );
      setDiceResults(results);
      setIsRolling(false);
      sound.playWinFanfare();
    }, 800);
  };

  // Generate Numbers Trigger
  const handleGenerateNumbers = () => {
    sound.playButtonClick();
    if (minNum >= maxNum) {
      alert('Max number must be greater than Min number.');
      return;
    }

    if (!allowDuplicates && numQuantity > maxNum - minNum + 1) {
      alert('Range is too small for unique numbers without duplicates.');
      return;
    }

    const results: number[] = [];
    if (!allowDuplicates) {
      const pool = Array.from({ length: maxNum - minNum + 1 }, (_, i) => minNum + i);
      pool.sort(() => Math.random() - 0.5);
      results.push(...pool.slice(0, numQuantity));
    } else {
      for (let i = 0; i < numQuantity; i++) {
        results.push(Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum);
      }
    }
    setGeneratedNumbers(results);
    sound.playWinFanfare();
  };

  // Pick Name Trigger
  const handlePickName = () => {
    const list = namesText
      .split('\n')
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (list.length < 2) {
      alert('Please enter at least 2 names.');
      return;
    }

    setIsPickingName(true);
    sound.playDiceRoll();

    let count = 0;
    const interval = setInterval(() => {
      const temp = list[Math.floor(Math.random() * list.length)];
      setPickedName(temp);
      count++;
      if (count > 15) {
        clearInterval(interval);
        const finalWinner = list[Math.floor(Math.random() * list.length)];
        setPickedName(finalWinner);
        setIsPickingName(false);
        sound.playWinFanfare();
      }
    }, 80);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl flex flex-col gap-6">
      {/* Tool Navigation Switcher */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          onClick={() => setActiveTab('coin')}
          className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition ${
            activeTab === 'coin'
              ? 'bg-cyan-950 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/50'
              : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <CircleDollarSign className="w-4 h-4" /> 3D Coin Flip
        </button>

        <button
          onClick={() => setActiveTab('dice')}
          className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition ${
            activeTab === 'dice'
              ? 'bg-purple-950 border-purple-500 text-purple-300 ring-1 ring-purple-500/50'
              : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <Dices className="w-4 h-4" /> Dice Roller
        </button>

        <button
          onClick={() => setActiveTab('number')}
          className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition ${
            activeTab === 'number'
              ? 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/50'
              : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <Hash className="w-4 h-4" /> Number Generator
        </button>

        <button
          onClick={() => setActiveTab('namepicker')}
          className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition ${
            activeTab === 'namepicker'
              ? 'bg-rose-950 border-rose-500 text-rose-300 ring-1 ring-rose-500/50'
              : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Raffle Name Picker
        </button>
      </div>

      {/* COIN FLIP TOOL */}
      {activeTab === 'coin' && (
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="flex items-center gap-3 w-full max-w-sm">
            <input
              type="text"
              value={headsLabel}
              onChange={(e) => setHeadsLabel(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 font-bold text-center py-1.5 rounded-lg text-xs"
            />
            <span className="text-slate-500 text-xs font-bold">VS</span>
            <input
              type="text"
              value={tailsLabel}
              onChange={(e) => setTailsLabel(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 font-bold text-center py-1.5 rounded-lg text-xs"
            />
          </div>

          {/* 3D Coin Visual */}
          <div
            onClick={handleFlipCoin}
            className={`w-36 h-36 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 p-1 cursor-pointer shadow-2xl transition-transform duration-700 flex items-center justify-center ${
              isFlipping ? 'animate-spin scale-110' : 'hover:scale-105 active:scale-95'
            }`}
          >
            <div className="w-full h-full rounded-full bg-slate-950 border-4 border-amber-400/80 flex flex-col items-center justify-center text-center p-2">
              <CircleDollarSign className="w-8 h-8 text-amber-400 mb-1" />
              <span className="text-sm font-black text-amber-200 uppercase tracking-wider">
                {coinResult ? (coinResult === 'HEADS' ? headsLabel : tailsLabel) : 'FLIP COIN'}
              </span>
            </div>
          </div>

          <button
            onClick={handleFlipCoin}
            disabled={isFlipping}
            className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-sm rounded-full shadow-lg transition"
          >
            {isFlipping ? 'Flipping...' : 'FLIP COIN NOW'}
          </button>

          {coinHistory.length > 0 && (
            <div className="w-full max-w-md pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400 font-semibold">Flip History:</span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {coinHistory.slice(0, 10).map((res, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-amber-300 font-medium rounded-md"
                  >
                    {res}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* DICE ROLLER TOOL */}
      {activeTab === 'dice' && (
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-2">
              <span>Dice Type:</span>
              <select
                value={diceType}
                onChange={(e) => setDiceType(Number(e.target.value) as any)}
                className="bg-slate-800 border border-slate-700 text-white font-bold rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value={4}>d4 (4-sided)</option>
                <option value={6}>d6 (Standard)</option>
                <option value={10}>d10 (10-sided)</option>
                <option value={20}>d20 (20-sided)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span>Quantity:</span>
              <select
                value={diceCount}
                onChange={(e) => setDiceCount(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 text-white font-bold rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} Dice
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dice Display */}
          <div className="flex flex-wrap justify-center gap-4 min-h-[100px] items-center">
            {diceResults.length > 0 ? (
              diceResults.map((val, i) => (
                <div
                  key={i}
                  className={`w-20 h-20 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl border-2 border-purple-300/80 flex flex-col items-center justify-center text-3xl font-black text-white shadow-xl ${
                    isRolling ? 'animate-bounce' : ''
                  }`}
                >
                  {val}
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-xs italic">Click Roll Dice to start!</div>
            )}
          </div>

          {diceResults.length > 0 && (
            <div className="text-lg font-bold text-purple-300">
              Total Sum: {diceResults.reduce((a, b) => a + b, 0)}
            </div>
          )}

          <button
            onClick={handleRollDice}
            disabled={isRolling}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-full shadow-lg transition"
          >
            {isRolling ? 'Rolling...' : 'ROLL DICE NOW'}
          </button>
        </div>
      )}

      {/* RANDOM NUMBER TOOL */}
      {activeTab === 'number' && (
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-md text-xs font-semibold text-slate-300">
            <div>
              <label>Min Value:</label>
              <input
                type="number"
                value={minNum}
                onChange={(e) => setMinNum(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 text-white font-bold p-2 rounded-lg mt-1"
              />
            </div>
            <div>
              <label>Max Value:</label>
              <input
                type="number"
                value={maxNum}
                onChange={(e) => setMaxNum(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 text-white font-bold p-2 rounded-lg mt-1"
              />
            </div>
            <div>
              <label>Count:</label>
              <input
                type="number"
                min={1}
                max={50}
                value={numQuantity}
                onChange={(e) => setNumQuantity(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 text-white font-bold p-2 rounded-lg mt-1"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={allowDuplicates}
              onChange={(e) => setAllowDuplicates(e.target.checked)}
              className="accent-emerald-500"
            />
            Allow Duplicate Numbers
          </label>

          <button
            onClick={handleGenerateNumbers}
            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm rounded-full shadow-lg transition"
          >
            GENERATE RANDOM NUMBERS
          </button>

          {generatedNumbers.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2.5 max-w-md pt-2">
              {generatedNumbers.map((num, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-lg font-black rounded-xl shadow-md"
                >
                  {num}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RAFFLE NAME PICKER */}
      {activeTab === 'namepicker' && (
        <div className="flex flex-col items-center gap-5 py-2">
          <div className="w-full max-w-md space-y-1.5">
            <label className="text-xs text-slate-400 font-semibold">Enter Names (one per line):</label>
            <textarea
              value={namesText}
              onChange={(e) => setNamesText(e.target.value)}
              rows={5}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs p-3 rounded-xl focus:outline-none focus:border-rose-500"
            />
          </div>

          <button
            onClick={handlePickName}
            disabled={isPickingName}
            className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-extrabold text-sm rounded-full shadow-lg transition"
          >
            {isPickingName ? 'Shuffling Names...' : 'PICK A RANDOM NAME'}
          </button>

          {pickedName && (
            <div className="p-4 bg-slate-950 border border-rose-500/40 rounded-2xl text-center space-y-1 w-full max-w-md animate-scale-up">
              <span className="text-xs text-rose-400 font-bold uppercase tracking-wider">
                WINNER ANNOUNCEMENT
              </span>
              <h3 className="text-2xl font-black text-white">{pickedName}</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

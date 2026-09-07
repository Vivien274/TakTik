import React from 'react';
import type { GameState } from '../game/types';
import { RotateCcw, BookOpen, Layers, History, Home } from 'lucide-react';

interface GameHeaderProps {
  state: GameState;
  onResetMode: () => void;
  onRestartMatch: () => void;
  onToggleRules: () => void;
  onToggleHistory: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  state,
  onResetMode,
  onRestartMatch,
  onToggleRules,
  onToggleHistory,
}) => {
  return (
    <header className="w-full flex items-center justify-between px-4 py-3 glass-panel border-b border-slate-800/80 sticky top-0 z-30">
      {/* Brand & Mode info */}
      <div className="flex items-center gap-3">
        <button
          onClick={onResetMode}
          title="Return to Mode Selection"
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Modes</span>
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-black font-display text-white tracking-wide flex items-center gap-2">
            TAKTIK
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
              {state.mode === 'PURE_DUEL' ? 'Pure Duel' : 'Two-Handed Classic'}
            </span>
          </h1>
        </div>
      </div>

      {/* Center Stats (Round, Deck) */}
      <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-300">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-slate-500">Round</span>
          <strong className="text-white font-mono">{state.roundNumber}</strong>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500">Deck:</span>
          <strong className="text-white font-mono">{state.deck.length}</strong>
          <span className="text-slate-500 ml-1">Discard:</span>
          <strong className="text-white font-mono">{state.discardPile.length}</strong>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleHistory}
          title="Move History"
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <History className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleRules}
          title="Rules & Cards Guide"
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Rules</span>
        </button>

        <button
          onClick={onRestartMatch}
          title="Restart Game"
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-transparent hover:border-rose-700/50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

import React from 'react';
import { Swords, Users, Shield, Zap, Sparkles, Trophy, ArrowRight } from 'lucide-react';
import type { GameMode } from '../game/types';

interface ModeSelectionProps {
  onSelectMode: (mode: GameMode) => void;
}

export const ModeSelection: React.FC<ModeSelectionProps> = ({ onSelectMode }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-2/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 text-center max-w-2xl mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-cyan-300 mb-4 backdrop-blur-md shadow-lg shadow-cyan-950/20">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>TAKTIK / JAQUAROO CUSTOM ENGINE</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight text-white mb-4 drop-shadow-sm">
          Select Game Mode
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Master the board using standard 52-card Taktik mechanics: split moves, backwards leaps, Jack swaps, and precise home entries.
        </p>
      </div>

      {/* Mode Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl w-full">
        {/* Mode 1: Pure Duel */}
        <div 
          onClick={() => onSelectMode('PURE_DUEL')}
          className="group relative rounded-3xl p-6 sm:p-8 glass-panel border border-slate-800/80 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1"
        >
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner group-hover:scale-105 transition-transform">
                <Swords className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                1 vs 1 Condensed
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mb-3 group-hover:text-cyan-300 transition-colors">
              Mode 1: Pure Duel
            </h2>

            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              Fast-paced head-to-head match on a custom 32-space condensed circular track. 2 players, 4 tokens each, with 6 cards dealt per round.
            </p>

            <div className="space-y-2.5 mb-8">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-cyan-400">
                  <Zap className="w-3 h-3" />
                </div>
                <span>32-Node Circular Track (16 spaces per side)</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-rose-400">
                  <Shield className="w-3 h-3" />
                </div>
                <span>Player 1 (Blue) vs. Player 2 (Red)</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-amber-400">
                  <Trophy className="w-3 h-3" />
                </div>
                <span>First to lock all 4 tokens in Home wins</span>
              </div>
            </div>
          </div>

          <button className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 group-hover:from-cyan-400 group-hover:to-blue-500 transition-all">
            <span>Launch Pure Duel</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Mode 2: Two-Handed Classic */}
        <div 
          onClick={() => onSelectMode('TWO_HANDED_CLASSIC')}
          className="group relative rounded-3xl p-6 sm:p-8 glass-panel border border-slate-800/80 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1"
        >
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-105 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                4 Seats • 2 Humans
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mb-3 group-hover:text-emerald-300 transition-colors">
              Mode 2: Two-Handed Classic
            </h2>

            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              The classic 64-space track where 2 human players control 2 seats each. Full partnership dynamics including card swapping and teammate assistance.
            </p>

            <div className="space-y-2.5 mb-8">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-cyan-400">
                  <span className="font-bold text-[10px]">H1</span>
                </div>
                <span>Human 1 (Team A): Seat North (Blue) & Seat South (Green)</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-rose-400">
                  <span className="font-bold text-[10px]">H2</span>
                </div>
                <span>Human 2 (Team B): Seat West (Yellow) & Seat East (Red)</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-3 h-3" />
                </div>
                <span>Round-start card swap & partner assistance when finished</span>
              </div>
            </div>
          </div>

          <button className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 group-hover:from-emerald-400 group-hover:to-teal-500 transition-all">
            <span>Launch Two-Handed Classic</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Footer / Quick rule badges */}
      <div className="relative z-10 mt-12 flex flex-wrap items-center justify-center gap-3 max-w-4xl text-xs text-slate-400">
        <span className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
          Ace & King: Exit Base
        </span>
        <span className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
          Card 4: Backward 4
        </span>
        <span className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
          Jack: Swap Any 2 Track Tokens
        </span>
        <span className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
          Card 7: Split 7 Steps
        </span>
        <span className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
          Exact-Count Home Entry
        </span>
      </div>
    </div>
  );
};

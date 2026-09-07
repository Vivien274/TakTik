import React from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, RotateCcw, Home } from 'lucide-react';
import type { GameMode, SeatConfig } from '../game/types';

interface VictoryModalProps {
  winner: string;
  winningSeats: string[];
  mode: GameMode;
  roundNumber: number;
  seats: SeatConfig[];
  onPlayAgain: () => void;
  onChooseMode: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winner,
  roundNumber,
  onPlayAgain,
  onChooseMode,
}) => {
  React.useEffect(() => {
    // Confetti
    const duration = 3.5 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-amber-500/40 shadow-2xl text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-5 shadow-lg shadow-amber-500/20 animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VICTOIRE ÉCLATANTE</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-display text-white mb-2">
            {winner}
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm mb-6 leading-relaxed">
            Tous les pions sont sécurisés dans la Maison après <strong>{roundNumber}</strong> manches épiques !
          </p>

          <div className="grid grid-cols-2 gap-3 w-full pt-4 border-t border-slate-800">
            <button
              onClick={onPlayAgain}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/25 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Revanche</span>
            </button>

            <button
              onClick={onChooseMode}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Menu Principal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

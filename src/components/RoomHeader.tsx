import React, { useState } from 'react';
import {
  Copy,
  Check,
  BookOpen,
  History,
  RotateCcw,
  LogOut,
  Clock,
} from 'lucide-react';
import type { GameState } from '../game/types';
import type { ConnectionStatus, PlayerRole } from '../multiplayer/types';

interface RoomHeaderProps {
  state: GameState;
  roomCode: string | null;
  connectionStatus: ConnectionStatus;
  localPlayerRole: PlayerRole | null; // null si partie locale
  isLocalGame: boolean;
  onLeaveRoom: () => void;
  onRestartMatch: () => void;
  onToggleRules: () => void;
  onToggleHistory: () => void;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({
  state,
  roomCode,
  connectionStatus,
  localPlayerRole,
  isLocalGame,
  onLeaveRoom,
  onRestartMatch,
  onToggleRules,
  onToggleHistory,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeSeatConfig = state.seats.find(s => s.id === state.activeSeat);
  const isMyTurn = isLocalGame || (localPlayerRole && activeSeatConfig?.humanPlayer === localPlayerRole);

  return (
    <header className="w-full flex items-center justify-between px-2.5 sm:px-4 py-1.5 sm:py-2 glass-panel border-b border-slate-800/80 sticky top-0 z-30 select-none h-12 sm:h-13">
      {/* Left: Quit button + Logo + Room Code */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        <button
          onClick={onLeaveRoom}
          title="Quitter la partie"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>

        <span className="font-black font-display text-white tracking-wide text-xs sm:text-sm flex items-center gap-1.5">
          TAKTIK
          {!isLocalGame && (
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                connectionStatus === 'CONNECTED'
                  ? 'bg-emerald-400'
                  : 'bg-amber-400 animate-pulse'
              }`}
              title={connectionStatus === 'CONNECTED' ? 'En ligne' : 'Connexion...'}
            />
          )}
        </span>

        {/* Room Code Badge (Online only) */}
        {!isLocalGame && roomCode && (
          <button
            onClick={handleCopy}
            title="Cliquez pour copier le code de la salle"
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/50 text-[11px] font-mono transition-colors"
          >
            <span className="text-slate-400 font-sans text-[10px]">#</span>
            <strong className="text-cyan-300 font-bold tracking-wider">{roomCode}</strong>
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
            ) : (
              <Copy className="w-3 h-3 text-slate-500 shrink-0" />
            )}
          </button>
        )}
      </div>

      {/* Center: Essential Turn Status - High Visibility */}
      <div className="flex items-center gap-1.5">
        {isMyTurn ? (
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1 rounded-full bg-emerald-500/25 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)] text-[11px] sm:text-xs font-black tracking-wide animate-pulse">
            <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-400"></span>
            </span>
            <span>★ À VOUS DE JOUER ★</span>
          </div>
        ) : (
          <div
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full border-2 text-[11px] sm:text-xs font-black shadow-md tracking-wide"
            style={{
              borderColor: activeSeatConfig?.hex || '#94a3b8',
              backgroundColor: (activeSeatConfig?.hex || '#94a3b8') + '25',
              color: activeSeatConfig?.hex || '#f8fafc',
            }}
          >
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 animate-pulse" />
            <span>Tour : {activeSeatConfig?.name} (J{activeSeatConfig?.humanPlayer})</span>
          </div>
        )}
      </div>

      {/* Right Controls: Only Essential Icons */}
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleRules}
          title="Guide des règles"
          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleHistory}
          title="Historique des coups"
          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors"
        >
          <History className="w-4 h-4" />
        </button>

        <button
          onClick={onRestartMatch}
          title="Recommencer la partie"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

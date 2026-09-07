import React, { useState } from 'react';
import {
  Copy,
  Check,
  BookOpen,
  History,
  RotateCcw,
  LogOut,
  Sparkles,
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

      {/* Center: Essential Turn Status */}
      <div className="flex items-center gap-1.5 text-xs">
        <div
          className={`flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full border text-[11px] sm:text-xs font-bold transition-all ${
            isMyTurn
              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 animate-pulse'
              : 'bg-slate-900/70 border-slate-800 text-slate-400'
          }`}
        >
          <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
          <span>{isMyTurn ? 'À vous' : activeSeatConfig?.name}</span>
        </div>
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

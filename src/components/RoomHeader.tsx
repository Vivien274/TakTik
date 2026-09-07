import React, { useState } from 'react';
import {
  Copy,
  Check,
  Radio,
  BookOpen,
  History,
  RotateCcw,
  LogOut,
  Layers,
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
    <header className="w-full flex items-center justify-between px-3 sm:px-5 py-2.5 glass-panel border-b border-slate-800/80 sticky top-0 z-30 select-none">
      {/* Brand & Room Info */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onLeaveRoom}
          title="Quitter la partie et revenir au salon"
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-transparent hover:border-rose-700/40 transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Quitter</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-extrabold font-display text-white tracking-wide text-sm sm:text-base">
            TAKTIK
          </span>
          <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
            {state.mode === 'PURE_DUEL' ? 'Pure Duel' : 'Classique'}
          </span>
        </div>

        {/* Room Code Badge (Online only) */}
        {!isLocalGame && roomCode && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 hidden sm:inline">Salle :</span>
            <strong className="font-mono text-cyan-400 font-black tracking-wider">{roomCode}</strong>
            <button
              onClick={handleCopy}
              title="Copier le code de salle"
              className="p-1 hover:text-cyan-300 transition-colors text-slate-400"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Center Status: Local Identity & Turn Notification */}
      <div className="flex items-center gap-2 sm:gap-4 text-xs">
        {!isLocalGame && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-slate-400">Vous êtes :</span>
            <strong className={localPlayerRole === 1 ? 'text-cyan-400' : 'text-rose-400'}>
              Joueur {localPlayerRole} ({localPlayerRole === 1 ? 'Hôte' : 'Invité'})
            </strong>
          </div>
        )}

        {/* Turn Status Pill */}
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-xl border font-semibold ${
            isMyTurn
              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 animate-pulse'
              : 'bg-slate-900/60 border-slate-800 text-slate-400'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isMyTurn ? 'À vous de jouer !' : "Tour de l'adversaire..."}</span>
        </div>

        {/* Connection status indicator (Online only) */}
        {!isLocalGame && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px]">
            <Radio
              className={`w-3.5 h-3.5 ${
                connectionStatus === 'CONNECTED'
                  ? 'text-emerald-400 animate-pulse'
                  : connectionStatus === 'WAITING_FOR_OPPONENT'
                  ? 'text-amber-400 animate-bounce'
                  : 'text-rose-400'
              }`}
            />
            <span className="text-slate-300">
              {connectionStatus === 'CONNECTED'
                ? 'Adversaire connecté'
                : connectionStatus === 'WAITING_FOR_OPPONENT'
                ? 'En attente...'
                : 'Déconnecté'}
            </span>
          </div>
        )}

        {/* Deck and Round Counters */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span>Manche <strong className="text-white font-mono">{state.roundNumber}</strong></span>
          <span>• Pioche <strong className="text-white font-mono">{state.deck.length}</strong></span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onToggleHistory}
          title="Historique des coups"
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <History className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleRules}
          title="Guide des règles et des cartes"
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Règles</span>
        </button>

        <button
          onClick={onRestartMatch}
          title="Recommencer la partie"
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

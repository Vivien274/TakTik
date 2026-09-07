import React, { useState } from 'react';
import {
  Globe,
  Plus,
  LogIn,
  Copy,
  Check,
  Sparkles,
  Users,
  Swords,
  Loader2,
  AlertCircle,
  Gamepad2,
  ArrowRight,
} from 'lucide-react';
import type { GameMode } from '../game/types';
import { normalizeRoomCode } from '../multiplayer/syncClient';

interface LobbyScreenProps {
  onCreateRoom: (mode: GameMode) => void;
  onJoinRoom: (code: string) => void;
  onStartLocalGame: (mode: GameMode) => void;
  waitingRoomCode: string | null;
  selectedMode: GameMode | null;
  isConnecting: boolean;
  errorMessage: string | null;
  onCancelWaiting: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  onCreateRoom,
  onJoinRoom,
  onStartLocalGame,
  waitingRoomCode,
  selectedMode,
  isConnecting,
  errorMessage,
  onCancelWaiting,
}) => {
  const [activeTab, setActiveTab] = useState<'ONLINE_CREATE' | 'ONLINE_JOIN' | 'LOCAL'>('ONLINE_CREATE');
  const [createMode, setCreateMode] = useState<GameMode>('PURE_DUEL');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (waitingRoomCode) {
      navigator.clipboard.writeText(waitingRoomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Si on est dans le salon d'attente de l'hôte (en attente du joueur 2)
  if (waitingRoomCode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Glows */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/30 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-5 shadow-lg shadow-cyan-500/20">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-xs font-bold text-cyan-300 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SALLE EN LIGNE ACTIVE</span>
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white mb-2">
            En attente du Joueur 2
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm mb-6 leading-relaxed">
            Partagez ce code à 6 caractères avec votre adversaire. Dès qu'il rejoint, la partie démarrera automatiquement en{' '}
            <strong className="text-cyan-300">
              {selectedMode === 'PURE_DUEL' ? 'Pure Duel (1v1)' : 'Two-Handed Classic (4 Sièges)'}
            </strong>.
          </p>

          {/* Room Code Display Box */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-700/80 mb-6 flex items-center justify-between gap-3">
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Code de Salle
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-cyan-400">
                {waitingRoomCode}
              </div>
            </div>

            <button
              onClick={handleCopyCode}
              className="py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copié !' : 'Copier'}</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-6">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Vous serez attribué au <strong>Joueur 1 (Hôte)</strong></span>
          </div>

          <button
            onClick={onCancelWaiting}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            Annuler et revenir au menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-2/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Title Banner */}
      <div className="relative z-10 text-center max-w-2xl mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-cyan-300 mb-4 backdrop-blur-md shadow-lg shadow-cyan-950/20">
          <Globe className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>TAKTIK / JAQUAROO MULTIJOUEUR</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight text-white mb-3 drop-shadow-sm">
          Partie en Ligne
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
          Affrontez un adversaire en temps réel. Créez un salon privé, rejoignez avec un code à 6 chiffres, ou jouez en local sur le même écran.
        </p>
      </div>

      {/* Error notification banner */}
      {errorMessage && (
        <div className="relative z-10 max-w-md w-full mb-6 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 shadow-lg shadow-rose-950/30">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Mode Navigation Tabs */}
      <div className="relative z-10 w-full max-w-xl flex rounded-2xl p-1.5 bg-slate-900/80 border border-slate-800 mb-6 backdrop-blur-md">
        <button
          onClick={() => setActiveTab('ONLINE_CREATE')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'ONLINE_CREATE'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Créer une salle</span>
        </button>

        <button
          onClick={() => setActiveTab('ONLINE_JOIN')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'ONLINE_JOIN'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Rejoindre</span>
        </button>

        <button
          onClick={() => setActiveTab('LOCAL')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'LOCAL'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>Pass & Play</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="relative z-10 w-full max-w-xl glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
        {/* TAB 1: CRÉER UNE SALLE EN LIGNE */}
        {activeTab === 'ONLINE_CREATE' && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                1. Choisissez le mode de jeu :
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Pure Duel Card */}
                <div
                  onClick={() => setCreateMode('PURE_DUEL')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    createMode === 'PURE_DUEL'
                      ? 'bg-cyan-500/15 border-cyan-500 ring-1 ring-cyan-400 shadow-lg shadow-cyan-500/15'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Swords className={`w-5 h-5 ${createMode === 'PURE_DUEL' ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      32 Cases
                    </span>
                  </div>
                  <div className="font-bold text-sm text-white mb-1">Mode 1: Pure Duel</div>
                  <div className="text-[11px] text-slate-400 leading-snug">
                    1v1 condensé, 4 pions chacun, 6 cartes par manche.
                  </div>
                </div>

                {/* Classic Card */}
                <div
                  onClick={() => setCreateMode('TWO_HANDED_CLASSIC')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    createMode === 'TWO_HANDED_CLASSIC'
                      ? 'bg-emerald-500/15 border-emerald-500 ring-1 ring-emerald-400 shadow-lg shadow-emerald-500/15'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Users className={`w-5 h-5 ${createMode === 'TWO_HANDED_CLASSIC' ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      64 Cases
                    </span>
                  </div>
                  <div className="font-bold text-sm text-white mb-1">Mode 2: Classique</div>
                  <div className="text-[11px] text-slate-400 leading-snug">
                    4 sièges contrôlés à 2, échange de cartes et entraide d'équipe.
                  </div>
                </div>
              </div>
            </div>

            <button
              disabled={isConnecting}
              onClick={() => onCreateRoom(createMode)}
              className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Créer la salle & Générer le Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* TAB 2: REJOINDRE UNE SALLE EXISTANTE */}
        {activeTab === 'ONLINE_JOIN' && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Entrez le code de salle (6 caractères) :
              </label>
              <input
                type="text"
                maxLength={6}
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(normalizeRoomCode(e.target.value))}
                placeholder="Ex: TK7824"
                className="w-full py-3.5 px-4 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-center text-2xl font-black font-mono tracking-widest text-cyan-400 uppercase placeholder:text-slate-600 outline-none transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-2 text-center">
                Demandez le code à 6 caractères à l'hôte créateur de la partie.
              </p>
            </div>

            <button
              disabled={joinCodeInput.length < 4 || isConnecting}
              onClick={() => onJoinRoom(joinCodeInput)}
              className={`w-full py-3.5 px-5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                joinCodeInput.length >= 4 && !isConnecting
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Rejoindre le salon</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* TAB 3: PARTIE LOCALE SUR LE MÊME ÉCRAN */}
        {activeTab === 'LOCAL' && (
          <div className="space-y-6">
            <div className="text-xs text-slate-300 leading-relaxed">
              Jouez sur le même écran en mode "Pass & Play" (toutes les mains sont visibles et jouées localement).
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => onStartLocalGame('PURE_DUEL')}
                className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-left transition-all"
              >
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-1">
                  <Swords className="w-4 h-4" />
                  <span>Pure Duel (1v1)</span>
                </div>
                <div className="text-[11px] text-slate-400">Plateau condensé 32 cases</div>
              </button>

              <button
                onClick={() => onStartLocalGame('TWO_HANDED_CLASSIC')}
                className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-left transition-all"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                  <Users className="w-4 h-4" />
                  <span>Classique (4 Sièges)</span>
                </div>
                <div className="text-[11px] text-slate-400">Plateau classique 64 cases</div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer rule highlights */}
      <div className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
        <span className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
          As & Roi : Sortie de Base
        </span>
        <span className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
          Carte 4 : Reculer de 4
        </span>
        <span className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
          Valet : Échange de 2 Pions
        </span>
        <span className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
          Carte 7 : Partager 7 cases
        </span>
      </div>
    </div>
  );
};

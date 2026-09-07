import React from 'react';
import type { GameState, Seat } from '../game/types';
import type { PlayerRole } from '../multiplayer/types';
import { ArrowRightLeft, Sparkles, Check, Clock } from 'lucide-react';

interface CardSwapModalProps {
  state: GameState;
  localPlayerRole?: PlayerRole | null;
  isLocalGame?: boolean;
  onConfirmSwaps: (swaps: Record<Seat, string>) => void;
  onPartialSwapSubmit?: (swaps: Partial<Record<Seat, string>>) => void;
}

export const CardSwapModal: React.FC<CardSwapModalProps> = ({
  state,
  localPlayerRole,
  isLocalGame = true,
  onConfirmSwaps,
  onPartialSwapSubmit,
}) => {
  const [selectedSwaps, setSelectedSwaps] = React.useState<Record<Seat, string>>({
    NORTH: state.cardSwaps.NORTH || '',
    SOUTH: state.cardSwaps.SOUTH || '',
    EAST: state.cardSwaps.EAST || '',
    WEST: state.cardSwaps.WEST || '',
    P1: '',
    P2: '',
  });

  const [hasSubmittedMine, setHasSubmittedMine] = React.useState(false);

  // Synchroniser si des swaps distants arrivent
  React.useEffect(() => {
    setSelectedSwaps(prev => ({
      ...prev,
      ...state.cardSwaps,
    }));
  }, [state.cardSwaps]);

  const handleSelectCard = (seat: Seat, cardId: string) => {
    setSelectedSwaps(prev => ({ ...prev, [seat]: cardId }));
  };

  const isHuman1Ready = Boolean(selectedSwaps.NORTH && selectedSwaps.SOUTH);
  const isHuman2Ready = Boolean(selectedSwaps.EAST && selectedSwaps.WEST);

  const canSubmitLocalRole = isLocalGame
    ? isHuman1Ready && isHuman2Ready
    : localPlayerRole === 1
    ? isHuman1Ready
    : isHuman2Ready;

  const handleSubmit = () => {
    if (isLocalGame) {
      onConfirmSwaps(selectedSwaps);
    } else {
      setHasSubmittedMine(true);
      if (onPartialSwapSubmit) {
        if (localPlayerRole === 1) {
          onPartialSwapSubmit({ NORTH: selectedSwaps.NORTH, SOUTH: selectedSwaps.SOUTH });
        } else {
          onPartialSwapSubmit({ EAST: selectedSwaps.EAST, WEST: selectedSwaps.WEST });
        }
      }
    }
  };

  const renderSeatSwapSelector = (
    seat: Seat,
    label: string,
    colorClass: string,
    partnerLabel: string,
    disabled: boolean
  ) => {
    const cards = state.hands[seat] || [];
    const chosenCardId = selectedSwaps[seat];

    return (
      <div className={`flex flex-col gap-2 p-3.5 rounded-2xl bg-slate-900/70 border ${disabled ? 'border-slate-800/50 opacity-60' : 'border-slate-800'}`}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold ${colorClass}`}>{label}</span>
          <span className="text-[11px] text-slate-400">Transmettre à {partnerLabel}</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {cards.map(card => {
            const isSelected = chosenCardId === card.id;
            return (
              <button
                key={card.id}
                type="button"
                disabled={disabled}
                onClick={() => handleSelectCard(seat, card.id)}
                className={`py-2 px-1 rounded-lg flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold ring-2 ring-cyan-300 scale-105 shadow-md shadow-cyan-500/30'
                    : disabled
                    ? 'bg-slate-900 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <span className={`text-sm leading-none ${isSelected ? 'text-slate-950' : card.isRed ? 'text-rose-400' : 'text-slate-200'}`}>
                  {card.rank}{card.symbol}
                </span>
                <span className="text-[9px] mt-0.5 opacity-70 leading-none">
                  {card.rank === 'A' || card.rank === 'K' ? 'Sortie' : card.rank === 'J' ? 'Valet' : card.rank === '7' ? '7' : card.rank === '4' ? '-4' : `+${card.value}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-3xl glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display text-white">
              Manche {state.roundNumber} : Échange Stratégique de Cartes
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              En mode Classique, chaque coéquipier transmet 1 carte à son partenaire avant le début des hostilités.
            </p>
          </div>
        </div>

        {/* 2 Sections Joueurs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          {/* Équipe A (Humain 1 : Nord & Sud) */}
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-950/60 border border-cyan-500/20">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Joueur 1 (Équipe A)
              </span>
              <span className="text-[11px] text-slate-400">Nord ↔ Sud</span>
            </div>
            {renderSeatSwapSelector(
              'NORTH',
              'Siège Nord (Bleu)',
              'text-cyan-400',
              'Sud',
              !isLocalGame && localPlayerRole !== 1
            )}
            {renderSeatSwapSelector(
              'SOUTH',
              'Siège Sud (Vert)',
              'text-emerald-400',
              'Nord',
              !isLocalGame && localPlayerRole !== 1
            )}
          </div>

          {/* Équipe B (Humain 2 : Est & Ouest) */}
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-950/60 border border-rose-500/20">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Joueur 2 (Équipe B)
              </span>
              <span className="text-[11px] text-slate-400">Est ↔ Ouest</span>
            </div>
            {renderSeatSwapSelector(
              'EAST',
              'Siège Est (Rouge)',
              'text-rose-400',
              'Ouest',
              !isLocalGame && localPlayerRole !== 2
            )}
            {renderSeatSwapSelector(
              'WEST',
              'Siège Ouest (Jaune)',
              'text-amber-400',
              'Est',
              !isLocalGame && localPlayerRole !== 2
            )}
          </div>
        </div>

        {/* Validation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {!isLocalGame && hasSubmittedMine && (
              <span className="flex items-center gap-1.5 text-amber-300">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Vos cartes sont prêtes ! En attente du choix de l'adversaire...</span>
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={!canSubmitLocalRole || hasSubmittedMine}
            onClick={handleSubmit}
            className={`px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
              canSubmitLocalRole && !hasSubmittedMine
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {hasSubmittedMine ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>
              {hasSubmittedMine
                ? 'Cartes transmises'
                : isLocalGame
                ? 'Valider les échanges & Démarrer'
                : 'Valider mes cartes transmises'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

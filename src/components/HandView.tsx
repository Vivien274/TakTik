import React from 'react';
import type { Card, GameMode, MoveOption, Seat, SeatConfig, Token } from '../game/types';
import type { PlayerRole } from '../multiplayer/types';
import { getLegalMovesForCard, hasAnyLegalMove } from '../game/rules';
import { Sparkles, Trash2, ArrowRightLeft, Split, AlertCircle } from 'lucide-react';

interface HandViewProps {
  cards: Card[];
  activeSeat: Seat;
  displayedSeat?: Seat;
  seats: SeatConfig[];
  mode: GameMode;
  tokens: Record<string, Token>;
  selectedCardId: string | null;
  selectedTokenId: string | null;
  split7Remaining: number;
  jackFirstSelectedTokenId: string | null;
  validMovesForSelectedCard: MoveOption[];
  localPlayerRole: PlayerRole | null;
  isLocalGame: boolean;
  turnTimeLeft?: number;
  onSelectCard: (cardId: string) => void;
  onDiscardCard: (cardId: string) => void;
  onExecuteMove?: (move: MoveOption) => void;
}

function getShortCardLabel(card: Card): string {
  switch (card.rank) {
    case 'A':
      return 'Sortie • +11';
    case '4':
      return 'Recul -4';
    case '5':
      return 'Pousse +5';
    case '7':
      return 'Partage 7';
    case 'J':
      return 'Échange';
    case 'Q':
      return 'Avance 12';
    case 'K':
      return 'Sortie • +13';
    default:
      return `Avance +${card.value}`;
  }
}

export const HandView: React.FC<HandViewProps> = ({
  cards,
  activeSeat,
  displayedSeat,
  seats,
  mode,
  tokens,
  selectedCardId,
  selectedTokenId,
  split7Remaining,
  jackFirstSelectedTokenId,
  validMovesForSelectedCard,
  localPlayerRole,
  isLocalGame,
  turnTimeLeft: _turnTimeLeft = 30,
  onSelectCard,
  onDiscardCard,
  onExecuteMove,
}) => {
  const currentSeatConfig = seats.find(s => s.id === activeSeat);
  const isMyTurn =
    isLocalGame ||
    (localPlayerRole !== null &&
      currentSeatConfig?.humanPlayer === localPlayerRole &&
      (!displayedSeat || displayedSeat === activeSeat));

  const anyMovePossible = React.useMemo(
    () => hasAnyLegalMove(cards, activeSeat, mode, tokens),
    [cards, activeSeat, mode, tokens]
  );

  const selectedCard = cards.find(c => c.id === selectedCardId);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Contextual Action Alerts (Partage du 7, Échange Valet, Défausse obligatoire) */}
      {isMyTurn && selectedCard?.rank === '7' && split7Remaining < 7 && (
        <div className="mb-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold">
          <Split className="w-3.5 h-3.5" />
          <span>Partage du 7 : <strong>{split7Remaining}</strong> case(s) restante(s)</span>
        </div>
      )}

      {isMyTurn && selectedCard?.rank === 'J' && (
        <div className="mb-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold">
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>
            {jackFirstSelectedTokenId
              ? 'Étape 2 : Cliquez sur un autre pion de la piste à échanger'
              : 'Étape 1 : Cliquez sur votre pion de piste'}
          </span>
        </div>
      )}

      {isMyTurn && !anyMovePossible && cards.length > 0 && (
        <div className="mb-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold animate-pulse">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Aucun coup valide ! Défaussez une carte.</span>
        </div>
      )}

      {/* Cards Row Header */}
      <div className="w-full flex items-center justify-between px-2 mb-1 select-none">
        <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          Vos Cartes ({cards.length})
        </span>
        {isMyTurn ? (
          <span className="text-[11px] sm:text-xs font-bold text-emerald-400 flex items-center gap-1 animate-pulse">
            ★ À VOUS DE JOUER ★
          </span>
        ) : (
          <span className="text-[11px] sm:text-xs font-medium text-slate-500 italic">
            Cartes verrouillées jusqu'à votre tour
          </span>
        )}
      </div>

      {/* Cards Row: High Touch Target for Smartphone & Mobile */}
      <div className="w-full flex items-center justify-center gap-2 xs:gap-3 sm:gap-4 md:gap-5 overflow-x-auto pt-4 pb-2 px-2">
        {cards.map((card) => {
          const isSelected = card.id === selectedCardId;
          const moves = isMyTurn ? getLegalMovesForCard(card, activeSeat, mode, tokens, split7Remaining) : [];
          const hasMoves = moves.length > 0;
          const uniquePlayableTokens = Array.from(new Set(moves.map(m => m.tokenId)));
          const canQuickPlayOnDoubleTap =
            isSelected && isMyTurn && (uniquePlayableTokens.length === 1 || Boolean(selectedTokenId));

          return (
            <div
              key={card.id}
              className={`relative flex-shrink-0 w-20 min-w-[80px] xs:w-[88px] sm:w-28 md:w-32 h-32 xs:h-36 sm:h-42 md:h-48 rounded-2xl sm:rounded-3xl transition-all duration-200 select-none flex flex-col justify-between p-2.5 sm:p-3.5 touch-manipulation ${
                !isMyTurn
                  ? 'grayscale opacity-40 bg-slate-950/80 border-2 border-slate-800 pointer-events-none cursor-not-allowed'
                  : isSelected
                  ? 'ring-4 ring-cyan-400 -translate-y-3 sm:-translate-y-4 shadow-[0_0_25px_rgba(34,211,238,0.7)] bg-slate-800 scale-105 z-20 cursor-pointer'
                  : hasMoves
                  ? 'hover:-translate-y-1.5 active:scale-95 glass-card border-2 border-slate-600 hover:border-cyan-400/90 bg-slate-900/90 shadow-xl cursor-pointer'
                  : 'opacity-50 glass-card bg-slate-950/60 hover:opacity-80 border border-slate-800 cursor-pointer'
              }`}
              onClick={() => {
                if (!isMyTurn) return;
                if (hasMoves || !anyMovePossible) {
                  onSelectCard(card.id);
                }
              }}
            >
              {/* Double-tap quick play indicator on raised card */}
              {canQuickPlayOnDoubleTap && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[9px] sm:text-[10px] whitespace-nowrap shadow-lg shadow-emerald-500/50 border border-emerald-200 animate-bounce z-30">
                  ▶ Re-clic pour jouer
                </div>
              )}

              {/* Header (Rank & Suit) */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-2xl xs:text-3xl sm:text-4xl font-black font-display leading-none ${
                    card.isRed ? 'text-rose-500' : 'text-slate-100'
                  }`}
                >
                  {card.rank}
                </span>
                <span
                  className={`text-lg xs:text-xl sm:text-2xl leading-none ${
                    card.isRed ? 'text-rose-500' : 'text-slate-300'
                  }`}
                >
                  {card.symbol}
                </span>
              </div>

              {/* Card Center Symbol Watermark */}
              <div className="self-center my-auto">
                <span
                  className={`text-3xl xs:text-4xl sm:text-5xl opacity-20 leading-none select-none ${
                    card.isRed ? 'text-rose-400' : 'text-slate-400'
                  }`}
                >
                  {card.symbol}
                </span>
              </div>

              {/* Action badge on mobile and desktop */}
              <div className="w-full py-0.5 px-1 rounded-md sm:rounded-lg bg-slate-950/80 border border-slate-700/60 text-center">
                <span className="text-[10px] xs:text-[11px] sm:text-xs font-black tracking-tight text-cyan-200 block truncate">
                  {getShortCardLabel(card)}
                </span>
              </div>

              {/* Discard button when no moves possible - centered on the card */}
              {!hasMoves && !anyMovePossible && isSelected && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDiscardCard(card.id);
                  }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-90 text-xs sm:text-sm font-black text-white flex items-center gap-1.5 shadow-2xl shadow-rose-950/90 border border-rose-400/60 z-30 whitespace-nowrap animate-pulse"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Défausser</span>
                </button>
              )}

              {/* Legal Move indicator pip */}
              {hasMoves && (
                <div className="absolute top-2 right-2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Card Move Choices (Uniquement si un pion sélectionné dispose de plusieurs actions au choix) */}
      {isMyTurn &&
        selectedCard &&
        selectedTokenId &&
        validMovesForSelectedCard.filter(m => m.tokenId === selectedTokenId).length > 1 && (
          <div className="mt-2 text-center text-xs text-cyan-300 flex items-center justify-center gap-2 bg-cyan-950/60 px-4 py-2 rounded-full border border-cyan-800/60 backdrop-blur-md flex-wrap">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white">Choisir l'action pour ce pion :</span>
              {validMovesForSelectedCard
                .filter(m => m.tokenId === selectedTokenId)
                .map((m, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onExecuteMove?.(m)}
                    className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-md shadow-cyan-500/30 active:scale-95 transition-all"
                  >
                    {m.type === 'EXIT_BASE'
                      ? 'Sortir sur Départ'
                      : m.steps > 0
                      ? `+${m.steps} cases`
                      : `${m.steps} cases`}
                  </button>
                ))}
            </div>
          </div>
        )}
    </div>
  );
};

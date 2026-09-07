import React from 'react';
import type { Card, GameMode, MoveOption, Seat, SeatConfig, Token } from '../game/types';
import type { PlayerRole } from '../multiplayer/types';
import { getLegalMovesForCard, hasAnyLegalMove } from '../game/rules';
import { Sparkles, Trash2, ArrowRightLeft, Split, AlertCircle, Lock, Clock } from 'lucide-react';

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
  onSelectCard: (cardId: string) => void;
  onDiscardCard: (cardId: string) => void;
  onExecuteMove?: (move: MoveOption) => void;
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
  onSelectCard,
  onDiscardCard,
  onExecuteMove,
}) => {
  const currentSeatConfig = seats.find(s => s.id === activeSeat);
  const mySeatConfig = seats.find(s => s.id === (displayedSeat || activeSeat));
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
      {/* Current Turn & Status Banner - High Prominence */}
      <div
        className={`w-full flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl border-2 mb-2 sm:mb-3 select-none transition-all ${
          isMyTurn
            ? 'border-emerald-400 bg-gradient-to-r from-emerald-950/95 via-slate-900/90 to-emerald-950/95 shadow-[0_0_25px_rgba(16,185,129,0.35)]'
            : 'border-amber-500/50 bg-gradient-to-r from-slate-950/95 via-slate-900/90 to-slate-950/95 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
        }`}
      >
        <div className="flex items-center gap-2.5 sm:gap-3.5 w-full sm:w-auto">
          {isMyTurn ? (
            <div className="relative flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 bg-emerald-400 shadow-[0_0_10px_#34d399]"></span>
            </div>
          ) : (
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-pulse shrink-0" />
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {isMyTurn ? (
                <span className="text-xs sm:text-sm font-black text-emerald-300 tracking-wide uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  C'EST VOTRE TOUR DE JOUER !
                </span>
              ) : (
                <span className="text-xs sm:text-sm font-black text-amber-300/90 uppercase tracking-wide">
                  TOUR DU JOUEUR :
                </span>
              )}

              <span
                className="text-xs font-black px-2.5 py-0.5 rounded-full border shadow-sm"
                style={{
                  color: currentSeatConfig?.hex || '#38bdf8',
                  borderColor: currentSeatConfig?.hex || '#38bdf8',
                  backgroundColor: (currentSeatConfig?.hex || '#38bdf8') + '25',
                }}
              >
                {currentSeatConfig?.name} • Joueur {currentSeatConfig?.humanPlayer}
              </span>

              {!isLocalGame && mySeatConfig && (
                <span className="text-[11px] text-slate-300 font-medium">
                  • Main : <strong style={{ color: mySeatConfig.hex }}>{mySeatConfig.name}</strong> ({cards.length} carte{cards.length > 1 ? 's' : ''})
                </span>
              )}
            </div>

            <div className="text-xs sm:text-sm font-semibold mt-0.5">
              {isMyTurn ? (
                selectedCard ? (
                  <span className="text-cyan-200">
                    👉 Carte <strong className="text-white underline decoration-cyan-400 font-black">{selectedCard.rank}{selectedCard.symbol}</strong> sélectionnée : touchez un pion sur le plateau.
                  </span>
                ) : (
                  <span className="text-emerald-100/90 font-medium">
                    👉 Touchez une carte ci-dessous pour choisir votre coup.
                  </span>
                )
              ) : (
                <span className="text-slate-400 font-normal">
                  ⏳ En attente du coup de <strong className="text-white">Joueur {currentSeatConfig?.humanPlayer} ({currentSeatConfig?.name})</strong>...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Prompt / Helper */}
        <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-end">
          {!isMyTurn && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-300 font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Tour de l'adversaire</span>
            </div>
          )}

          {isMyTurn && selectedCard?.rank === '7' && split7Remaining < 7 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
              <Split className="w-3.5 h-3.5" />
              <span>Partage du 7 : <strong>{split7Remaining}</strong> case(s) restante(s)</span>
            </div>
          )}

          {isMyTurn && selectedCard?.rank === 'J' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>
                {jackFirstSelectedTokenId
                  ? 'Étape 2 : Cliquez sur un autre pion de la piste à échanger'
                  : 'Étape 1 : Cliquez sur votre pion de piste'}
              </span>
            </div>
          )}

          {isMyTurn && !anyMovePossible && cards.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 font-semibold animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Aucun coup valide ! Défaussez une carte.</span>
            </div>
          )}
        </div>
      </div>

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

      {/* Cards Row: Always rendered Face-Up with full values */}
      <div className="w-full flex items-center justify-center gap-1.5 sm:gap-3 md:gap-4 overflow-x-auto py-1 sm:py-2 px-1 sm:px-2">
        {cards.map((card) => {
          const isSelected = card.id === selectedCardId;
          const moves = isMyTurn ? getLegalMovesForCard(card, activeSeat, mode, tokens, split7Remaining) : [];
          const hasMoves = moves.length > 0;

          return (
            <div
              key={card.id}
              className={`relative flex-shrink-0 w-16 sm:w-24 md:w-28 h-24 sm:h-34 md:h-40 rounded-xl sm:rounded-2xl transition-all duration-200 select-none flex flex-col justify-between p-2 sm:p-2.5 md:p-3 ${
                !isMyTurn
                  ? 'glass-card bg-slate-900/70 opacity-80 border-slate-700/70 cursor-default'
                  : isSelected
                  ? 'ring-2 ring-cyan-400 -translate-y-2 sm:-translate-y-3 shadow-2xl shadow-cyan-500/30 bg-slate-800 cursor-pointer'
                  : hasMoves
                  ? 'hover:-translate-y-1 sm:hover:-translate-y-2 glass-card hover:border-slate-400 bg-slate-900/80 shadow-md cursor-pointer'
                  : 'opacity-50 glass-card bg-slate-950/60 hover:opacity-80 cursor-pointer'
              }`}
              onClick={() => {
                if (!isMyTurn) return;
                if (hasMoves || !anyMovePossible) {
                  onSelectCard(card.id);
                }
              }}
            >
                {/* Header (Rank & Suit) */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-base sm:text-xl md:text-2xl font-black font-display leading-none ${
                      card.isRed ? 'text-rose-500' : 'text-slate-100'
                    }`}
                  >
                    {card.rank}
                  </span>
                  <span
                    className={`text-sm sm:text-lg md:text-xl leading-none ${
                      card.isRed ? 'text-rose-500' : 'text-slate-300'
                    }`}
                  >
                    {card.symbol}
                  </span>
                </div>

                {/* Card Center Symbol */}
                <div className="self-center my-auto">
                  <span
                    className={`text-2xl sm:text-3xl md:text-4xl opacity-20 leading-none ${
                      card.isRed ? 'text-rose-400' : 'text-slate-400'
                    }`}
                  >
                    {card.symbol}
                  </span>
                </div>

                {/* Footer description (hidden on small mobile to preserve layout) */}
                <div className="hidden sm:block text-[9px] md:text-[11px] leading-tight font-medium text-slate-300 line-clamp-2">
                  {card.description}
                </div>

                {/* Discard button when no moves possible - centered on the card */}
                {!hasMoves && !anyMovePossible && isSelected && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDiscardCard(card.id);
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-[10px] sm:text-xs font-bold text-white flex items-center gap-1 shadow-2xl shadow-rose-950/90 border border-rose-400/60 z-30 whitespace-nowrap animate-pulse"
                  >
                    <Trash2 className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    <span>Défausser</span>
                  </button>
                )}

                {/* Legal Move indicator pip */}
                {hasMoves && (
                  <div className="absolute top-1.5 right-1.5 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 animate-pulse" />
                )}
              </div>
            );
          })}
      </div>

      {/* Selected Card Move Options / Quick Guidance */}
      {isMyTurn && selectedCard && validMovesForSelectedCard.length > 0 && (
        <div className="mt-2 text-center text-xs text-cyan-300 flex items-center justify-center gap-2 bg-cyan-950/60 px-4 py-2 rounded-full border border-cyan-800/60 backdrop-blur-md flex-wrap">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          {selectedTokenId &&
          validMovesForSelectedCard.filter(m => m.tokenId === selectedTokenId).length > 1 ? (
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
          ) : (
            <span>
              Carte <strong>{selectedCard.rank}{selectedCard.symbol}</strong> : Cliquez directement sur votre pion pour le déplacer !
            </span>
          )}
        </div>
      )}
    </div>
  );
};

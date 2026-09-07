import React from 'react';
import type { Card, GameMode, MoveOption, Seat, SeatConfig, Token } from '../game/types';
import type { PlayerRole } from '../multiplayer/types';
import { getLegalMovesForCard, hasAnyLegalMove } from '../game/rules';
import { Sparkles, Trash2, ArrowRightLeft, Split, AlertCircle, Lock } from 'lucide-react';

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
}

export const HandView: React.FC<HandViewProps> = ({
  cards,
  activeSeat,
  displayedSeat,
  seats,
  mode,
  tokens,
  selectedCardId,
  split7Remaining,
  jackFirstSelectedTokenId,
  validMovesForSelectedCard,
  localPlayerRole,
  isLocalGame,
  onSelectCard,
  onDiscardCard,
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
      {/* Current Turn & Status Banner */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl glass-panel border border-slate-800/80 mb-1.5 sm:mb-3 select-none">
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full animate-pulse shadow-lg shrink-0"
            style={{
              backgroundColor: currentSeatConfig?.hex || '#38bdf8',
              boxShadow: `0 0 12px ${currentSeatConfig?.glowHex || 'rgba(56, 189, 248, 0.6)'}`,
            }}
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Tour :
              </span>
              <span
                className="text-xs font-black px-2 py-0.5 rounded-md border"
                style={{
                  color: currentSeatConfig?.hex,
                  borderColor: currentSeatConfig?.hex + '40',
                  backgroundColor: currentSeatConfig?.hex + '15',
                }}
              >
                {currentSeatConfig?.name}
              </span>
              {!isLocalGame && mySeatConfig && (
                <span className="text-[11px] text-slate-300 font-medium">
                  • Votre main : <strong style={{ color: mySeatConfig.hex }}>{mySeatConfig.name}</strong> ({cards.length} carte{cards.length > 1 ? 's' : ''})
                </span>
              )}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-white">
              {isMyTurn ? (
                <span className="text-emerald-300 font-bold">C'est votre tour de jouer !</span>
              ) : (
                <span className="text-slate-400">
                  En attente du coup de <strong className="text-white">Joueur {currentSeatConfig?.humanPlayer} ({currentSeatConfig?.name})</strong>...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Prompt / Helper */}
        <div className="flex items-center gap-2 text-xs">
          {!isMyTurn && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Contrôle verrouillé pendant le tour adverse</span>
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
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Aucun coup valide possible ! Défaussez une carte pour passer.</span>
            </div>
          )}
        </div>
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
        <div className="mt-3 text-center text-xs text-cyan-300 flex items-center gap-2 bg-cyan-950/40 px-4 py-2 rounded-full border border-cyan-800/50">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            Carte <strong>{selectedCard.rank}{selectedCard.symbol}</strong> active : Cliquez sur un pion ou sur une case lumineuse en surbrillance !
          </span>
        </div>
      )}
    </div>
  );
};

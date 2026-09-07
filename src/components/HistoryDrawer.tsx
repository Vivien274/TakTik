import React from 'react';
import type { MoveHistoryItem, SeatConfig } from '../game/types';
import { X, History, Sparkles } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: MoveHistoryItem[];
  seats: SeatConfig[];
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  seats,
}) => {
  if (!isOpen) return null;

  const getSeatConfig = (seatId: string) => {
    return seats.find(s => s.id === seatId);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-sm glass-panel border-l border-slate-800 shadow-2xl flex flex-col select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold font-display text-white">Historique des Coups</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* History Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            Aucun coup joué pour le moment.
          </div>
        ) : (
          history.map((item, idx) => {
            const seatConfig = getSeatConfig(item.seat);
            return (
              <div
                key={item.id || idx}
                className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col gap-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: seatConfig?.hex || '#94a3b8' }}
                    />
                    <span className="font-bold text-slate-200">
                      {seatConfig?.name || item.seat}
                    </span>
                  </div>
                  {item.card && (
                    <span
                      className={`font-mono font-bold ${
                        item.card.isRed ? 'text-rose-400' : 'text-slate-300'
                      }`}
                    >
                      {item.card.rank}{item.card.symbol}
                    </span>
                  )}
                </div>

                <div className="text-slate-300 leading-snug">
                  {item.description}
                </div>

                {item.captured && (
                  <div className="flex items-center gap-1 text-[10px] text-rose-400 font-medium">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Pion {item.captured.seat} capturé !</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

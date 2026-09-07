import React from 'react';
import { X, BookOpen, Shield, Zap, Sparkles, AlertTriangle } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col glass-panel rounded-3xl border border-slate-700/60 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold font-display text-white">
              Guide des Cartes & Règles Taktik / Jaquaroo
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Card Powers Reference */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Valeurs & Pouvoirs Spéciaux des Cartes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-base">As (A)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Sortie ou +1</span>
                </div>
                <p className="text-xs text-slate-400">Sortir un pion de sa Base vers la case Départ, ou avancer un pion actif de 1 case.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-base">Roi (K)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Sortie ou +13</span>
                </div>
                <p className="text-xs text-slate-400">Sortir un pion de sa Base vers la case Départ, ou avancer un pion actif de 13 cases.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-base">Valet (J)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Échange</span>
                </div>
                <p className="text-xs text-slate-400">Échanger les positions de n'importe quels 2 pions situés sur la piste (les pions en Base ou en Maison sont protégés).</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-base">Quatre (4)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">Recul de 4</span>
                </div>
                <p className="text-xs text-slate-400">Doit obligatoirement reculer de 4 cases sur la piste. Idéal pour se positionner juste avant la Maison.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-base">Sept (7)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Partage 7</span>
                </div>
                <p className="text-xs text-slate-400">Partager un total de 7 cases entre plusieurs pions de votre camp (ex : 3 sur l'un, 4 sur un autre).</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-base">Dame (Q)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700/50 text-slate-300">Avancer de 12</span>
                </div>
                <p className="text-xs text-slate-400">Avancer de 12 cases sur la piste ou vers la Maison.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-base">Cartes Numériques (2, 3, 5, 6, 8, 9, 10)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700/50 text-slate-300">Valeur Nominale</span>
                </div>
                <p className="text-xs text-slate-400">Avancer exactement du nombre de cases indiqué par la carte.</p>
              </div>
            </div>
          </div>

          {/* Collisions & Captures */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Collisions & Captures
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Atterrir sur une case occupée capture le pion présent et le renvoie immédiatement dans sa Base de départ.
            </p>
          </div>

          {/* Maison & Victoire */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> Entrée en Maison & Victoire
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Les pions entrent dans la Maison depuis la case d'entrée avec un compte exact. À l'intérieur de la Maison, les pions ne peuvent pas se sauter par-dessus et sont immunisés contre les captures et les échanges de Valet.
            </p>
          </div>

          {/* Coéquipiers en Classique */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Entraide d'Équipe (Mode Classique)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              L'Humain 1 contrôle Nord & Sud (Équipe A). L'Humain 2 contrôle Est & Ouest (Équipe B). Lorsqu'un siège a rentré tous ses 4 pions en Maison, il utilise ses cartes pour faire avancer les pions de son coéquipier !
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
          >
            Fermer le guide
          </button>
        </div>
      </div>
    </div>
  );
};

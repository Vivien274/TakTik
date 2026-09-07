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
              <Zap className="w-4 h-4" /> Règles & Pouvoirs des Cartes (Style WePlay Jackaroo)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-base">As (A)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Sortie, +1 ou +11</span>
                </div>
                <p className="text-xs text-slate-400">Sortir un pion de sa Base vers la case Départ, OU avancer un pion de 1 case, OU de 11 cases.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-base">Roi (K)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Sortie ou +13</span>
                </div>
                <p className="text-xs text-slate-400">Sortir un pion de sa Base vers la case Départ, OU avancer un pion de 13 cases.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-base">Dame (Q - 12)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">Avancer de 12</span>
                </div>
                <p className="text-xs text-slate-400">Avancer un pion en jeu de 12 cases sur la piste. Si vous dépassez l'entrée de la maison, le pion poursuit son tour de piste (ne permet pas de sortir de la base).</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-base">Valet (J)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Échange</span>
                </div>
                <p className="text-xs text-slate-400">Échanger l'un de vos pions avec un pion adverse sur la piste (les pions en Base ou en Maison sont protégés).</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-base">Cinq (5)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">N'importe quel pion</span>
                </div>
                <p className="text-xs text-slate-400">Avancer <strong>n'importe quel pion sur la piste</strong> de 5 cases : le vôtre, celui de votre allié ou même un pion ennemi !</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-base">Quatre (4)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">Recul de 4</span>
                </div>
                <p className="text-xs text-slate-400">Doit obligatoirement reculer de 4 cases sur la piste. Joué depuis la case départ, il vous positionne juste devant l'entrée de votre Maison !</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-base">Sept (7)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Partage 7</span>
                </div>
                <p className="text-xs text-slate-400">Avancer de 7 cases ou partager les 7 cases entre deux pions de votre camp (ex : 3 et 4).</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-base">Cartes (2, 3, 6, 8, 9, 10)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700/50 text-slate-300">Avance Normale</span>
                </div>
                <p className="text-xs text-slate-400">Avancer exactement du nombre de cases indiqué par la carte.</p>
              </div>
            </div>
          </div>

          {/* Collisions & Captures */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Collisions & Sorties de Base ("Au Pieu")
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pour sortir un pion de sa Base de réserve, vous devez <strong>impérativement jouer un As ou un Roi</strong>. Une Dame (12) ou toute autre carte ne permet pas de sortir un pion en base.
              Atterrir sur une case occupée capture le pion présent et le renvoie immédiatement dans sa Base.
            </p>
          </div>

          {/* Maison & Victoire */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> Entrée en Maison (Safe Zone) & Dépassement
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Les pions entrent dans la Maison avec un <strong>compte exact</strong>. Si votre carte dépasse les cases restantes de la maison (par exemple jouer un 12 en arrivant près de l'entrée), le pion ne rentre pas mais continue naturellement son tour sur la piste !
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

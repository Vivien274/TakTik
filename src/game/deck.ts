import type { Card, Rank, Suit } from './types';

export const SUITS: Suit[] = ['SPADES', 'HEARTS', 'DIAMONDS', 'CLUBS'];
export const RANKS: Rank[] = [
  'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'
];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  SPADES: '♠',
  HEARTS: '♥',
  DIAMONDS: '♦',
  CLUBS: '♣',
};

export function getCardDescription(rank: Rank): { value: number; description: string } {
  switch (rank) {
    case 'A':
      return { value: 1, description: 'Sortir de la Base, ou Avancer de +1 ou +11' };
    case '2':
      return { value: 2, description: 'Avancer de +2' };
    case '3':
      return { value: 3, description: 'Avancer de +3' };
    case '4':
      return { value: -4, description: 'Reculer obligatoirement de 4 cases' };
    case '5':
      return { value: 5, description: 'Avancer n’importe quel pion de 5 cases' };
    case '6':
      return { value: 6, description: 'Avancer de +6' };
    case '7':
      return { value: 7, description: 'Avancer de 7 (ou partager entre 2 pions)' };
    case '8':
      return { value: 8, description: 'Avancer de +8' };
    case '9':
      return { value: 9, description: 'Avancer de +9' };
    case '10':
      return { value: 10, description: 'Avancer de +10' };
    case 'J':
      return { value: 0, description: 'Échanger un de vos pions avec un pion adverse' };
    case 'Q':
      return { value: 12, description: 'Avancer de +12' };
    case 'K':
      return { value: 13, description: 'Sortir de la Base, ou Avancer de +13' };
  }
}

export function createDeck(): Card[] {
  const cards: Card[] = [];
  let idCounter = 0;

  for (const suit of SUITS) {
    const isRed = suit === 'HEARTS' || suit === 'DIAMONDS';
    for (const rank of RANKS) {
      const { value, description } = getCardDescription(rank);
      cards.push({
        id: `card-${rank}-${suit}-${idCounter++}`,
        suit,
        rank,
        value,
        description,
        symbol: SUIT_SYMBOLS[suit],
        isRed,
      });
    }
  }

  return cards;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const result = [...deck];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export type GameMode = 'PURE_DUEL' | 'TWO_HANDED_CLASSIC';

export type ClassicSeat = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';
export type DuelSeat = 'P1' | 'P2'; // P1 (Blue), P2 (Red)
export type Seat = ClassicSeat | DuelSeat;

export type PlayerColor = 'blue' | 'red' | 'green' | 'yellow';

export interface SeatConfig {
  id: Seat;
  name: string;
  color: PlayerColor;
  hex: string;
  glowHex: string;
  humanPlayer: 1 | 2; // Human 1 or Human 2
  team: 'TEAM_A' | 'TEAM_B';
  startIndex: number; // Index on main track where tokens enter
  homePreIndex: number; // Last track index before turning into home
  partnerSeat?: Seat;
}

export type Suit = 'SPADES' | 'HEARTS' | 'DIAMONDS' | 'CLUBS';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  value: number; // Face value or default move value
  description: string;
  symbol: string;
  isRed: boolean;
}

export type TokenLocationType = 'BASE' | 'TRACK' | 'HOME';

export interface TokenLocation {
  type: TokenLocationType;
  index: number; // For BASE: 0..3; For TRACK: 0..totalTrack-1; For HOME: 0..3
}

export interface Token {
  id: string;
  seat: Seat;
  tokenIndex: number; // 0..3
  color: PlayerColor;
  location: TokenLocation;
}

export type MoveType = 
  | 'EXIT_BASE'
  | 'FORWARD'
  | 'BACKWARD_4'
  | 'SWAP_JACK'
  | 'SPLIT_7';

export interface MoveOption {
  type: MoveType;
  cardId: string;
  tokenId: string;
  from: TokenLocation;
  to: TokenLocation;
  steps: number;
  secondaryTokenId?: string; // For Jack swap
  secondaryTo?: TokenLocation; // For Jack swap
  capturedTokenId?: string;
  description: string;
}

export interface MoveHistoryItem {
  id: string;
  timestamp: number;
  seat: Seat;
  humanPlayer: 1 | 2;
  card: Card;
  description: string;
  captured?: {
    tokenId: string;
    seat: Seat;
  };
}

export type GamePhase = 
  | 'MODE_SELECT'
  | 'CARD_SWAP'
  | 'PLAYING'
  | 'ROUND_OVER'
  | 'GAME_OVER';

export interface GameState {
  mode: GameMode | null;
  phase: GamePhase;
  roundNumber: number;
  turnIndex: number;
  activeSeat: Seat;
  seats: SeatConfig[];
  tokens: Record<string, Token>;
  hands: Record<Seat, Card[]>;
  deck: Card[];
  discardPile: Card[];
  selectedCardId: string | null;
  selectedTokenId: string | null;
  // For 7 split move
  split7Remaining: number;
  active7Moves: Array<{ tokenId: string; steps: number }>;
  // For Jack swap
  jackFirstSelectedTokenId: string | null;
  // For Card swap phase in Classic Mode
  cardSwaps: Partial<Record<Seat, string>>; // seat -> cardId
  lastMove: MoveHistoryItem | null;
  history: MoveHistoryItem[];
  winner: string | null; // e.g. "Human 1 (Team A)", "Player 1 (Blue)"
  winningSeats: Seat[];
}

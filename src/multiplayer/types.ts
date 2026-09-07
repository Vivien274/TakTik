import type { GameMode, GameState, MoveOption, Seat } from '../game/types';

export type PlayerRole = 1 | 2; // 1 = Hôte (Humain 1), 2 = Invité (Humain 2)

export type ConnectionStatus =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'WAITING_FOR_OPPONENT'
  | 'CONNECTED'
  | 'ERROR';

export type SyncMessageType =
  | 'JOIN_REQUEST'
  | 'JOIN_ACCEPTED'
  | 'INIT_GAME'
  | 'MOVE_EXECUTED'
  | 'CARD_DISCARDED'
  | 'SWAP_SELECTION'
  | 'REMATCH_REQUESTED';

export interface SyncMessage {
  type: SyncMessageType;
  senderRole: PlayerRole;
  roomCode: string;
  timestamp: number;
  payload?: any;
}

export interface JoinAcceptedPayload {
  mode: GameMode;
  initialState: GameState;
}

export interface MoveExecutedPayload {
  move: MoveOption;
}

export interface CardDiscardedPayload {
  cardId: string;
}

export interface SwapSelectionPayload {
  swaps: Partial<Record<Seat, string>>;
}

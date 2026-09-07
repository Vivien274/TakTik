import type {
  Card,
  GameMode,
  GameState,
  MoveOption,
  Seat,
  Token,
} from './types';
import { createDeck, shuffleDeck } from './deck';
import {
  checkVictoryCondition,
  createInitialTokens,
  getSeatConfigs,
} from './rules';

export function createInitialState(): GameState {
  return {
    mode: null,
    phase: 'MODE_SELECT',
    roundNumber: 0,
    turnIndex: 0,
    activeSeat: 'P1',
    seats: [],
    tokens: {},
    hands: {
      P1: [],
      P2: [],
      NORTH: [],
      EAST: [],
      SOUTH: [],
      WEST: [],
    },
    deck: [],
    discardPile: [],
    selectedCardId: null,
    selectedTokenId: null,
    split7Remaining: 7,
    active7Moves: [],
    jackFirstSelectedTokenId: null,
    cardSwaps: {},
    lastMove: null,
    history: [],
    winner: null,
    winningSeats: [],
  };
}

export function startNewGame(mode: GameMode): GameState {
  const seats = getSeatConfigs(mode);
  const tokens = createInitialTokens(mode);
  let deck = shuffleDeck(createDeck());

  const hands: Record<Seat, Card[]> = {
    P1: [],
    P2: [],
    NORTH: [],
    EAST: [],
    SOUTH: [],
    WEST: [],
  };

  const cardsPerSeat = mode === 'PURE_DUEL' ? 6 : 5;

  for (const seat of seats) {
    hands[seat.id] = deck.slice(0, cardsPerSeat);
    deck = deck.slice(cardsPerSeat);
  }

  const initialSeat = seats[0].id;
  const phase = mode === 'PURE_DUEL' ? 'PLAYING' : 'CARD_SWAP';

  return {
    mode,
    phase,
    roundNumber: 1,
    turnIndex: 0,
    activeSeat: initialSeat,
    seats,
    tokens,
    hands,
    deck,
    discardPile: [],
    selectedCardId: null,
    selectedTokenId: null,
    split7Remaining: 7,
    active7Moves: [],
    jackFirstSelectedTokenId: null,
    cardSwaps: {},
    lastMove: null,
    history: [
      {
        id: `start-${Date.now()}`,
        timestamp: Date.now(),
        seat: initialSeat,
        humanPlayer: 1,
        card: {
          id: 'start-deal',
          suit: 'SPADES',
          rank: 'A',
          value: 0,
          description: 'Game Started',
          symbol: '★',
          isRed: false,
        },
        description: `Manche 1 démarrée ! ${cardsPerSeat} cartes distribuées.`,
      },
    ],
    winner: null,
    winningSeats: [],
  };
}

export function findNextFreeBaseSlot(seat: Seat, tokens: Record<string, Token>): number {
  const seatTokens = Object.values(tokens).filter(t => t.seat === seat);
  const usedBaseIndices = new Set(
    seatTokens
      .filter(t => t.location.type === 'BASE')
      .map(t => t.location.index)
  );

  for (let i = 0; i < 4; i++) {
    if (!usedBaseIndices.has(i)) return i;
  }
  return 0;
}

export function dealNextRound(state: GameState): GameState {
  if (!state.mode) return state;

  const seats = state.seats;
  const cardsNeeded = (state.mode === 'PURE_DUEL' ? 6 : 5) * seats.length;

  let deck = [...state.deck];
  let discardPile = [...state.discardPile];

  if (deck.length < cardsNeeded) {
    const reshuffled = shuffleDeck([...deck, ...discardPile]);
    deck = reshuffled;
    discardPile = [];
  }

  const cardsPerSeat = state.mode === 'PURE_DUEL' ? 6 : 5;
  const newHands = { ...state.hands };

  for (const seat of seats) {
    newHands[seat.id] = deck.slice(0, cardsPerSeat);
    deck = deck.slice(cardsPerSeat);
  }

  const nextPhase = state.mode === 'PURE_DUEL' ? 'PLAYING' : 'CARD_SWAP';
  const newRoundNumber = state.roundNumber + 1;

  return {
    ...state,
    phase: nextPhase,
    roundNumber: newRoundNumber,
    deck,
    discardPile,
    hands: newHands,
    selectedCardId: null,
    selectedTokenId: null,
    split7Remaining: 7,
    active7Moves: [],
    jackFirstSelectedTokenId: null,
    cardSwaps: {},
    history: [
      {
        id: `deal-${Date.now()}`,
        timestamp: Date.now(),
        seat: state.activeSeat,
        humanPlayer: state.seats.find(s => s.id === state.activeSeat)?.humanPlayer || 1,
        card: {
          id: `deal-${newRoundNumber}`,
          suit: 'CLUBS',
          rank: 'A',
          value: 0,
          description: 'New Deal',
          symbol: '♣',
          isRed: false,
        },
        description: `Manche ${newRoundNumber} distribuée ! ${cardsPerSeat} cartes chacun.`,
      },
      ...state.history,
    ],
  };
}

export function advanceTurn(state: GameState): GameState {
  const seats = state.seats;
  const currentIndex = seats.findIndex(s => s.id === state.activeSeat);
  const nextIndex = (currentIndex + 1) % seats.length;
  const nextSeat = seats[nextIndex].id;

  // Check if all seats have empty hands
  const allHandsEmpty = seats.every(s => (state.hands[s.id] || []).length === 0);

  if (allHandsEmpty) {
    return dealNextRound({
      ...state,
      turnIndex: state.turnIndex + 1,
      activeSeat: nextSeat,
      selectedCardId: null,
      selectedTokenId: null,
      split7Remaining: 7,
      active7Moves: [],
      jackFirstSelectedTokenId: null,
    });
  }

  return {
    ...state,
    turnIndex: state.turnIndex + 1,
    activeSeat: nextSeat,
    selectedCardId: null,
    selectedTokenId: null,
    split7Remaining: 7,
    active7Moves: [],
    jackFirstSelectedTokenId: null,
  };
}

export function applyMove(state: GameState, move: MoveOption): GameState {
  if (!state.mode) return state;

  const currentSeat = state.activeSeat;
  const activeSeatConfig = state.seats.find(s => s.id === currentSeat);
  const humanPlayer = activeSeatConfig?.humanPlayer || 1;

  const newTokens = { ...state.tokens };

  // 1. Handle collision/capture if any
  let capturedInfo: { tokenId: string; seat: Seat } | undefined;
  if (move.capturedTokenId && newTokens[move.capturedTokenId]) {
    const captured = newTokens[move.capturedTokenId];
    const freeSlot = findNextFreeBaseSlot(captured.seat, newTokens);
    newTokens[move.capturedTokenId] = {
      ...captured,
      location: {
        type: 'BASE',
        index: freeSlot,
      },
    };
    capturedInfo = {
      tokenId: captured.id,
      seat: captured.seat,
    };
  }

  // 2. Move primary token
  if (newTokens[move.tokenId]) {
    newTokens[move.tokenId] = {
      ...newTokens[move.tokenId],
      location: move.to,
    };
  }

  // 3. Handle secondary token for Jack swap
  if (move.secondaryTokenId && move.secondaryTo && newTokens[move.secondaryTokenId]) {
    newTokens[move.secondaryTokenId] = {
      ...newTokens[move.secondaryTokenId],
      location: move.secondaryTo,
    };
  }

  // 4. Handle 7 Split remaining calculation
  let nextSplitRemaining = state.split7Remaining;
  let shouldEndCardTurn = true;

  if (move.type === 'SPLIT_7') {
    nextSplitRemaining = state.split7Remaining - move.steps;
    if (nextSplitRemaining > 0) {
      // Still steps left in the 7!
      shouldEndCardTurn = false;
    }
  }

  // Check victory
  const victory = checkVictoryCondition(state.mode, newTokens);

  // Card handling
  let newHands = { ...state.hands };
  let newDiscardPile = [...state.discardPile];

  const currentCard = newHands[currentSeat]?.find(c => c.id === move.cardId);

  if (shouldEndCardTurn && currentCard) {
    newHands[currentSeat] = newHands[currentSeat].filter(c => c.id !== move.cardId);
    newDiscardPile = [currentCard, ...newDiscardPile];
  }

  const historyItem = {
    id: `move-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: Date.now(),
    seat: currentSeat,
    humanPlayer,
    card: currentCard || {
      id: move.cardId,
      suit: 'SPADES',
      rank: 'A',
      value: 0,
      description: 'Move',
      symbol: '♠',
      isRed: false,
    },
    description: move.description,
    captured: capturedInfo,
  };

  const updatedState: GameState = {
    ...state,
    tokens: newTokens,
    hands: newHands,
    discardPile: newDiscardPile,
    split7Remaining: shouldEndCardTurn ? 7 : nextSplitRemaining,
    lastMove: historyItem,
    history: [historyItem, ...state.history],
    winner: victory.winner,
    winningSeats: victory.winningSeats,
    phase: victory.winner ? 'GAME_OVER' : state.phase,
    selectedTokenId: null,
    jackFirstSelectedTokenId: null,
  };

  if (victory.winner) {
    return updatedState;
  }

  if (shouldEndCardTurn) {
    return advanceTurn(updatedState);
  }

  return updatedState;
}

export function discardCardWithoutMove(state: GameState, cardId: string): GameState {
  const currentSeat = state.activeSeat;
  const currentSeatConfig = state.seats.find(s => s.id === currentSeat);
  const humanPlayer = currentSeatConfig?.humanPlayer || 1;

  const card = state.hands[currentSeat]?.find(c => c.id === cardId);
  if (!card) return state;

  const newHands = {
    ...state.hands,
    [currentSeat]: state.hands[currentSeat].filter(c => c.id !== cardId),
  };

  const newDiscardPile = [card, ...state.discardPile];

  const historyItem = {
    id: `discard-${Date.now()}`,
    timestamp: Date.now(),
    seat: currentSeat,
    humanPlayer,
    card,
    description: `Carte ${card.rank}${card.symbol} défaussée (aucun coup possible)`,
  };

  const updatedState: GameState = {
    ...state,
    hands: newHands,
    discardPile: newDiscardPile,
    selectedCardId: null,
    selectedTokenId: null,
    lastMove: historyItem,
    history: [historyItem, ...state.history],
  };

  return advanceTurn(updatedState);
}

export function executeCardSwaps(state: GameState): GameState {
  if (state.mode !== 'TWO_HANDED_CLASSIC') return state;

  const swaps = state.cardSwaps;
  const northCardId = swaps.NORTH;
  const southCardId = swaps.SOUTH;
  const eastCardId = swaps.EAST;
  const westCardId = swaps.WEST;

  if (!northCardId || !southCardId || !eastCardId || !westCardId) {
    return state;
  }

  const hands = { ...state.hands };

  const northCard = hands.NORTH.find(c => c.id === northCardId);
  const southCard = hands.SOUTH.find(c => c.id === southCardId);
  const eastCard = hands.EAST.find(c => c.id === eastCardId);
  const westCard = hands.WEST.find(c => c.id === westCardId);

  if (!northCard || !southCard || !eastCard || !westCard) {
    return state;
  }

  // Swap North <-> South
  hands.NORTH = [...hands.NORTH.filter(c => c.id !== northCardId), southCard];
  hands.SOUTH = [...hands.SOUTH.filter(c => c.id !== southCardId), northCard];

  // Swap East <-> West
  hands.EAST = [...hands.EAST.filter(c => c.id !== eastCardId), westCard];
  hands.WEST = [...hands.WEST.filter(c => c.id !== westCardId), eastCard];

  return {
    ...state,
    hands,
    phase: 'PLAYING',
    cardSwaps: {},
    activeSeat: 'NORTH',
    history: [
      {
        id: `swap-${Date.now()}`,
        timestamp: Date.now(),
        seat: 'NORTH',
        humanPlayer: 1,
        card: northCard,
        description: 'Échanges de cartes validés entre coéquipiers !',
      },
      ...state.history,
    ],
  };
}

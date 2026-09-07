import type {
  Card,
  GameMode,
  MoveOption,
  Seat,
  SeatConfig,
  Token,
  TokenLocation,
} from './types';

export const SEAT_CONFIGS_DUEL: SeatConfig[] = [
  {
    id: 'P1',
    name: 'Joueur 1 (Bleu)',
    color: 'blue',
    hex: '#38bdf8',
    glowHex: 'rgba(56, 189, 248, 0.6)',
    humanPlayer: 1,
    team: 'TEAM_A',
    startIndex: 0,
    homePreIndex: 31,
  },
  {
    id: 'P2',
    name: 'Joueur 2 (Rouge)',
    color: 'red',
    hex: '#f87171',
    glowHex: 'rgba(248, 113, 113, 0.6)',
    humanPlayer: 2,
    team: 'TEAM_B',
    startIndex: 16,
    homePreIndex: 15,
  },
];

export const SEAT_CONFIGS_CLASSIC: SeatConfig[] = [
  {
    id: 'NORTH',
    name: 'Nord (Bleu)',
    color: 'blue',
    hex: '#38bdf8',
    glowHex: 'rgba(56, 189, 248, 0.6)',
    humanPlayer: 1,
    team: 'TEAM_A',
    startIndex: 0,
    homePreIndex: 63,
    partnerSeat: 'SOUTH',
  },
  {
    id: 'EAST',
    name: 'Est (Rouge)',
    color: 'red',
    hex: '#f87171',
    glowHex: 'rgba(248, 113, 113, 0.6)',
    humanPlayer: 2,
    team: 'TEAM_B',
    startIndex: 16,
    homePreIndex: 15,
    partnerSeat: 'WEST',
  },
  {
    id: 'SOUTH',
    name: 'Sud (Vert)',
    color: 'green',
    hex: '#4ade80',
    glowHex: 'rgba(74, 222, 128, 0.6)',
    humanPlayer: 1,
    team: 'TEAM_A',
    startIndex: 32,
    homePreIndex: 31,
    partnerSeat: 'NORTH',
  },
  {
    id: 'WEST',
    name: 'Ouest (Jaune)',
    color: 'yellow',
    hex: '#facc15',
    glowHex: 'rgba(250, 204, 21, 0.6)',
    humanPlayer: 2,
    team: 'TEAM_B',
    startIndex: 48,
    homePreIndex: 47,
    partnerSeat: 'EAST',
  },
];

export function getSeatConfigs(mode: GameMode): SeatConfig[] {
  return mode === 'PURE_DUEL' ? SEAT_CONFIGS_DUEL : SEAT_CONFIGS_CLASSIC;
}

export function createInitialTokens(mode: GameMode): Record<string, Token> {
  const configs = getSeatConfigs(mode);
  const tokens: Record<string, Token> = {};

  for (const seat of configs) {
    for (let i = 0; i < 4; i++) {
      const id = `token-${seat.id}-${i}`;
      tokens[id] = {
        id,
        seat: seat.id,
        tokenIndex: i,
        color: seat.color,
        location: {
          type: 'BASE',
          index: i,
        },
      };
    }
  }

  return tokens;
}

export function isSeatFinished(seat: Seat, tokens: Record<string, Token>): boolean {
  return Object.values(tokens)
    .filter(t => t.seat === seat)
    .every(t => t.location.type === 'HOME');
}

export function getEligibleTokensForSeat(
  seatId: Seat,
  mode: GameMode,
  tokens: Record<string, Token>
): Token[] {
  const configs = getSeatConfigs(mode);
  const config = configs.find(s => s.id === seatId);
  if (!config) return [];

  // If active seat has unfinished tokens, return active seat's tokens
  if (!isSeatFinished(seatId, tokens)) {
    return Object.values(tokens).filter(t => t.seat === seatId);
  }

  // Active seat is finished! If in classic mode, can help partner
  if (mode === 'TWO_HANDED_CLASSIC' && config.partnerSeat) {
    return Object.values(tokens).filter(t => t.seat === config.partnerSeat);
  }

  return [];
}

export function findTokenAtLocation(
  loc: TokenLocation,
  seatForHomeOrBase: Seat | undefined,
  tokens: Record<string, Token>
): Token | undefined {
  return Object.values(tokens).find(t => {
    if (t.location.type !== loc.type) return false;
    if (loc.type === 'TRACK') {
      return t.location.index === loc.index;
    }
    // For BASE or HOME, must match the seat
    return t.seat === seatForHomeOrBase && t.location.index === loc.index;
  });
}

export function calculateForwardDestination(
  startLocation: TokenLocation,
  steps: number,
  tokenSeat: Seat,
  mode: GameMode,
  tokens: Record<string, Token>,
  allowHomeEntry: boolean = true
): { destination: TokenLocation; valid: boolean } {
  const configs = getSeatConfigs(mode);
  const seatConfig = configs.find(s => s.id === tokenSeat);
  if (!seatConfig) return { destination: startLocation, valid: false };

  const totalTrackNodes = mode === 'PURE_DUEL' ? 32 : 64;

  // If already in HOME
  if (startLocation.type === 'HOME') {
    const targetSlot = startLocation.index + steps;
    if (targetSlot > 3) {
      return { destination: startLocation, valid: false };
    }
    // Check if any token blocks the path or destination in HOME
    for (let s = startLocation.index + 1; s <= targetSlot; s++) {
      const occupied = findTokenAtLocation({ type: 'HOME', index: s }, tokenSeat, tokens);
      if (occupied) return { destination: startLocation, valid: false };
    }
    return { destination: { type: 'HOME', index: targetSlot }, valid: true };
  }

  if (startLocation.type !== 'TRACK') {
    return { destination: startLocation, valid: false };
  }

  let currentIndex = startLocation.index;
  let remainingSteps = steps;

  while (remainingSteps > 0) {
    // If currently at the pre-home node and moving forward:
    // Only enter HOME if allowHomeEntry is true (pushing an opponent prevents home entry!)
    if (allowHomeEntry && currentIndex === seatConfig.homePreIndex) {
      const homeSlotTarget = remainingSteps - 1;
      if (homeSlotTarget >= 0 && homeSlotTarget <= 3) {
        let blockedInHome = false;
        for (let s = 0; s <= homeSlotTarget; s++) {
          const occupied = findTokenAtLocation({ type: 'HOME', index: s }, tokenSeat, tokens);
          if (occupied) {
            blockedInHome = true;
            break;
          }
        }
        if (!blockedInHome) {
          return { destination: { type: 'HOME', index: homeSlotTarget }, valid: true };
        }
      }
      // If homeSlotTarget > 3 (overshoot) or path into Home is blocked:
      // The marble does not enter HOME; it continues along the track!
    }

    currentIndex = (currentIndex + 1) % totalTrackNodes;
    remainingSteps--;
  }

  return { destination: { type: 'TRACK', index: currentIndex }, valid: true };
}

export function calculateBackwardDestination(
  startLocation: TokenLocation,
  steps: number,
  mode: GameMode
): { destination: TokenLocation; valid: boolean } {
  if (startLocation.type !== 'TRACK') {
    return { destination: startLocation, valid: false };
  }
  const totalTrackNodes = mode === 'PURE_DUEL' ? 32 : 64;
  const newIndex = (startLocation.index - steps + totalTrackNodes) % totalTrackNodes;
  return { destination: { type: 'TRACK', index: newIndex }, valid: true };
}

export function getLegalMovesForCard(
  card: Card,
  activeSeat: Seat,
  mode: GameMode,
  tokens: Record<string, Token>,
  splitRemaining: number = 7
): MoveOption[] {
  const configs = getSeatConfigs(mode);
  const seatConfig = configs.find(s => s.id === activeSeat);
  if (!seatConfig) return [];

  const eligibleTokens = getEligibleTokensForSeat(activeSeat, mode, tokens);
  const moves: MoveOption[] = [];

  // Check 1: Exit Base moves (Ace or King)
  if (card.rank === 'A' || card.rank === 'K') {
    const baseTokens = eligibleTokens.filter(t => t.location.type === 'BASE');
    if (baseTokens.length > 0) {
      const targetLocation: TokenLocation = { type: 'TRACK', index: seatConfig.startIndex };
      const occupyingToken = findTokenAtLocation(targetLocation, undefined, tokens);
      const isBlockedBySelf = occupyingToken && occupyingToken.seat === activeSeat;

      if (!isBlockedBySelf) {
        for (const token of baseTokens) {
          moves.push({
            type: 'EXIT_BASE',
            cardId: card.id,
            tokenId: token.id,
            from: token.location,
            to: targetLocation,
            steps: 0,
            capturedTokenId: occupyingToken ? occupyingToken.id : undefined,
            description: occupyingToken
              ? `Sortie de base & capture du pion ${occupyingToken.seat} !`
              : `Sortie de base vers la case départ`,
          });
        }
      }
    }
  }

  // Check 2: Jack Swap moves
  if (card.rank === 'J') {
    const trackEligibleTokens = eligibleTokens.filter(t => t.location.type === 'TRACK');
    const allTrackTokens = Object.values(tokens).filter(t => t.location.type === 'TRACK');

    // Need at least 1 friendly track token and 1 other track token
    for (const friendly of trackEligibleTokens) {
      for (const other of allTrackTokens) {
        if (friendly.id === other.id) continue;
        moves.push({
          type: 'SWAP_JACK',
          cardId: card.id,
          tokenId: friendly.id,
          from: friendly.location,
          to: other.location,
          secondaryTokenId: other.id,
          secondaryTo: friendly.location,
          steps: 0,
          description: `Échanger avec le pion ${other.seat} (case ${other.location.index + 1})`,
        });
      }
    }
    return moves;
  }

  // Check 3: Backward 4
  if (card.rank === '4') {
    const trackTokens = eligibleTokens.filter(t => t.location.type === 'TRACK');
    for (const token of trackTokens) {
      const { destination, valid } = calculateBackwardDestination(token.location, 4, mode);
      if (valid) {
        const occupyingToken = findTokenAtLocation(destination, undefined, tokens);
        moves.push({
          type: 'BACKWARD_4',
          cardId: card.id,
          tokenId: token.id,
          from: token.location,
          to: destination,
          steps: -4,
          capturedTokenId: occupyingToken?.id,
          description: occupyingToken
            ? `Reculer de 4 vers case ${destination.index + 1} (Capture ${occupyingToken.seat} !)`
            : `Reculer de 4 vers case ${destination.index + 1}`,
        });
      }
    }
    return moves;
  }

  // Check 4: Split 7 moves
  if (card.rank === '7') {
    const activeTokens = eligibleTokens.filter(t => t.location.type !== 'BASE');
    // If we are evaluating moves for 7, we generate step options from 1 to splitRemaining
    const maxSteps = splitRemaining;
    for (const token of activeTokens) {
      for (let s = 1; s <= maxSteps; s++) {
        const { destination, valid } = calculateForwardDestination(
          token.location,
          s,
          token.seat,
          mode,
          tokens
        );
        if (valid) {
          const occupyingToken = destination.type === 'TRACK'
            ? findTokenAtLocation(destination, undefined, tokens)
            : undefined;

          moves.push({
            type: 'SPLIT_7',
            cardId: card.id,
            tokenId: token.id,
            from: token.location,
            to: destination,
            steps: s,
            capturedTokenId: occupyingToken?.id,
            description: destination.type === 'HOME'
              ? `Avancer de +${s} dans la Maison (case ${destination.index + 1})`
              : `Avancer de +${s} vers case ${destination.index + 1}${occupyingToken ? ` (Capture !)` : ''}`,
          });
        }
      }
    }
    return moves;
  }

  // Check 5: Standard forward moves
  // Special WePlay Rule for Card 5: can move ANY token on the track (friendly, partner, or opponent)!
  // When pushing an OPPONENT token, allowHomeEntry is FALSE: it pushes the opponent forward along the track,
  // bypassing their garage so they miss their home entrance!
  if (card.rank === '5') {
    const allTrackTokens = Object.values(tokens).filter(t => t.location.type === 'TRACK');
    for (const token of allTrackTokens) {
      const isOpponent = token.seat !== activeSeat && token.seat !== seatConfig.partnerSeat;
      const allowHomeEntry = !isOpponent;
      const { destination, valid } = calculateForwardDestination(
        token.location,
        5,
        token.seat,
        mode,
        tokens,
        allowHomeEntry
      );
      if (valid) {
        const occupyingToken = destination.type === 'TRACK'
          ? findTokenAtLocation(destination, undefined, tokens)
          : undefined;

        const isMine = token.seat === activeSeat;
        moves.push({
          type: 'FORWARD',
          cardId: card.id,
          tokenId: token.id,
          from: token.location,
          to: destination,
          steps: 5,
          capturedTokenId: occupyingToken?.id,
          description: destination.type === 'HOME'
            ? `Entrer dans la Maison (${token.seat}) case ${destination.index + 1}`
            : isOpponent
            ? `Pousser pion adverse ${token.seat} de +5 (reste sur la piste / évite le garage !)${occupyingToken ? ` (Capture ${occupyingToken.seat} !)` : ''}`
            : isMine
            ? `Avancer de 5 vers case ${destination.index + 1}${occupyingToken ? ` (Capture !)` : ''}`
            : `Avancer pion ${token.seat} de 5 vers case ${destination.index + 1}${occupyingToken ? ` (Capture !)` : ''}`,
        });
      }
    }
    return moves;
  }

  // Normal forward moves for friendly eligible tokens (2, 3, 6, 8, 9, 10, Q=12, K=13, A=1 or 11)
  const forwardTokens = eligibleTokens.filter(t => t.location.type !== 'BASE');
  const stepOptions = card.rank === 'A'
    ? [1, 11]
    : [card.rank === 'K' ? 13 : card.rank === 'Q' ? 12 : card.value];

  for (const steps of stepOptions) {
    for (const token of forwardTokens) {
      const { destination, valid } = calculateForwardDestination(
        token.location,
        steps,
        token.seat,
        mode,
        tokens
      );
      if (valid) {
        const occupyingToken = destination.type === 'TRACK'
          ? findTokenAtLocation(destination, undefined, tokens)
          : undefined;

        moves.push({
          type: 'FORWARD',
          cardId: card.id,
          tokenId: token.id,
          from: token.location,
          to: destination,
          steps,
          capturedTokenId: occupyingToken?.id,
          description: destination.type === 'HOME'
            ? `Entrer dans la Maison (case ${destination.index + 1})`
            : `Avancer de +${steps} vers case ${destination.index + 1}${occupyingToken ? ` (Capture !)` : ''}`,
        });
      }
    }
  }

  return moves;
}

export function hasAnyLegalMove(
  cards: Card[],
  activeSeat: Seat,
  mode: GameMode,
  tokens: Record<string, Token>
): boolean {
  for (const card of cards) {
    const moves = getLegalMovesForCard(card, activeSeat, mode, tokens);
    if (moves.length > 0) return true;
  }
  return false;
}

export function checkVictoryCondition(
  mode: GameMode,
  tokens: Record<string, Token>
): { winner: string | null; winningSeats: Seat[] } {
  if (mode === 'PURE_DUEL') {
    if (isSeatFinished('P1', tokens)) {
      return { winner: 'Joueur 1 (Bleu)', winningSeats: ['P1'] };
    }
    if (isSeatFinished('P2', tokens)) {
      return { winner: 'Joueur 2 (Rouge)', winningSeats: ['P2'] };
    }
    return { winner: null, winningSeats: [] };
  }

  // TWO_HANDED_CLASSIC:
  const teamAFinished = isSeatFinished('NORTH', tokens) && isSeatFinished('SOUTH', tokens);
  const teamBFinished = isSeatFinished('EAST', tokens) && isSeatFinished('WEST', tokens);

  if (teamAFinished) {
    return {
      winner: 'Humain 1 (Équipe A : Bleu & Vert)',
      winningSeats: ['NORTH', 'SOUTH'],
    };
  }
  if (teamBFinished) {
    return {
      winner: 'Humain 2 (Équipe B : Rouge & Jaune)',
      winningSeats: ['EAST', 'WEST'],
    };
  }

  return { winner: null, winningSeats: [] };
}

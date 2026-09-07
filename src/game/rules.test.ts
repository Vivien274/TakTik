import assert from 'node:assert';
import { createDeck } from './deck.ts';
import {
  calculateBackwardDestination,
  calculateForwardDestination,
  checkVictoryCondition,
  createInitialTokens,
  getLegalMovesForCard,
  isSeatFinished,
} from './rules.ts';
import { applyMove, startNewGame } from './stateMachine.ts';
import type { Card } from './types.ts';

console.log('🧪 Starting Taktik Rule Engine Test Suite...\n');

// Test 1: Deck generation
{
  const deck = createDeck();
  assert.strictEqual(deck.length, 52, 'Deck should contain exactly 52 cards');
  assert.strictEqual(deck.filter(c => c.rank === 'A').length, 4, 'Should have 4 Aces');
  assert.strictEqual(deck.filter(c => c.rank === 'K').length, 4, 'Should have 4 Kings');
  assert.strictEqual(deck.filter(c => c.rank === 'J').length, 4, 'Should have 4 Jacks');
  console.log('✅ Test 1 Passed: 52-card deck generated correctly');
}

// Test 2: Ace and King exit base moves
{
  const tokens = createInitialTokens('PURE_DUEL');
  const aceCard: Card = {
    id: 'test-ace',
    suit: 'SPADES',
    rank: 'A',
    value: 1,
    description: 'Exit Base or +1',
    symbol: '♠',
    isRed: false,
  };

  const moves = getLegalMovesForCard(aceCard, 'P1', 'PURE_DUEL', tokens);
  assert(moves.length > 0, 'Ace must have legal exit move when tokens are in base');
  assert.strictEqual(moves[0].type, 'EXIT_BASE');
  assert.strictEqual(moves[0].to.type, 'TRACK');
  assert.strictEqual(moves[0].to.index, 0, 'P1 start index is 0');
  console.log('✅ Test 2 Passed: Ace generates valid EXIT_BASE to track index 0');
}

// Test 3: Backward 4 move
{
  const { destination, valid } = calculateBackwardDestination(
    { type: 'TRACK', index: 2 },
    4,
    'PURE_DUEL'
  );
  assert.strictEqual(valid, true);
  // (2 - 4 + 32) % 32 = 30
  assert.strictEqual(destination.index, 30, 'Backward 4 from space 2 on 32-node track should land on 30');
  console.log('✅ Test 3 Passed: Backward 4 moves counter-clockwise correctly');
}

// Test 4: Jack Token Swap
{
  const tokens = createInitialTokens('PURE_DUEL');
  // Place P1 token at track 5, P2 token at track 12
  tokens['token-P1-0'].location = { type: 'TRACK', index: 5 };
  tokens['token-P2-0'].location = { type: 'TRACK', index: 12 };

  const jackCard: Card = {
    id: 'test-jack',
    suit: 'HEARTS',
    rank: 'J',
    value: 0,
    description: 'Swap tokens',
    symbol: '♥',
    isRed: true,
  };

  const moves = getLegalMovesForCard(jackCard, 'P1', 'PURE_DUEL', tokens);
  const swapMove = moves.find(m => m.type === 'SWAP_JACK' && m.secondaryTokenId === 'token-P2-0');
  assert(swapMove !== undefined, 'Jack should generate swap move with opponent track token');
  if (swapMove) {
    assert.strictEqual(swapMove.to.index, 12);
    assert.strictEqual(swapMove.secondaryTo?.index, 5);
  }
  console.log('✅ Test 4 Passed: Jack generates valid track token swaps');
}

// Test 5: Collisions / Captures
{
  let state = startNewGame('PURE_DUEL');
  // Put P2 token on P1's start index 0
  state.tokens['token-P2-0'].location = { type: 'TRACK', index: 0 };
  state.activeSeat = 'P1';

  const aceCard: Card = {
    id: 'test-ace-capture',
    suit: 'DIAMONDS',
    rank: 'A',
    value: 1,
    description: 'Exit Base or +1',
    symbol: '♦',
    isRed: true,
  };
  state.hands.P1 = [aceCard];

  const exitMove = getLegalMovesForCard(aceCard, 'P1', 'PURE_DUEL', state.tokens)[0];
  assert.strictEqual(exitMove.capturedTokenId, 'token-P2-0', 'Should target occupying token for capture');

  state = applyMove(state, exitMove);
  assert.strictEqual(state.tokens['token-P2-0'].location.type, 'BASE', 'Captured token must return to BASE');
  assert.strictEqual(state.tokens['token-P1-0'].location.type, 'TRACK');
  assert.strictEqual(state.tokens['token-P1-0'].location.index, 0);
  console.log('✅ Test 5 Passed: Collision capture returns opponent token to BASE');
}

// Test 6: Home entry on exact count
{
  const tokens = createInitialTokens('PURE_DUEL');
  // P1 pre-home index is 31
  tokens['token-P1-0'].location = { type: 'TRACK', index: 30 };

  // Moving 2 steps from 30: 30 -> 31 -> Home 0
  const resultExact = calculateForwardDestination(
    tokens['token-P1-0'].location,
    2,
    'P1',
    'PURE_DUEL',
    tokens
  );
  assert.strictEqual(resultExact.valid, true);
  assert.strictEqual(resultExact.destination.type, 'HOME');
  assert.strictEqual(resultExact.destination.index, 0, 'Should enter Home slot 0');

  // Moving 10 steps from 30: 30 -> 31 -> over-shoots home entrance, so it continues along the track!
  const resultOvershootTrack = calculateForwardDestination(
    tokens['token-P1-0'].location,
    10,
    'P1',
    'PURE_DUEL',
    tokens
  );
  assert.strictEqual(resultOvershootTrack.valid, true, 'Overshooting home entrance continues along track');
  assert.strictEqual(resultOvershootTrack.destination.type, 'TRACK');
  assert.strictEqual(resultOvershootTrack.destination.index, (30 + 10) % 32);

  // Moving 12 steps (Queen) from 30 on track: continues to track index 10
  const resultQueen = calculateForwardDestination(
    tokens['token-P1-0'].location,
    12,
    'P1',
    'PURE_DUEL',
    tokens
  );
  assert.strictEqual(resultQueen.valid, true, 'Queen 12 must be able to move forward around track');
  assert.strictEqual(resultQueen.destination.type, 'TRACK');
  assert.strictEqual(resultQueen.destination.index, (30 + 12) % 32);

  // Once inside HOME, overshooting is invalid
  const resultHomeOvershoot = calculateForwardDestination(
    { type: 'HOME', index: 0 },
    12,
    'P1',
    'PURE_DUEL',
    tokens
  );
  assert.strictEqual(resultHomeOvershoot.valid, false, 'Inside Home, moving 12 steps must be invalid');
  console.log('✅ Test 6 Passed: Exact-count Home entry and track continuation on overshoot validated');
}

// Test 7: Victory Conditions
{
  const tokens = createInitialTokens('PURE_DUEL');
  for (let i = 0; i < 4; i++) {
    tokens[`token-P1-${i}`].location = { type: 'HOME', index: i };
  }
  const isFinished = isSeatFinished('P1', tokens);
  assert.strictEqual(isFinished, true, 'All 4 tokens in Home means seat is finished');
  const victory = checkVictoryCondition('PURE_DUEL', tokens);
  assert.strictEqual(victory.winner, 'Joueur 1 (Bleu)');
  assert.strictEqual(victory.winningSeats.length, 1);
  console.log('✅ Test 7 Passed: Pure Duel victory condition detected correctly');
}

// Test 8: WePlay Ace +11 option
{
  const tokens = createInitialTokens('PURE_DUEL');
  tokens['token-P1-0'].location = { type: 'TRACK', index: 0 };
  const aceCard: Card = {
    id: 'test-ace-11',
    suit: 'SPADES',
    rank: 'A',
    value: 1,
    description: 'Exit Base or +1 or +11',
    symbol: '♠',
    isRed: false,
  };
  const moves = getLegalMovesForCard(aceCard, 'P1', 'PURE_DUEL', tokens);
  const move11 = moves.find(m => m.type === 'FORWARD' && m.steps === 11);
  assert(move11 !== undefined, 'Ace must provide +11 forward move option in WePlay rules');
  assert.strictEqual(move11.to.index, 11);
  console.log('✅ Test 8 Passed: WePlay Ace provides +11 option');
}

// Test 9: WePlay Card 5 on any token (opponent included)
{
  const tokens = createInitialTokens('PURE_DUEL');
  tokens['token-P2-0'].location = { type: 'TRACK', index: 16 };
  const card5: Card = {
    id: 'test-card-5',
    suit: 'CLUBS',
    rank: '5',
    value: 5,
    description: 'Move any token +5',
    symbol: '♣',
    isRed: false,
  };
  const moves = getLegalMovesForCard(card5, 'P1', 'PURE_DUEL', tokens);
  const moveP2 = moves.find(m => m.tokenId === 'token-P2-0');
  assert(moveP2 !== undefined, 'Card 5 must be able to move opponent token');
  assert.strictEqual(moveP2.to.index, (16 + 5) % 32);
  console.log('✅ Test 9 Passed: WePlay Card 5 can move opponent token');
}

console.log('\n🎉 ALL 9 TEST SUITES PASSED CLEANLY!\n');

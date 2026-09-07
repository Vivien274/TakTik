import React, { useState, useEffect, useRef } from 'react';
import type { GameMode, GameState, MoveOption, Seat, Token } from './game/types';
import type { ConnectionStatus, PlayerRole, SyncMessage } from './multiplayer/types';
import {
  applyMove,
  createInitialState,
  discardCardWithoutMove,
  executeCardSwaps,
  startNewGame,
} from './game/stateMachine';
import { getLegalMovesForCard } from './game/rules';
import { RealtimeSyncClient } from './multiplayer/syncClient';
import { LobbyScreen } from './components/LobbyScreen';
import { RoomHeader } from './components/RoomHeader';
import { GameBoardSVG } from './components/GameBoardSVG';
import { HandView } from './components/HandView';
import { CardSwapModal } from './components/CardSwapModal';
import { RulesModal } from './components/RulesModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { VictoryModal } from './components/VictoryModal';
import { Info } from 'lucide-react';

export function App() {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // État Multijoueur
  const [isLocalGame, setIsLocalGame] = useState(true);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [localPlayerRole, setLocalPlayerRole] = useState<PlayerRole | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('DISCONNECTED');
  const [waitingRoomCode, setWaitingRoomCode] = useState<string | null>(null);
  const [selectedLobbyMode, setSelectedLobbyMode] = useState<GameMode | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!hintMessage) return;
    const timer = setTimeout(() => setHintMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [hintMessage]);

  // Compte à rebours du tour (30s) style WePlay Jaquaroo
  const [turnTimeLeft, setTurnTimeLeft] = useState(30);

  useEffect(() => {
    setTurnTimeLeft(30);
    const interval = setInterval(() => {
      setTurnTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState.activeSeat, gameState.roundNumber, gameState.phase]);

  // Références mutables pour éviter les fermetures lexicales périmées (stale closures)
  const clientRef = useRef<RealtimeSyncClient | null>(null);
  const selectedLobbyModeRef = useRef<GameMode | null>(null);
  const gameStateRef = useRef<GameState>(gameState);
  const localPlayerRoleRef = useRef<PlayerRole | null>(null);
  const roomCodeRef = useRef<string | null>(null);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    selectedLobbyModeRef.current = selectedLobbyMode;
  }, [selectedLobbyMode]);

  useEffect(() => {
    localPlayerRoleRef.current = localPlayerRole;
  }, [localPlayerRole]);

  useEffect(() => {
    roomCodeRef.current = roomCode;
  }, [roomCode]);

  // Initialisation du client réseau
  useEffect(() => {
    const client = new RealtimeSyncClient();
    clientRef.current = client;

    client.onStatusChange((status, detail) => {
      setConnectionStatus(status);
      if (status === 'ERROR' && detail) {
        setErrorMessage(detail);
        setIsConnecting(false);
      }
      if (status === 'CONNECTED') {
        setIsConnecting(false);
        setWaitingRoomCode(null);
      }
    });

    client.onMessage((msg: SyncMessage) => {
      handleRemoteMessage(msg);
    });

    return () => {
      client.disconnect();
    };
  }, []);

  // Traiter les messages reçus de l'adversaire
  const handleRemoteMessage = (msg: SyncMessage) => {
    console.log('[handleRemoteMessage] Type reçu:', msg.type, msg);

    switch (msg.type) {
      case 'JOIN_REQUEST': {
        // Hôte reçoit la demande du joueur 2 : envoyer l'état initial
        const modeToStart = selectedLobbyModeRef.current || gameStateRef.current.mode || 'PURE_DUEL';
        console.log('[Host] Traitement JOIN_REQUEST avec mode:', modeToStart);
        const freshGame = startNewGame(modeToStart);
        setGameState(freshGame);
        gameStateRef.current = freshGame;

        clientRef.current?.sendMessage({
          type: 'INIT_GAME',
          senderRole: 1,
          roomCode: clientRef.current.getRoomCode(),
          timestamp: Date.now(),
          payload: {
            mode: modeToStart,
            initialState: freshGame,
          },
        });
        break;
      }

      case 'INIT_GAME': {
        // Invité reçoit la partie initialisée par l'hôte
        console.log('[Guest] Traitement INIT_GAME:', msg.payload);
        if (msg.payload?.initialState) {
          setGameState(msg.payload.initialState);
          gameStateRef.current = msg.payload.initialState;
          setIsLocalGame(false);
          setLocalPlayerRole(2);
          localPlayerRoleRef.current = 2;
          setRoomCode(msg.roomCode);
          roomCodeRef.current = msg.roomCode;
          setWaitingRoomCode(null);
          setIsConnecting(false);
        }
        break;
      }

      case 'MOVE_EXECUTED': {
        if (msg.payload?.move) {
          setGameState(prev => applyMove(prev, msg.payload.move));
        }
        break;
      }

      case 'CARD_DISCARDED': {
        if (msg.payload?.cardId) {
          setGameState(prev => discardCardWithoutMove(prev, msg.payload.cardId));
        }
        break;
      }

      case 'SWAP_SELECTION': {
        if (msg.payload?.swaps) {
          setGameState(prev => {
            const mergedSwaps = {
              ...prev.cardSwaps,
              ...msg.payload.swaps,
            };
            const updated = {
              ...prev,
              cardSwaps: mergedSwaps,
            };
            if (
              mergedSwaps.NORTH &&
              mergedSwaps.SOUTH &&
              mergedSwaps.EAST &&
              mergedSwaps.WEST
            ) {
              return executeCardSwaps(updated);
            }
            return updated;
          });
        }
        break;
      }

      case 'REMATCH_REQUESTED': {
        if (msg.payload?.mode) {
          const restarted = startNewGame(msg.payload.mode);
          setGameState(restarted);
        }
        break;
      }
    }
  };

  // Créer une salle en ligne (Hôte / Joueur 1)
  const handleCreateRoom = (mode: GameMode) => {
    if (!clientRef.current) return;
    setErrorMessage(null);
    setIsConnecting(true);
    setSelectedLobbyMode(mode);
    selectedLobbyModeRef.current = mode;

    const code = clientRef.current.createRoom();
    setWaitingRoomCode(code);
    setRoomCode(code);
    roomCodeRef.current = code;
    setLocalPlayerRole(1);
    localPlayerRoleRef.current = 1;
    setIsLocalGame(false);

    // Initialiser localement
    const freshGame = startNewGame(mode);
    setGameState(freshGame);
    gameStateRef.current = freshGame;
  };

  // Rejoindre une salle en ligne (Invité / Joueur 2)
  const handleJoinRoom = async (code: string) => {
    if (!clientRef.current) return;
    setErrorMessage(null);
    setIsConnecting(true);

    try {
      await clientRef.current.joinRoom(code);
      setRoomCode(code);
      roomCodeRef.current = code;
      setLocalPlayerRole(2);
      localPlayerRoleRef.current = 2;
      setIsLocalGame(false);
    } catch (err: any) {
      console.error('[handleJoinRoom Error]', err);
      setErrorMessage("Impossible de se connecter à la salle. Vérifiez le code et réessayez.");
      setIsConnecting(false);
    }
  };

  // Démarrer une partie locale (Pass & Play)
  const handleStartLocalGame = (mode: GameMode) => {
    setIsLocalGame(true);
    setLocalPlayerRole(null);
    setRoomCode(null);
    setWaitingRoomCode(null);
    const game = startNewGame(mode);
    setGameState(game);
    gameStateRef.current = game;
  };

  // Quitter la salle et revenir au menu principal
  const handleLeaveRoom = () => {
    clientRef.current?.disconnect();
    setIsLocalGame(true);
    setRoomCode(null);
    setLocalPlayerRole(null);
    setWaitingRoomCode(null);
    setSelectedLobbyMode(null);
    setErrorMessage(null);
    const initial = createInitialState();
    setGameState(initial);
    gameStateRef.current = initial;
  };

  // Revanche
  const handleRestartMatch = () => {
    if (gameState.mode) {
      const restarted = startNewGame(gameState.mode);
      setGameState(restarted);
      gameStateRef.current = restarted;

      if (!isLocalGame && clientRef.current) {
        clientRef.current.sendMessage({
          type: 'REMATCH_REQUESTED',
          senderRole: localPlayerRole || 1,
          roomCode: roomCode || '',
          timestamp: Date.now(),
          payload: { mode: gameState.mode },
        });
      }
    }
  };

  // Déterminer le siège dont la main doit être affichée à l'écran local
  const displayedSeat: Seat = React.useMemo(() => {
    if (isLocalGame) {
      // En partie locale sur le même écran, la main affichée tourne avec le joueur actif
      return gameState.activeSeat;
    }
    // En multijoueur en ligne : chaque joueur conserve SA PROPRE MAIN privée à l'écran !
    if (gameState.mode === 'PURE_DUEL') {
      return localPlayerRole === 2 ? 'P2' : 'P1';
    }
    // Mode Classique 4 sièges (2 joueurs contrôlant 2 sièges chacun) :
    if (localPlayerRole === 2) {
      // Joueur 2 contrôle EST et OUEST
      if (gameState.activeSeat === 'EAST' || gameState.activeSeat === 'WEST') {
        return gameState.activeSeat;
      }
      return gameState.activeSeat === 'NORTH' ? 'EAST' : 'WEST';
    } else {
      // Joueur 1 contrôle NORD et SUD
      if (gameState.activeSeat === 'NORTH' || gameState.activeSeat === 'SOUTH') {
        return gameState.activeSeat;
      }
      return gameState.activeSeat === 'EAST' ? 'SOUTH' : 'NORTH';
    }
  }, [isLocalGame, localPlayerRole, gameState.mode, gameState.activeSeat]);

  // Calcul du joueur actif et protection des tours
  const activeSeatConfig = gameState.seats.find(s => s.id === gameState.activeSeat);
  const isMyTurn =
    isLocalGame ||
    (localPlayerRole !== null &&
      activeSeatConfig?.humanPlayer === localPlayerRole &&
      displayedSeat === gameState.activeSeat);

  // La main affichée à l'écran est celle du joueur local
  const currentHand = gameState.hands[displayedSeat] || [];
  const selectedCard = currentHand.find(c => c.id === gameState.selectedCardId) || null;

  // Calcul des coups légaux pour la carte sélectionnée
  const validMovesForSelectedCard: MoveOption[] = React.useMemo(() => {
    if (!selectedCard || !gameState.mode || !isMyTurn) return [];
    return getLegalMovesForCard(
      selectedCard,
      gameState.activeSeat,
      gameState.mode,
      gameState.tokens,
      gameState.split7Remaining
    );
  }, [selectedCard, gameState.activeSeat, gameState.mode, gameState.tokens, gameState.split7Remaining, isMyTurn]);

  // Sélection d'une carte
  const handleSelectCard = (cardId: string) => {
    if (!isMyTurn) return;

    if (gameState.selectedCardId === cardId) {
      setGameState(prev => ({
        ...prev,
        selectedCardId: null,
        selectedTokenId: null,
        jackFirstSelectedTokenId: null,
      }));
      return;
    }

    // Auto-sélection si un seul pion peut être déplacé
    const card = currentHand.find(c => c.id === cardId);
    let autoTokenId: string | null = null;
    if (card && gameState.mode) {
      const moves = getLegalMovesForCard(
        card,
        gameState.activeSeat,
        gameState.mode,
        gameState.tokens,
        gameState.split7Remaining
      );
      const uniqueTokens = Array.from(new Set(moves.map(m => m.tokenId)));
      if (uniqueTokens.length === 1) {
        autoTokenId = uniqueTokens[0];
      }
    }

    setGameState(prev => ({
      ...prev,
      selectedCardId: cardId,
      selectedTokenId: autoTokenId,
      jackFirstSelectedTokenId: null,
    }));
  };

  // Sélection d'un pion
  const handleSelectToken = (tokenId: string) => {
    if (!isMyTurn) return;

    if (selectedCard?.rank === 'J') {
      setGameState(prev => ({
        ...prev,
        jackFirstSelectedTokenId: tokenId,
        selectedTokenId: tokenId,
      }));
      return;
    }

    setGameState(prev => ({
      ...prev,
      selectedTokenId: prev.selectedTokenId === tokenId ? null : tokenId,
    }));
  };

  // Clic sur un pion qui ne peut pas être déplacé : explication immédiate à l'utilisateur
  const handleInvalidTokenClick = (token: Token) => {
    if (!isMyTurn) return;
    if (!selectedCard) {
      setHintMessage("Sélectionnez d'abord une carte dans votre main.");
      return;
    }
    if (token.location.type === 'BASE') {
      if (selectedCard.rank === 'A' || selectedCard.rank === 'K') {
        setHintMessage("Votre case de départ est déjà occupée par l'un de vos pions. Avancez-le pour libérer la sortie !");
      } else {
        setHintMessage("Ce pion est en base (au pieu). Seul un As ou un Roi permet de sortir un pion sur la case départ !");
      }
    } else if (token.location.type === 'HOME') {
      setHintMessage("Ce pion est dans la maison d'arrivée. Il lui faut un compte exact pour avancer.");
    } else {
      setHintMessage(`La carte ${selectedCard.rank}${selectedCard.symbol} ne permet pas de déplacer ce pion.`);
    }
  };

  // Sélection de la cible pour le Valet
  const handleSelectJackTarget = (targetTokenId: string) => {
    if (!isMyTurn || !gameState.jackFirstSelectedTokenId || !selectedCard) return;

    const swapMove = validMovesForSelectedCard.find(
      m =>
        m.type === 'SWAP_JACK' &&
        m.tokenId === gameState.jackFirstSelectedTokenId &&
        m.secondaryTokenId === targetTokenId
    );

    if (swapMove) {
      handleExecuteMove(swapMove);
    }
  };

  // Exécution d'un coup
  const handleExecuteMove = (move: MoveOption) => {
    if (!isMyTurn) return;

    setGameState(prev => applyMove(prev, move));

    // Synchronisation réseau
    if (!isLocalGame && clientRef.current) {
      clientRef.current.sendMessage({
        type: 'MOVE_EXECUTED',
        senderRole: localPlayerRole || 1,
        roomCode: roomCode || '',
        timestamp: Date.now(),
        payload: { move },
      });
    }
  };

  // Défausse d'une carte
  const handleDiscardCard = (cardId: string) => {
    if (!isMyTurn) return;

    setGameState(prev => discardCardWithoutMove(prev, cardId));

    if (!isLocalGame && clientRef.current) {
      clientRef.current.sendMessage({
        type: 'CARD_DISCARDED',
        senderRole: localPlayerRole || 1,
        roomCode: roomCode || '',
        timestamp: Date.now(),
        payload: { cardId },
      });
    }
  };

  // Validation des échanges de cartes en mode Classique
  const handleConfirmSwaps = (swaps: Record<Seat, string>) => {
    setGameState(prev => {
      const updated = {
        ...prev,
        cardSwaps: swaps,
      };
      return executeCardSwaps(updated);
    });
  };

  // Soumission partielle en ligne (par rôle)
  const handlePartialSwapSubmit = (swaps: Partial<Record<Seat, string>>) => {
    if (!isLocalGame && clientRef.current) {
      clientRef.current.sendMessage({
        type: 'SWAP_SELECTION',
        senderRole: localPlayerRole || 1,
        roomCode: roomCode || '',
        timestamp: Date.now(),
        payload: { swaps },
      });
    }

    setGameState(prev => {
      const merged = { ...prev.cardSwaps, ...swaps };
      const updated = { ...prev, cardSwaps: merged };
      if (
        merged.NORTH &&
        merged.SOUTH &&
        merged.EAST &&
        merged.WEST
      ) {
        return executeCardSwaps(updated);
      }
      return updated;
    });
  };

  // Si aucun match n'est en cours (menu salon)
  if (gameState.phase === 'MODE_SELECT' || !gameState.mode || waitingRoomCode) {
    return (
      <LobbyScreen
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onStartLocalGame={handleStartLocalGame}
        waitingRoomCode={waitingRoomCode}
        selectedMode={selectedLobbyMode}
        isConnecting={isConnecting}
        errorMessage={errorMessage}
        onCancelWaiting={() => {
          clientRef.current?.disconnect();
          setWaitingRoomCode(null);
          setIsConnecting(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 relative">
      {/* En-tête de salle avec code, statut et rôle */}
      <RoomHeader
        state={gameState}
        roomCode={roomCode}
        connectionStatus={connectionStatus}
        localPlayerRole={localPlayerRole}
        isLocalGame={isLocalGame}
        turnTimeLeft={turnTimeLeft}
        onLeaveRoom={handleLeaveRoom}
        onRestartMatch={handleRestartMatch}
        onToggleRules={() => setIsRulesOpen(true)}
        onToggleHistory={() => setIsHistoryOpen(true)}
      />

      {/* Arène de jeu principale */}
      <main className="flex-1 flex flex-col items-center justify-between p-1 sm:p-3 max-w-7xl w-full mx-auto relative gap-1 sm:gap-2">
        {/* Bulle d'aide / Toast d'information des règles */}
        {hintMessage && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-3.5 py-2 rounded-xl bg-slate-900/95 border border-cyan-500/60 text-cyan-200 text-xs font-medium shadow-2xl shadow-cyan-950/70 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-md max-w-[90vw]">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
            <span>{hintMessage}</span>
            <button
              onClick={() => setHintMessage(null)}
              className="ml-2 text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Plateau dynamique SVG */}
        <div className="w-full flex-1 flex items-center justify-center my-0.5 sm:my-1">
          <GameBoardSVG
            mode={gameState.mode}
            seats={gameState.seats}
            tokens={gameState.tokens}
            activeSeat={gameState.activeSeat}
            selectedTokenId={gameState.selectedTokenId}
            validMoves={validMovesForSelectedCard}
            onSelectToken={handleSelectToken}
            onExecuteMove={handleExecuteMove}
            jackFirstSelectedTokenId={gameState.jackFirstSelectedTokenId}
            onSelectJackTarget={handleSelectJackTarget}
            isMyTurn={isMyTurn}
            turnTimeLeft={turnTimeLeft}
            onInvalidTokenClick={handleInvalidTokenClick}
          />
        </div>

        {/* Barre de jeu : Main du joueur avec protection des tours et cartes adverses masquées */}
        <div className="w-full mt-1 sm:mt-2">
          <HandView
            cards={currentHand}
            activeSeat={gameState.activeSeat}
            displayedSeat={displayedSeat}
            seats={gameState.seats}
            mode={gameState.mode}
            tokens={gameState.tokens}
            selectedCardId={gameState.selectedCardId}
            selectedTokenId={gameState.selectedTokenId}
            split7Remaining={gameState.split7Remaining}
            jackFirstSelectedTokenId={gameState.jackFirstSelectedTokenId}
            validMovesForSelectedCard={validMovesForSelectedCard}
            localPlayerRole={localPlayerRole}
            isLocalGame={isLocalGame}
            turnTimeLeft={turnTimeLeft}
            onSelectCard={handleSelectCard}
            onDiscardCard={handleDiscardCard}
            onExecuteMove={handleExecuteMove}
          />
        </div>
      </main>

      {/* Modal d'échange de cartes en mode Classique */}
      {gameState.phase === 'CARD_SWAP' && (
        <CardSwapModal
          state={gameState}
          localPlayerRole={localPlayerRole}
          isLocalGame={isLocalGame}
          onConfirmSwaps={handleConfirmSwaps}
          onPartialSwapSubmit={handlePartialSwapSubmit}
        />
      )}

      {/* Modal du Guide des Règles */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      {/* Tiroir d'historique des coups */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={gameState.history}
        seats={gameState.seats}
      />

      {/* Modal de Victoire */}
      {gameState.phase === 'GAME_OVER' && gameState.winner && (
        <VictoryModal
          winner={gameState.winner}
          winningSeats={gameState.winningSeats}
          mode={gameState.mode}
          roundNumber={gameState.roundNumber}
          seats={gameState.seats}
          onPlayAgain={handleRestartMatch}
          onChooseMode={handleLeaveRoom}
        />
      )}
    </div>
  );
}

export default App;

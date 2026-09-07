import React from 'react';
import type {
  GameMode,
  MoveOption,
  Seat,
  SeatConfig,
  Token,
  TokenLocation,
} from '../game/types';
import type { BoardGeometryConfig, Point } from '../game/boardGeometry';
import {
  getBoardGeometry,
  getTokenCoordinates,
  getTrackAngle,
} from '../game/boardGeometry';

interface GameBoardSVGProps {
  mode: GameMode;
  seats: SeatConfig[];
  tokens: Record<string, Token>;
  activeSeat: Seat;
  selectedTokenId: string | null;
  validMoves: MoveOption[];
  onSelectToken: (tokenId: string) => void;
  onExecuteMove: (move: MoveOption) => void;
  jackFirstSelectedTokenId?: string | null;
  onSelectJackTarget?: (targetTokenId: string) => void;
  isMyTurn?: boolean;
  onInvalidTokenClick?: (token: Token) => void;
}

const COLOR_MAP: Record<string, { fill: string; stroke: string; glow: string; text: string }> = {
  blue: {
    fill: 'url(#token-grad-blue)',
    stroke: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.7)',
    text: '#7dd3fc',
  },
  red: {
    fill: 'url(#token-grad-red)',
    stroke: '#f87171',
    glow: 'rgba(248, 113, 113, 0.7)',
    text: '#fca5a5',
  },
  green: {
    fill: 'url(#token-grad-green)',
    stroke: '#4ade80',
    glow: 'rgba(74, 222, 128, 0.7)',
    text: '#86efac',
  },
  yellow: {
    fill: 'url(#token-grad-yellow)',
    stroke: '#facc15',
    glow: 'rgba(250, 204, 21, 0.7)',
    text: '#fde047',
  },
};

export const GameBoardSVG: React.FC<GameBoardSVGProps> = ({
  mode,
  seats,
  tokens,
  activeSeat,
  selectedTokenId,
  validMoves,
  onSelectToken,
  onExecuteMove,
  jackFirstSelectedTokenId,
  onSelectJackTarget,
  isMyTurn = true,
  onInvalidTokenClick,
}) => {
  const geometry: BoardGeometryConfig = React.useMemo(
    () => getBoardGeometry(mode),
    [mode]
  );

  // Map of tokenId -> list of moves available for that token
  const movesByTokenId = React.useMemo(() => {
    const map = new Map<string, MoveOption[]>();
    for (const move of validMoves) {
      const current = map.get(move.tokenId) || [];
      current.push(move);
      map.set(move.tokenId, current);
    }
    return map;
  }, [validMoves]);

  // Destination nodes that can be clicked for the currently selected token or for base exits
  const targetLocations = React.useMemo(() => {
    if (selectedTokenId) {
      return validMoves.filter(m => m.tokenId === selectedTokenId);
    }
    // Also show start square targets when a card that can exit base is selected
    return validMoves.filter(m => m.type === 'EXIT_BASE');
  }, [selectedTokenId, validMoves]);

  // Helper to check if a location is a target destination
  const getMoveForLocation = (location: TokenLocation): MoveOption | undefined => {
    if (selectedTokenId) {
      return targetLocations.find(m => {
        if (m.to.type !== location.type) return false;
        return m.to.index === location.index;
      });
    }
    // If no token selected yet, clicking the glowing start square triggers the EXIT_BASE move!
    return validMoves.find(
      m => m.type === 'EXIT_BASE' && m.to.type === location.type && m.to.index === location.index
    );
  };

  // Find token at a given location
  const getTokenAtLocation = (loc: TokenLocation, seat?: Seat): Token | undefined => {
    return Object.values(tokens).find(t => {
      if (t.location.type !== loc.type) return false;
      if (loc.type === 'TRACK') {
        return t.location.index === loc.index;
      }
      return t.seat === seat && t.location.index === loc.index;
    });
  };

  const getSeatColor = (seatId?: Seat) => {
    const seat = seats.find(s => s.id === seatId);
    return seat?.color || 'blue';
  };

  // State to animate moving tokens along the circular board track
  const [animatingPositions, setAnimatingPositions] = React.useState<Record<string, Point>>({});
  const prevTokensRef = React.useRef<Record<string, Token>>(tokens);

  React.useEffect(() => {
    const prev = prevTokensRef.current;
    prevTokensRef.current = tokens;

    // Identify tokens whose locations changed
    const movedTokens: Array<{
      id: string;
      prevLoc: TokenLocation;
      currLoc: TokenLocation;
      prevSeat: Seat;
      currSeat: Seat;
    }> = [];

    for (const [id, token] of Object.entries(tokens)) {
      const p = prev[id];
      if (
        p &&
        (p.location.type !== token.location.type || p.location.index !== token.location.index)
      ) {
        movedTokens.push({
          id,
          prevLoc: p.location,
          currLoc: token.location,
          prevSeat: p.seat,
          currSeat: token.seat,
        });
      }
    }

    if (movedTokens.length === 0) return;

    const startTime = performance.now();
    const duration = 460; // ms

    let animFrameId: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // smooth easeOutCubic

      const newPositions: Record<string, Point> = {};

      for (const item of movedTokens) {
        const fromCoords = getTokenCoordinates(item.prevLoc, item.prevSeat, geometry);
        const toCoords = getTokenCoordinates(item.currLoc, item.currSeat, geometry);

        if (item.prevLoc.type === 'TRACK' && item.currLoc.type === 'TRACK') {
          const total = geometry.totalTrackNodes;
          const fromAngle = getTrackAngle(item.prevLoc.index, mode);
          const toAngle = getTrackAngle(item.currLoc.index, mode);
          const isBackward = (item.prevLoc.index - item.currLoc.index + total) % total === 4;

          let diffAngle = toAngle - fromAngle;
          if (isBackward) {
            while (diffAngle > 0) diffAngle -= 2 * Math.PI;
          } else {
            while (diffAngle < 0) diffAngle += 2 * Math.PI;
            if (diffAngle === 0) diffAngle = 2 * Math.PI;
          }

          const angle = fromAngle + eased * diffAngle;
          newPositions[item.id] = {
            x: Math.round((geometry.center.x + geometry.trackRadius * Math.cos(angle)) * 10) / 10,
            y: Math.round((geometry.center.y + geometry.trackRadius * Math.sin(angle)) * 10) / 10,
          };
        } else if (item.prevLoc.type === 'TRACK' && item.currLoc.type === 'HOME') {
          const seatCfg = seats.find(s => s.id === item.currSeat);
          const preHomeIdx = seatCfg?.homePreIndex ?? 0;
          const fromAngle = getTrackAngle(item.prevLoc.index, mode);
          const preHomeAngle = getTrackAngle(preHomeIdx, mode);
          let diffAngle = preHomeAngle - fromAngle;
          while (diffAngle < 0) diffAngle += 2 * Math.PI;

          const preHomeCoords = {
            x: geometry.center.x + geometry.trackRadius * Math.cos(preHomeAngle),
            y: geometry.center.y + geometry.trackRadius * Math.sin(preHomeAngle),
          };

          if (eased < 0.6) {
            const trackEased = eased / 0.6;
            const angle = fromAngle + trackEased * diffAngle;
            newPositions[item.id] = {
              x: Math.round((geometry.center.x + geometry.trackRadius * Math.cos(angle)) * 10) / 10,
              y: Math.round((geometry.center.y + geometry.trackRadius * Math.sin(angle)) * 10) / 10,
            };
          } else {
            const homeEased = (eased - 0.6) / 0.4;
            newPositions[item.id] = {
              x: Math.round((preHomeCoords.x + homeEased * (toCoords.x - preHomeCoords.x)) * 10) / 10,
              y: Math.round((preHomeCoords.y + homeEased * (toCoords.y - preHomeCoords.y)) * 10) / 10,
            };
          }
        } else {
          newPositions[item.id] = {
            x: Math.round((fromCoords.x + eased * (toCoords.x - fromCoords.x)) * 10) / 10,
            y: Math.round((fromCoords.y + eased * (toCoords.y - fromCoords.y)) * 10) / 10,
          };
        }
      }

      setAnimatingPositions(newPositions);

      if (progress < 1) {
        animFrameId = requestAnimationFrame(animate);
      } else {
        setAnimatingPositions({});
      }
    };

    animFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [tokens, geometry, mode, seats]);

  return (
    <div className="w-full flex items-center justify-center relative select-none touch-none">
      <svg
        viewBox={`0 0 ${geometry.viewBoxSize} ${geometry.viewBoxSize}`}
        className="w-full max-w-[100vw] sm:max-w-[660px] lg:max-w-[740px] max-h-[62vh] sm:max-h-[68vh] aspect-square drop-shadow-2xl overflow-visible touch-none"
      >
        <defs>
          {/* Radial Board Glow */}
          <radialGradient id="board-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#111827" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#0b0f19" stopOpacity="0.98" />
            <stop offset="100%" stopColor="#06080e" stopOpacity="1" />
          </radialGradient>

          {/* Token 3D Gradients */}
          <radialGradient id="token-grad-blue" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="40%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#034d75" />
          </radialGradient>

          <radialGradient id="token-grad-red" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="40%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </radialGradient>

          <radialGradient id="token-grad-green" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="40%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#14532d" />
          </radialGradient>

          <radialGradient id="token-grad-yellow" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#713f12" />
          </radialGradient>

          {/* Filters for neon glows */}
          <filter id="glow-blue" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="glow-target" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Central Circular Board Plate (Le plateau de jeu en cercle distinct) */}
        <circle
          cx={geometry.center.x}
          cy={geometry.center.y}
          r="360"
          fill="url(#board-bg)"
          stroke="#334155"
          strokeWidth="3"
        />
        <circle
          cx={geometry.center.x}
          cy={geometry.center.y}
          r="356"
          fill="none"
          stroke="#1e293b"
          strokeWidth="1.5"
        />

        {/* Outer decorative track guide ring */}
        <circle
          cx={geometry.center.x}
          cy={geometry.center.y}
          r={geometry.trackRadius}
          fill="none"
          stroke="#1e293b"
          strokeWidth="28"
          strokeOpacity="0.4"
        />
        <circle
          cx={geometry.center.x}
          cy={geometry.center.y}
          r={geometry.trackRadius}
          fill="none"
          stroke="#334155"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          strokeOpacity="0.6"
        />

        {/* Center Emblem / Compass */}
        <g opacity="0.15">
          <circle
            cx={geometry.center.x}
            cy={geometry.center.y}
            r="110"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1={geometry.center.x - 120}
            y1={geometry.center.y}
            x2={geometry.center.x + 120}
            y2={geometry.center.y}
            stroke="#94a3b8"
            strokeWidth="1"
          />
          <line
            x1={geometry.center.x}
            y1={geometry.center.y - 120}
            x2={geometry.center.x}
            y2={geometry.center.y + 120}
            stroke="#94a3b8"
            strokeWidth="1"
          />
        </g>

        {/* Center Mode Title */}
        <text
          x={geometry.center.x}
          y={geometry.center.y - 8}
          textAnchor="middle"
          fill="#64748b"
          fontSize="14"
          fontWeight="bold"
          letterSpacing="4"
          className="font-display uppercase"
        >
          {mode === 'PURE_DUEL' ? 'PURE DUEL' : 'CLASSIQUE'}
        </text>
        <text
          x={geometry.center.x}
          y={geometry.center.y + 12}
          textAnchor="middle"
          fill="#475569"
          fontSize="10"
          letterSpacing="2"
          className="uppercase"
        >
          {mode === 'PURE_DUEL' ? '32 Cases • 1v1' : '64 Cases • 4 Sièges'}
        </text>

        {/* HOME RUNWAYS FOR EACH SEAT */}
        {seats.map(seat => {
          const homePoints = geometry.homeSlots[seat.id] || [];
          if (homePoints.length === 0) return null;
          const colorStyles = COLOR_MAP[seat.color];

          return (
            <g key={`home-group-${seat.id}`}>
              {/* Runway track line */}
              <polyline
                points={homePoints.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={colorStyles.stroke}
                strokeWidth="4"
                strokeOpacity="0.25"
                strokeLinecap="round"
              />

              {/* 4 Home Slots */}
              {homePoints.map((point, slotIndex) => {
                const location: TokenLocation = { type: 'HOME', index: slotIndex };
                const tokenAtSlot = getTokenAtLocation(location, seat.id);
                const matchingMove = getMoveForLocation(location);
                const isTarget = Boolean(matchingMove);

                return (
                  <g
                    key={`home-slot-${seat.id}-${slotIndex}`}
                    className={isMyTurn && isTarget ? 'cursor-pointer' : ''}
                    onClick={() => {
                      if (isMyTurn && matchingMove) onExecuteMove(matchingMove);
                    }}
                  >
                    {/* Target highlight glow */}
                    {isTarget && (
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="22"
                        fill="#22d3ee"
                        fillOpacity="0.25"
                        stroke="#22d3ee"
                        strokeWidth="2.5"
                        filter="url(#glow-target)"
                      >
                        <animate
                          attributeName="r"
                          values="18;23;18"
                          dur="1.2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="stroke-opacity"
                          values="1;0.4;1"
                          dur="1.2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    {/* Slot socket */}
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="18"
                      fill="#0b0f19"
                      stroke={isTarget ? '#22d3ee' : colorStyles.stroke}
                      strokeWidth={isTarget ? '2.5' : '1.5'}
                      strokeOpacity={isTarget ? '1' : '0.6'}
                    />

                    {/* Slot number inside */}
                    {!tokenAtSlot && (
                      <text
                        x={point.x}
                        y={point.y + 4}
                        textAnchor="middle"
                        fill={colorStyles.text}
                        fontSize="11"
                        fontWeight="600"
                        opacity="0.6"
                      >
                        {slotIndex + 1}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* MAIN TRACK NODES */}
        {geometry.trackNodes.map(node => {
          const location: TokenLocation = { type: 'TRACK', index: node.index };
          const matchingMove = getMoveForLocation(location);
          const isTarget = Boolean(matchingMove);
          const ownerColor = node.seatOwner ? getSeatColor(node.seatOwner) : null;
          const ownerStyles = ownerColor ? COLOR_MAP[ownerColor] : null;

          return (
            <g
              key={`track-node-${node.index}`}
              className={isMyTurn && isTarget ? 'cursor-pointer' : ''}
              onClick={() => {
                if (isMyTurn && matchingMove) onExecuteMove(matchingMove);
              }}
            >
              {/* Target pulse ring */}
              {isTarget && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="20"
                  fill="#22d3ee"
                  fillOpacity="0.25"
                  stroke="#22d3ee"
                  strokeWidth="2.5"
                  filter="url(#glow-target)"
                >
                  <animate
                    attributeName="r"
                    values="16;22;16"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="stroke-opacity"
                    values="1;0.4;1"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Base node socket */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.isStartNode ? 18 : 14}
                fill={node.isStartNode ? '#1e293b' : '#0f172a'}
                stroke={
                  isTarget
                    ? '#22d3ee'
                    : node.isStartNode && ownerStyles
                    ? ownerStyles.stroke
                    : '#334155'
                }
                strokeWidth={isTarget ? 3 : node.isStartNode ? 2.5 : 1.5}
                strokeDasharray={node.isPreHomeNode && !isTarget ? '3 3' : undefined}
              />

              {/* Start node accent dot / icon */}
              {node.isStartNode && ownerStyles && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="6"
                  fill={ownerStyles.stroke}
                  opacity="0.8"
                />
              )}
            </g>
          );
        })}

        {/* BASE PODS (Corner or Radial clusters for 4 tokens) */}
        {seats.map(seat => {
          const basePoints = geometry.baseSlots[seat.id] || [];
          if (basePoints.length === 0) return null;
          const colorStyles = COLOR_MAP[seat.color];
          const isCurrentActive = seat.id === activeSeat;

          // Compute pod bounding center
          const minX = Math.min(...basePoints.map(p => p.x)) - 30;
          const maxX = Math.max(...basePoints.map(p => p.x)) + 30;
          const minY = Math.min(...basePoints.map(p => p.y)) - 30;
          const maxY = Math.max(...basePoints.map(p => p.y)) + 30;
          const width = maxX - minX;
          const height = maxY - minY;

          return (
            <g key={`base-pod-${seat.id}`}>
              {/* Pod container panel (Réserve extérieure au plateau) */}
              <rect
                x={minX}
                y={minY}
                width={width}
                height={height}
                rx="22"
                fill="#070b14"
                fillOpacity="0.95"
                stroke={isCurrentActive ? colorStyles.stroke : '#1e293b'}
                strokeWidth={isCurrentActive ? 2.5 : 1.5}
                strokeOpacity={isCurrentActive ? 1 : 0.6}
              />

              {/* Pod Seat Title */}
              <text
                x={minX + width / 2}
                y={minY - 8}
                textAnchor="middle"
                fill={colorStyles.stroke}
                fontSize="10"
                fontWeight="900"
                letterSpacing="1.2"
                className="font-display"
              >
                RÉSERVE • {seat.name.toUpperCase()}
              </text>

              {/* 4 Base Slots */}
              {basePoints.map((point, slotIndex) => {
                return (
                  <circle
                    key={`base-slot-${seat.id}-${slotIndex}`}
                    cx={point.x}
                    cy={point.y}
                    r="17"
                    fill="#080c14"
                    stroke={colorStyles.stroke}
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                  />
                );
              })}
            </g>
          );
        })}

        {/* TOKENS LAYER (Render on top of all track and home nodes) */}
        {Object.values(tokens).map(token => {
          const coords = getTokenCoordinates(token.location, token.seat, geometry);
          const animated = animatingPositions[token.id];
          const renderX = animated ? animated.x : coords.x;
          const renderY = animated ? animated.y : coords.y;

          const colorStyles = COLOR_MAP[token.color] || COLOR_MAP.blue;
          const moves = movesByTokenId.get(token.id) || [];
          const hasAvailableMoves = moves.length > 0;
          const isSelected = token.id === selectedTokenId;
          const isJackTargetSelectable =
            Boolean(jackFirstSelectedTokenId) &&
            token.location.type === 'TRACK' &&
            token.id !== jackFirstSelectedTokenId;

          return (
            <g
              key={`token-${token.id}`}
              transform={`translate(${renderX}, ${renderY})`}
              className={isMyTurn ? 'cursor-pointer' : ''}
              onClick={() => {
                if (!isMyTurn) return;
                if (isJackTargetSelectable && onSelectJackTarget) {
                  onSelectJackTarget(token.id);
                } else if (hasAvailableMoves) {
                  const tokenMoves = movesByTokenId.get(token.id) || [];
                  if (tokenMoves.length === 1) {
                    onExecuteMove(tokenMoves[0]);
                  } else {
                    onSelectToken(token.id);
                  }
                } else if (onInvalidTokenClick) {
                  onInvalidTokenClick(token);
                }
              }}
            >
              {/* Selected / Active Aura */}
              {isSelected && (
                <circle
                  cx={0}
                  cy={0}
                  r="22"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  filter="url(#glow-target)"
                >
                  <animate
                    attributeName="r"
                    values="20;23;20"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="stroke-opacity"
                    values="1;0.5;1"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Has available moves rotating dash ring - pure SVG stroke-dashoffset, no CSS transform displacement */}
              {hasAvailableMoves && !isSelected && (
                <circle
                  cx={0}
                  cy={0}
                  r="20"
                  fill="none"
                  stroke={colorStyles.stroke}
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  opacity="0.85"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="20"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Jack Target swap indicator */}
              {isJackTargetSelectable && (
                <circle
                  cx={0}
                  cy={0}
                  r="22"
                  fill="none"
                  stroke="#facc15"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity="0.9"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="16"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Token Main Body with 3D gradient */}
              <circle
                cx={0}
                cy={0}
                r="17"
                fill={colorStyles.fill}
                stroke={isSelected ? '#ffffff' : colorStyles.stroke}
                strokeWidth={isSelected ? 2.5 : 1.5}
                filter={`drop-shadow(0 4px 6px ${colorStyles.glow})`}
              />

              {/* Specular 3D highlight */}
              <ellipse
                cx={-5}
                cy={-5}
                rx="6"
                ry="3.5"
                fill="#ffffff"
                fillOpacity="0.4"
              />

              {/* Token Number/Letter Label */}
              <text
                x={0}
                y={4}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10.5"
                fontWeight="bold"
                className="pointer-events-none drop-shadow-sm font-sans"
              >
                {token.tokenIndex + 1}
              </text>

              {/* Quick Action Choices if selected token has multiple moves */}
              {isSelected && isMyTurn && moves.length > 1 && (
                <g transform="translate(0, -32)" className="select-none">
                  {moves.map((m, idx) => {
                    const label =
                      m.type === 'EXIT_BASE' ? 'Départ' : m.steps > 0 ? `+${m.steps}` : `${m.steps}`;
                    const btnWidth = Math.max(38, label.length * 8 + 16);
                    const gap = 6;
                    const totalW = moves.length * btnWidth + (moves.length - 1) * gap;
                    const startX = -totalW / 2 + idx * (btnWidth + gap) + btnWidth / 2;
                    return (
                      <g
                        key={`quick-choice-${idx}`}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onExecuteMove(m);
                        }}
                      >
                        <rect
                          x={startX - btnWidth / 2}
                          y={-13}
                          width={btnWidth}
                          height={26}
                          rx={8}
                          fill="#06b6d4"
                          stroke="#ffffff"
                          strokeWidth={1.5}
                          filter="drop-shadow(0 4px 6px rgba(6, 182, 212, 0.5))"
                        />
                        <text
                          x={startX}
                          y={3.5}
                          textAnchor="middle"
                          fill="#080c14"
                          fontSize="11"
                          fontWeight="900"
                          className="pointer-events-none font-display"
                        >
                          {label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

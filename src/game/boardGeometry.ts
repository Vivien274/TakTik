import type { GameMode, Seat, TokenLocation } from './types';

export interface Point {
  x: number;
  y: number;
}

export interface TrackNodeInfo {
  index: number;
  x: number;
  y: number;
  isStartNode?: boolean;
  seatOwner?: Seat;
  isPreHomeNode?: boolean;
  label?: string;
}

export interface BoardGeometryConfig {
  viewBoxSize: number;
  center: Point;
  trackRadius: number;
  totalTrackNodes: number;
  trackNodes: TrackNodeInfo[];
  homeSlots: Record<Seat, Point[]>;
  baseSlots: Record<Seat, Point[]>;
}

export function getTrackAngle(index: number, mode: GameMode): number {
  if (mode === 'PURE_DUEL') {
    return Math.PI / 2 + (index * 2 * Math.PI) / 32;
  }
  return -Math.PI / 2 + (index * 2 * Math.PI) / 64;
}

export function getBoardGeometry(mode: GameMode): BoardGeometryConfig {
  const viewBoxSize = 960;
  const center: Point = { x: 480, y: 480 };
  const trackRadius = 300;

  if (mode === 'PURE_DUEL') {
    const totalTrackNodes = 32;
    const trackNodes: TrackNodeInfo[] = [];

    // P1 (Blue): Starts at bottom (index 0, angle 90 deg / math angle PI/2)
    // P2 (Red): Starts at top (index 16, angle 270 deg / math angle 3PI/2)
    for (let i = 0; i < totalTrackNodes; i++) {
      // Clockwise angle: start at bottom (PI/2), increase by (2*PI / 32)
      const angle = getTrackAngle(i, 'PURE_DUEL');
      const x = center.x + trackRadius * Math.cos(angle);
      const y = center.y + trackRadius * Math.sin(angle);

      let isStartNode = false;
      let seatOwner: Seat | undefined;
      let isPreHomeNode = false;

      if (i === 0) {
        isStartNode = true;
        seatOwner = 'P1';
      } else if (i === 16) {
        isStartNode = true;
        seatOwner = 'P2';
      }

      if (i === 31) {
        isPreHomeNode = true;
      } else if (i === 15) {
        isPreHomeNode = true;
      }

      trackNodes.push({
        index: i,
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        isStartNode,
        seatOwner,
        isPreHomeNode,
        label: `${i + 1}`,
      });
    }

    // Home slots: 4 slots running radially inward toward center
    const homeSlots: Record<Seat, Point[]> = {
      P1: [
        { x: center.x, y: center.y + trackRadius - 50 },
        { x: center.x, y: center.y + trackRadius - 95 },
        { x: center.x, y: center.y + trackRadius - 140 },
        { x: center.x, y: center.y + trackRadius - 185 },
      ],
      P2: [
        { x: center.x, y: center.y - trackRadius + 50 },
        { x: center.x, y: center.y - trackRadius + 95 },
        { x: center.x, y: center.y - trackRadius + 140 },
        { x: center.x, y: center.y - trackRadius + 185 },
      ],
      NORTH: [],
      EAST: [],
      SOUTH: [],
      WEST: [],
    };

    // Base pods en ligne droite près du pieu (case de départ), bien éloignées du plateau :
    // P1 : En ligne horizontale en bas près du pieu P1 (x=480, y=780)
    // P2 : En ligne horizontale en haut près du pieu P2 (x=480, y=180)
    const baseSlots: Record<Seat, Point[]> = {
      P1: [
        { x: 375, y: 890 },
        { x: 445, y: 890 },
        { x: 515, y: 890 },
        { x: 585, y: 890 },
      ],
      P2: [
        { x: 375, y: 70 },
        { x: 445, y: 70 },
        { x: 515, y: 70 },
        { x: 585, y: 70 },
      ],
      NORTH: [],
      EAST: [],
      SOUTH: [],
      WEST: [],
    };

    return {
      viewBoxSize,
      center,
      trackRadius,
      totalTrackNodes,
      trackNodes,
      homeSlots,
      baseSlots,
    };
  }

  // TWO_HANDED_CLASSIC: 64 nodes
  const totalTrackNodes = 64;
  const trackNodes: TrackNodeInfo[] = [];

  // North start: index 0 at top (angle = -PI/2)
  // East start: index 16 at right (angle = 0)
  // South start: index 32 at bottom (angle = PI/2)
  // West start: index 48 at left (angle = PI)
  for (let i = 0; i < totalTrackNodes; i++) {
    const angle = getTrackAngle(i, 'TWO_HANDED_CLASSIC');
    const x = center.x + trackRadius * Math.cos(angle);
    const y = center.y + trackRadius * Math.sin(angle);

    let isStartNode = false;
    let seatOwner: Seat | undefined;
    let isPreHomeNode = false;

    if (i === 0) {
      isStartNode = true;
      seatOwner = 'NORTH';
    } else if (i === 16) {
      isStartNode = true;
      seatOwner = 'EAST';
    } else if (i === 32) {
      isStartNode = true;
      seatOwner = 'SOUTH';
    } else if (i === 48) {
      isStartNode = true;
      seatOwner = 'WEST';
    }

    if (i === 63 || i === 15 || i === 31 || i === 47) {
      isPreHomeNode = true;
    }

    trackNodes.push({
      index: i,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      isStartNode,
      seatOwner,
      isPreHomeNode,
      label: `${i + 1}`,
    });
  }

  // Home slots for 4 seats running inward toward center
  const homeSlots: Record<Seat, Point[]> = {
    NORTH: [
      { x: center.x, y: center.y - trackRadius + 50 },
      { x: center.x, y: center.y - trackRadius + 95 },
      { x: center.x, y: center.y - trackRadius + 140 },
      { x: center.x, y: center.y - trackRadius + 185 },
    ],
    EAST: [
      { x: center.x + trackRadius - 50, y: center.y },
      { x: center.x + trackRadius - 95, y: center.y },
      { x: center.x + trackRadius - 140, y: center.y },
      { x: center.x + trackRadius - 185, y: center.y },
    ],
    SOUTH: [
      { x: center.x, y: center.y + trackRadius - 50 },
      { x: center.x, y: center.y + trackRadius - 95 },
      { x: center.x, y: center.y + trackRadius - 140 },
      { x: center.x, y: center.y + trackRadius - 185 },
    ],
    WEST: [
      { x: center.x - trackRadius + 50, y: center.y },
      { x: center.x - trackRadius + 95, y: center.y },
      { x: center.x - trackRadius + 140, y: center.y },
      { x: center.x - trackRadius + 185, y: center.y },
    ],
    P1: [],
    P2: [],
  };

  // Base reserve pods en ligne droite près de chaque pieu (départ), bien éloignées du plateau :
  // North: En ligne horizontale en haut près du pieu Nord (x=480, y=180)
  // South: En ligne horizontale en bas près du pieu Sud (x=480, y=780)
  // East: En ligne verticale à droite près du pieu Est (x=780, y=480)
  // West: En ligne verticale à gauche près du pieu Ouest (x=180, y=480)
  const baseSlots: Record<Seat, Point[]> = {
    NORTH: [
      { x: 375, y: 70 },
      { x: 445, y: 70 },
      { x: 515, y: 70 },
      { x: 585, y: 70 },
    ],
    EAST: [
      { x: 890, y: 375 },
      { x: 890, y: 445 },
      { x: 890, y: 515 },
      { x: 890, y: 585 },
    ],
    SOUTH: [
      { x: 375, y: 890 },
      { x: 445, y: 890 },
      { x: 515, y: 890 },
      { x: 585, y: 890 },
    ],
    WEST: [
      { x: 70, y: 375 },
      { x: 70, y: 445 },
      { x: 70, y: 515 },
      { x: 70, y: 585 },
    ],
    P1: [],
    P2: [],
  };

  return {
    viewBoxSize,
    center,
    trackRadius,
    totalTrackNodes,
    trackNodes,
    homeSlots,
    baseSlots,
  };
}

export function getTokenCoordinates(
  location: TokenLocation,
  seat: Seat,
  geometry: BoardGeometryConfig
): Point {
  if (location.type === 'BASE') {
    const slots = geometry.baseSlots[seat] || [];
    return slots[location.index] || geometry.center;
  }
  if (location.type === 'HOME') {
    const slots = geometry.homeSlots[seat] || [];
    return slots[location.index] || geometry.center;
  }
  // TRACK
  const node = geometry.trackNodes[location.index];
  return node ? { x: node.x, y: node.y } : geometry.center;
}

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

export function getBoardGeometry(mode: GameMode): BoardGeometryConfig {
  const viewBoxSize = 900;
  const center: Point = { x: 450, y: 450 };
  const trackRadius = 330;

  if (mode === 'PURE_DUEL') {
    const totalTrackNodes = 32;
    const trackNodes: TrackNodeInfo[] = [];

    // P1 (Blue): Starts at bottom (index 0, angle 90 deg / math angle PI/2)
    // P2 (Red): Starts at top (index 16, angle 270 deg / math angle 3PI/2)
    for (let i = 0; i < totalTrackNodes; i++) {
      // Clockwise angle: start at bottom (PI/2), increase by (2*PI / 32)
      const angle = Math.PI / 2 + (i * 2 * Math.PI) / totalTrackNodes;
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
    // P1 Home runs from bottom (y=780) towards center (y=450)
    const homeSlots: Record<Seat, Point[]> = {
      P1: [
        { x: center.x, y: center.y + trackRadius - 55 },
        { x: center.x, y: center.y + trackRadius - 105 },
        { x: center.x, y: center.y + trackRadius - 155 },
        { x: center.x, y: center.y + trackRadius - 205 },
      ],
      P2: [
        { x: center.x, y: center.y - trackRadius + 55 },
        { x: center.x, y: center.y - trackRadius + 105 },
        { x: center.x, y: center.y - trackRadius + 155 },
        { x: center.x, y: center.y - trackRadius + 205 },
      ],
      NORTH: [],
      EAST: [],
      SOUTH: [],
      WEST: [],
    };

    // Base pods: 4 slots arranged in 2x2 grid
    // P1 Base pod near bottom-right
    const baseSlots: Record<Seat, Point[]> = {
      P1: [
        { x: center.x + 220, y: center.y + 240 },
        { x: center.x + 270, y: center.y + 240 },
        { x: center.x + 220, y: center.y + 290 },
        { x: center.x + 270, y: center.y + 290 },
      ],
      P2: [
        { x: center.x - 270, y: center.y - 290 },
        { x: center.x - 220, y: center.y - 290 },
        { x: center.x - 270, y: center.y - 240 },
        { x: center.x - 220, y: center.y - 240 },
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
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / totalTrackNodes;
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

  // Base pods in the 4 corners:
  // North (Top-Left corner)
  // East (Top-Right corner)
  // South (Bottom-Right corner)
  // West (Bottom-Left corner)
  const baseSlots: Record<Seat, Point[]> = {
    NORTH: [
      { x: center.x - 260, y: center.y - 260 },
      { x: center.x - 215, y: center.y - 260 },
      { x: center.x - 260, y: center.y - 215 },
      { x: center.x - 215, y: center.y - 215 },
    ],
    EAST: [
      { x: center.x + 215, y: center.y - 260 },
      { x: center.x + 260, y: center.y - 260 },
      { x: center.x + 215, y: center.y - 215 },
      { x: center.x + 260, y: center.y - 215 },
    ],
    SOUTH: [
      { x: center.x + 215, y: center.y + 215 },
      { x: center.x + 260, y: center.y + 215 },
      { x: center.x + 215, y: center.y + 260 },
      { x: center.x + 260, y: center.y + 260 },
    ],
    WEST: [
      { x: center.x - 260, y: center.y + 215 },
      { x: center.x - 215, y: center.y + 215 },
      { x: center.x - 260, y: center.y + 260 },
      { x: center.x - 215, y: center.y + 260 },
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

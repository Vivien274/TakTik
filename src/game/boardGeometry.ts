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
  const viewBoxSize = 900;
  const center: Point = { x: 450, y: 450 };
  const trackRadius = 355;

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

    // Base pods: 4 slots in the corners outside the circular board
    // P1 Base reserve pod in bottom-right corner (outside board disc)
    // P2 Base reserve pod in top-left corner (outside board disc)
    const baseSlots: Record<Seat, Point[]> = {
      P1: [
        { x: 735, y: 735 },
        { x: 785, y: 735 },
        { x: 735, y: 785 },
        { x: 785, y: 785 },
      ],
      P2: [
        { x: 115, y: 115 },
        { x: 165, y: 115 },
        { x: 115, y: 165 },
        { x: 165, y: 165 },
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

  // Base reserve pods in the 4 corners (completely outside the circular board)
  // North: Top-Left corner
  // East: Top-Right corner
  // South: Bottom-Right corner
  // West: Bottom-Left corner
  const baseSlots: Record<Seat, Point[]> = {
    NORTH: [
      { x: 115, y: 115 },
      { x: 165, y: 115 },
      { x: 115, y: 165 },
      { x: 165, y: 165 },
    ],
    EAST: [
      { x: 735, y: 115 },
      { x: 785, y: 115 },
      { x: 735, y: 165 },
      { x: 785, y: 165 },
    ],
    SOUTH: [
      { x: 735, y: 735 },
      { x: 785, y: 735 },
      { x: 735, y: 785 },
      { x: 785, y: 785 },
    ],
    WEST: [
      { x: 115, y: 735 },
      { x: 165, y: 735 },
      { x: 115, y: 785 },
      { x: 165, y: 785 },
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

export enum TreeState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED'
}

export interface DualPosition {
  chaos: [number, number, number];
  target: [number, number, number];
}

export interface OrnamentData {
  id: number;
  type: 'ball' | 'gift' | 'light';
  color: string;
  positions: DualPosition;
  scale: number;
  speed: number; // Physics weight factor for interpolation
}
export type BallColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'cyan' | 'orange';

export interface Position {
  x: number;
  y: number;
}

export interface Cell {
  position: Position;
  ball: BallColor | null;
}

export interface GameState {
  grid: Cell[][];
  score: number;
  nextBalls: BallColor[];
  nextBallPositions: Position[];
  selectedBall: Position | null;
  isGameOver: boolean;
}

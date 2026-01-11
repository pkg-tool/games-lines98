import type { BallColor, Position, Cell } from '../types/game';

export const GRID_SIZE = 9;
export const MIN_LINE_LENGTH = 5;
export const COLORS: BallColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'cyan', 'orange'];

export const createEmptyGrid = (): Cell[][] => {
  const grid: Cell[][] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      row.push({ position: { x, y }, ball: null });
    }
    grid.push(row);
  }
  return grid;
};

export const getRandomColors = (count: number): BallColor[] => {
  return Array.from({ length: count }, () => COLORS[Math.floor(Math.random() * COLORS.length)]);
};

export const getEmptyCells = (grid: Cell[][]): Position[] => {
  const emptyCells: Position[] = [];
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (!cell.ball) {
        emptyCells.push({ x, y });
      }
    });
  });
  return emptyCells;
};

export const getRandomPositions = (grid: Cell[][], count: number): Position[] => {
  const emptyCells = getEmptyCells(grid);
  const positions: Position[] = [];
  for (let i = 0; i < count; i++) {
    if (emptyCells.length === 0) break;
    const index = Math.floor(Math.random() * emptyCells.length);
    positions.push(emptyCells.splice(index, 1)[0]);
  }
  return positions;
};

export const findPath = (grid: Cell[][], start: Position, end: Position): Position[] | null => {
  if (grid[end.y][end.x].ball) return null;

  const queue: Position[] = [start];
  const cameFrom = new Map<string, Position>();
  const visited = new Set<string>();
  const startKey = `${start.x},${start.y}`;
  visited.add(startKey);

  const directions = [
    { x: 0, y: 1 },
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: -1, y: 0 },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.x === end.x && current.y === end.y) {
      const path: Position[] = [];
      let curr: Position | undefined = end;
      while (curr) {
        path.unshift(curr);
        const key = `${curr.x},${curr.y}`;
        curr = cameFrom.get(key);
      }
      return path;
    }

    for (const dir of directions) {
      const next = { x: current.x + dir.x, y: current.y + dir.y };
      const nextKey = `${next.x},${next.y}`;

      if (
        next.x >= 0 && next.x < GRID_SIZE &&
        next.y >= 0 && next.y < GRID_SIZE &&
        !grid[next.y][next.x].ball &&
        !visited.has(nextKey)
      ) {
        visited.add(nextKey);
        cameFrom.set(nextKey, current);
        queue.push(next);
      }
    }
  }

  return null;
};

export const checkLines = (grid: Cell[][], lastMove: Position): Position[] => {
  const color = grid[lastMove.y][lastMove.x].ball;
  if (!color) return [];

  const directions = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 1, y: -1 },
  ];

  const ballsToRemove: Position[] = [];

  for (const dir of directions) {
    const line = [lastMove];

    [1, -1].forEach(sign => {
      let curr = { x: lastMove.x + dir.x * sign, y: lastMove.y + dir.y * sign };
      while (
        curr.x >= 0 && curr.x < GRID_SIZE &&
        curr.y >= 0 && curr.y < GRID_SIZE &&
        grid[curr.y][curr.x].ball === color
      ) {
        line.push({ ...curr });
        curr = { x: curr.x + dir.x * sign, y: curr.y + dir.y * sign };
      }
    });

    if (line.length >= MIN_LINE_LENGTH) {
      line.forEach(pos => {
        if (!ballsToRemove.some(p => p.x === pos.x && p.y === pos.y)) {
          ballsToRemove.push(pos);
        }
      });
    }
  }

  return ballsToRemove;
};

// --- Improved AI / Hint Logic ---

const getReachableCells = (grid: Cell[][], start: Position): Position[] => {
  const reachable: Position[] = [];
  const queue: Position[] = [start];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  const directions = [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.x !== start.x || current.y !== start.y) {
      reachable.push(current);
    }

    for (const dir of directions) {
      const next = { x: current.x + dir.x, y: current.y + dir.y };
      const key = `${next.x},${next.y}`;
      
      if (
        next.x >= 0 && next.x < GRID_SIZE &&
        next.y >= 0 && next.y < GRID_SIZE &&
        !grid[next.y][next.x].ball &&
        !visited.has(key)
      ) {
        visited.add(key);
        queue.push(next);
      }
    }
  }
  return reachable;
};

// Evaluate the value of a ball at a specific position
// High value = contributes to long lines with open ends
const calculatePositionValue = (grid: Cell[][], pos: Position, color: BallColor): number => {
  const directions = [
    { x: 1, y: 0 },  // H
    { x: 0, y: 1 },  // V
    { x: 1, y: 1 },  // D1
    { x: 1, y: -1 }, // D2
  ];

  let totalValue = 0;

  for (const dir of directions) {
    let consecutive = 1;
    let openEnds = 0;
    let space = 1; // Current ball

    // Scan in both directions for this vector
    [1, -1].forEach(sign => {
      let k = 1;
      let blocked = false;
      while (true) {
        const cx = pos.x + dir.x * sign * k;
        const cy = pos.y + dir.y * sign * k;

        if (cx < 0 || cx >= GRID_SIZE || cy < 0 || cy >= GRID_SIZE) {
          // Wall
          break;
        }

        const cell = grid[cy][cx];
        
        if (cell.ball === color && !blocked) {
          consecutive++;
          space++;
        } else if (cell.ball === null) {
          if (!blocked) openEnds++; // First empty space counts as open end
          blocked = true; // Stop counting consecutive, but count space
          space++;
        } else {
          // Different color ball - hard stop
          break;
        }
        k++;
      }
    });

    if (consecutive >= MIN_LINE_LENGTH) {
      return 10000; // Immediate win - huge value
    }

    // Only value lines that HAVE POTENTIAL to become 5
    if (space >= MIN_LINE_LENGTH) {
      // Exponential weight for length: 2->4, 3->9, 4->16
      let lineValue = Math.pow(consecutive, 2.5);
      
      // Bonus for open ends (easier to fill)
      if (openEnds > 0) lineValue += openEnds * 2;
      
      totalValue += lineValue;
    }
  }

  return totalValue;
};

export const findBestMove = (grid: Cell[][]): { from: Position, to: Position, path: Position[] } | null => {
  const balls: { pos: Position, color: BallColor }[] = [];
  
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell.ball) {
        balls.push({ pos: { x, y }, color: cell.ball });
      }
    });
  });

  let bestMove = null;
  let maxNetGain = -Infinity; // Can be negative if no good moves

  for (const ball of balls) {
    // 1. Calculate value BEFORE move (what we lose by moving this ball)
    const valueBefore = calculatePositionValue(grid, ball.pos, ball.color);

    const reachable = getReachableCells(grid, ball.pos);
    
    for (const target of reachable) {
      // 2. Simulate move
      const originalTargetBall = grid[target.y][target.x].ball;
      const originalSourceBall = grid[ball.pos.y][ball.pos.x].ball;
      
      grid[target.y][target.x].ball = ball.color;
      grid[ball.pos.y][ball.pos.x].ball = null;

      // 3. Calculate value AFTER move (what we gain)
      // Check if we formed a line (Instant score check logic)
      // Note: calculatePositionValue returns 10000 for completed lines, which handles immediate wins.
      const valueAfter = calculatePositionValue(grid, target, ball.color);

      // 4. Net Gain = After - Before
      const netGain = valueAfter - valueBefore;

      // Revert
      grid[ball.pos.y][ball.pos.x].ball = originalSourceBall;
      grid[target.y][target.x].ball = originalTargetBall;

      if (netGain > maxNetGain) {
        maxNetGain = netGain;
        bestMove = { from: ball.pos, to: target };
      }
    }
  }

  if (bestMove && maxNetGain > 0.1) { // Ensure at least some positive gain, or maybe loosen this
     // Actually, if all moves are negative (breaking stuff), we might still want to return the "least bad" one?
     // Or just return the best available. Let's return best available, but prioritize > 0.
     // In Lines 98, sometimes you just move trash to free space.
     // However, moving "trash" (value 1) to "trash" (value 1) is net gain 0.
     // Let's accept >= 0 or best.
     const path = findPath(grid, bestMove.from, bestMove.to);
     return path ? { ...bestMove, path } : null;
  }
  
  // Fallback: if absolutely no "good" moves (e.g. all net gains are 0 or negative),
  // try to find a move that places a ball into a position with the highest potential (e.g. center of board or open area)
  // But usually maxNetGain will pick 0 (neutral move) over negative.
  if (bestMove) {
      const path = findPath(grid, bestMove.from, bestMove.to);
      return path ? { ...bestMove, path } : null;
  }

  return null;
};

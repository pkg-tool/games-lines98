import { describe, it, expect } from 'vitest';
import { 
  createEmptyGrid, 
  GRID_SIZE, 
  getEmptyCells, 
  findPath, 
  checkLines,
  getRandomPositions,
  findBestMove
} from './gameLogic';
import type { Cell, BallColor } from '../types/game';

const fillGrid = (grid: Cell[][], balls: { x: number, y: number, color: BallColor }[]) => {
  balls.forEach(({ x, y, color }) => {
    grid[y][x].ball = color;
  });
};

describe('gameLogic', () => {
  // ... previous tests ... 
  // I will rewrite the whole file to include previous tests and the new one.
  
  describe('createEmptyGrid', () => {
    it('should create a grid of correct size', () => {
      const grid = createEmptyGrid();
      expect(grid.length).toBe(GRID_SIZE);
      expect(grid[0].length).toBe(GRID_SIZE);
    });

    it('should have all cells empty initially', () => {
      const grid = createEmptyGrid();
      const hasBall = grid.some(row => row.some(cell => cell.ball !== null));
      expect(hasBall).toBe(false);
    });
  });

  describe('getEmptyCells', () => {
    it('should return all cells for empty grid', () => {
      const grid = createEmptyGrid();
      const empty = getEmptyCells(grid);
      expect(empty.length).toBe(GRID_SIZE * GRID_SIZE);
    });

    it('should exclude occupied cells', () => {
      const grid = createEmptyGrid();
      grid[0][0].ball = 'red';
      const empty = getEmptyCells(grid);
      expect(empty.length).toBe(GRID_SIZE * GRID_SIZE - 1);
      expect(empty).not.toContainEqual({ x: 0, y: 0 });
    });
  });

  describe('getRandomPositions', () => {
    it('should return requested number of unique positions', () => {
      const grid = createEmptyGrid();
      const positions = getRandomPositions(grid, 3);
      expect(positions.length).toBe(3);
      
      const unique = new Set(positions.map(p => `${p.x},${p.y}`));
      expect(unique.size).toBe(3);
    });

    it('should return fewer positions if grid is almost full', () => {
      const grid = createEmptyGrid();
      const allCells = getEmptyCells(grid);
      allCells.forEach((p, i) => {
        if (i < allCells.length - 1) grid[p.y][p.x].ball = 'red';
      });
      
      const positions = getRandomPositions(grid, 3);
      expect(positions.length).toBe(1);
    });
  });

  describe('findPath', () => {
    it('should find path between adjacent empty cells', () => {
      const grid = createEmptyGrid();
      const start = { x: 0, y: 0 };
      const end = { x: 0, y: 1 };
      const path = findPath(grid, start, end);
      expect(path).not.toBeNull();
      expect(path!.length).toBeGreaterThan(0);
      expect(path![0]).toEqual(start);
      expect(path![path!.length - 1]).toEqual(end);
    });

    it('should find path around obstacles', () => {
      const grid = createEmptyGrid();
      grid[1][0].ball = 'red';
      grid[1][1].ball = 'red';
      
      const start = { x: 0, y: 0 };
      const end = { x: 0, y: 2 };
      
      const path = findPath(grid, start, end);
      expect(path).not.toBeNull();
    });

    it('should return null if no path exists', () => {
      const grid = createEmptyGrid();
      grid[0][1].ball = 'red';
      grid[1][0].ball = 'red';
      grid[1][1].ball = 'red';
      
      const start = { x: 0, y: 0 };
      const end = { x: 2, y: 2 };
      
      const path = findPath(grid, start, end);
      expect(path).toBeNull();
    });

    it('should return null if destination is occupied', () => {
      const grid = createEmptyGrid();
      grid[1][0].ball = 'red';
      const start = { x: 0, y: 0 };
      const end = { x: 0, y: 1 }; // y=1, x=0
      
      const path = findPath(grid, start, end);
      expect(path).toBeNull();
    });
  });

  describe('checkLines', () => {
    it('should detect horizontal line of 5', () => {
      const grid = createEmptyGrid();
      fillGrid(grid, [
        { x: 0, y: 0, color: 'red' },
        { x: 1, y: 0, color: 'red' },
        { x: 2, y: 0, color: 'red' },
        { x: 3, y: 0, color: 'red' },
        { x: 4, y: 0, color: 'red' },
      ]);
      
      const removed = checkLines(grid, { x: 4, y: 0 });
      expect(removed.length).toBe(5);
      expect(removed).toContainEqual({ x: 0, y: 0 });
      expect(removed).toContainEqual({ x: 4, y: 0 });
    });

    it('should detect vertical line of 5', () => {
      const grid = createEmptyGrid();
      fillGrid(grid, [
        { x: 0, y: 0, color: 'blue' },
        { x: 0, y: 1, color: 'blue' },
        { x: 0, y: 2, color: 'blue' },
        { x: 0, y: 3, color: 'blue' },
        { x: 0, y: 4, color: 'blue' },
      ]);
      
      const removed = checkLines(grid, { x: 0, y: 2 });
      expect(removed.length).toBe(5);
    });

    it('should detect diagonal line of 5', () => {
      const grid = createEmptyGrid();
      fillGrid(grid, [
        { x: 0, y: 0, color: 'green' },
        { x: 1, y: 1, color: 'green' },
        { x: 2, y: 2, color: 'green' },
        { x: 3, y: 3, color: 'green' },
        { x: 4, y: 4, color: 'green' },
      ]);
      
      const removed = checkLines(grid, { x: 2, y: 2 });
      expect(removed.length).toBe(5);
    });

    it('should not detect lines shorter than 5', () => {
      const grid = createEmptyGrid();
      fillGrid(grid, [
        { x: 0, y: 0, color: 'red' },
        { x: 1, y: 0, color: 'red' },
        { x: 2, y: 0, color: 'red' },
        { x: 3, y: 0, color: 'red' },
      ]);
      
      const removed = checkLines(grid, { x: 3, y: 0 });
      expect(removed.length).toBe(0);
    });

    it('should detect intersecting lines (cross)', () => {
      const grid = createEmptyGrid();
      fillGrid(grid, [
        // Horizontal
        { x: 0, y: 2, color: 'blue' },
        { x: 1, y: 2, color: 'blue' },
        { x: 2, y: 2, color: 'blue' },
        { x: 3, y: 2, color: 'blue' },
        { x: 4, y: 2, color: 'blue' },
        // Vertical
        { x: 2, y: 0, color: 'blue' },
        { x: 2, y: 1, color: 'blue' },
        { x: 2, y: 3, color: 'blue' },
        { x: 2, y: 4, color: 'blue' },
      ]);
      
      const removed = checkLines(grid, { x: 2, y: 2 });
      expect(removed.length).toBe(9);
    });

    it('should handle lines longer than 5', () => {
      const grid = createEmptyGrid();
      fillGrid(grid, [
        { x: 0, y: 0, color: 'red' },
        { x: 1, y: 0, color: 'red' },
        { x: 2, y: 0, color: 'red' },
        { x: 3, y: 0, color: 'red' },
        { x: 4, y: 0, color: 'red' },
        { x: 5, y: 0, color: 'red' },
      ]);
      
      const removed = checkLines(grid, { x: 5, y: 0 });
      expect(removed.length).toBe(6);
    });
  });

  describe('findBestMove', () => {
    it('should favor creating a longer line using a loose ball', () => {
      const grid = createEmptyGrid();
      fillGrid(grid, [
        { x: 0, y: 0, color: 'red' },
        { x: 1, y: 0, color: 'red' },
        { x: 2, y: 0, color: 'red' },
        { x: 3, y: 0, color: 'red' }, // Line of 4
        { x: 5, y: 5, color: 'red' }, // Loose ball
      ]);

      const bestMove = findBestMove(grid);
      
      expect(bestMove).not.toBeNull();
      // It should move the loose ball (5,5) to complete the line at (4,0)
      expect(bestMove?.from).toEqual({ x: 5, y: 5 });
      expect(bestMove?.to).toEqual({ x: 4, y: 0 });
    });

    it('should prioritize winning move (5 in a row)', () => {
      const grid = createEmptyGrid();
      fillGrid(grid, [
        { x: 0, y: 0, color: 'blue' },
        { x: 1, y: 0, color: 'blue' },
        { x: 2, y: 0, color: 'blue' },
        { x: 3, y: 0, color: 'blue' },
        // Spot 4,0 is empty
        { x: 0, y: 5, color: 'blue' }, // Can move here
      ]);

      const bestMove = findBestMove(grid);
      expect(bestMove?.to).toEqual({ x: 4, y: 0 });
    });
  });
});
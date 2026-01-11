import { useState, useCallback, useEffect, useMemo } from 'react';
import type { GameState, Position, BallColor, Cell } from '../types/game';
import { 
  createEmptyGrid, 
  getRandomColors, 
  getEmptyCells, 
  getRandomPositions,
  findPath, 
  checkLines,
  findBestMove
} from '../utils/gameLogic';

const INITIAL_BALLS_COUNT = 5;
const BALLS_PER_TURN = 3;

interface MovingState {
  path: Position[];
  color: BallColor;
}

export const useGame = () => {
  const [state, setState] = useState<GameState>({
    grid: createEmptyGrid(),
    score: 0,
    nextBalls: getRandomColors(BALLS_PER_TURN),
    nextBallPositions: [],
    selectedBall: null,
    isGameOver: false,
  });

  const [hoveredCell, setHoveredCell] = useState<Position | null>(null);
  const [movingState, setMovingState] = useState<MovingState | null>(null);
  const [explodingCells, setExplodingCells] = useState<Position[]>([]);
  const [hintPath, setHintPath] = useState<Position[] | null>(null);

  // Calculate path for preview
  const currentPath = useMemo(() => {
    if (!state.selectedBall || !hoveredCell || movingState || state.isGameOver) return null;
    return findPath(state.grid, state.selectedBall, hoveredCell);
  }, [state.grid, state.selectedBall, hoveredCell, movingState, state.isGameOver]);

  const initGame = useCallback(() => {
    const emptyGrid = createEmptyGrid();
    
    // Initial spawn
    const firstBalls = getRandomColors(INITIAL_BALLS_COUNT);
    const firstPositions = getRandomPositions(emptyGrid, INITIAL_BALLS_COUNT);
    
    firstPositions.forEach((pos, idx) => {
      emptyGrid[pos.y][pos.x].ball = firstBalls[idx];
    });

    // Prepare next turn
    const nextBalls = getRandomColors(BALLS_PER_TURN);
    const nextPositions = getRandomPositions(emptyGrid, BALLS_PER_TURN);

    setState({
      grid: emptyGrid,
      score: 0,
      nextBalls,
      nextBallPositions: nextPositions,
      selectedBall: null,
      isGameOver: false,
    });
    setMovingState(null);
    setExplodingCells([]);
    setHintPath(null);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCellHover = (pos: Position | null) => {
    if (state.isGameOver || movingState) return;
    setHoveredCell(pos);
  };

  const showHint = () => {
    if (state.isGameOver || movingState) return;
    
    if (hintPath) {
      setHintPath(null);
      setState(prev => ({ ...prev, selectedBall: null }));
      return;
    }

    const bestMove = findBestMove(state.grid);
    if (bestMove) {
      setHintPath(bestMove.path);
      // Automatically select the ball at the start of the hint path
      setState(prev => ({ ...prev, selectedBall: bestMove.from }));
    }
  };

  // Helper to handle explosion and cleanup
  const triggerExplosion = (grid: Cell[][], lines: Position[], currentScore: number) => {
    setExplodingCells(lines);
    
    setTimeout(() => {
      const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
      lines.forEach(p => {
        newGrid[p.y][p.x].ball = null;
      });
      
      setState(prev => ({
        ...prev,
        grid: newGrid,
        score: currentScore + lines.length * 2,
      }));
      setExplodingCells([]);
    }, 300); // Wait for animation
  };

  const spawnNewBalls = (grid: Cell[][], currentScore: number) => {
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    const emptyCells = getEmptyCells(newGrid);
    
    if (emptyCells.length === 0) {
      setState(prev => ({ ...prev, isGameOver: true }));
      return;
    }

    let positionsToSpawn = [...state.nextBallPositions];
    let colorsToSpawn = [...state.nextBalls];
    let spawnedPositions: Position[] = [];

    for (let i = 0; i < BALLS_PER_TURN; i++) {
      if (getEmptyCells(newGrid).length === 0) break;

      let targetPos = positionsToSpawn[i];
      if (!targetPos || newGrid[targetPos.y][targetPos.x].ball) {
         const currentEmpty = getEmptyCells(newGrid);
         if (currentEmpty.length === 0) break;
         const randIdx = Math.floor(Math.random() * currentEmpty.length);
         targetPos = currentEmpty[randIdx];
      }

      newGrid[targetPos.y][targetPos.x].ball = colorsToSpawn[i];
      spawnedPositions.push(targetPos);
    }

    let allLines: Position[] = [];
    spawnedPositions.forEach(pos => {
      const lines = checkLines(newGrid, pos);
      lines.forEach(linePos => {
        if (!allLines.some(p => p.x === linePos.x && p.y === linePos.y)) {
          allLines.push(linePos);
        }
      });
    });

    if (allLines.length > 0) {
      triggerExplosion(newGrid, allLines, currentScore);
      const newNextBalls = getRandomColors(BALLS_PER_TURN);
      const newNextPositions = getRandomPositions(newGrid, BALLS_PER_TURN);
       setState(prev => ({
        ...prev,
        nextBalls: newNextBalls,
        nextBallPositions: newNextPositions
      }));
    } else {
      const isGameOver = getEmptyCells(newGrid).length === 0;
      const newNextBalls = getRandomColors(BALLS_PER_TURN);
      const newNextPositions = getRandomPositions(newGrid, BALLS_PER_TURN);

      setState(prev => ({
        ...prev,
        grid: newGrid,
        score: currentScore,
        nextBalls: newNextBalls,
        nextBallPositions: newNextPositions,
        selectedBall: null,
        isGameOver
      }));
    }
  };

  const handleMoveComplete = () => {
    if (!movingState) return;

    const { path, color } = movingState;
    const endPos = path[path.length - 1];
    const startPos = path[0];

    const newGrid = state.grid.map(row => row.map(cell => ({ ...cell })));
    
    newGrid[startPos.y][startPos.x].ball = null;
    newGrid[endPos.y][endPos.x].ball = color;

    const lines = checkLines(newGrid, endPos);

    setMovingState(null);

    if (lines.length > 0) {
      setState(prev => ({ ...prev, grid: newGrid, selectedBall: null }));
      triggerExplosion(newGrid, lines, state.score);
    } else {
      setState(prev => ({ ...prev, grid: newGrid, selectedBall: null }));
      spawnNewBalls(newGrid, state.score);
    }
  };

  const handleCellClick = (pos: Position) => {
    // Clear hint on any interaction
    if (hintPath) setHintPath(null);

    if (state.isGameOver || movingState || explodingCells.length > 0) return;

    const clickedCell = state.grid[pos.y][pos.x];

    if (clickedCell.ball) {
      setState(prev => ({ ...prev, selectedBall: pos }));
    } else if (state.selectedBall) {
      const path = findPath(state.grid, state.selectedBall, pos);
      
      if (path) {
        const color = state.grid[state.selectedBall.y][state.selectedBall.x].ball!;
        setMovingState({
          path,
          color
        });
      } else {
        setState(prev => ({ ...prev, selectedBall: null }));
      }
    }
  };

  return { 
    state, 
    currentPath,
    movingState,
    explodingCells,
    hintPath,
    handleCellClick, 
    handleCellHover, 
    handleMoveComplete,
    showHint,
    initGame 
  };
};
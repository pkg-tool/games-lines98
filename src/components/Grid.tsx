import React from 'react';
import { Box, styled } from '@mui/material';
import type { Cell as ICell, Position, BallColor } from '../types/game';
import Cell from './Cell';
import MovingBall from './MovingBall';

interface GridProps {
  grid: ICell[][];
  selectedBall: Position | null;
  nextBalls: BallColor[];
  nextBallPositions: Position[];
  currentPath: Position[] | null;
  hintPath: Position[] | null;
  movingState: { path: Position[]; color: BallColor } | null;
  explodingCells: Position[];
  patternMode: boolean;
  onCellClick: (pos: Position) => void;
  onCellHover: (pos: Position | null) => void;
  onMoveComplete: () => void;
}

const GridContainer = styled(Box)(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(9, 50px)',
  gridTemplateRows: 'repeat(9, 50px)',
  gap: '2px',
  backgroundColor: '#bdbdbd',
  border: '2px solid #bdbdbd',
  borderRadius: '4px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  position: 'relative',
}));

const Grid: React.FC<GridProps> = ({ 
  grid, 
  selectedBall, 
  nextBalls,
  nextBallPositions,
  currentPath,
  hintPath,
  movingState,
  explodingCells,
  patternMode,
  onCellClick,
  onCellHover,
  onMoveComplete
}) => {
  const getHintColor = (x: number, y: number): BallColor | undefined => {
    const index = nextBallPositions.findIndex(pos => pos.x === x && pos.y === y);
    return index !== -1 ? nextBalls[index] : undefined;
  };

  const isPathCell = (x: number, y: number): boolean => {
    if (!currentPath) return false;
    return currentPath.some(pos => pos.x === x && pos.y === y) && 
           !(selectedBall?.x === x && selectedBall?.y === y);
  };

  const getHintArrow = (x: number, y: number): string | undefined => {
    if (!hintPath) return undefined;
    const index = hintPath.findIndex(pos => pos.x === x && pos.y === y);
    if (index === -1) return undefined;

    // Last cell in path is the target
    if (index === hintPath.length - 1) return '🎯';

    const next = hintPath[index + 1];
    const curr = hintPath[index];

    if (next.x > curr.x) return '→';
    if (next.x < curr.x) return '←';
    if (next.y > curr.y) return '↓';
    if (next.y < curr.y) return '↑';

    return undefined;
  };

  const isSelected = (x: number, y: number): boolean => {
    if (selectedBall?.x === x && selectedBall?.y === y) return true;
    if (hintPath && hintPath.length > 0) {
      return hintPath[0].x === x && hintPath[0].y === y;
    }
    return false;
  };

  const isHidden = (x: number, y: number): boolean => {
    if (movingState && movingState.path[0].x === x && movingState.path[0].y === y) {
      return true;
    }
    return false;
  };

  const isExploding = (x: number, y: number): boolean => {
    return explodingCells.some(pos => pos.x === x && pos.y === y);
  };

  return (
    <GridContainer onMouseLeave={() => onCellHover(null)}>
      {grid.map((row, y) =>
        row.map((cell, x) => (
          <Cell
            key={`${x}-${y}`}
            ball={isHidden(x, y) ? null : cell.ball}
            position={{ x, y }}
            selected={isSelected(x, y)}
            isPath={isPathCell(x, y)}
            hintArrow={getHintArrow(x, y)}
            hintColor={!cell.ball ? getHintColor(x, y) : undefined}
            isExploding={cell.ball ? isExploding(x, y) : undefined}
            patternMode={patternMode}
            onClick={onCellClick}
            onHover={onCellHover}
          />
        ))
      )}
      
      {movingState && (
        <MovingBall 
          path={movingState.path} 
          color={movingState.color}
          patternMode={patternMode} 
          onComplete={onMoveComplete} 
        />
      )}
    </GridContainer>
  );
};

export default Grid;
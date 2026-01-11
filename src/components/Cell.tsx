import React from 'react';
import { Paper, Box, styled, keyframes, Typography } from '@mui/material';
import type { BallColor, Position } from '../types/game';
import Ball from './Ball';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(1); opacity: 0.7; }
`;

interface CellProps {
  ball: BallColor | null;
  position: Position;
  selected: boolean;
  isPath: boolean;
  isHint?: boolean;
  hintArrow?: string;
  hintColor?: BallColor;
  isExploding?: boolean;
  patternMode?: boolean;
  onClick: (pos: Position) => void;
  onHover: (pos: Position | null) => void;
}

const StyledCell = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected: boolean }>(({ selected }) => ({
  width: '50px',
  height: '50px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: selected ? 'rgba(33, 150, 243, 0.2)' : '#fff',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: selected ? 'rgba(33, 150, 243, 0.3)' : '#f0f0f0',
  },
  border: '1px solid #e0e0e0',
  position: 'relative',
}));

const PathDot = styled(Box)(({ theme }) => ({
  width: '10px',
  height: '12px',
  borderRadius: '50%',
  backgroundColor: theme.palette.text.secondary,
  opacity: 0.4,
}));

const HintSymbol = styled(Typography)(({ theme }) => ({
  color: theme.palette.secondary.main,
  fontWeight: 'bold',
  fontSize: '1.4rem',
  lineHeight: 1,
  userSelect: 'none',
  animation: `${pulse} 1.5s infinite ease-in-out`,
  zIndex: 1,
}));

const Cell: React.FC<CellProps> = ({ 
  ball, 
  position, 
  selected, 
  isPath, 
  hintArrow,
  hintColor,
  isExploding,
  patternMode,
  onClick, 
  onHover 
}) => {
  return (
    <StyledCell 
      selected={selected} 
      onClick={() => onClick(position)}
      onMouseEnter={() => onHover(position)}
      onMouseLeave={() => onHover(null)}
      elevation={0}
      square
    >
      {ball ? (
        <Ball 
          color={ball} 
          selected={selected} 
          isExploding={isExploding}
          patternMode={patternMode}
        />
      ) : (
        <>
          {hintColor && <Ball color={hintColor} variant="ghost" patternMode={patternMode} />}
          {hintArrow && <HintSymbol>{hintArrow}</HintSymbol>}
          {isPath && !hintColor && !hintArrow && <PathDot />}
        </>
      )}
    </StyledCell>
  );
};

export default Cell;

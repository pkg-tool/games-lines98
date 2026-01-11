import React from 'react';
import { Box, styled, keyframes } from '@mui/material';
import { 
  Favorite, 
  CropSquare, 
  ChangeHistory, 
  Star, 
  Diamond, 
  Hexagon, 
  Bolt 
} from '@mui/icons-material';
import type { BallColor } from '../types/game';

const appear = keyframes`
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

const disappear = keyframes`
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(0); opacity: 0; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const colorMap: Record<BallColor, string> = {
  red: '#D50000',    // Vivid Red
  blue: '#2962FF',   // Vivid Blue
  green: '#00C853',  // Vivid Green
  yellow: '#FFD600', // Vivid Yellow
  purple: '#AA00FF', // Vivid Purple
  cyan: '#00B8D4',   // Vivid Cyan
  orange: '#FF6D00', // Vivid Orange
};

const IconMap: Record<BallColor, React.ElementType> = {
  red: Favorite,
  blue: CropSquare,
  green: ChangeHistory,
  yellow: Star,
  purple: Diamond,
  cyan: Hexagon,
  orange: Bolt,
};

interface BallProps {
  color: BallColor;
  selected?: boolean;
  preview?: boolean;
  variant?: 'normal' | 'ghost';
  isExploding?: boolean;
  patternMode?: boolean;
}

const StyledBall = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'ballColor' && prop !== 'selected' && prop !== 'preview' && prop !== 'variant' && prop !== 'isExploding',
})<{ ballColor: string; selected?: boolean; preview?: boolean; variant?: 'normal' | 'ghost'; isExploding?: boolean }>(({ ballColor, selected, preview, variant, isExploding }) => {
  const isGhost = variant === 'ghost';
  
  let animation = `${appear} 0.3s ease-out`;
  if (isExploding) {
    animation = `${disappear} 0.3s ease-in forwards`;
  } else if (selected) {
    animation = `${pulse} 0.6s infinite ease-in-out`;
  }
  
  return {
    width: preview || isGhost ? '20px' : '40px',
    height: preview || isGhost ? '20px' : '40px',
    borderRadius: '50%',
    background: isGhost 
      ? ballColor // Flat color for ghost
      : `radial-gradient(circle at 30% 30%, ${ballColor}, #000)`,
    opacity: isGhost ? 0.5 : 1,
    boxShadow: isGhost ? 'none' : '2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(0,0,0,0.5)',
    animation: animation,
    cursor: 'pointer',
    transition: 'transform 0.2s',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff', // Icon color
    '&:hover': {
      transform: (preview || isExploding) ? 'none' : 'scale(1.05)',
    },
    position: 'relative',
    '&::after': isGhost ? 'none' : {
      content: '""',
      position: 'absolute',
      top: '15%',
      left: '15%',
      width: '30%',
      height: '30%',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.4)',
      filter: 'blur(1px)',
    }
  };
});

const Ball: React.FC<BallProps> = ({ color, selected, preview, variant = 'normal', isExploding, patternMode }) => {
  const Icon = IconMap[color];
  
  return (
    <StyledBall ballColor={colorMap[color]} selected={selected} preview={preview} variant={variant} isExploding={isExploding}>
      {patternMode && Icon && (
        <Icon 
          sx={{ 
            width: preview ? '70%' : '60%', 
            height: preview ? '70%' : '60%', 
            zIndex: 2,
            opacity: 0.9,
            filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5))'
          }} 
        />
      )}
    </StyledBall>
  );
};

export default Ball;
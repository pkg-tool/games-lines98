import React, { useEffect, useState, useRef } from 'react';
import { Box } from '@mui/material';
import type { Position, BallColor } from '../types/game';
import Ball from './Ball';

interface MovingBallProps {
  path: Position[];
  color: BallColor;
  patternMode?: boolean;
  onComplete: () => void;
}

const CELL_SIZE = 50;
const GAP = 2;
const PITCH = CELL_SIZE + GAP;
const OFFSET = 5; // (50px cell - 40px ball) / 2

// Speed in ms per cell
const SPEED = 50; 

const MovingBall: React.FC<MovingBallProps> = ({ path, color, patternMode, onComplete }) => {
  const [currentPos, setCurrentPos] = useState<{ x: number, y: number } | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    if (path.length < 2) return;

    // Start from the first position
    const startNode = path[0];
    setCurrentPos({ 
      x: startNode.x * PITCH + OFFSET, 
      y: startNode.y * PITCH + OFFSET 
    });

    const animate = (time: number) => {
      if (startTimeRef.current === null) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;
      
      // Calculate total duration based on path length
      const totalSteps = path.length - 1;
      const stepIndex = Math.floor(elapsed / SPEED);
      
      if (stepIndex >= totalSteps) {
        // Animation finished
        onComplete();
        return;
      }

      // Current segment of the path
      const from = path[stepIndex];
      const to = path[stepIndex + 1];
      
      // Progress within the current segment (0 to 1)
      const segmentProgress = (elapsed % SPEED) / SPEED;

      // Linear interpolation
      const x = (from.x + (to.x - from.x) * segmentProgress) * PITCH + OFFSET;
      const y = (from.y + (to.y - from.y) * segmentProgress) * PITCH + OFFSET;

      setCurrentPos({ x, y });
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [path, onComplete]);

  if (!currentPos) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        transform: `translate(${currentPos.x}px, ${currentPos.y}px)`,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <Ball color={color} selected={false} patternMode={patternMode} />
    </Box>
  );
};

export default MovingBall;
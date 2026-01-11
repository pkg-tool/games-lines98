import React from 'react';
import { Paper, Typography, Box, Stack } from '@mui/material';
import type { BallColor } from '../types/game';
import Ball from './Ball';

interface ScoreBoardProps {
  score: number;
  nextBalls: BallColor[];
  patternMode?: boolean;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ score, nextBalls, patternMode }) => {
  return (
    <Paper sx={{ p: 2, minWidth: '150px' }} elevation={2}>
      <Stack spacing={2} alignItems="center">
        <Box>
          <Typography variant="subtitle2" color="textSecondary" align="center">
            SCORE
          </Typography>
          <Typography variant="h4" component="div" align="center" sx={{ fontWeight: 'bold' }}>
            {score}
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="subtitle2" color="textSecondary" align="center" sx={{ mb: 1 }}>
            NEXT
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center">
            {nextBalls.map((color, index) => (
              <Ball key={index} color={color} preview patternMode={patternMode} />
            ))}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

export default ScoreBoard;
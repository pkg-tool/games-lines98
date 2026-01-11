import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

interface GameOverDialogProps {
  open: boolean;
  score: number;
  onRestart: () => void;
}

const GameOverDialog: React.FC<GameOverDialogProps> = ({ open, score, onRestart }) => {
  return (
    <Dialog open={open} onClose={onRestart}>
      <DialogTitle align="center">Game Over!</DialogTitle>
      <DialogContent>
        <Typography variant="h6" align="center">
          Your final score is:
        </Typography>
        <Typography variant="h3" align="center" sx={{ color: 'primary.main', fontWeight: 'bold', my: 2 }}>
          {score}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button onClick={onRestart} variant="contained" size="large">
          New Game
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GameOverDialog;

import { useState } from 'react';
import { 
  ThemeProvider, 
  CssBaseline, 
  Container, 
  Box, 
  Typography, 
  Button, 
  Stack,
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip,
  styled,
  keyframes
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import theme from './theme/theme';
import Grid from './components/Grid';
import ScoreBoard from './components/ScoreBoard';
import GameOverDialog from './components/GameOverDialog';
import { useGame } from './hooks/useGame';

// 90s Style Marquee Animation
const scroll = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const rainbow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const MarqueeContainer = styled(Box)({
  width: '100%',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  padding: '1rem 0',
  marginBottom: '1rem',
  position: 'relative',
  backgroundColor: '#000080', // Classic Windows 98 blue background
  border: '4px inset #dfdfdf', // Inset border
});

const MarqueeContent = styled(Box)({
  display: 'inline-block',
  animation: `${scroll} 8000s linear infinite`, 
});

const GradientText = styled('span')({
  fontWeight: '900',
  fontSize: '4rem',
  fontFamily: '"Comic Sans MS", "Chalkboard SE", "Arial Black", sans-serif', // Peak 90s fonts
  fontStyle: 'italic',
  paddingRight: '2rem',
  display: 'inline-block',
  transform: 'scaleY(1.5)', // Stretched text
  
  // Acid Rainbow Gradient
  backgroundImage: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
  backgroundSize: '50% auto', // Make gradient repeat more often
  backgroundClip: 'text',
  textFillColor: 'transparent',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  
  // Harsh shadow (simulated with filter since text-shadow doesn't work well with background-clip: text)
  filter: 'drop-shadow(4px 4px 0px #000000)',
  
  animation: `${rainbow} 50s linear infinite`, // Fast flashing colors
});

function App() {
  const { 
    state, 
    handleCellClick, 
    handleCellHover, 
    handleMoveComplete, 
    currentPath, 
    movingState, 
    explodingCells,
    hintPath,
    showHint,
    initGame 
  } = useGame();
  const [patternMode, setPatternMode] = useState(false);

  // Repeat text to ensure seamless loop
  const marqueeText = "LINES 98 ".repeat(20);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          py: 4,
          alignItems: 'center'
        }}>
          
          <MarqueeContainer>
            <MarqueeContent>
              {/* Render twice for seamless loop logic if needed, or just one long string if using 50% translation technique with duplication inside */}
              <GradientText>{marqueeText}</GradientText>
              <GradientText>{marqueeText}</GradientText>
            </MarqueeContent>
          </MarqueeContainer>

          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={4} 
            alignItems="flex-start"
            sx={{ mt: 2 }}
          >
            <Grid 
              grid={state.grid} 
              selectedBall={state.selectedBall} 
              nextBalls={state.nextBalls}
              nextBallPositions={state.nextBallPositions}
              currentPath={currentPath}
              hintPath={hintPath}
              movingState={movingState}
              explodingCells={explodingCells}
              patternMode={patternMode}
              onCellClick={handleCellClick} 
              onCellHover={handleCellHover}
              onMoveComplete={handleMoveComplete}
            />
            
            <Stack spacing={2}>
              <ScoreBoard score={state.score} nextBalls={state.nextBalls} patternMode={patternMode} />
              
              <Stack direction="row" spacing={1}>
                <Button 
                  variant="outlined" 
                  startIcon={<RefreshIcon />} 
                  onClick={initGame}
                  fullWidth
                >
                  New Game
                </Button>
                <Tooltip title="Show Best Move">
                  <IconButton 
                    color="primary" 
                    onClick={showHint} 
                    disabled={state.isGameOver || !!movingState}
                    sx={{ border: '1px solid rgba(33, 150, 243, 0.5)' }}
                  >
                    <LightbulbIcon />
                  </IconButton>
                </Tooltip>
              </Stack>

              <FormControlLabel
                control={
                  <Switch
                    checked={patternMode}
                    onChange={(e) => setPatternMode(e.target.checked)}
                    color="primary"
                  />
                }
                label="Pattern Mode"
              />
            </Stack>
          </Stack>

          <Box sx={{ mt: 'auto', pt: 4 }}>
            <Typography variant="body2" color="textSecondary">
              Match 5 balls of the same color to score points.
            </Typography>
          </Box>
        </Box>

        <GameOverDialog 
          open={state.isGameOver} 
          score={state.score} 
          onRestart={initGame} 
        />
      </Container>
    </ThemeProvider>
  );
}

export default App;

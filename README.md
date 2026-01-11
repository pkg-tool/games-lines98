# Lines 98 - React Edition

A modern web remake of the classic Lines 98 puzzle game, built with React, TypeScript, and Material UI.

## Features

- **Classic Gameplay**: 9x9 grid, match 5 balls of the same color to clear lines.
- **Smart Hints**: "Best Move" button with advanced AI that suggests strategic moves.
- **Path Preview**: Visualizes the path a ball will take before you move it.
- **Ghost Balls**: Shows where the next balls will appear.
- **Animations**: Smooth ball movement and line clearing effects.
- **Accessibility**: High contrast "Pattern Mode" for colorblind users.
- **Responsive Design**: Works on desktop and mobile.

## How to Play

1.  **Objective**: Score as many points as possible by arranging 5 or more balls of the same color in a line (horizontal, vertical, or diagonal).
2.  **Move**: Click on a ball to select it, then click on an empty cell to move it there. A clear path must exist between the two points.
3.  **Turns**: After each move that doesn't clear a line, 3 new balls are added to the board.
4.  **Game Over**: The game ends when the board is completely full.

## Tech Stack

-   **Frontend**: React 18, TypeScript, Vite
-   **UI**: Material UI (MUI), Emotion
-   **Animations**: CSS Keyframes, JS-based path interpolation
-   **Testing**: Vitest

## Getting Started

### Prerequisites

-   Node.js (v16+)
-   npm

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install
# or
make install
```

### Development

```bash
# Start local dev server
npm run dev
```

### Build

```bash
# Build for production
npm run build
# or
make build
```

The production files will be in the `dist` directory.

### Testing



```bash

# Run unit tests

npm test

# or

make test

```



## License



This project is released into the [public domain](LICENSE) under the Unlicense.

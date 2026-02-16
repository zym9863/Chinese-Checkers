# Chinese Checkers - Game Design Document

## Overview

A browser-based Chinese Checkers (跳棋) game built with Vite + Svelte, featuring a skeuomorphic visual style with wooden board and glass marble pieces.

## Requirements

- **Tech Stack**: Vite + Svelte
- **Game Modes**: Local multiplayer + AI opponent
- **Players**: 2-6 players on a full hexagonal star board (121 positions)
- **Visual Style**: Skeuomorphic (wood texture board + glass/marble pieces)

## Architecture

### Rendering: Canvas

Canvas rendering chosen for:
- Strong skeuomorphic effects (gradients, shadows, highlights)
- Smooth animations
- Good performance with 121 board positions

### Board Data Model: Cube Coordinates

Each position represented as `(q, r, s)` where `q + r + s = 0`.
- 121 valid positions on the hexagonal star
- 6 triangular corners with 10 starting positions each
- Supports 2, 3, 4, or 6 player configurations

Player seating by count:
- 2 players: opposite corners (top/bottom)
- 3 players: alternating corners
- 4 players: two pairs of opposite corners
- 6 players: all corners

### Game Rules Engine

- **Movement**: Adjacent move (6 hex directions) or chain-jump (recursive hop detection)
- **Win condition**: All pieces reach the opposite triangle
- **Turn management**: Sequential by player order, skip absent players
- **Validation**: Only allow legal moves; pieces must end in valid positions

### AI Engine

- **Algorithm**: Minimax with Alpha-Beta pruning
- **Evaluation**: Sum of distances from each piece to its target positions
- **Search depth**: 2-3 levels for responsive gameplay
- **Execution**: Web Worker to avoid blocking UI thread

### UI Component Structure

```
App.svelte
├── MenuScreen.svelte       — Start screen (player count, mode selection)
├── GameScreen.svelte        — Main game interface
│   ├── BoardCanvas.svelte   — Canvas board rendering
│   ├── PlayerInfo.svelte    — Player info sidebar
│   └── GameControls.svelte  — Undo/restart controls
└── GameOverModal.svelte     — Game over dialog
```

### Visual Design

- **Board**: Wood texture background, recessed circular slots (inner shadow)
- **Pieces**: Glass/marble look via radial gradients + specular highlight + drop shadow
- **Colors**: Red, Blue, Green, Yellow, Purple, Orange
- **Animations**: Smooth piece movement transitions, arc animation for jumps

### State Management

Svelte stores for:
- `gameState`: board positions, current player, game phase
- `selectedPiece`: currently selected piece and valid moves
- `gameConfig`: player count, AI settings, player assignments

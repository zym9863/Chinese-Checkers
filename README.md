[English](README.md) | [中文](README-zh.md)

# Chinese Checkers (跳棋)

A browser-based Chinese Checkers game built with Vite + Svelte + TypeScript, featuring a skeuomorphic visual style with wooden board and glass marble pieces.

## Features

- 🎮 **Multiple Game Modes**: Local multiplayer and AI opponent
- 👥 **2-6 Players**: Full hexagonal star board with 121 positions
- 🎨 **Skeuomorphic Design**: Wood texture board with glass/marble pieces
- 🤖 **AI Engine**: Minimax algorithm with Alpha-Beta pruning
- ⏪ **Undo Support**: Take back moves during gameplay
- 📱 **Responsive**: Works on desktop and tablet screens

## Tech Stack

- **Framework**: [Svelte 5](https://svelte.dev/) with TypeScript
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Rendering**: HTML5 Canvas
- **Testing**: [Vitest](https://vitest.dev/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/zym9863/chinese-checkers.git
cd chinese-checkers

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm check` | Type check with svelte-check |
| `pnpm test` | Run tests |
| `pnpm test:watch` | Run tests in watch mode |

## Game Rules

Chinese Checkers is a strategy board game where the objective is to move all your pieces from your starting triangle to the opposite triangle.

### Movement

1. **Adjacent Move**: Move to an adjacent empty cell (6 directions)
2. **Chain Jump**: Jump over adjacent pieces to empty cells, can chain multiple jumps in one turn

### Winning

The first player to move all 10 pieces to the opposite triangle wins.

### Player Configurations

| Players | Starting Positions |
|---------|-------------------|
| 2 | Opposite corners (top/bottom) |
| 3 | Alternating corners |
| 4 | Two pairs of opposite corners |
| 6 | All corners |

## Architecture

### Component Structure

```
src/
├── App.svelte              # Main app container
├── components/
│   ├── MenuScreen.svelte   # Start screen (player count, mode selection)
│   ├── GameScreen.svelte   # Main game interface
│   ├── BoardCanvas.svelte  # Canvas board rendering
│   ├── PlayerInfo.svelte   # Player info sidebar
│   ├── GameControls.svelte # Undo/restart controls
│   └── GameOverModal.svelte# Game over dialog
└── lib/
    ├── board.ts            # Board generation and utilities
    ├── rules.ts            # Game rules and move validation
    ├── ai.ts               # AI engine (Minimax + Alpha-Beta)
    ├── renderer.ts         # Canvas rendering logic
    ├── stores.ts           # Svelte stores for state management
    └── types.ts            # TypeScript type definitions
```

### Board Model

The board uses **cube coordinates** `(q, r, s)` where `q + r + s = 0`:

- 121 valid positions on the hexagonal star
- 6 triangular corners with 10 starting positions each
- Efficient neighbor calculation and distance metrics

### AI Engine

- **Algorithm**: Minimax with Alpha-Beta pruning
- **Evaluation**: Sum of distances from each piece to target positions
- **Search Depth**: 2-3 levels for responsive gameplay
- **Execution**: Synchronous (Web Worker support planned)

## Development

### Type Checking

```bash
pnpm check
```

### Running Tests

```bash
# Run once
pnpm test

# Watch mode
pnpm test:watch
```

### Building for Production

```bash
pnpm build
```

The built files will be in the `dist/` directory.

## IDE Setup

[VS Code](https://code.visualstudio.com/) with the [Svelte extension](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) is recommended.

## License

MIT

## Acknowledgments

- Game design inspired by the classic Chinese Checkers board game
- Built with the amazing [Svelte](https://svelte.dev/) framework

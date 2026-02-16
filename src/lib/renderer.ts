import type { HexPos, Cell, PlayerColor } from './types';
import { posKey } from './board';

// ── Constants ──────────────────────────────────────────────────────────
export const HEX_SIZE = 28;
export const PIECE_RADIUS = 12;
export const SLOT_RADIUS = 14;

// ── Color palette ──────────────────────────────────────────────────────
interface ColorSet {
  main: string;
  light: string;
  dark: string;
}

const COLOR_PALETTE: Record<PlayerColor, ColorSet> = {
  red:    { main: '#e74c3c', light: '#ff8a80', dark: '#b71c1c' },
  blue:   { main: '#2196f3', light: '#82b1ff', dark: '#0d47a1' },
  green:  { main: '#4caf50', light: '#b9f6ca', dark: '#1b5e20' },
  yellow: { main: '#ffc107', light: '#fff9c4', dark: '#f57f17' },
  purple: { main: '#9c27b0', light: '#ea80fc', dark: '#4a148c' },
  orange: { main: '#ff9800', light: '#ffe0b2', dark: '#e65100' },
};

// ── Coordinate conversion ──────────────────────────────────────────────

/**
 * Convert hex cube coordinate to pixel position on canvas.
 * Uses flat-top hex layout.
 */
export function hexToPixel(pos: HexPos, centerX: number, centerY: number): { x: number; y: number } {
  const x = centerX + HEX_SIZE * (3 / 2 * pos.q);
  const y = centerY + HEX_SIZE * (Math.sqrt(3) / 2 * pos.q + Math.sqrt(3) * pos.r);
  return { x, y };
}

/**
 * Find which board position a click corresponds to.
 * Returns the closest cell within SLOT_RADIUS distance, or null.
 */
export function pixelToHex(
  px: number,
  py: number,
  centerX: number,
  centerY: number,
  board: Map<string, Cell>,
): HexPos | null {
  let closest: HexPos | null = null;
  let closestDist = SLOT_RADIUS;

  for (const cell of board.values()) {
    const { x, y } = hexToPixel(cell.pos, centerX, centerY);
    const dist = Math.sqrt((px - x) ** 2 + (py - y) ** 2);
    if (dist < closestDist) {
      closestDist = dist;
      closest = cell.pos;
    }
  }

  return closest;
}

// ── Drawing helpers ────────────────────────────────────────────────────

function drawWoodBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  // Base wood gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#b5834a');
  grad.addColorStop(0.3, '#d4a05a');
  grad.addColorStop(0.5, '#c8903e');
  grad.addColorStop(0.7, '#d4a05a');
  grad.addColorStop(1, '#a87238');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Wavy wood grain lines
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = '#6b4226';
  ctx.lineWidth = 1;

  for (let i = 0; i < height; i += 6) {
    ctx.beginPath();
    for (let x = 0; x < width; x += 2) {
      const y = i + Math.sin(x * 0.02 + i * 0.1) * 3 + Math.sin(x * 0.005) * 5;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawSlot(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  // Outer dark recess
  ctx.beginPath();
  ctx.arc(x, y, SLOT_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = '#5a3d20';
  ctx.fill();

  // Lighter inner area
  ctx.beginPath();
  ctx.arc(x, y, SLOT_RADIUS - 2, 0, Math.PI * 2);
  ctx.fillStyle = '#7a5535';
  ctx.fill();

  // Inner shadow ring (top edge)
  const shadowGrad = ctx.createRadialGradient(x, y - 2, SLOT_RADIUS - 5, x, y, SLOT_RADIUS - 1);
  shadowGrad.addColorStop(0, 'rgba(0,0,0,0)');
  shadowGrad.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.beginPath();
  ctx.arc(x, y, SLOT_RADIUS - 1, 0, Math.PI * 2);
  ctx.fillStyle = shadowGrad;
  ctx.fill();
}

function drawValidMoveIndicator(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  // Green glowing ring
  ctx.save();
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(x, y, SLOT_RADIUS - 1, 0, Math.PI * 2);
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  // Inner subtle fill
  ctx.beginPath();
  ctx.arc(x, y, SLOT_RADIUS - 3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 255, 136, 0.15)';
  ctx.fill();
}

function drawPiece(ctx: CanvasRenderingContext2D, x: number, y: number, color: PlayerColor): void {
  const palette = COLOR_PALETTE[color];

  // Drop shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 3;
  ctx.beginPath();
  ctx.arc(x, y, PIECE_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = palette.main;
  ctx.fill();
  ctx.restore();

  // Glass marble body: radial gradient
  const bodyGrad = ctx.createRadialGradient(
    x - PIECE_RADIUS * 0.3, y - PIECE_RADIUS * 0.3, PIECE_RADIUS * 0.1,
    x, y, PIECE_RADIUS,
  );
  bodyGrad.addColorStop(0, palette.light);
  bodyGrad.addColorStop(0.5, palette.main);
  bodyGrad.addColorStop(1, palette.dark);
  ctx.beginPath();
  ctx.arc(x, y, PIECE_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Specular highlight (small white spot)
  const specGrad = ctx.createRadialGradient(
    x - PIECE_RADIUS * 0.35, y - PIECE_RADIUS * 0.35, 0,
    x - PIECE_RADIUS * 0.35, y - PIECE_RADIUS * 0.35, PIECE_RADIUS * 0.45,
  );
  specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  specGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
  specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.beginPath();
  ctx.arc(x - PIECE_RADIUS * 0.35, y - PIECE_RADIUS * 0.35, PIECE_RADIUS * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = specGrad;
  ctx.fill();

  // Subtle rim/edge highlight
  ctx.beginPath();
  ctx.arc(x, y, PIECE_RADIUS - 0.5, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawSelectedHighlight(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.save();
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(x, y, PIECE_RADIUS + 3, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();
}

// ── Main draw function ─────────────────────────────────────────────────

/**
 * Main render function that draws the entire board.
 *
 * Drawing order:
 * 1. Wood texture background
 * 2. All 121 recessed slots
 * 3. Valid move indicators
 * 4. All pieces with glass/marble effect
 * 5. Selected piece highlight ring
 */
export function drawBoard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  board: Map<string, Cell>,
  selectedPos: HexPos | null,
  validMoves: HexPos[],
): void {
  const centerX = width / 2;
  const centerY = height / 2;

  // Build lookup sets for quick checks
  const validMoveKeys = new Set(validMoves.map(m => posKey(m)));
  const selectedKey = selectedPos ? posKey(selectedPos) : null;

  // 1. Wood texture background
  drawWoodBackground(ctx, width, height);

  // 2. Draw all recessed slots
  for (const cell of board.values()) {
    const { x, y } = hexToPixel(cell.pos, centerX, centerY);
    drawSlot(ctx, x, y);
  }

  // 3. Draw valid move indicators
  for (const move of validMoves) {
    const { x, y } = hexToPixel(move, centerX, centerY);
    drawValidMoveIndicator(ctx, x, y);
  }

  // 4. Draw all pieces
  for (const cell of board.values()) {
    if (cell.piece) {
      const { x, y } = hexToPixel(cell.pos, centerX, centerY);
      drawPiece(ctx, x, y, cell.piece);
    }
  }

  // 5. Draw selected piece highlight
  if (selectedPos) {
    const { x, y } = hexToPixel(selectedPos, centerX, centerY);
    drawSelectedHighlight(ctx, x, y);
  }
}

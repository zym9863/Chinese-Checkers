import type { HexPos, Cell, PlayerColor } from './types';
import { posKey } from './board';

// ── Constants ──────────────────────────────────────────────────────────
export const HEX_SIZE = 28;
export const PIECE_RADIUS = 12;
export const SLOT_RADIUS = 14;

// ── Color palette (Refined) ────────────────────────────────────────────
interface ColorSet {
  main: string;
  light: string;
  dark: string;
  glow: string;
}

const COLOR_PALETTE: Record<PlayerColor, ColorSet> = {
  red: { main: '#e74c3c', light: '#ff6b5a', dark: '#c0392b', glow: 'rgba(231, 76, 60, 0.5)' },
  blue: { main: '#3498db', light: '#5dade2', dark: '#2980b9', glow: 'rgba(52, 152, 219, 0.5)' },
  green: { main: '#27ae60', light: '#58d68d', dark: '#1e8449', glow: 'rgba(39, 174, 96, 0.5)' },
  yellow: { main: '#f1c40f', light: '#f4d03f', dark: '#d4ac0d', glow: 'rgba(241, 196, 15, 0.5)' },
  purple: { main: '#9b59b6', light: '#bb8fce', dark: '#8e44ad', glow: 'rgba(155, 89, 182, 0.5)' },
  orange: { main: '#e67e22', light: '#f39c12', dark: '#d35400', glow: 'rgba(230, 126, 34, 0.5)' },
};

// ── Coordinate conversion ──────────────────────────────────────────────

/**
 * Convert hex cube coordinate to pixel position on canvas.
 * Uses pointy-top hex layout so that rows (same r) are horizontal,
 * making the star's triangular corners appear as equilateral triangles.
 */
export function hexToPixel(pos: HexPos, centerX: number, centerY: number): { x: number; y: number } {
  const x = centerX + HEX_SIZE * (Math.sqrt(3) * pos.q + Math.sqrt(3) / 2 * pos.r);
  const y = centerY + HEX_SIZE * (3 / 2 * pos.r);
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

function drawBoardBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  // Deep dark gradient base
  const baseGrad = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, width * 0.7
  );
  baseGrad.addColorStop(0, '#1a1f35');
  baseGrad.addColorStop(0.5, '#101828');
  baseGrad.addColorStop(1, '#0a1020');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle radial glow from center
  const glowGrad = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, width * 0.4
  );
  glowGrad.addColorStop(0, 'rgba(212, 160, 90, 0.08)');
  glowGrad.addColorStop(0.5, 'rgba(212, 160, 90, 0.03)');
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle grid pattern
  ctx.save();
  ctx.globalAlpha = 0.02;
  ctx.strokeStyle = '#d4a05a';
  ctx.lineWidth = 0.5;

  const gridSize = 40;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();

  // Vignette effect
  const vignetteGrad = ctx.createRadialGradient(
    width / 2, height / 2, height * 0.3,
    width / 2, height / 2, width * 0.8
  );
  vignetteGrad.addColorStop(0, 'transparent');
  vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
  ctx.fillStyle = vignetteGrad;
  ctx.fillRect(0, 0, width, height);
}

function drawSlot(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  // Outer dark recess with subtle glow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.arc(x, y, SLOT_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0f1a';
  ctx.fill();
  ctx.restore();

  // Inner gradient ring
  const ringGrad = ctx.createRadialGradient(x, y, SLOT_RADIUS - 4, x, y, SLOT_RADIUS);
  ringGrad.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
  ringGrad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
  ctx.beginPath();
  ctx.arc(x, y, SLOT_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = ringGrad;
  ctx.fill();

  // Inner area with subtle gradient
  const innerGrad = ctx.createRadialGradient(
    x - 2, y - 2, 0,
    x, y, SLOT_RADIUS - 2
  );
  innerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
  innerGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
  innerGrad.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
  ctx.beginPath();
  ctx.arc(x, y, SLOT_RADIUS - 2, 0, Math.PI * 2);
  ctx.fillStyle = innerGrad;
  ctx.fill();

  // Subtle border highlight
  ctx.beginPath();
  ctx.arc(x, y, SLOT_RADIUS - 0.5, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawValidMoveIndicator(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  // Outer glow
  ctx.save();
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(x, y, SLOT_RADIUS + 2, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Inner pulsing ring
  ctx.beginPath();
  ctx.arc(x, y, SLOT_RADIUS - 1, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.8)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Center dot
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 255, 136, 0.9)';
  ctx.fill();

  // Subtle fill
  ctx.beginPath();
  ctx.arc(x, y, SLOT_RADIUS - 3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 255, 136, 0.1)';
  ctx.fill();
}

/**
 * Draw a piece at arbitrary pixel coordinates.
 * Exported so it can be used for animation overlays.
 */
export function drawPieceAt(ctx: CanvasRenderingContext2D, x: number, y: number, color: PlayerColor): void {
  drawPiece(ctx, x, y, color);
}

function drawPiece(ctx: CanvasRenderingContext2D, x: number, y: number, color: PlayerColor): void {
  const palette = COLOR_PALETTE[color];

  // Drop shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 4;
  ctx.beginPath();
  ctx.arc(x, y, PIECE_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = palette.dark;
  ctx.fill();
  ctx.restore();

  // Outer glow
  ctx.save();
  ctx.shadowColor = palette.glow;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(x, y, PIECE_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = palette.main;
  ctx.fill();
  ctx.restore();

  // Glass marble body: radial gradient
  const bodyGrad = ctx.createRadialGradient(
    x - PIECE_RADIUS * 0.35, y - PIECE_RADIUS * 0.35, PIECE_RADIUS * 0.1,
    x, y, PIECE_RADIUS
  );
  bodyGrad.addColorStop(0, palette.light);
  bodyGrad.addColorStop(0.4, palette.main);
  bodyGrad.addColorStop(1, palette.dark);
  ctx.beginPath();
  ctx.arc(x, y, PIECE_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Inner ring for depth
  ctx.beginPath();
  ctx.arc(x, y, PIECE_RADIUS - 2, 0, Math.PI * 2);
  const innerRingGrad = ctx.createRadialGradient(
    x - PIECE_RADIUS * 0.2, y - PIECE_RADIUS * 0.2, 0,
    x, y, PIECE_RADIUS - 2
  );
  innerRingGrad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
  innerRingGrad.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
  ctx.fillStyle = innerRingGrad;
  ctx.fill();

  // Specular highlight (main)
  const specGrad = ctx.createRadialGradient(
    x - PIECE_RADIUS * 0.4, y - PIECE_RADIUS * 0.4, 0,
    x - PIECE_RADIUS * 0.4, y - PIECE_RADIUS * 0.4, PIECE_RADIUS * 0.5
  );
  specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  specGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
  specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.beginPath();
  ctx.arc(x - PIECE_RADIUS * 0.4, y - PIECE_RADIUS * 0.4, PIECE_RADIUS * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = specGrad;
  ctx.fill();

  // Secondary small highlight
  const spec2Grad = ctx.createRadialGradient(
    x + PIECE_RADIUS * 0.25, y + PIECE_RADIUS * 0.3, 0,
    x + PIECE_RADIUS * 0.25, y + PIECE_RADIUS * 0.3, PIECE_RADIUS * 0.2
  );
  spec2Grad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
  spec2Grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.beginPath();
  ctx.arc(x + PIECE_RADIUS * 0.25, y + PIECE_RADIUS * 0.3, PIECE_RADIUS * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = spec2Grad;
  ctx.fill();

  // Rim highlight
  ctx.beginPath();
  ctx.arc(x, y, PIECE_RADIUS - 0.5, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawSelectedHighlight(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  // Outer glow
  ctx.save();
  ctx.shadowColor = 'rgba(212, 160, 90, 0.8)';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(x, y, PIECE_RADIUS + 4, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(212, 160, 90, 0.6)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // Inner ring
  ctx.beginPath();
  ctx.arc(x, y, PIECE_RADIUS + 2, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Animated dots effect (static representation)
  const dotCount = 8;
  const dotRadius = PIECE_RADIUS + 6;
  for (let i = 0; i < dotCount; i++) {
    const angle = (i / dotCount) * Math.PI * 2;
    const dotX = x + Math.cos(angle) * dotRadius;
    const dotY = y + Math.sin(angle) * dotRadius;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(212, 160, 90, 0.8)';
    ctx.fill();
  }
}

// ── Main draw function ─────────────────────────────────────────────────

/**
 * Main render function that draws the entire board.
 *
 * Drawing order:
 * 1. Dark atmospheric background
 * 2. All 121 recessed slots
 * 3. Valid move indicators
 * 4. All pieces with glass/marble effect
 * 5. Selected piece highlight ring
 *
 * @param excludePos - Optional position to exclude from piece rendering (used during animation)
 */
export function drawBoard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  board: Map<string, Cell>,
  selectedPos: HexPos | null,
  validMoves: HexPos[],
  excludePos?: HexPos | null,
): void {
  const centerX = width / 2;
  const centerY = height / 2;

  // Build lookup sets for quick checks
  const validMoveKeys = new Set(validMoves.map(m => posKey(m)));
  const selectedKey = selectedPos ? posKey(selectedPos) : null;
  const excludeKey = excludePos ? posKey(excludePos) : null;

  // 1. Dark atmospheric background
  drawBoardBackground(ctx, width, height);

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

  // 4. Draw all pieces (skip excluded position during animation)
  for (const cell of board.values()) {
    if (cell.piece) {
      const key = posKey(cell.pos);
      if (excludeKey && key === excludeKey) continue;
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
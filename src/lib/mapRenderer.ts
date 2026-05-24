import { settings } from '../settings';
import { tileColors, liquidColors, wallColors } from '../MapHelper';

export function getTileColor(y: number, tile: any, world: any): { r: number; g: number; b: number } | undefined {
  if (tile.IsActive && tileColors.length > tile.Type) {
    return tileColors[tile.Type][0];
  }

  if (tile.IsLiquidPresent) {
    if (tile.IsLiquidLava)
      return liquidColors[1];
    else if (tile.IsLiquidHoney)
      return liquidColors[2];
    else if (tile.Shimmer)
      return liquidColors[3];
    else
      return liquidColors[0];
  }

  if (tile.IsWallPresent) {
    const color = wallColors[tile.WallType][0];
    if (!color || (color.r === 0 && color.g === 0 && color.b === 0)) {
      const wall = settings.Walls.find((w) => w.Id === tile.WallType.toString());
      if (wall && wall.Color) return wall.Color as any;
    }
    return color;
  }

  if (y < world.worldSurfaceY)
    return { r: 132, g: 170, b: 248 };

  if (y < world.rockLayerY)
    return { r: 88, g: 61, b: 46 };

  if (y < world.hellLayerY)
    return { r: 74, g: 67, b: 60 };

  return { r: 0, g: 0, b: 0 };
}

export function drawSelectionIndicator(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  x: number,
  y: number,
): void {
  const cx = x + 0.5;
  const cy = y + 0.5;

  const lineWidth = 12;
  const targetWidth = 39;
  const halfTargetWidth = targetWidth / 2;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = "rgb(255, 0, 0)";
  ctx.strokeRect(cx - halfTargetWidth, cy - halfTargetWidth, targetWidth, targetWidth);

  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - halfTargetWidth, cy);
  ctx.lineTo(cx - 1, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + halfTargetWidth, cy);
  ctx.lineTo(cx + 1, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - halfTargetWidth);
  ctx.lineTo(cx, cy - 1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy + halfTargetWidth);
  ctx.lineTo(cx, cy + 1);
  ctx.stroke();
}

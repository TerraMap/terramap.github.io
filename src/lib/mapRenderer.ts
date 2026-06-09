import convert from 'color-convert';
import { liquidColors, tileColors, wallColors, type Color } from '../MapHelper';
import { walls } from '../walls';
import type { WorldData, WorldTile } from '../types/settings';
import { paintColors } from './paintColors';

/**
 * Directly blend two colors by weighted average.
 */
function blendColor(base: Color, tint: Color, strength: number): Color {
  return {
    r: base.r + Math.round(strength * (tint.r - base.r)),
    g: base.g + Math.round(strength * (tint.g - base.g)),
    b: base.b + Math.round(strength * (tint.b - base.b)),
  }
}

function doBlendHue(base: Color, tint: Color): Color {
  // Colorspace conversions are slow.
  const baseHsv = convert.rgb.hsv(base.r, base.g, base.b);
  const tintHsv = convert.rgb.hsv(tint.r, tint.g, tint.b);
  const hueMatch = convert.hsv.rgb(
    tintHsv[0],
    // Only copy saturation if grayscale.
    tintHsv[1] === 0 ? 0 : baseHsv[1],
    baseHsv[2]
  );
  return blendColor(
    { r: hueMatch[0], g: hueMatch[1], b: hueMatch[2] },
    tint,
    0.3
  );
}

const hueBlendCache = new Map<number, Color>();

/**
 * Blend colors, shifting hue to match supplied tint.
 */
function blendHue(base: Color, tint: Color): Color {
  // Risk of hash collision, but massively faster than stringification.
  const key = (base.r << 23) ^ (base.g << 18) ^ (base.b << 14) ^ (tint.r << 9) ^ (tint.g << 4) ^ tint.b;
  let color = hueBlendCache.get(key);
  if (color == null) {
    color = doBlendHue(base, tint);
    hueBlendCache.set(key, color);
  }
  return color;
}

const skyGradientCache = new Map<number, Color>();

export function clearCaches(): void {
  hueBlendCache.clear();
  skyGradientCache.clear();
}

function getLayerColor(y: number, world: WorldData): Color {
  if (y < world.worldSurfaceY) {
    if (world.remixWorld > 0) {
      return { r: 0, g: 0, b: 0 };
    } else if (world.version < 315) {
      return { r: 132, g: 170, b: 248 };
    }
    const key = (world.worldSurfaceY << 12) ^ y;
    let color = skyGradientCache.get(key);
    if (color == null) {
      color = blendColor(
        { r: 55, g: 58, b: 248 }, // Space.
        { r: 150, g: 180, b: 251 }, // Surface.
        y / world.worldSurfaceY
      );
      skyGradientCache.set(key, color);
    }
    return color;
  } else if (y < world.rockLayerY) {
    return { r: 88, g: 61, b: 46 }; // Underground.
  } else if (y < world.hellLayerY) {
    return { r: 74, g: 67, b: 60 }; // Cavern.
  } else {
    return { r: 0, g: 0, b: 0 }; // Underworld.
  }
}

function getWallColor(tile: WorldTile): Color | undefined {
  if (tile.WallType == null) {
    return undefined;
  }
  let color = wallColors[tile.WallType][0];
  if (!color || (color.r === 0 && color.g === 0 && color.b === 0)) {
    const wall = walls.find((w) => w.id === tile.WallType);
    if (wall != null && wall.color != null && typeof wall.color != 'string') {
      color = wall.color;
    }
  }
  if (!color || tile.WallColor == null) {
    return color;
  }
  const paint = paintColors[tile.WallColor];
  return paint == null ? color : blendHue(color, paint);
}

function getBlockColor(tile: WorldTile): Color | undefined {
  if (tile.Type == null || tile.Type >= tileColors.length) {
    return undefined;
  }
  let color = tileColors[tile.Type][0];
  if (!color) {
    return color;
  }
  if (!tile.IsActive) {
    // Darken actuated blocks.
    color = blendColor(color, { r: 0, g: 0, b: 0 }, 0.3);
  }
  if (tile.tileColor == null) {
    return color;
  }
  const paint = paintColors[tile.tileColor];
  return paint == null ? color : blendHue(color, paint);
}

function getLiquidColor(tile: WorldTile): Color {
  if (tile.IsLiquidLava) {
    return liquidColors[1];
  } else if (tile.IsLiquidHoney) {
    return liquidColors[2];
  } else if (tile.Shimmer) {
    return liquidColors[3];
  } else {
    return liquidColors[0];
  }
}

// Render a tile directly from raw TypedArrays on WorldData, without creating a WorldTile object.
// Mirrors getTileColor exactly — used by renderColumnRange during the initial canvas render pass.
export function getTileColorRaw(y: number, idx: number, world: WorldData): Color {
  const f1 = world.rawFlags1![idx];
  const f2 = world.rawFlags2![idx];
  const f3 = world.rawFlags3![idx];

  // getBlockColor equivalent
  let bColor: Color | undefined;
  if (f1 & 0x01) {
    const type = world.rawTypes![idx];
    if (type < tileColors.length) {
      const color = tileColors[type][0];
      if (color) {
        const tilePaint = world.rawTileColors![idx];
        if (tilePaint) {
          const paint = paintColors[tilePaint];
          bColor = paint == null ? color : blendHue(color, paint);
        } else {
          bColor = color;
        }
      }
    }
  }

  const echoBlock = (f2 & 0x80) !== 0;
  if (bColor != null && !echoBlock) {
    return bColor;
  }

  let color: Color;
  if (f1 & 0x08) {
    // getLiquidColor equivalent
    if (f1 & 0x10)      color = liquidColors[1];
    else if (f1 & 0x20) color = liquidColors[2];
    else if (f1 & 0x40) color = liquidColors[3];
    else                color = liquidColors[0];
  } else {
    // getWallColor equivalent (wallType 0 = no wall, mirrors `WallType: wallTypes[i] || undefined`)
    const wallType = world.rawWallTypes![idx];
    let wColor: Color | undefined;
    if (wallType !== 0) {
      wColor = wallColors[wallType][0];
      if (!wColor || (wColor.r === 0 && wColor.g === 0 && wColor.b === 0)) {
        const wall = walls.find((w) => w.id === wallType);
        if (wall != null && wall.color != null && typeof wall.color !== 'string') {
          wColor = wall.color;
        }
      }
      if (wColor) {
        const wallPaint = world.rawWallColors![idx];
        if (wallPaint) {
          const paint = paintColors[wallPaint];
          if (paint != null) wColor = blendHue(wColor, paint);
        }
      }
    }
    if (wColor) {
      const echoWall = (f3 & 0x01) !== 0;
      color = echoWall ? blendColor(getLayerColor(y, world), wColor, 0.1) : wColor;
    } else {
      color = getLayerColor(y, world);
    }
  }

  if (bColor != null) {
    color = blendColor(color, bColor, 0.15);
  }

  return color;
}

export function getTileColor(y: number, tile: WorldTile, world: WorldData): Color {
  const bColor = getBlockColor(tile);
  if (bColor != null && !tile.echoBlock) {
    return bColor;
  }

  let color: Color;
  if (tile.IsLiquidPresent) {
    color = getLiquidColor(tile);
  } else {
    const wColor = getWallColor(tile);
    if (wColor != null) {
      color = tile.echoWall ? blendColor(getLayerColor(y, world), wColor, 0.1) : wColor;
    } else {
      color = getLayerColor(y, world);
    }
  }

  if (bColor != null) {
    color = blendColor(color, bColor, 0.15); // Echo coat block.
  }

  return color;
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

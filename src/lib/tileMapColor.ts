// Which map color a block tile shows, ported from Terraria 1.4.5's
// MapHelper.GetTileType / GetTileBaseOption (decompiled) and the WorldGen
// helpers they call. Many tile types have several map colors (tileColors[type]
// in MapHelper.ts), chosen by the tile's frame, its position, or what's around it.
import { tileColors, type Color } from '../MapHelper';
import type { WorldData } from '../types/settings';

/** C#-style integer division (frames are never negative). */
const div = (a: number, b: number) => (a / b) | 0;

function tileSet(...ids: number[]): Uint8Array {
  const set = new Uint8Array(tileColors.length);
  for (const id of ids) set[id] = 1;
  return set;
}

function tileSetFromRanges(ranges: string): Uint8Array {
  const set = new Uint8Array(tileColors.length);
  for (const range of ranges.split(',')) {
    const [start, end = start] = range.split('-').map(Number);
    for (let id = start; id <= end; id++) set[id] = 1;
  }
  return set;
}

// TileID.Sets
const IS_A_TREE_TRUNK = tileSet(5, 72, 583, 584, 585, 586, 587, 588, 589, 596, 616, 634);
const CORRUPT = tileSet(23, 661, 25, 112, 163, 398, 400, 636);
const CRIMSON = tileSet(199, 662, 203, 234, 200, 399, 401, 205);
const HALLOW = tileSet(109, 492, 117, 116, 164, 402, 403, 115);

// Main.tileSolid, from TEdit's tile data (scripts/tedit/tiles.json). Only used
// to find the ground a cactus grows from.
const SOLID = tileSetFromRanges(
  '0-2,6-10,19,22-23,25,30,37-41,43-48,51,53-54,56-60,63-68,70,75-76,107-109,111-112,116-123,127,130,137-138,140,' +
  '145-148,150-164,166-170,175-177,179-183,188-200,202-204,206,208,211,221-226,229-230,232,234-235,239,248-253,' +
  '255-268,272-274,284,311-313,315,321-322,325-329,336,340-348,350-353,357,365-371,379-381,383-385,387-388,396-404,' +
  '407-409,415-418,421-422,426-427,430-439,446-451,458-460,472-474,476-479,481-484,492,495-496,498,500-503,507-508,' +
  '512-517,534-537,539-541,546,557,562-563,566,618,625-628,633,635,641,659,661-662,664,666-692,708,711-719,722,' +
  '726-732,734-750',
);

const BEACH_DISTANCE = 380; // WorldGen.beachDistance

/** The tile at (x, y) of a world, read from its raw arrays. */
class Tiles {
  readonly width: number;
  readonly height: number;
  private readonly types: Uint16Array;
  private readonly flags1: Uint8Array;

  constructor(world: WorldData) {
    this.width = world.width;
    this.height = world.height;
    this.types = world.rawTypes!;
    this.flags1 = world.rawFlags1!;
  }

  inWorld(x: number, y: number, fluff = 0): boolean {
    return x >= fluff && x < this.width - fluff && y >= fluff && y < this.height - fluff;
  }

  active(x: number, y: number): boolean {
    return (this.flags1[x * this.height + y] & 0x01) !== 0;
  }

  type(x: number, y: number): number {
    return this.types[x * this.height + y];
  }
}

// Only the few tile types that look at their surroundings need one.
const tilesByWorld = new WeakMap<WorldData, Tiles>();
function tilesOf(world: WorldData): Tiles {
  let tiles = tilesByWorld.get(world);
  if (!tiles) {
    tiles = new Tiles(world);
    tilesByWorld.set(world, tiles);
  }
  return tiles;
}

/** WorldGen.GetTreeBottom, for a tree trunk tile (not a palm tree). */
function getTreeBottom(tiles: Tiles, world: WorldData, idx: number, x: number, y: number): { x: number; y: number } {
  const frameCol = div(world.rawTextureU![idx], 22);
  const frameRow = div(world.rawTextureV![idx], 22);
  if (frameCol === 3 && frameRow <= 2) x++;
  else if (frameCol === 4 && frameRow >= 3 && frameRow <= 5) x--;
  else if (frameCol === 1 && frameRow >= 6 && frameRow <= 8) x--;
  else if (frameCol === 2 && frameRow >= 6 && frameRow <= 8) x++;
  else if (frameCol === 2 && frameRow >= 9) x++;
  else if (frameCol === 3 && frameRow >= 9) x--;
  if (x < 0 || x >= tiles.width) return { x, y };
  while (y < tiles.height - 1 && (!tiles.active(x, y) || IS_A_TREE_TRUNK[tiles.type(x, y)] || tiles.type(x, y) === 72)) {
    y++;
  }
  return { x, y };
}

/** WorldGen.IsThisAMushroomTree: a tree growing from mushroom grass. */
function isMushroomTree(tiles: Tiles, world: WorldData, idx: number, x: number, y: number): boolean {
  const bottom = getTreeBottom(tiles, world, idx, x, y);
  return tiles.inWorld(bottom.x, bottom.y) && tiles.active(bottom.x, bottom.y) && tiles.type(bottom.x, bottom.y) === 70;
}

/** WorldGen.GetCactusType, as the map option: 0 normal, 1 corrupt, 2 hallowed, 3 crimson. */
function getCactusOption(tiles: Tiles, x: number, y: number, frameX: number, frameY: number): number {
  let cx = x;
  if (frameX === 36) cx--;
  if (frameX === 54) cx++;
  if (frameX === 108) cx = frameY !== 18 ? cx + 1 : cx - 1;
  if (!tiles.inWorld(cx, y, 2)) return 0;
  let foundCactus = tiles.type(cx, y) === 80 && tiles.active(cx, y);
  // Down through the cactus to the first solid tile under it. Like the game,
  // `ty` stays on the last tile looked at when the search gives up.
  let ty = y;
  while (!tiles.active(cx, ty) || !SOLID[tiles.type(cx, ty)] || !foundCactus) {
    if (tiles.type(cx, ty) === 80 && tiles.active(cx, ty)) foundCactus = true;
    if (ty + 1 > y + 20 || !tiles.inWorld(cx, ty + 1, 2)) break;
    ty++;
  }
  if (!tiles.active(cx, ty)) return 0;
  switch (tiles.type(cx, ty)) {
    case 112: return 1; // ebonsand
    case 116: return 2; // pearlsand
    case 234: return 3; // crimsand
    default: return 0;
  }
}

/** WorldGen.GetBiomeInfluence */
function getBiomeInfluence(tiles: Tiles, startX: number, endX: number, startY: number, endY: number) {
  let corrupt = 0, crimson = 0, hallowed = 0;
  for (let i = Math.max(startX, 0); i <= endX && i < tiles.width; i++) {
    for (let j = Math.max(startY, 0); j <= endY && j < tiles.height; j++) {
      const type = tiles.type(i, j);
      if (CORRUPT[type]) corrupt++;
      if (CRIMSON[type]) crimson++;
      if (HALLOW[type]) hallowed++;
    }
  }
  return { corrupt, crimson, hallowed, max: Math.max(corrupt, crimson, hallowed) };
}

// The 18-tile-wide rows of the moss/rubble piles (185 small, 649) use the same groupings.
function smallPileOption(n: number): number {
  if (n < 6 || n === 28 || n === 29 || n === 30 || n === 31 || n === 32) return 0;
  if (n < 12 || n === 33 || n === 34 || n === 35) return 1;
  if (n < 28) return 2;
  if (n < 48) return 3;
  if (n < 54) return 4;
  if (n < 72) return 0;
  if (n === 72) return 1;
  if (n < 78) return 11;
  return 0;
}

function mediumPileOption(n: number): number {
  if (n < 6 || n === 19 || n === 20 || n === 21 || n === 22 || n === 23 || n === 24 || n === 33 || n === 38 || n === 39 || n === 40) return 0;
  if (n < 16) return 2;
  if (n < 19 || n === 31 || n === 32) return 1;
  if (n < 31) return 3;
  if (n < 38) return 4;
  if (n < 59) return 0;
  if (n < 62) return 1;
  if (n < 65) return 11;
  return 0;
}

/** MapHelper.GetTileBaseOption: which of tileColors[type] a tile uses. */
function getTileBaseOption(world: WorldData, idx: number, x: number, y: number, type: number): number {
  const frameX = world.rawTextureU![idx];
  const frameY = world.rawTextureV![idx];
  switch (type) {
    case 89: // sofas, benches, pianos...
      switch (div(frameX, 54)) {
        case 0: case 21: case 23: return 0;
        case 43: return 2;
        default: return 1;
      }
    case 160: case 627: case 628: case 692: // rainbow bricks, lava moss
      return (x + y) % 9;
    case 80: // cactus
      return getCactusOption(tilesOf(world), x, y, frameX, frameY);
    case 529: { // sea oats
      const { corrupt, crimson, hallowed, max } = getBiomeInfluence(tilesOf(world), x, x, y + 1, y + 1);
      if (corrupt === 0 && crimson === 0 && hallowed === 0) {
        return x < BEACH_DISTANCE || x > world.width - BEACH_DISTANCE ? 1 : 0;
      }
      if (hallowed === max) return 2;
      return crimson !== max ? 4 : 3;
    }
    case 530: { // oasis plants
      const groundY = y - div(frameY % 36, 18) + 2;
      const left = x - div(frameX % 54, 18);
      const { corrupt, crimson, hallowed, max } = getBiomeInfluence(tilesOf(world), left, left + 3, groundY, groundY);
      if (corrupt === 0 && crimson === 0 && hallowed === 0) return 0;
      if (hallowed === max) return 1;
      return crimson !== max ? 3 : 2;
    }
    case 19: // platforms
      return div(frameY, 18) === 48 ? 1 : 0;
    case 15: { // chairs
      const style = div(frameY, 40);
      return style === 1 || style === 20 ? 1 : 0;
    }
    case 518: case 519: // lily pads, cattails
      return div(frameY, 18);
    case 572: // soul bottles
      return div(frameY, 36);
    case 21: case 441: // chests
      switch (div(frameX, 36)) {
        case 1: case 2: case 10: case 13: case 15: return 1;
        case 3: case 4: return 2;
        case 6: return 3;
        case 11: case 17: return 4;
        default: return 0;
      }
    case 467: case 468: { // more chests
      const style = div(frameX, 36);
      if (style <= 11) return style;
      switch (style) {
        case 12: case 13: case 15: case 18: return 10;
        case 14: case 17: return 7;
        case 16: return 3;
        default: return 12;
      }
    }
    case 560: { // monolith-style trophies
      const style = div(frameX, 36);
      return style >= 0 && style <= 2 ? style : 0;
    }
    case 28: case 653: // pots
      if (frameY < 144) return 0;
      if (frameY < 252) return 1;
      if (frameY < 360 || (frameY >= 900 && frameY < 1008)) return 2;
      if (frameY < 468) return 3;
      if (frameY < 576) return 4;
      if (frameY < 684) return 5;
      if (frameY < 792) return 6;
      if (frameY < 900) return 8;
      if (frameY < 1008) return 7;
      if (frameY < 1116) return 0;
      if (frameY < 1224) return 3;
      return 7;
    case 27: // sunflowers
      return frameY < 34 ? 1 : 0;
    case 31: case 696: // shadow orbs / crimson hearts
      return frameX >= 36 ? 1 : 0;
    case 26: case 695: // demon / crimson altars
      return frameX >= 54 ? 1 : 0;
    case 137: // traps
      switch (div(frameY, 18)) {
        case 1: case 2: case 3: case 4: return 1;
        case 5: return 2;
        default: return 0;
      }
    case 82: case 83: case 84: // herbs
      return Math.min(div(frameX, 18), 6);
    case 591:
      return div(frameX, 36);
    case 105: // statues
      if (frameX >= 1548 && frameX <= 1654) return 1;
      if (frameX >= 1656 && frameX <= 1798) return 2;
      return 0;
    case 133: // furnaces
      return frameX < 52 ? 0 : 1;
    case 134: // anvils
      return frameX < 28 ? 0 : 1;
    case 149: // christmas lights
      return y % 3;
    case 165: case 693: case 694: // stalactites
      if (frameX < 54) return 0;
      if (frameX < 106) return 1;
      if (frameX >= 216) return 1;
      if (frameX < 162) return 2;
      return 3;
    case 178: // gems
      return Math.min(div(frameX, 18), 6);
    case 184: // moss
      return frameX < 242 ? div(frameX, 22) : 0;
    case 650:
      return smallPileOption(div(frameX, 18));
    case 649:
      return mediumPileOption(div(frameX, 36) + (div(frameY, 18) - 1) * 18);
    case 185: // small and medium piles
      if (frameY < 18) return smallPileOption(div(frameX, 18));
      return mediumPileOption(div(frameX, 36) + (div(frameY, 18) - 1) * 18);
    case 186: case 647: { // large piles
      const n = div(frameX, 54);
      if (n < 7) return 2;
      if (n < 22 || n === 33 || n === 34 || n === 35) return 0;
      if (n < 25) return 1;
      if (n === 25) return 5;
      if (n < 32) return 3;
      return 0;
    }
    case 187: case 648: { // more large piles
      const n = div(frameX, 54) + div(frameY, 36) * 36;
      if (n < 3 || n === 14 || n === 15 || n === 16) return 0;
      if (n < 6) return 6;
      if (n < 9) return 7;
      if (n < 18) return 4;
      if (n < 23) return 8;
      if (n < 25) return 0;
      if (n < 29) return 1;
      if (n < 47) return 0;
      if (n < 50) return 1;
      if (n < 52) return 10;
      if (n < 55) return 2;
      return 0;
    }
    case 227: // dye plants
      return div(frameX, 34);
    case 129: // crystal shards
      return frameX >= 324 ? 1 : 0;
    case 240: { // paintings and trophies
      const n = div(frameX, 54) + div(frameY, 54) * 36;
      if ((n >= 0 && n <= 11) || (n >= 47 && n <= 53) || n === 72 || n === 73 || n === 75) return 0;
      if ((n >= 12 && n <= 15) || (n >= 18 && n <= 35) || (n >= 63 && n <= 71) || n === 74 || (n >= 76 && n <= 100)) return 1;
      if (n === 16 || n === 17) return 2;
      if (n >= 41 && n <= 45) return 3;
      if (n === 46) return 4;
      return 0;
    }
    case 242: // paintings
      return div(frameX, 106) === 0 && div(frameY, 72) >= 22 && div(frameY, 72) <= 24 ? 1 : 0;
    case 440: // gem locks
      return Math.min(div(frameX, 54), 6);
    case 457:
      return Math.min(div(frameX, 36), 4);
    case 453:
      return Math.min(div(frameX, 36), 2);
    case 419: // logic gate lamps
      return Math.min(div(frameX, 18), 2);
    case 428: // pressure plate tracks
      return Math.min(div(frameY, 18), 3);
    case 420: // logic gates
      return Math.min(div(frameY, 18), 5);
    case 423: // logic sensors
      return Math.min(div(frameY, 18), 6);
    case 493: // stools
      return Math.min(div(frameX, 18), 5);
    case 548:
      return div(frameX, 54) < 7 ? 0 : 1;
    case 597: { // pylons
      const kind = div(frameX, 54);
      return kind >= 0 && kind <= 10 ? kind : 0;
    }
    default:
      return 0;
  }
}

// The tile types whose map color depends on more than their type: everything
// handled in getTileBaseOption and getTileMapColor. Every other type is drawn in
// its first color, which keeps the render loop fast. (The game also has cases
// for torches (4), which always end up with their first color, and 461, whose
// color depends on the biome the player is standing in, which a world file
// doesn't record.)
export const TILE_COLOR_VARIES = tileSet(
  5, 15, 19, 21, 26, 27, 28, 31, 51, 80, 82, 83, 84, 89, 105, 129, 133, 134, 137, 149, 160, 165, 178, 184, 185,
  186, 187, 227, 240, 242, 419, 420, 423, 428, 440, 441, 453, 457, 467, 468, 493, 518, 519, 529, 530, 548, 560,
  572, 591, 597, 627, 628, 647, 648, 649, 650, 653, 692, 693, 694, 695, 696, 697,
);

/** Each tile type's first (and usually only) map color. */
export const FIRST_TILE_COLORS: (Color | undefined)[] = tileColors.map((options) => options[0]);

function optionColor(type: number, option: number): Color | undefined {
  const options = tileColors[type];
  return options[option] ?? options[0];
}

/**
 * The map color of the block at `idx` (at row `y`), as MapHelper.GetTileType
 * picks it, before paint; undefined when the map shows what's behind it.
 */
export function getTileMapColor(world: WorldData, idx: number, y: number): Color | undefined {
  let type = world.rawTypes![idx];
  if (!TILE_COLOR_VARIES[type]) return FIRST_TILE_COLORS[type];
  const x = div(idx, world.height);
  switch (type) {
    case 5: // trees: mushroom trees have their own color
      return optionColor(5, isMushroomTree(tilesOf(world), world, idx, x, y) ? 1 : 0);
    case 51: case 697: // cobwebs are drawn as a checkerboard
      if ((x + y) % 2 === 0) return undefined;
      break;
    case 19: // this platform frame isn't drawn
      if (world.rawTextureV![idx] === 864) return undefined;
      break;
    case 184: // lava moss is drawn like tile 627
      if (div(world.rawTextureU![idx], 22) === 10) type = 627;
      break;
  }
  return optionColor(type, getTileBaseOption(world, idx, x, y, type));
}

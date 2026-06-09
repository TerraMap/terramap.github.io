export interface TileFrame {
  u?: number;
  v?: number;
  name?: string;
  variety?: string;
  isTile?: boolean;
  parent?: TileInfo;
}

export interface TileInfo {
  id: number;
  name: string;
  size?: string;
  frames?: TileFrame[];

  isTile?: boolean;
  [key: string]: unknown;
}

export interface ItemInfo {
  id: number;
  name: string;
  isItem?: boolean;
}

export interface WallInfo {
  id: number;
  name: string;
  color?: string | { r: number; g: number; b: number } | null;
  isWall?: boolean;
}

export interface NpcInfo {
  id: number;
  name: string;
}

export interface ItemPrefixInfo {
  name: string;
}


export interface WorldItem {
  id: number;
  count: number;
  prefixId: number;
}

export interface Chest {
  x: number;
  y: number;
  name: string;
  maxItems: number;
  items: WorldItem[];
}

export interface Sign {
  x: number;
  y: number;
  text: string;
}

export interface WorldNpc {
  spriteId: number;
  type: string;
  name: string;
  x: number;
  y: number;
  isHomeless: boolean;
  homeX: number;
  homeY: number;
  townVariation?: number;
  homelessDespawn?: boolean;
}

export interface TileEntity {
  type: number;
  id: number;
  position: { x: number; y: number };
  item?: WorldItem;
  items?: WorldItem[];
  dyes?: WorldItem[];
  misc?: WorldItem[];
  logicCheckType?: number;
  on?: boolean;
  arg_62_0?: number;
  bb?: number;
  pose?: number;
  bitsByte?: number;
}

export interface WorldTile {
  IsActive?: boolean;
  Type?: number;
  TextureU?: number;
  TextureV?: number;
  WallType?: number;
  IsWallPresent?: boolean;
  WallColor?: number;
  IsWallColorPresent?: boolean;
  IsLiquidPresent?: boolean;
  LiquidAmount?: number;
  Shimmer?: boolean;
  IsLiquidLava?: boolean;
  IsLiquidHoney?: boolean;
  IsRedWirePresent?: boolean;
  IsGreenWirePresent?: boolean;
  IsBlueWirePresent?: boolean;
  IsYellowWirePresent?: boolean;
  IsActuatorPresent?: boolean;
  slope?: number;
  tileColor?: number;
  echoBlock?: boolean;
  echoWall?: boolean;
  illuminantBlock?: boolean;
  illuminantWall?: boolean;
  info?: TileFrame | TileInfo;
  chest?: Chest;
  sign?: Sign;
  tileEntity?: TileEntity;
  x?: number;
  y?: number;
}

export interface WorldData {
  width: number;
  height: number;
  worldSurfaceY: number;
  rockLayerY: number;
  hellLayerY: number;
  name: string;
  version: number;
  remixWorld: number;
  chests: Chest[];
  signs: Sign[];
  npcs: WorldNpc[];
  tileEntities: Map<{ x: number; y: number }, TileEntity>;
  rawTypes?: Uint16Array;
  rawWallTypes?: Uint16Array;
  rawTextureU?: Int16Array;
  rawTextureV?: Int16Array;
  rawTileColors?: Uint8Array;
  rawWallColors?: Uint8Array;
  rawLiquidAmounts?: Uint8Array;
  rawFlags1?: Uint8Array;
  rawFlags2?: Uint8Array;
  rawFlags3?: Uint8Array;
  chestByIdx?: Map<number, Chest>;
  signByIdx?: Map<number, Sign>;
  entityByIdx?: Map<number, TileEntity>;
  tileTypeIdx?: Map<number, Uint32Array>;
  wallTypeIdx?: Map<number, Uint32Array>;
  itemIdx?: Map<number, Uint32Array>;
  itemHighlightIdx?: Map<number, Uint32Array>;
  [key: string]: unknown;
}

export interface SetEntry {
  id: number;
  name: string;
  isTile?: boolean;
  isItem?: boolean;
  isWall?: boolean;
  u?: number;
  v?: number;
  variety?: string;
  parent?: TileInfo;
}

export interface BlockSet {
  name: string;
  entries: SetEntry[];
}

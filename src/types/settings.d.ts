export interface TileFrame {
  U?: number;
  V?: number;
  Name?: string;
  Variety?: string;
  isTile?: boolean;
  parent?: TileInfo;
}

export interface TileInfo {
  Id: string;
  Name: string;
  Size?: string;
  Frames?: TileFrame[];
  CheckTypes?: string[];
  isTile?: boolean;
  [key: string]: unknown;
}

export interface ItemInfo {
  Id: string;
  Name: string;
  isItem?: boolean;
}

export interface WallInfo {
  Id: string;
  Name: string;
  Color?: string | { r: number; g: number; b: number } | null;
  isWall?: boolean;
}

export interface NpcInfo {
  Id: number;
  Name: string;
}

export interface ItemPrefixInfo {
  Name: string;
}

export interface Settings {
  Tiles: TileInfo[];
  Items: ItemInfo[];
  Walls: WallInfo[];
  Npcs: NpcInfo[];
  ItemPrefix: ItemPrefixInfo[];
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
  tiles: WorldTile[];
  chests: Chest[];
  signs: Sign[];
  npcs: WorldNpc[];
  tileEntities: Map<{ x: number; y: number }, TileEntity>;
  [key: string]: unknown;
}

export interface SetEntry {
  Id: string;
  Name: string;
  isTile?: boolean;
  isItem?: boolean;
  isWall?: boolean;
  U?: number;
  V?: number;
  Variety?: string;
  parent?: TileInfo;
}

export interface BlockSet {
  Name: string;
  Entries: SetEntry[];
}

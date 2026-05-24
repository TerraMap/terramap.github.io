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
  [key: string]: any;
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

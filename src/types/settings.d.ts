export interface TileFrame {
  U?: number;
  V?: number;
  Name?: string;
  Anchor?: string;
  UV?: string;
  Variety?: string;
  isTile?: boolean;
  parent?: TileInfo;
  growsOn?: string;
}

export interface TileInfo {
  Id: string;
  Name: string;
  Color?: string;
  Blends?: string;
  Solid?: string;
  SolidTop?: string;
  MergeWith?: string;
  Stone?: string;
  Special?: string;
  TextureGrid?: string;
  Framed?: string;
  Light?: string;
  Size?: string;
  Placement?: string;
  UV?: string;
  growsOn?: string;
  Frames?: TileFrame[];
  isTile?: boolean;
  // tile-specific properties not in settings but added at runtime or from parsed world data
  [key: string]: any;
}

export interface ItemInfo {
  Id: string;
  Name: string;
  Tally?: string;
  isItem?: boolean;
}

export interface WallInfo {
  Id: string;
  Name: string;
  Color?: string;
  IsHouse?: string;
  isWall?: boolean;
}

export interface NpcInfo {
  Id: number;
  Name: string;
}

export interface ItemPrefixInfo {
  Id: string;
  Name: string;
}

export interface GlobalColor {
  Name: string;
  Color: string;
}

export interface Settings {
  GlobalColors: GlobalColor[];
  Tiles: TileInfo[];
  Items: ItemInfo[];
  Walls: WallInfo[];
  Npcs: NpcInfo[];
  ItemPrefix: ItemPrefixInfo[];
}

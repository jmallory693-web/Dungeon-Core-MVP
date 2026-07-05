export type ResourceState = {
  mana: number;
  stone: number;
};

export type TileStatus = "hidden" | "claimed" | "blocked";

export type TileType =
  | "stone"
  | "softEarth"
  | "manaVein"
  | "mushroomCave"
  | "boneDeposit"
  | "undergroundPool";

export type RoomType = "core" | "entrance" | "empty";

export type DungeonTile = {
  id: string;
  floor: number;
  x: number;
  y: number;
  status: TileStatus;
  tileType: TileType;
  roomType: RoomType;
  claimedAtTurn?: number;
};

export type DungeonState = {
  schemaVersion: number;
  ownerUid: string;
  name: string;
  turn: number;
  floor: number;
  width: number;
  height: number;
  resources: ResourceState;
  tiles: DungeonTile[];
  log: string[];
  createdAt: string;
  updatedAt: string;
};

export const SCHEMA_VERSION = 1;
export const GRID_SIZE = 7;
export const CORE_X = 3;
export const CORE_Y = 3;
export const ENTRANCE_X = 3;
export const ENTRANCE_Y = 0;

export const CLAIM_COST: ResourceState = { mana: 10, stone: 5 };
export const STARTING_RESOURCES: ResourceState = { mana: 100, stone: 50 };
export const MANA_PER_TURN = 5;

export const TILE_TYPES: TileType[] = [
  "stone",
  "softEarth",
  "manaVein",
  "mushroomCave",
  "boneDeposit",
  "undergroundPool",
];

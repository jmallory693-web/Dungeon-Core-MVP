export type ResourceState = {
  mana: number;
  stone: number;
  essence: number;
  food: number;
  gold: number;
};

export type TileStatus = "hidden" | "claimed" | "blocked";

export type TileType =
  | "stone"
  | "softEarth"
  | "manaVein"
  | "mushroomCave"
  | "boneDeposit"
  | "undergroundPool";

export type RoomType =
  | "core"
  | "entrance"
  | "empty"
  | "manaSiphon"
  | "stoneQuarry"
  | "mushroomFarm"
  | "boneShrine"
  | "treasureNook";

export type PulseSpeedMultiplier = 0.5 | 1 | 2;

export const PULSE_SPEED_OPTIONS: PulseSpeedMultiplier[] = [0.5, 1, 2];

export type BuildableRoomType = Exclude<
  RoomType,
  "core" | "entrance" | "empty"
>;

export type DungeonTile = {
  id: string;
  floor: number;
  x: number;
  y: number;
  status: TileStatus;
  tileType: TileType;
  roomType: RoomType;
  claimedAtPulse?: number;
};

export type DungeonState = {
  schemaVersion: number;
  ownerUid: string;
  name: string;
  pulseCount: number;
  lastPulseAt: string;
  pulseIntervalMs: number;
  isPulsePaused: boolean;
  pulseSpeedMultiplier: PulseSpeedMultiplier;
  floor: number;
  width: number;
  height: number;
  resources: ResourceState;
  tiles: DungeonTile[];
  log: string[];
  createdAt: string;
  updatedAt: string;
};

export const SCHEMA_VERSION = 3;
export const GRID_SIZE = 7;
export const CORE_X = 3;
export const CORE_Y = 3;
export const ENTRANCE_X = 3;
export const ENTRANCE_Y = 0;

export const DEFAULT_PULSE_INTERVAL_MS = 10000;
export const MAX_OFFLINE_PULSES = 360;
export const MANA_PER_PULSE = 5;

export const CLAIM_COST: ResourceState = {
  mana: 10,
  stone: 5,
  essence: 0,
  food: 0,
  gold: 0,
};

export const STARTING_RESOURCES: ResourceState = {
  mana: 100,
  stone: 50,
  essence: 0,
  food: 0,
  gold: 0,
};

/** @deprecated Use MANA_PER_PULSE. Kept for room rules until room production moves to pulses. */
export const MANA_PER_TURN = MANA_PER_PULSE;

export const TILE_TYPES: TileType[] = [
  "stone",
  "softEarth",
  "manaVein",
  "mushroomCave",
  "boneDeposit",
  "undergroundPool",
];

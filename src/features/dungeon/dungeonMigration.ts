import {
  DEFAULT_PULSE_INTERVAL_MS,
  SCHEMA_VERSION,
  STARTING_RESOURCES,
  type DungeonState,
  type DungeonTile,
  type ResourceState,
  type RoomType,
} from "./dungeonTypes";
import { applyOfflineProgress, normalizePulseSpeedMultiplier } from "./pulseRules";
import { normalizeResources } from "./resourceUtils";

const VALID_ROOM_TYPES = new Set<RoomType>([
  "core",
  "entrance",
  "empty",
  "manaSiphon",
  "stoneQuarry",
  "mushroomFarm",
  "boneShrine",
  "treasureNook",
]);

type LegacyDungeonState = DungeonState & {
  turn?: number;
};

function normalizeTile(tile: DungeonTile & { claimedAtTurn?: number }): DungeonTile {
  const roomType = VALID_ROOM_TYPES.has(tile.roomType) ? tile.roomType : "empty";
  const claimedAtPulse = tile.claimedAtPulse ?? tile.claimedAtTurn;

  return {
    ...tile,
    roomType,
    claimedAtPulse,
  };
}

function migratePulseFields(dungeon: LegacyDungeonState, now: string) {
  const pulseCount =
    typeof dungeon.pulseCount === "number"
      ? dungeon.pulseCount
      : typeof dungeon.turn === "number"
        ? dungeon.turn
        : 0;

  return {
    pulseCount,
    lastPulseAt:
      typeof dungeon.lastPulseAt === "string" ? dungeon.lastPulseAt : now,
    pulseIntervalMs:
      typeof dungeon.pulseIntervalMs === "number"
        ? dungeon.pulseIntervalMs
        : DEFAULT_PULSE_INTERVAL_MS,
    isPulsePaused:
      typeof dungeon.isPulsePaused === "boolean" ? dungeon.isPulsePaused : false,
    pulseSpeedMultiplier: normalizePulseSpeedMultiplier(
      dungeon.pulseSpeedMultiplier,
    ),
  };
}

export function normalizeDungeonState(raw: unknown): DungeonState {
  const dungeon = raw as LegacyDungeonState;
  const now = new Date().toISOString();
  const resources = normalizeResources(dungeon.resources);
  const pulseFields = migratePulseFields(dungeon, now);

  const baseState: DungeonState = {
    ...dungeon,
    schemaVersion: SCHEMA_VERSION,
    resources: {
      mana: resources.mana ?? STARTING_RESOURCES.mana,
      stone: resources.stone ?? STARTING_RESOURCES.stone,
      essence: resources.essence ?? 0,
      food: resources.food ?? 0,
      gold: resources.gold ?? 0,
    },
    ...pulseFields,
    tiles: (dungeon.tiles ?? []).map(normalizeTile),
    log: dungeon.log ?? [],
  };

  if (dungeon.schemaVersion === undefined || dungeon.schemaVersion < SCHEMA_VERSION) {
    return baseState;
  }

  return baseState;
}

export function loadDungeonWithOfflineProgress(raw: unknown): DungeonState {
  const normalized = normalizeDungeonState(raw);
  return applyOfflineProgress(normalized);
}

export function shouldPersistAfterLoad(
  before: DungeonState,
  after: DungeonState,
): boolean {
  return (
    before.pulseCount !== after.pulseCount ||
    before.lastPulseAt !== after.lastPulseAt ||
    before.resources.mana !== after.resources.mana ||
    before.isPulsePaused !== after.isPulsePaused ||
    before.pulseSpeedMultiplier !== after.pulseSpeedMultiplier
  );
}

export function normalizeResourcesForSave(
  resources: Partial<ResourceState> | ResourceState,
): ResourceState {
  return normalizeResources(resources);
}

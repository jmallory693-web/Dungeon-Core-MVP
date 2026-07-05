import {
  MANA_PER_TURN,
  type BuildableRoomType,
  type DungeonState,
  type DungeonTile,
  type ResourceState,
  type RoomType,
  type TileType,
} from "./dungeonTypes";
import { applyBonus, applyCost, canAfford, formatResourceCost } from "./resourceUtils";

export type RoomDefinition = {
  roomType: BuildableRoomType;
  name: string;
  cost: ResourceState;
  requiredTileTypes: TileType[] | "any";
  production: Partial<ResourceState>;
  productionLabel: string;
};

export const ROOM_DEFINITIONS: RoomDefinition[] = [
  {
    roomType: "manaSiphon",
    name: "Mana Siphon",
    cost: { mana: 30, stone: 10, essence: 0, food: 0, gold: 0 },
    requiredTileTypes: ["manaVein", "stone"],
    production: { mana: 3 },
    productionLabel: "+3 mana/pulse",
  },
  {
    roomType: "stoneQuarry",
    name: "Stone Quarry",
    cost: { mana: 20, stone: 20, essence: 0, food: 0, gold: 0 },
    requiredTileTypes: ["stone", "softEarth"],
    production: { stone: 3 },
    productionLabel: "+3 stone/pulse",
  },
  {
    roomType: "mushroomFarm",
    name: "Mushroom Farm",
    cost: { mana: 15, stone: 10, essence: 0, food: 0, gold: 0 },
    requiredTileTypes: ["mushroomCave", "undergroundPool"],
    production: { food: 3 },
    productionLabel: "+3 food/pulse",
  },
  {
    roomType: "boneShrine",
    name: "Bone Shrine",
    cost: { mana: 25, stone: 10, essence: 5, food: 0, gold: 0 },
    requiredTileTypes: ["boneDeposit", "stone"],
    production: { essence: 2 },
    productionLabel: "+2 essence/pulse",
  },
  {
    roomType: "treasureNook",
    name: "Treasure Nook",
    cost: { mana: 10, stone: 5, essence: 0, food: 0, gold: 0 },
    requiredTileTypes: "any",
    production: { gold: 2 },
    productionLabel: "+2 gold/pulse",
  },
];

export type BuildRoomResult =
  | { ok: true; dungeon: DungeonState; message: string }
  | { ok: false; reason: string };

export type RoomBuildOption = {
  definition: RoomDefinition;
  canBuild: boolean;
  reason?: string;
};

function isBuildableSurface(tile: DungeonTile): boolean {
  return tile.status === "claimed" && tile.roomType === "empty";
}

function tileMatchesRequirement(
  tile: DungeonTile,
  requiredTileTypes: TileType[] | "any",
): boolean {
  if (requiredTileTypes === "any") {
    return true;
  }

  return requiredTileTypes.includes(tile.tileType);
}

export function getRoomDefinition(
  roomType: BuildableRoomType,
): RoomDefinition | undefined {
  return ROOM_DEFINITIONS.find((entry) => entry.roomType === roomType);
}

export function calculateTurnProduction(dungeon: DungeonState): ResourceState {
  const production: ResourceState = {
    mana: MANA_PER_TURN,
    stone: 0,
    essence: 0,
    food: 0,
    gold: 0,
  };

  for (const tile of dungeon.tiles) {
    const definition = ROOM_DEFINITIONS.find(
      (entry) => entry.roomType === tile.roomType,
    );
    if (!definition) {
      continue;
    }

    production.mana += definition.production.mana ?? 0;
    production.stone += definition.production.stone ?? 0;
    production.essence += definition.production.essence ?? 0;
    production.food += definition.production.food ?? 0;
    production.gold += definition.production.gold ?? 0;
  }

  return production;
}

export function applyTurnProduction(
  resources: ResourceState,
  dungeon: DungeonState,
): ResourceState {
  const production = calculateTurnProduction(dungeon);
  return applyBonus(resources, production);
}

export function canBuildRoomOnTile(
  dungeon: DungeonState,
  tile: DungeonTile,
  roomType: BuildableRoomType,
): { canBuild: boolean; reason?: string } {
  const definition = getRoomDefinition(roomType);
  if (!definition) {
    return { canBuild: false, reason: "Unknown room type." };
  }

  if (tile.status !== "claimed") {
    return { canBuild: false, reason: "Tile must be claimed first." };
  }

  if (tile.roomType === "core" || tile.roomType === "entrance") {
    return { canBuild: false, reason: "Cannot build over special tiles." };
  }

  if (tile.roomType !== "empty") {
    return { canBuild: false, reason: "This tile already has a room." };
  }

  if (!tileMatchesRequirement(tile, definition.requiredTileTypes)) {
    return {
      canBuild: false,
      reason: `Requires tile type: ${definition.requiredTileTypes === "any" ? "any claimed empty tile" : definition.requiredTileTypes.join(" or ")}.`,
    };
  }

  if (!canAfford(dungeon.resources, definition.cost)) {
    return {
      canBuild: false,
      reason: `Need ${formatResourceCost(definition.cost)}.`,
    };
  }

  return { canBuild: true };
}

export function getBuildOptionsForTile(
  dungeon: DungeonState,
  tile: DungeonTile,
): RoomBuildOption[] {
  if (!isBuildableSurface(tile)) {
    return [];
  }

  return ROOM_DEFINITIONS.map((definition) => {
    const eligibility = canBuildRoomOnTile(dungeon, tile, definition.roomType);
    return {
      definition,
      canBuild: eligibility.canBuild,
      reason: eligibility.reason,
    };
  });
}

export function buildRoom(
  dungeon: DungeonState,
  tileId: string,
  roomType: BuildableRoomType,
): BuildRoomResult {
  const tile = dungeon.tiles.find((entry) => entry.id === tileId);
  if (!tile) {
    return { ok: false, reason: "Tile not found." };
  }

  const eligibility = canBuildRoomOnTile(dungeon, tile, roomType);
  if (!eligibility.canBuild) {
    return { ok: false, reason: eligibility.reason ?? "Cannot build room." };
  }

  const definition = getRoomDefinition(roomType)!;

  let resources = applyCost(dungeon.resources, definition.cost);
  const updatedTiles = dungeon.tiles.map((entry) =>
    entry.id === tileId ? { ...entry, roomType: roomType as RoomType } : entry,
  );

  const now = new Date().toISOString();
  const message = `Built ${definition.name} at (${tile.x}, ${tile.y}).`;
  const updatedLog = [message, ...dungeon.log].slice(0, 50);

  return {
    ok: true,
    dungeon: {
      ...dungeon,
      resources,
      tiles: updatedTiles,
      log: updatedLog,
      updatedAt: now,
    },
    message,
  };
}

export function formatBuildableRoomType(roomType: BuildableRoomType): string {
  return getRoomDefinition(roomType)?.name ?? roomType;
}

import {
  CLAIM_COST,
  MANA_PER_TURN,
  type DungeonState,
  type DungeonTile,
  type ResourceState,
} from "./dungeonTypes";
import { getTileAt } from "./dungeonGeneration";

export type ClaimResult =
  | { ok: true; dungeon: DungeonState; message: string }
  | { ok: false; reason: string };

function hasResources(resources: ResourceState): boolean {
  return resources.mana >= CLAIM_COST.mana && resources.stone >= CLAIM_COST.stone;
}

function isAdjacentToClaimed(dungeon: DungeonState, tile: DungeonTile): boolean {
  const neighbors = [
    { x: tile.x - 1, y: tile.y },
    { x: tile.x + 1, y: tile.y },
    { x: tile.x, y: tile.y - 1 },
    { x: tile.x, y: tile.y + 1 },
  ];

  return neighbors.some((pos) => {
    const neighbor = getTileAt(dungeon, pos.x, pos.y);
    return neighbor?.status === "claimed";
  });
}

export function canClaimTile(
  dungeon: DungeonState,
  tile: DungeonTile,
): { canClaim: boolean; reason?: string } {
  if (tile.status === "claimed") {
    return { canClaim: false, reason: "Already claimed." };
  }

  if (tile.status === "blocked") {
    return { canClaim: false, reason: "Blocked by dense rock." };
  }

  if (tile.status !== "hidden") {
    return { canClaim: false, reason: "Cannot claim this tile." };
  }

  if (!isAdjacentToClaimed(dungeon, tile)) {
    return { canClaim: false, reason: "Must be adjacent to a claimed tile." };
  }

  if (!hasResources(dungeon.resources)) {
    return {
      canClaim: false,
      reason: `Need ${CLAIM_COST.mana} mana and ${CLAIM_COST.stone} stone.`,
    };
  }

  return { canClaim: true };
}

export function claimTile(dungeon: DungeonState, tileId: string): ClaimResult {
  const tile = dungeon.tiles.find((entry) => entry.id === tileId);
  if (!tile) {
    return { ok: false, reason: "Tile not found." };
  }

  const eligibility = canClaimTile(dungeon, tile);
  if (!eligibility.canClaim) {
    return { ok: false, reason: eligibility.reason ?? "Cannot claim tile." };
  }

  const nextTurn = dungeon.turn + 1;
  const updatedResources: ResourceState = {
    mana:
      dungeon.resources.mana -
      CLAIM_COST.mana +
      MANA_PER_TURN,
    stone: dungeon.resources.stone - CLAIM_COST.stone,
  };

  const updatedTiles = dungeon.tiles.map((entry) =>
    entry.id === tileId
      ? { ...entry, status: "claimed" as const, claimedAtTurn: nextTurn }
      : entry,
  );

  const message = `Claimed tile (${tile.x}, ${tile.y}) — ${tile.tileType}. Turn ${nextTurn}.`;
  const updatedLog = [message, ...dungeon.log].slice(0, 50);

  const updatedDungeon: DungeonState = {
    ...dungeon,
    turn: nextTurn,
    resources: updatedResources,
    tiles: updatedTiles,
    log: updatedLog,
    updatedAt: new Date().toISOString(),
  };

  return { ok: true, dungeon: updatedDungeon, message };
}

export function formatTileStatus(status: DungeonTile["status"]): string {
  switch (status) {
    case "hidden":
      return "Hidden";
    case "claimed":
      return "Claimed";
    case "blocked":
      return "Blocked";
    default:
      return status;
  }
}

export function formatTileType(tileType: DungeonTile["tileType"]): string {
  switch (tileType) {
    case "softEarth":
      return "Soft Earth";
    case "manaVein":
      return "Mana Vein";
    case "mushroomCave":
      return "Mushroom Cave";
    case "boneDeposit":
      return "Bone Deposit";
    case "undergroundPool":
      return "Underground Pool";
    default:
      return "Stone";
  }
}

export function formatRoomType(roomType: DungeonTile["roomType"]): string {
  switch (roomType) {
    case "core":
      return "Core Chamber";
    case "entrance":
      return "Entrance";
    default:
      return "Empty";
  }
}

import {
  CLAIM_COST,
  type DungeonState,
  type DungeonTile,
  type ResourceState,
  type TileType,
} from "./dungeonTypes";
import { getTileAt } from "./dungeonGeneration";
import { applyBonus, applyCost, canAfford } from "./resourceUtils";

export type ClaimResult =
  | { ok: true; dungeon: DungeonState; message: string }
  | { ok: false; reason: string };

type TileClaimReward = {
  bonus: Partial<ResourceState>;
  log: string;
};

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

function getTileClaimReward(tileType: TileType): TileClaimReward | null {
  switch (tileType) {
    case "stone":
      return null;
    case "softEarth":
      return {
        bonus: { stone: 3 },
        log: "The core spreads easily through soft earth.",
      };
    case "manaVein":
      return {
        bonus: { mana: 25 },
        log: "A mana vein pulses beneath the stone. The core drinks deeply.",
      };
    case "mushroomCave":
      return {
        bonus: { food: 10 },
        log: "Pale mushrooms bloom in the damp dark.",
      };
    case "boneDeposit":
      return {
        bonus: { essence: 10 },
        log: "Ancient bones crumble into usable essence.",
      };
    case "undergroundPool":
      return {
        bonus: { mana: 5, food: 5 },
        log: "Cold underground water gathers around the core's roots.",
      };
    default:
      return null;
  }
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

  if (!canAfford(dungeon.resources, CLAIM_COST)) {
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

  let resources = applyCost(dungeon.resources, CLAIM_COST);

  const updatedTiles = dungeon.tiles.map((entry) =>
    entry.id === tileId
      ? {
          ...entry,
          status: "claimed" as const,
          claimedAtPulse: dungeon.pulseCount,
        }
      : entry,
  );

  const reward = getTileClaimReward(tile.tileType);
  const logEntries: string[] = [
    `Claimed tile (${tile.x}, ${tile.y}) — ${tile.tileType}.`,
  ];

  if (reward) {
    resources = applyBonus(resources, reward.bonus);
    logEntries.push(reward.log);
  }

  const updatedLog = [...logEntries, ...dungeon.log].slice(0, 50);
  const now = new Date().toISOString();

  const updatedDungeon: DungeonState = {
    ...dungeon,
    resources,
    tiles: updatedTiles,
    log: updatedLog,
    updatedAt: now,
  };

  return {
    ok: true,
    dungeon: updatedDungeon,
    message: logEntries[0],
  };
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
    case "manaSiphon":
      return "Mana Siphon";
    case "stoneQuarry":
      return "Stone Quarry";
    case "mushroomFarm":
      return "Mushroom Farm";
    case "boneShrine":
      return "Bone Shrine";
    case "treasureNook":
      return "Treasure Nook";
    default:
      return "Empty";
  }
}

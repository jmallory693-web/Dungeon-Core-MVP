import {
  CORE_X,
  CORE_Y,
  ENTRANCE_X,
  ENTRANCE_Y,
  GRID_SIZE,
  SCHEMA_VERSION,
  STARTING_RESOURCES,
  TILE_TYPES,
  type DungeonState,
  type DungeonTile,
  type TileType,
} from "./dungeonTypes";

const BLOCKED_TILE_COUNT = 8;

function tileId(x: number, y: number): string {
  return `${x}-${y}`;
}

function randomTileType(): TileType {
  return TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function candidateBlockedTiles(): { x: number; y: number }[] {
  const candidates: { x: number; y: number }[] = [];
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const isCore = x === CORE_X && y === CORE_Y;
      const isEntrance = x === ENTRANCE_X && y === ENTRANCE_Y;
      if (!isCore && !isEntrance) {
        candidates.push({ x, y });
      }
    }
  }
  return candidates;
}

function createTile(
  x: number,
  y: number,
  status: DungeonTile["status"],
  roomType: DungeonTile["roomType"],
  tileType: TileType,
  claimedAtTurn?: number,
): DungeonTile {
  return {
    id: tileId(x, y),
    floor: 1,
    x,
    y,
    status,
    tileType,
    roomType,
    claimedAtTurn,
  };
}

export function createInitialDungeon(ownerUid: string): DungeonState {
  const now = new Date().toISOString();
  const blockedCoords = shuffle(candidateBlockedTiles())
    .slice(0, BLOCKED_TILE_COUNT)
    .map(({ x, y }) => tileId(x, y));
  const blockedSet = new Set(blockedCoords);

  const tiles: DungeonTile[] = [];
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const id = tileId(x, y);
      const isCore = x === CORE_X && y === CORE_Y;
      const isEntrance = x === ENTRANCE_X && y === ENTRANCE_Y;

      if (isCore) {
        tiles.push(
          createTile(x, y, "claimed", "core", "manaVein", 0),
        );
        continue;
      }

      if (isEntrance) {
        tiles.push(
          createTile(x, y, "claimed", "entrance", "softEarth", 0),
        );
        continue;
      }

      if (blockedSet.has(id)) {
        tiles.push(createTile(x, y, "blocked", "empty", randomTileType()));
        continue;
      }

      tiles.push(createTile(x, y, "hidden", "empty", randomTileType()));
    }
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    ownerUid,
    name: "First Floor Core",
    turn: 0,
    floor: 1,
    width: GRID_SIZE,
    height: GRID_SIZE,
    resources: { ...STARTING_RESOURCES },
    tiles,
    log: [
      "Dungeon core awakened.",
      "Entrance tunnel secured at the surface.",
      "Expand adjacent tiles to grow your domain.",
    ],
    createdAt: now,
    updatedAt: now,
  };
}

export function getTileAt(
  dungeon: DungeonState,
  x: number,
  y: number,
): DungeonTile | undefined {
  return dungeon.tiles.find((tile) => tile.x === x && tile.y === y);
}

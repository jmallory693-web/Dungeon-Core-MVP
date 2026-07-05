import type { DungeonState, DungeonTile } from "./dungeonTypes";

type DungeonGridProps = {
  dungeon: DungeonState;
  selectedTileId: string | null;
  onSelectTile: (tileId: string) => void;
};

function tileClassName(tile: DungeonTile, selected: boolean): string {
  const classes = ["grid-tile", `status-${tile.status}`];
  if (tile.roomType === "core") {
    classes.push("room-core");
  }
  if (tile.roomType === "entrance") {
    classes.push("room-entrance");
  }
  if (selected) {
    classes.push("selected");
  }
  return classes.join(" ");
}

function tileLabel(tile: DungeonTile): string {
  if (tile.roomType === "core") {
    return "C";
  }
  if (tile.roomType === "entrance") {
    return "E";
  }
  if (tile.status === "claimed") {
    return "•";
  }
  if (tile.status === "blocked") {
    return "X";
  }
  return "?";
}

export function DungeonGrid({
  dungeon,
  selectedTileId,
  onSelectTile,
}: DungeonGridProps) {
  const rows: DungeonTile[][] = [];
  for (let y = 0; y < dungeon.height; y += 1) {
    const row: DungeonTile[] = [];
    for (let x = 0; x < dungeon.width; x += 1) {
      const tile = dungeon.tiles.find((entry) => entry.x === x && entry.y === y);
      if (tile) {
        row.push(tile);
      }
    }
    rows.push(row);
  }

  return (
    <div
      className="dungeon-grid"
      style={{
        gridTemplateColumns: `repeat(${dungeon.width}, 1fr)`,
      }}
    >
      {rows.flatMap((row) =>
        row.map((tile) => (
          <button
            key={tile.id}
            type="button"
            className={tileClassName(tile, selectedTileId === tile.id)}
            onClick={() => onSelectTile(tile.id)}
            aria-label={`Tile ${tile.x}, ${tile.y}`}
          >
            {tileLabel(tile)}
          </button>
        )),
      )}
    </div>
  );
}

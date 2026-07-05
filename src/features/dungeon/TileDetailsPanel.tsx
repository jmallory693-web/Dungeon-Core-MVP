import {
  canClaimTile,
  formatRoomType,
  formatTileStatus,
  formatTileType,
} from "./dungeonRules";
import type { DungeonState, DungeonTile } from "./dungeonTypes";

type TileDetailsPanelProps = {
  dungeon: DungeonState;
  tile: DungeonTile | null;
  onClaim: (tileId: string) => void;
  claiming: boolean;
  claimError: string | null;
};

export function TileDetailsPanel({
  dungeon,
  tile,
  onClaim,
  claiming,
  claimError,
}: TileDetailsPanelProps) {
  if (!tile) {
    return (
      <section className="tile-details">
        <h2>Tile Details</h2>
        <p className="muted">Select a tile on the grid.</p>
      </section>
    );
  }

  const eligibility = canClaimTile(dungeon, tile);

  return (
    <section className="tile-details">
      <h2>Tile Details</h2>
      <dl>
        <div>
          <dt>Coordinates</dt>
          <dd>
            ({tile.x}, {tile.y})
          </dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{formatTileStatus(tile.status)}</dd>
        </div>
        <div>
          <dt>Tile Type</dt>
          <dd>{formatTileType(tile.tileType)}</dd>
        </div>
        <div>
          <dt>Room Type</dt>
          <dd>{formatRoomType(tile.roomType)}</dd>
        </div>
        <div>
          <dt>Can Be Claimed</dt>
          <dd>{eligibility.canClaim ? "Yes" : "No"}</dd>
        </div>
      </dl>

      {!eligibility.canClaim && eligibility.reason && (
        <p className="claim-hint">{eligibility.reason}</p>
      )}

      {claimError && <p className="claim-error">{claimError}</p>}

      <button
        type="button"
        className="claim-button"
        disabled={!eligibility.canClaim || claiming}
        onClick={() => onClaim(tile.id)}
      >
        {claiming ? "Claiming..." : "Claim Tile (10 mana, 5 stone)"}
      </button>
    </section>
  );
}

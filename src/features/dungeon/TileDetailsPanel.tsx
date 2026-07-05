import {
  canClaimTile,
  formatRoomType,
  formatTileStatus,
  formatTileType,
} from "./dungeonRules";
import type { BuildableRoomType } from "./dungeonTypes";
import type { DungeonState, DungeonTile } from "./dungeonTypes";
import { formatResourceCost } from "./resourceUtils";
import { getBuildOptionsForTile } from "./roomRules";

type TileDetailsPanelProps = {
  dungeon: DungeonState;
  tile: DungeonTile | null;
  onClaim: (tileId: string) => void;
  onBuildRoom: (tileId: string, roomType: BuildableRoomType) => void;
  claiming: boolean;
  building: boolean;
  claimError: string | null;
  buildError: string | null;
};

export function TileDetailsPanel({
  dungeon,
  tile,
  onClaim,
  onBuildRoom,
  claiming,
  building,
  claimError,
  buildError,
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
  const buildOptions = getBuildOptionsForTile(dungeon, tile);
  const showBuildSection = tile.status === "claimed" && tile.roomType === "empty";
  const affordableBuildOptions = buildOptions.filter((option) => option.canBuild);

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
        {tile.status === "hidden" && (
          <div>
            <dt>Can Be Claimed</dt>
            <dd>{eligibility.canClaim ? "Yes" : "No"}</dd>
          </div>
        )}
      </dl>

      {tile.status === "hidden" && (
        <>
          {!eligibility.canClaim && eligibility.reason && (
            <p className="claim-hint">{eligibility.reason}</p>
          )}

          {claimError && <p className="claim-error">{claimError}</p>}

          <button
            type="button"
            className="claim-button"
            disabled={!eligibility.canClaim || claiming || building}
            onClick={() => onClaim(tile.id)}
          >
            {claiming ? "Claiming..." : "Claim Tile (10 mana, 5 stone)"}
          </button>
        </>
      )}

      {showBuildSection && (
        <section className="build-room-section">
          <h3>Build Room</h3>
          {buildOptions.length === 0 ? (
            <p className="muted">No rooms can be built on this tile.</p>
          ) : (
            <ul className="build-room-list">
              {buildOptions.map(({ definition, canBuild, reason }) => (
                <li key={definition.roomType} className="build-room-option">
                  <div className="build-room-option-header">
                    <strong>{definition.name}</strong>
                    <span className="build-room-production">
                      {definition.productionLabel}
                    </span>
                  </div>
                  <p className="build-room-cost">
                    Cost: {formatResourceCost(definition.cost)}
                  </p>
                  {!canBuild && reason && (
                    <p className="claim-hint">{reason}</p>
                  )}
                  <button
                    type="button"
                    className="build-button"
                    disabled={!canBuild || building || claiming}
                    onClick={() => onBuildRoom(tile.id, definition.roomType)}
                  >
                    {building ? "Building..." : `Build ${definition.name}`}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {affordableBuildOptions.length === 0 && buildOptions.length > 0 && (
            <p className="claim-hint">
              No affordable rooms right now. Claim more resources or choose another tile.
            </p>
          )}
          {buildError && <p className="claim-error">{buildError}</p>}
        </section>
      )}

      {tile.status === "claimed" && tile.roomType !== "empty" && (
        <p className="muted">This tile already has a built room.</p>
      )}
    </section>
  );
}

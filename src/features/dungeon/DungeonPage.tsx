import { useCallback, useEffect, useMemo, useState } from "react";
import { DemoModeBanner } from "../demo/DemoModeBanner";
import { claimTile } from "./dungeonRules";
import type { DungeonState } from "./dungeonTypes";
import { DungeonGrid } from "./DungeonGrid";
import { DungeonLog } from "./DungeonLog";
import { ResourceBar } from "./ResourceBar";
import { TileDetailsPanel } from "./TileDetailsPanel";
import { useDungeonSession } from "./useDungeonSession";

export function DungeonPage() {
  const session = useDungeonSession();
  const repository =
    session.status === "ready" ? session.repository : null;
  const isDemoMode = session.isDemoMode;
  const [dungeon, setDungeon] = useState<DungeonState | null>(null);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!repository) {
      return;
    }

    const activeRepository = repository;
    let cancelled = false;

    async function loadDungeon() {
      setLoading(true);
      setLoadError(null);
      try {
        const data = await activeRepository.loadOrCreateDungeon();
        if (!cancelled) {
          setDungeon(data);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Failed to load dungeon.";
          setLoadError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDungeon();

    return () => {
      cancelled = true;
    };
  }, [repository]);

  useEffect(() => {
    if (!dungeon || !selectedTileId) {
      return;
    }

    const tileExists = dungeon.tiles.some((tile) => tile.id === selectedTileId);
    if (!tileExists) {
      setSelectedTileId(null);
    }
  }, [dungeon, selectedTileId]);

  const selectedTile = useMemo(() => {
    if (!dungeon || !selectedTileId) {
      return null;
    }
    return dungeon.tiles.find((tile) => tile.id === selectedTileId) ?? null;
  }, [dungeon, selectedTileId]);

  const handleClaim = useCallback(
    async (tileId: string) => {
      if (!dungeon || !repository) {
        return;
      }

      setClaimError(null);
      const result = claimTile(dungeon, tileId);
      if (!result.ok) {
        setClaimError(result.reason);
        return;
      }

      setClaiming(true);
      try {
        await repository.saveDungeon(result.dungeon);
        setDungeon(result.dungeon);
        setSelectedTileId(tileId);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to save dungeon.";
        setClaimError(message);
      } finally {
        setClaiming(false);
      }
    },
    [dungeon, repository],
  );

  const handleResetDemo = useCallback(async () => {
    if (!isDemoMode || !repository) {
      return;
    }

    const resetDungeon = repository.resetDungeon;
    if (!resetDungeon) {
      return;
    }

    const confirmed = window.confirm(
      "Reset demo save? This deletes your local progress and starts a new dungeon.",
    );
    if (!confirmed) {
      return;
    }

    setResetting(true);
    setLoadError(null);
    setClaimError(null);
    setSelectedTileId(null);

    try {
      const freshDungeon = await resetDungeon();
      setDungeon(freshDungeon);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to reset demo save.";
      setLoadError(message);
    } finally {
      setResetting(false);
    }
  }, [isDemoMode, repository]);

  if (session.status === "loading" || loading) {
    return <p className="status-message">Awakening the dungeon core...</p>;
  }

  if (session.status === "error") {
    return (
      <p className="status-message error">
        Authentication failed: {session.message}
      </p>
    );
  }

  if (loadError) {
    return (
      <p className="status-message error">Failed to load dungeon: {loadError}</p>
    );
  }

  if (!dungeon) {
    return <p className="status-message error">Dungeon data unavailable.</p>;
  }

  return (
    <div className="dungeon-page">
      {isDemoMode && (
        <DemoModeBanner onResetDemo={handleResetDemo} resetting={resetting} />
      )}

      <header className="dungeon-header">
        <div>
          <h1>{dungeon.name}</h1>
          <p className="muted">Floor {dungeon.floor} — expand your claimed domain.</p>
        </div>
        <ResourceBar resources={dungeon.resources} turn={dungeon.turn} />
      </header>

      <div className="dungeon-layout">
        <DungeonGrid
          dungeon={dungeon}
          selectedTileId={selectedTileId}
          onSelectTile={setSelectedTileId}
        />

        <aside className="dungeon-sidebar">
          <TileDetailsPanel
            dungeon={dungeon}
            tile={selectedTile}
            onClaim={handleClaim}
            claiming={claiming}
            claimError={claimError}
          />
          <DungeonLog entries={dungeon.log} />
        </aside>
      </div>
    </div>
  );
}

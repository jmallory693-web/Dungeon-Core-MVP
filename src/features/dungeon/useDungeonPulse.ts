import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import type { DungeonRepository } from "../../services/dungeon/dungeonRepository";
import type { DungeonState } from "./dungeonTypes";
import { getEffectivePulseIntervalMs, processDungeonPulse } from "./pulseRules";

type UseDungeonPulseOptions = {
  dungeon: DungeonState | null;
  loading: boolean;
  repository: DungeonRepository | null;
  setDungeon: Dispatch<SetStateAction<DungeonState | null>>;
  onSaveError: (message: string) => void;
};

export function useDungeonPulse({
  dungeon,
  loading,
  repository,
  setDungeon,
  onSaveError,
}: UseDungeonPulseOptions): void {
  const repositoryRef = useRef(repository);
  repositoryRef.current = repository;

  const onSaveErrorRef = useRef(onSaveError);
  onSaveErrorRef.current = onSaveError;

  const isPulsePaused = dungeon?.isPulsePaused ?? true;
  const effectivePulseIntervalMs =
    dungeon === null ? null : getEffectivePulseIntervalMs(dungeon);

  useEffect(() => {
    if (
      loading ||
      !repository ||
      effectivePulseIntervalMs === null ||
      isPulsePaused
    ) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setDungeon((current) => {
        if (!current || current.isPulsePaused) {
          return current;
        }

        const updated = processDungeonPulse(current);
        const activeRepository = repositoryRef.current;

        if (activeRepository) {
          void activeRepository.saveDungeon(updated).catch((error) => {
            const message =
              error instanceof Error ? error.message : "Failed to save pulse progress.";
            onSaveErrorRef.current(message);
          });
        }

        return updated;
      });
    }, effectivePulseIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loading, effectivePulseIntervalMs, isPulsePaused, repository, setDungeon]);
}

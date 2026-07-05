import { createInitialDungeon } from "../../features/dungeon/dungeonGeneration";
import {
  loadDungeonWithOfflineProgress,
  normalizeDungeonState,
  shouldPersistAfterLoad,
} from "../../features/dungeon/dungeonMigration";
import type { DungeonState } from "../../features/dungeon/dungeonTypes";
import type { DungeonRepository } from "../dungeon/dungeonRepository";

export const DEMO_SAVE_KEY = "dungeon-core-demo-save-v1";
export const DEMO_OWNER_UID = "demo-local-player";

function readDemoSave(): unknown | null {
  try {
    const raw = localStorage.getItem(DEMO_SAVE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function writeDemoSave(dungeon: DungeonState): void {
  localStorage.setItem(DEMO_SAVE_KEY, JSON.stringify(dungeon));
}

export function createDemoDungeonRepository(): DungeonRepository {
  return {
    async loadOrCreateDungeon(): Promise<DungeonState> {
      const existing = readDemoSave();
      if (!existing) {
        const dungeon = createInitialDungeon(DEMO_OWNER_UID);
        writeDemoSave(dungeon);
        return dungeon;
      }

      const normalized = normalizeDungeonState(existing);
      const withOffline = loadDungeonWithOfflineProgress(existing);
      const legacySchema =
        typeof (existing as DungeonState).schemaVersion !== "number" ||
        (existing as DungeonState).schemaVersion < normalized.schemaVersion;

      if (shouldPersistAfterLoad(normalized, withOffline) || legacySchema) {
        writeDemoSave(withOffline);
      }

      return withOffline;
    },

    async saveDungeon(dungeon: DungeonState): Promise<void> {
      const payload: DungeonState = {
        ...dungeon,
        updatedAt: new Date().toISOString(),
      };
      writeDemoSave(payload);
    },

    async resetDungeon(): Promise<DungeonState> {
      localStorage.removeItem(DEMO_SAVE_KEY);
      const dungeon = createInitialDungeon(DEMO_OWNER_UID);
      writeDemoSave(dungeon);
      return dungeon;
    },
  };
}

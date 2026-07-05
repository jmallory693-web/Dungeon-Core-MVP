import { createInitialDungeon } from "../../features/dungeon/dungeonGeneration";
import type { DungeonState } from "../../features/dungeon/dungeonTypes";
import type { DungeonRepository } from "../dungeon/dungeonRepository";

export const DEMO_SAVE_KEY = "dungeon-core-demo-save-v1";
export const DEMO_OWNER_UID = "demo-local-player";

function readDemoSave(): DungeonState | null {
  try {
    const raw = localStorage.getItem(DEMO_SAVE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as DungeonState;
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
      if (existing) {
        return existing;
      }

      const dungeon = createInitialDungeon(DEMO_OWNER_UID);
      writeDemoSave(dungeon);
      return dungeon;
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

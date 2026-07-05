import type { DungeonState } from "../../features/dungeon/dungeonTypes";

export type DungeonRepository = {
  loadOrCreateDungeon(): Promise<DungeonState>;
  saveDungeon(dungeon: DungeonState): Promise<void>;
  resetDungeon?(): Promise<DungeonState>;
};

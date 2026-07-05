import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { createInitialDungeon } from "../../features/dungeon/dungeonGeneration";
import {
  loadDungeonWithOfflineProgress,
  normalizeDungeonState,
  shouldPersistAfterLoad,
} from "../../features/dungeon/dungeonMigration";
import type { DungeonState } from "../../features/dungeon/dungeonTypes";
import type { DungeonRepository } from "../dungeon/dungeonRepository";
import { getFirebaseDb } from "./firebaseApp";

const DUNGEON_COLLECTION = "dungeons";

function dungeonDocId(ownerUid: string): string {
  return ownerUid;
}

export function createFirebaseDungeonRepository(ownerUid: string): DungeonRepository {
  return {
    async loadOrCreateDungeon(): Promise<DungeonState> {
      const ref = doc(getFirebaseDb(), DUNGEON_COLLECTION, dungeonDocId(ownerUid));
      const snapshot = await getDoc(ref);

      if (snapshot.exists()) {
        const raw = snapshot.data();
        const normalized = normalizeDungeonState(raw);
        const withOffline = loadDungeonWithOfflineProgress(raw);
        const legacySchema =
          typeof (raw as DungeonState).schemaVersion !== "number" ||
          (raw as DungeonState).schemaVersion < normalized.schemaVersion;

        if (shouldPersistAfterLoad(normalized, withOffline) || legacySchema) {
          await setDoc(ref, withOffline);
        }

        return withOffline;
      }

      const dungeon = createInitialDungeon(ownerUid);
      await setDoc(ref, dungeon);
      return dungeon;
    },

    async saveDungeon(dungeon: DungeonState): Promise<void> {
      const ref = doc(
        getFirebaseDb(),
        DUNGEON_COLLECTION,
        dungeonDocId(dungeon.ownerUid),
      );
      const payload: DungeonState = {
        ...dungeon,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(ref, payload);
    },
  };
}

import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { createInitialDungeon } from "../../features/dungeon/dungeonGeneration";
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
        return snapshot.data() as DungeonState;
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

import { useMemo } from "react";
import { useAnonymousAuth } from "../auth/useAnonymousAuth";
import { createDemoDungeonRepository } from "../../services/demo/demoDungeonRepository";
import type { DungeonRepository } from "../../services/dungeon/dungeonRepository";
import { createFirebaseDungeonRepository } from "../../services/firebase/firebaseDungeonRepository";
import { isFirebaseConfigured } from "../../services/firebase/firebaseConfig";

export type DungeonSessionState =
  | { status: "loading"; isDemoMode: boolean }
  | { status: "error"; isDemoMode: boolean; message: string }
  | { status: "ready"; isDemoMode: boolean; repository: DungeonRepository };

export function useDungeonSession(): DungeonSessionState {
  const isDemoMode = !isFirebaseConfigured();
  const authState = useAnonymousAuth(!isDemoMode);

  const demoRepository = useMemo(() => createDemoDungeonRepository(), []);

  const firebaseRepository = useMemo(() => {
    if (isDemoMode || authState.status !== "ready") {
      return null;
    }

    return createFirebaseDungeonRepository(authState.user.uid);
  }, [authState, isDemoMode]);

  return useMemo((): DungeonSessionState => {
    if (isDemoMode) {
      return {
        status: "ready",
        isDemoMode: true,
        repository: demoRepository,
      };
    }

    if (authState.status === "loading") {
      return { status: "loading", isDemoMode: false };
    }

    if (authState.status === "error") {
      return {
        status: "error",
        isDemoMode: false,
        message: authState.message,
      };
    }

    return {
      status: "ready",
      isDemoMode: false,
      repository: firebaseRepository!,
    };
  }, [authState, demoRepository, firebaseRepository, isDemoMode]);
}

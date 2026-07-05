import { onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "../../services/firebase/firebaseApp";

type AuthState =
  | { status: "loading" }
  | { status: "ready"; user: User }
  | { status: "error"; message: string };

export function useAnonymousAuth(enabled = true): AuthState {
  const [state, setState] = useState<AuthState>(() =>
    enabled ? { status: "loading" } : { status: "ready", user: null! },
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (cancelled) {
        return;
      }

      if (user) {
        setState({ status: "ready", user });
        return;
      }

      try {
        const credential = await signInAnonymously(auth);
        if (!cancelled) {
          setState({ status: "ready", user: credential.user });
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Anonymous sign-in failed.";
          setState({ status: "error", message });
        }
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [enabled]);

  return state;
}

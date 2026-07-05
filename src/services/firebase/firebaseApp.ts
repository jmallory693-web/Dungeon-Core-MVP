import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFirebaseEnvConfig, isFirebaseConfigured } from "./firebaseConfig";

let firebaseApp: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function ensureFirebaseInitialized(): void {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured. Set VITE_FIREBASE_* values in .env.");
  }

  if (!firebaseApp) {
    firebaseApp = initializeApp(getFirebaseEnvConfig());
    authInstance = getAuth(firebaseApp);
    dbInstance = getFirestore(firebaseApp);
  }
}

export function getFirebaseAuth(): Auth {
  ensureFirebaseInitialized();
  return authInstance!;
}

export function getFirebaseDb(): Firestore {
  ensureFirebaseInitialized();
  return dbInstance!;
}

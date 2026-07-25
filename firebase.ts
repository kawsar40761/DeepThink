import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getDatabase, type Database } from "firebase/database";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { firebaseConfigData } from "@/lib/config";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let rtdb: Database | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;

function ensureInit() {
  if (typeof window === "undefined") return;
  if (!getApps().length) {
    app = initializeApp(firebaseConfigData);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
  rtdb = getDatabase(app);
  storage = getStorage(app);
}

// Initialize on client side
ensureInit();

export async function initAnalytics() {
  if (typeof window === "undefined" || analytics) return;
  try {
    if (await isSupported()) {
      analytics = getAnalytics(app!);
    }
  } catch {}
}

export { app, auth, db, rtdb, storage, analytics };
export type { FirebaseApp, Auth, Firestore, Database, FirebaseStorage, Analytics };

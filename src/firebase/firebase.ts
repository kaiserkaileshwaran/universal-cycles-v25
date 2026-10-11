import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth as firebaseGetAuth, type Auth } from "firebase/auth";
import { getDatabase as firebaseGetDatabase, type Database } from "firebase/database";
import { getStorage as firebaseGetStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDPfUWLor1pHzlmzP1USvw72HE52ey-rxk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "universal-cycles-bc8c9.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://universal-cycles-bc8c9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "universal-cycles-bc8c9",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "universal-cycles-bc8c9.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "185414460401",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:185414460401:web:4de4d1411bd2b66e655a50",
};

const isClient = typeof window !== "undefined";
const isFirebaseConfigValid = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Database | null = null;
let storage: ReturnType<typeof firebaseGetStorage> | null = null;

function initFirebaseClient() {
  if (!isClient || !isFirebaseConfigValid) return;

  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = firebaseGetAuth(app);
    db = firebaseGetDatabase(app);
    storage = firebaseGetStorage(app);
  }
}

export function getFirebaseAuth(): Auth {
  initFirebaseClient();
  if (!auth) {
    throw new Error("Firebase auth is not initialized. Ensure Firebase config is set and code runs in the browser.");
  }
  return auth;
}

export function getFirebaseDatabase(): Database {
  initFirebaseClient();
  if (!db) {
    throw new Error("Firebase database is not initialized. Ensure Firebase config is set and code runs in the browser.");
  }
  return db;
}

export function getFirebaseStorage(): ReturnType<typeof firebaseGetStorage> {
  initFirebaseClient();
  if (!storage) {
    throw new Error("Firebase storage is not initialized. Ensure Firebase config is set and code runs in the browser.");
  }
  return storage;
}

export function isFirebaseConfigured(): boolean {
  return isClient && isFirebaseConfigValid;
}

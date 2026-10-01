"use client";

import { getApp, getApps, initializeApp } from "@firebase/app";
import { browserLocalPersistence, getAuth, setPersistence } from "@firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
firebaseAuth.languageCode = "vi";

let persistenceReady: Promise<void> | undefined;

export function ensureFirebasePersistence() {
  persistenceReady ??= setPersistence(firebaseAuth, browserLocalPersistence);
  return persistenceReady;
}

export function firebaseAuthConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId);
}

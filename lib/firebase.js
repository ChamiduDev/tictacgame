// lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Prevent re-initialization in Next.js hot-reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getDatabase(app);

/**
 * Returns the Firebase Realtime Database reference for a given room.
 * @param {string} roomId - The 6-digit room code
 */
export const roomRef = (roomId) => ref(db, `rooms/${roomId}`);

/**
 * Returns a nested path reference inside a room.
 * @param {string} roomId
 * @param {string} path - e.g. "board", "emoji", "players/X"
 */
export const roomPath = (roomId, path) => ref(db, `rooms/${roomId}/${path}`);

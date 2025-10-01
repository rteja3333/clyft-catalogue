// firebase.ts (Web Version)
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import {
  getFirestore,
  collection as fsCollection,
  getDocs as fsGetDocs,
  doc as fsDoc,
  getDoc as fsGetDoc,
  setDoc as fsSetDoc,
  updateDoc as fsUpdateDoc,
  deleteDoc as fsDeleteDoc,
  query as fsQuery,
  where as fsWhere,
  orderBy as fsOrderBy,
  limit as fsLimit,
  addDoc as fsAddDoc,
  serverTimestamp as fsServerTimestamp,
} from "firebase/firestore";

// Firebase web config
export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app
export const firebaseApp: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Auth (if needed for web login)
export const auth = getAuth(firebaseApp);

// Firestore
export const db = getFirestore(firebaseApp);

// Storage
export const storage = getStorage(firebaseApp);

// Export Firestore functions
export const collection = fsCollection;
export const getDocs = fsGetDocs;
export const doc = fsDoc;
export const getDoc = fsGetDoc;
export const setDoc = fsSetDoc;
export const updateDoc = fsUpdateDoc;
export const deleteDoc = fsDeleteDoc;
export const query = fsQuery;
export const where = fsWhere;
export const orderBy = fsOrderBy;
export const limit = fsLimit;
export const addDoc = fsAddDoc;
export const serverTimestamp = fsServerTimestamp;

// Notes:
// - This is now ready for web usage.
// - You can import `db`, `collection`, `getDocs` etc. directly in your React web admin panel.
// - `auth` is optional if you want web login.

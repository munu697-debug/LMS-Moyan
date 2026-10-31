import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  addDoc,
  query,
  where,
} from "firebase/firestore";

// User's provided Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAyy_PTejuLkVsnSANsQSEuu795cZ-9f1Y",
  authDomain: "moyan-classroom.firebaseapp.com",
  projectId: "moyan-classroom",
  storageBucket: "moyan-classroom.firebasestorage.app",
  messagingSenderId: "258346636618",
  appId: "1:258346636618:web:122ea2eee6e10048ad1db3",
  measurementId: "G-6Q0P4CH28W",
};

// Initialize Firebase safely (avoid re-initialization during SSR / Fast Refresh)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Analytics loader (runs only on client where supported)
export async function getFirebaseAnalytics() {
  if (typeof window !== "undefined") {
    const { getAnalytics, isSupported } = await import("firebase/analytics");
    const supported = await isSupported();
    if (supported) {
      return getAnalytics(app);
    }
  }
  return null;
}

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDBgIP8MMrLb7VVywnuR93YBmBlPlE4KEk",
  authDomain: "graditi-group.firebaseapp.com",
  projectId: "graditi-group",
  storageBucket: "graditi-group.firebasestorage.app",
  messagingSenderId: "596637944254",
  appId: "1:596637944254:web:48c9fb361490bc0960d1ef"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;


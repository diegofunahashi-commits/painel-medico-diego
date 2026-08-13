// ============================================================================
// FIREBASE CONFIG + PERSISTÊNCIA OFFLINE
// Dr. Diego Funahashi Alves - Neurologia Pediátrica
// Projeto: agenda-5dee5
// ============================================================================

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  CACHE_SIZE_UNLIMITED
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCDZbk98G8Alt0JJzahg5S3maHcPTE7xHw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "agenda-5dee5.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "agenda-5dee5",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "agenda-5dee5.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "257162604920",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:257162604920:web:038fd69a9544605f99188d",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-SK7W978DD6"
};

// Inicializa o app (evita dupla inicialização no Next.js)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth
export const auth = getAuth(app);

// Storage
export const storage = getStorage(app);

// Firestore COM CACHE OFFLINE (IndexedDB) + multi-tab
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  })
});

console.log('✅ Firebase inicializado com persistência offline ativa (multi-tab)');

export default app;

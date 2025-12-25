import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, indexedDBLocalPersistence, inMemoryPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCwe2lgsK5rhHePnsVgNflZf68M35qm3wU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gmb-automation-474209-549ee.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gmb-automation-474209-549ee",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gmb-automation-474209-549ee.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "317153753727",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:317153753727:web:8281f982a8e7a05f885d4a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Set persistence with fallback to ensure it works
// Try indexedDB first (most reliable), then localStorage, then memory
console.log('🔧 Firebase - Setting up persistence...');
setPersistence(auth, indexedDBLocalPersistence)
  .then(() => {
    console.log('✅ Firebase - IndexedDB persistence set successfully');
  })
  .catch((error) => {
    console.warn('⚠️ Firebase - IndexedDB persistence failed, trying localStorage:', error);
    return setPersistence(auth, browserLocalPersistence);
  })
  .then(() => {
    console.log('✅ Firebase - LocalStorage persistence set successfully');
  })
  .catch((error) => {
    console.error('❌ Firebase - All persistence methods failed, using in-memory:', error);
    return setPersistence(auth, inMemoryPersistence);
  });

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

export default app;

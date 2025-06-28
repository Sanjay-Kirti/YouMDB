
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration from global variables
const firebaseConfig = (window as any).__firebase_config || {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// App ID for Firestore paths
export const APP_ID = (window as any).__app_id || 'demo-app';

// Collection paths
export const COLLECTIONS = {
  YOUTUBERS: `artifacts/${APP_ID}/public/data/youtubers`,
  VIDEOS: `artifacts/${APP_ID}/public/data/videos`,
  REVIEWS: `artifacts/${APP_ID}/public/data/reviews`
};

export default app;

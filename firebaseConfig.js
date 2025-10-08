import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB61Q_Q2lu5ff206lh638MhwPZH9FypOWA",
  authDomain: "foodapp-4e511.firebaseapp.com",
  projectId: "foodapp-4e511",
  storageBucket: "foodapp-4e511.firebasestorage.app",
  messagingSenderId: "922969943051",
  appId: "1:922969943051:web:8f2c382f51818f1ecdab0e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
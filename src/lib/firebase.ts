import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC0aW-2Bd16BH1Oyq_pyRd9Aw_emd7tPro",
  authDomain: "uwin-1cb4f.firebaseapp.com",
  projectId: "uwin-1cb4f",
  storageBucket: "uwin-1cb4f.firebasestorage.app",
  messagingSenderId: "470569949223",
  appId: "1:470569949223:web:b4ec8714cf42c88a15d602"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
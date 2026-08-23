import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Config pública do Firebase (não é segredo — fica protegida pelas regras
// do Firestore/Auth, não por ficar escondida). Projeto: hotel-araguaia-palace.
const firebaseConfig = {
  apiKey: 'AIzaSyB5CBRH0kZGJ1GHL01yx6SHSz9gbwMQU6E',
  authDomain: 'hotel-araguaia-palace.firebaseapp.com',
  projectId: 'hotel-araguaia-palace',
  storageBucket: 'hotel-araguaia-palace.firebasestorage.app',
  messagingSenderId: '698893612652',
  appId: '1:698893612652:web:8a29fac691734447338a49',
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

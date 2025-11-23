// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Import getAuth properly
import { getFirestore } from 'firebase/firestore'; // Import getFirestore properly

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCtl3GBGtNNnW8hh3ww_xsG9cr0R3vE9f8',
  authDomain: 'sync-space-f4d7b.firebaseapp.com',
  projectId: 'sync-space-f4d7b',
  storageBucket: 'sync-space-f4d7b.firebasestorage.app',
  messagingSenderId: '135160790703',
  appId: '1:135160790703:web:f885fae44298f2a75d5e5a',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js';
import { getFunctions } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-functions.js';
import { firebaseConfig } from './firebase-config.js';
export const app=initializeApp(firebaseConfig);
export const auth=getAuth(app); export const db=getFirestore(app); export const rtdb=getDatabase(app); export const functions=getFunctions(app,'us-central1');

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Importa o Firestore
import { getFunctions } from 'firebase/functions';
import { getStorage } from "firebase/storage"; // Importe o getStorage


const firebaseConfig = {
  apiKey: "AIzaSyCvQJ_TVxKBk1w2GvtEIuDzdTjU72PDNeQ",
  authDomain: "chatpos-aff1a.firebaseapp.com",
  projectId: "chatpos-aff1a",
  storageBucket: "chatpos-aff1a.appspot.com",
  messagingSenderId: "840413567529",
  appId: "1:840413567529:web:bde8ae325acddd6f989a38",
  measurementId: "G-NJBYN0VW4M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
export const db = getFirestore(app); // Adiciona Firestore
export const auth = getAuth(app);    // Adiciona Authentication
const functions = getFunctions(app);
const storage = getStorage(app);

export { functions,storage };


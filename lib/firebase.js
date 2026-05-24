import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDz3QVNJqzHOBosYphASj4POHMX50hiM0Q",
  authDomain: "vitloop-e008d.firebaseapp.com",
  projectId: "vitloop-e008d",
  storageBucket: "vitloop-e008d.firebasestorage.app",
  messagingSenderId: "1057570950875",
  appId: "1:1057570950875:web:bb74aafd41712ca4d5c6fe"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
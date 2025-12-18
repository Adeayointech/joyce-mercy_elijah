import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAfUQBIcqhGRca7Ota37zXKc-qObFu5RDI",
  authDomain: "joyce-mercy-elijah.firebaseapp.com",
  projectId: "joyce-mercy-elijah",
  storageBucket: "joyce-mercy-elijah.firebasestorage.app",
  messagingSenderId: "716582125998",
  appId: "1:716582125998:web:fb894a571f12045c16883f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

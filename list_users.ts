import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC4GfV_-UN_51Nxr87lxAWvbMeZZS0J9u0",
  authDomain: "hairport-queue.firebaseapp.com",
  projectId: "hairport-queue",
  storageBucket: "hairport-queue.firebasestorage.app",
  messagingSenderId: "549250266901",
  appId: "1:549250266901:web:e6ada249699eaea7471b1c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listUsers() {
  const snapshot = await getDocs(collection(db, "stylists"));
  console.log("\nRegistered Users in System:");
  snapshot.docs.forEach(doc => {
    const d = doc.data();
    console.log(` • ${d.name} (Role: ${d.role || 'stylist'}, Active: ${d.active})`);
  });
  process.exit(0);
}

listUsers();

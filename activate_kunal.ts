import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

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

async function activateKunal() {
  const snapshot = await getDocs(collection(db, "stylists"));
  for (const d of snapshot.docs) {
    if (d.data().name === "Kunal") {
      await updateDoc(doc(db, "stylists", d.id), { active: true });
      console.log("✅ Updated Kunal to Active: true");
    }
  }
  process.exit(0);
}

activateKunal();

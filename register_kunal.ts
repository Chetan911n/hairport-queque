import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";

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

async function registerKunal() {
  console.log("Checking if Kunal already exists...");
  const q = query(collection(db, "stylists"), where("name", "==", "Kunal"));
  const existing = await getDocs(q);

  if (!existing.empty) {
    console.log("✅ User 'Kunal' is already registered in the system!");
    process.exit(0);
  }

  console.log("Registering new user 'Kunal'...");
  const docRef = await addDoc(collection(db, "stylists"), {
    name: "Kunal",
    active: true,
    role: "stylist"
  });

  console.log("✅ Successfully registered new user 'Kunal' with ID:", docRef.id);
  process.exit(0);
}

registerKunal().catch(err => {
  console.error("❌ Error registering Kunal:", err);
  process.exit(1);
});

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

async function test() {
  console.log("Fetching tickets without orderBy...");
  const snapshot = await getDocs(collection(db, "tickets"));
  console.log(`Found ${snapshot.docs.length} tickets in Firestore!`);
  snapshot.docs.slice(0, 5).forEach(doc => {
    console.log(doc.id, doc.data());
  });

  const stylistsSnap = await getDocs(collection(db, "stylists"));
  console.log(`Found ${stylistsSnap.docs.length} stylists in Firestore!`);
  stylistsSnap.docs.forEach(doc => console.log(doc.id, doc.data()));

  process.exit(0);
}

test().catch(err => {
  console.error("Firestore Error:", err);
  process.exit(1);
});

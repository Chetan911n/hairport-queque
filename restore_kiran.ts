import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

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

async function restoreKiran() {
  console.log("Restoring KIRAN's ticket...");
  const newDoc = await addDoc(collection(db, "tickets"), {
    id: "#099",
    customerName: "KIRAN",
    phone: "",
    serviceType: "Hair Colour",
    serviceCategory: "Hair",
    gender: "Female",
    status: "Completed",
    paymentMethod: "UPI",
    price: 1500,
    timestamp: serverTimestamp(),
    completedAt: serverTimestamp()
  });

  console.log("✅ Successfully restored KIRAN ticket with ID:", newDoc.id);
  process.exit(0);
}

restoreKiran().catch(err => {
  console.error("❌ Error restoring KIRAN:", err);
  process.exit(1);
});

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

// Real Firebase Config from App.tsx
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

async function removeChetanClients() {
  console.log("Connecting to Firestore (hairport-queue)...");
  const snapshot = await getDocs(collection(db, "tickets"));
  
  const toDelete: { id: string; name: string; service: string; status: string }[] = [];

  snapshot.docs.forEach(docSnap => {
    const data = docSnap.data();
    const customerName = (data.customerName || "").toLowerCase().trim();
    const stylistName = (data.stylistName || "").toLowerCase().trim();
    const primaryStylist = (data.primaryStylistName || "").toLowerCase().trim();

    if (
      customerName.includes("chetan") ||
      stylistName.includes("chetan") ||
      primaryStylist.includes("chetan")
    ) {
      toDelete.push({
        id: docSnap.id,
        name: data.customerName || "Unknown",
        service: data.serviceType || "N/A",
        status: data.status || "Unknown"
      });
    }
  });

  if (toDelete.length === 0) {
    console.log("✅ No clients named Chetan found in the database.");
    process.exit(0);
  }

  console.log(`\n🗑️ Found ${toDelete.length} ticket(s) matching 'Chetan':\n`);
  toDelete.forEach(t => console.log(`  • [${t.id}] ${t.name} (${t.service}) - Status: ${t.status}`));
  console.log("\nDeleting records now...");

  for (const item of toDelete) {
    await deleteDoc(doc(db, "tickets", item.id));
    console.log(`  ✓ Deleted: [${item.id}] ${item.name}`);
  }

  console.log(`\n✅ Successfully deleted all ${toDelete.length} record(s) matching Chetan.`);
  process.exit(0);
}

removeChetanClients().catch(err => {
  console.error("❌ Error deleting records:", err);
  process.exit(1);
});

import { 
  Firestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc,
  serverTimestamp 
} from "firebase/firestore";
import { ClientProfile } from "../types/clientHistory";

/**
 * Normalizes phone numbers to clean digits (e.g., "+91 79729 91857" -> "7972991857").
 * Handles 10-digit Indian numbers consistently.
 */
export const normalizePhone = (phone: string): string => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  // If 12 digits starting with 91, take last 10 digits
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.substring(2);
  }
  return digits;
};

/**
 * Finds an existing client by normalized phone number or creates a new client document.
 * Crucial Rule: New client document starts with firstVisit: null, lastVisit: null, totalVisits: 0, totalSpent: 0.
 * firstVisit is ONLY set upon completion of their first actual service!
 */
export const findOrCreateClient = async (
  db: Firestore,
  customerData: { name: string; phone: string; gender?: "Male" | "Female" },
  createdBy: string = "Reception"
): Promise<ClientProfile> => {
  const cleanPhone = normalizePhone(customerData.phone);
  const trimmedName = (customerData.name || "").trim();
  const gender = customerData.gender || "Male";
  const nowIso = new Date().toISOString();

  try {
    // 1. Check if client already exists by normalized phone number (if phone is provided)
    if (cleanPhone && cleanPhone.length >= 7) {
      const q = query(
        collection(db, "clients"), 
        where("phone", "==", cleanPhone),
        where("archived", "==", false)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const existingDoc = snapshot.docs[0];
        const existingData = existingDoc.data() as ClientProfile;
        const clientId = existingDoc.id;

        // Update name or gender if updated
        const updates: Partial<ClientProfile> = {
          updatedAt: nowIso,
          updatedBy: createdBy
        };
        if (trimmedName && trimmedName !== existingData.name) {
          updates.name = trimmedName;
        }
        if (gender && gender !== existingData.gender) {
          updates.gender = gender;
        }

        await updateDoc(doc(db, "clients", clientId), updates);

        return {
          ...existingData,
          clientId,
          ...updates
        };
      }
    }

    // 2. Client does not exist -> Create new client profile
    const newClientPayload: Omit<ClientProfile, "clientId"> = {
      name: trimmedName || "Valued Client",
      phone: cleanPhone || "N/A",
      gender,
      firstVisit: null, // ONLY set when first service completes!
      lastVisit: null,  // ONLY set when first service completes!
      totalVisits: 0,   // Initialized to 0
      totalSpent: 0,    // Initialized to 0
      notes: "",
      archived: false,
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy,
      updatedBy: createdBy
    };

    const docRef = await addDoc(collection(db, "clients"), newClientPayload);
    
    return {
      ...newClientPayload,
      clientId: docRef.id
    };
  } catch (err) {
    console.warn("clientService.findOrCreateClient error (falling back to temporary profile):", err);
    // Return a safe fallback client profile so reception queue ticket creation is NEVER blocked
    return {
      clientId: `temp_client_${Date.now()}`,
      name: trimmedName || "Valued Client",
      phone: cleanPhone || "N/A",
      gender,
      firstVisit: null,
      lastVisit: null,
      totalVisits: 0,
      totalSpent: 0,
      createdAt: nowIso,
      updatedAt: nowIso
    };
  }
};

/**
 * Updates a client's general notes or preferences.
 */
export const updateClientNotes = async (
  db: Firestore,
  clientId: string,
  notes: string,
  updatedBy: string = "Reception"
): Promise<void> => {
  if (!clientId || clientId.startsWith("temp_")) return;
  const clientRef = doc(db, "clients", clientId);
  await updateDoc(clientRef, {
    notes: notes.trim(),
    updatedAt: new Date().toISOString(),
    updatedBy
  });
};

/**
 * Soft-deletes a client profile by setting archived: true (preserving business records).
 */
export const archiveClient = async (
  db: Firestore,
  clientId: string,
  updatedBy: string = "Admin"
): Promise<void> => {
  if (!clientId || clientId.startsWith("temp_")) return;
  const clientRef = doc(db, "clients", clientId);
  await updateDoc(clientRef, {
    archived: true,
    updatedAt: new Date().toISOString(),
    updatedBy
  });
};

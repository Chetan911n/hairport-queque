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
 * Normalizes phone numbers to clean 10-digit format (e.g., "+91 79729 91857" -> "7972991857").
 * Gracefully handles leading 0, country code +91, and rejects placeholder numbers ("00", "0").
 */
export const normalizePhone = (phone: string | null | undefined): string => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  
  // Reject dummy/placeholder values like "0", "00", "0000000000"
  if (/^0+$/.test(digits)) return "";

  // 12 digits starting with 91 (e.g. 919834755204) -> take last 10
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.substring(2);
  }
  // 11 digits starting with 0 (e.g. 09823012444) -> take last 10
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.substring(1);
  }
  // 13 digits starting with +91 (or 0091) -> take last 10
  if (digits.length > 10 && digits.endsWith(digits.slice(-10))) {
    const last10 = digits.slice(-10);
    if (!/^0+$/.test(last10)) return last10;
  }
  
  return digits.length >= 7 ? digits : "";
};

// In-flight mutex/cache to prevent race condition duplicates on rapid concurrent calls
const inFlightClientRequests = new Map<string, Promise<ClientProfile>>();

/**
 * Finds an existing client by normalized phone number, or by name fallback if phone is absent.
 * If found, updates any newly provided details (phone, gender, name).
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

  // Generate deduplication key for concurrent in-flight requests
  const dedupeKey = cleanPhone ? `phone_${cleanPhone}` : `name_${trimmedName.toLowerCase()}`;

  if (inFlightClientRequests.has(dedupeKey)) {
    return inFlightClientRequests.get(dedupeKey)!;
  }

  const task = (async (): Promise<ClientProfile> => {
    try {
      // 1. Check if client already exists by normalized phone number (if phone is valid)
      if (cleanPhone && cleanPhone.length >= 7) {
        const qPhone = query(
          collection(db, "clients"), 
          where("phone", "==", cleanPhone),
          where("archived", "==", false)
        );
        const snapshotPhone = await getDocs(qPhone);

        if (!snapshotPhone.empty) {
          const existingDoc = snapshotPhone.docs[0];
          const existingData = existingDoc.data() as ClientProfile;
          const clientId = existingDoc.id;

          const updates: Partial<ClientProfile> = {
            updatedAt: nowIso,
            updatedBy: createdBy
          };
          if (trimmedName && trimmedName !== existingData.name && !existingData.name.toLowerCase().includes("valued client")) {
            updates.name = trimmedName;
          }
          if (gender && gender !== existingData.gender) {
            updates.gender = gender;
          }

          if (Object.keys(updates).length > 2) {
            await updateDoc(doc(db, "clients", clientId), updates);
          }

          return {
            ...existingData,
            clientId,
            ...updates
          };
        }
      }

      // 2. Name Fallback Search: If phone is missing/placeholder, or if phone lookup didn't match,
      // search by name so walk-in clients without phone numbers aren't duplicated on every visit!
      const isGenericName = !trimmedName || 
        ["valued client", "guest", "client", "customer"].includes(trimmedName.toLowerCase());

      if (!isGenericName) {
        // Query active clients matching name exactly
        const qName = query(
          collection(db, "clients"),
          where("name", "==", trimmedName),
          where("archived", "==", false)
        );
        const snapshotName = await getDocs(qName);

        if (!snapshotName.empty) {
          const existingDoc = snapshotName.docs[0];
          const existingData = existingDoc.data() as ClientProfile;
          const clientId = existingDoc.id;

          const updates: Partial<ClientProfile> = {
            updatedAt: nowIso,
            updatedBy: createdBy
          };

          // If existing profile didn't have phone, but now we have cleanPhone, backfill it!
          if (cleanPhone && (!existingData.phone || existingData.phone === "N/A" || existingData.phone === "00")) {
            updates.phone = cleanPhone;
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

        // Also check case-insensitive match by scanning active clients if small collection
        const allActiveSnap = await getDocs(query(collection(db, "clients"), where("archived", "==", false)));
        const matchingDoc = allActiveSnap.docs.find(d => {
          const dData = d.data() as ClientProfile;
          const matchName = (dData.name || "").trim().toLowerCase() === trimmedName.toLowerCase();
          const matchPhone = cleanPhone && normalizePhone(dData.phone) === cleanPhone;
          return matchName || matchPhone;
        });

        if (matchingDoc) {
          const existingData = matchingDoc.data() as ClientProfile;
          const clientId = matchingDoc.id;
          const updates: Partial<ClientProfile> = {
            updatedAt: nowIso,
            updatedBy: createdBy
          };
          if (cleanPhone && (!existingData.phone || existingData.phone === "N/A")) {
            updates.phone = cleanPhone;
          }
          await updateDoc(doc(db, "clients", clientId), updates);
          return {
            ...existingData,
            clientId,
            ...updates
          };
        }
      }

      // 3. Client does not exist anywhere -> Create new client profile
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
    } finally {
      inFlightClientRequests.delete(dedupeKey);
    }
  })();

  inFlightClientRequests.set(dedupeKey, task);
  return task;
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

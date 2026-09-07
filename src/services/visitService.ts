import { 
  Firestore, 
  doc, 
  runTransaction, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  onSnapshot 
} from "firebase/firestore";
import { ClientProfile, VisitRecord } from "../types/clientHistory";
import { normalizePhone, findOrCreateClient } from "./clientService";

/**
 * ATOMIC & IDEMPOTENT SERVICE COMPLETION TRANSACTION
 * 
 * Invariants Guaranteed:
 * 1. Visit ID is deterministic: `visit_${ticketDocId}`
 * 2. If `visit_${ticketDocId}` already exists, transaction exits immediately without incrementing statistics.
 * 3. `client.totalVisits` === exact count of completed visits.
 * 4. `client.totalSpent` === exact sum of visit billing amounts.
 * 5. `firstVisit` is set ONLY on the client's first completed visit.
 */
export const completeTicketAndCreateVisitTransaction = async (
  db: Firestore,
  params: {
    ticketDocId: string;
    ticketId: string;
    customerName: string;
    phone: string;
    serviceType: string;
    serviceCategory?: string;
    stylistName: string;
    colourNumber?: string;
    price: number;
    paymentMethod: "Cash" | "UPI" | "Pending";
    gender?: "Male" | "Female";
    isSplit?: boolean;
    primaryStylistName?: string;
    primaryStylistPrice?: number;
    primaryStylistService?: string;
    secondaryStylistName?: string;
    secondaryStylistPrice?: number;
    secondaryStylistService?: string;
    tertiaryStylistName?: string;
    tertiaryStylistPrice?: number;
    tertiaryStylistService?: string;
    clientId?: string;
  },
  createdBy: string = "Reception"
): Promise<{ success: boolean; alreadyCompleted: boolean }> => {
  const {
    ticketDocId,
    ticketId,
    customerName,
    phone,
    serviceType,
    serviceCategory = "Hair",
    stylistName,
    colourNumber = "",
    price,
    paymentMethod,
    gender = "Male"
  } = params;

  const cleanPhone = normalizePhone(phone);
  const completionTime = new Date().toISOString();
  const effectiveTicketId = (ticketDocId && !ticketDocId.startsWith("temp_")) ? ticketDocId : (ticketId || `t_${Date.now()}`);
  const deterministicVisitId = `visit_${effectiveTicketId.replace('#', '')}`;
  const visitRef = doc(db, "visits", deterministicVisitId);

  try {
    // 0. Pre-check if a visit with this ticket ID or deterministic ID already exists
    const directSnap = await getDocs(query(
      collection(db, "visits"),
      where("ticketId", "in", [effectiveTicketId, ticketId, ticketDocId].filter(Boolean))
    ));
    if (!directSnap.empty) {
      console.warn(`Idempotency protection: Visit for ticket ${effectiveTicketId} already recorded.`);
      return { success: true, alreadyCompleted: true };
    }

    // 1. Pre-resolve or find target client ID before transaction
    let targetClientId = params.clientId;
    
    if (!targetClientId || targetClientId.startsWith("temp_")) {
      const client = await findOrCreateClient(db, { name: customerName, phone: cleanPhone, gender }, createdBy);
      targetClientId = client.clientId;
    }

    const clientRef = doc(db, "clients", targetClientId);

    // 2. Execute Firestore Atomic Transaction
    const result = await runTransaction(db, async (transaction) => {
      // Check if visit document already exists
      const visitSnap = await transaction.get(visitRef);
      if (visitSnap.exists()) {
        console.warn(`Idempotency protection: Visit ${deterministicVisitId} already processed.`);
        return { success: true, alreadyCompleted: true };
      }

      // Read Client profile document inside transaction
      const clientSnap = await transaction.get(clientRef);
      
      let currentVisits = 0;
      let currentSpent = 0;
      let existingFirstVisit: string | null = null;
      let clientExistsInDb = false;

      if (clientSnap.exists()) {
        clientExistsInDb = true;
        const cData = clientSnap.data() as ClientProfile;
        currentVisits = typeof cData.totalVisits === "number" ? cData.totalVisits : 0;
        currentSpent = typeof cData.totalSpent === "number" ? cData.totalSpent : 0;
        existingFirstVisit = cData.firstVisit || null;
      }

      // Calculate new statistics
      const newTotalVisits = currentVisits + 1;
      const validPrice = typeof price === "number" && !isNaN(price) ? Math.max(0, price) : 0;
      const newTotalSpent = currentSpent + validPrice;
      const updatedFirstVisit = existingFirstVisit ? existingFirstVisit : completionTime;

      // Construct Visit Record Payload — strictly sanitized against undefined values
      const newVisitRecord: VisitRecord = {
        visitId: deterministicVisitId,
        ticketId: effectiveTicketId,
        clientId: targetClientId,
        clientName: (customerName || "").trim() || "Valued Client",
        phone: cleanPhone || "N/A",
        visitDate: completionTime,
        services: serviceType || "Haircut",
        serviceCategory: serviceCategory || "Hair",
        stylistName: stylistName || "Unassigned",
        colourNumber: colourNumber || "",
        amount: validPrice,
        paymentMethod: paymentMethod || "UPI",
        paymentStatus: paymentMethod === "Pending" ? "Pending" : "Paid",
        isSplit: Boolean(params.isSplit),
        primaryStylistName: params.primaryStylistName || "",
        primaryStylistPrice: typeof params.primaryStylistPrice === "number" ? params.primaryStylistPrice : 0,
        primaryStylistService: params.primaryStylistService || "",
        secondaryStylistName: params.secondaryStylistName || "",
        secondaryStylistPrice: typeof params.secondaryStylistPrice === "number" ? params.secondaryStylistPrice : 0,
        secondaryStylistService: params.secondaryStylistService || "",
        tertiaryStylistName: params.tertiaryStylistName || "",
        tertiaryStylistPrice: typeof params.tertiaryStylistPrice === "number" ? params.tertiaryStylistPrice : 0,
        tertiaryStylistService: params.tertiaryStylistService || "",
        createdAt: completionTime,
        createdBy: createdBy || "Reception"
      };

      // Create the Visit Document inside transaction
      transaction.set(visitRef, newVisitRecord);

      // Create or Update the Client Profile document inside transaction
      if (clientExistsInDb) {
        transaction.update(clientRef, {
          firstVisit: updatedFirstVisit,
          lastVisit: completionTime,
          totalVisits: newTotalVisits,
          totalSpent: newTotalSpent,
          updatedAt: completionTime,
          updatedBy: createdBy
        });
      } else {
        transaction.set(clientRef, {
          clientId: targetClientId,
          name: (customerName || "").trim() || "Valued Client",
          phone: cleanPhone || "N/A",
          gender: gender || "Male",
          firstVisit: updatedFirstVisit,
          lastVisit: completionTime,
          totalVisits: 1,
          totalSpent: validPrice,
          notes: "",
          archived: false,
          createdAt: completionTime,
          updatedAt: completionTime,
          createdBy: createdBy || "Reception",
          updatedBy: createdBy || "Reception"
        });
      }

      return { success: true, alreadyCompleted: false };
    });

    return result;
  } catch (err) {
    console.error("Critical error in completeTicketAndCreateVisitTransaction:", err);
    return { success: false, alreadyCompleted: false };
  }
};

/**
 * Fetches all completed visits for a specific client sorted newest first.
 */
export const getClientVisits = async (
  db: Firestore, 
  clientId: string
): Promise<VisitRecord[]> => {
  if (!clientId || clientId.startsWith("temp_")) return [];
  try {
    const q = query(
      collection(db, "visits"), 
      where("clientId", "==", clientId),
      orderBy("visitDate", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as VisitRecord);
  } catch (err) {
    console.warn("getClientVisits query notice:", err);
    // Fallback search by ticketId match if index building
    const qFallback = query(collection(db, "visits"), where("clientId", "==", clientId));
    const snap = await getDocs(qFallback);
    const results = snap.docs.map(d => d.data() as VisitRecord);
    return results.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
  }
};

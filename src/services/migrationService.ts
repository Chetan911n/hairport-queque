import { 
  Firestore, 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc 
} from "firebase/firestore";
import { MigrationReport } from "../types/clientHistory";
import { normalizePhone, findOrCreateClient } from "./clientService";
import { completeTicketAndCreateVisitTransaction } from "./visitService";

/**
 * EXPLICIT ADMIN-ONLY DATA MIGRATION UTILITY
 * 
 * Safety & Invariants:
 * 1. MUST NOT run automatically on app load.
 * 2. Scans existing completed tickets from Firestore `tickets` collection.
 * 3. Idempotently backfills `clients` and `visits` records using atomic transactions.
 * 4. Never deletes, overwrites, or alters original tickets.
 * 5. Returns a comprehensive migration report.
 */
export const runAdminClientHistoryMigration = async (
  db: Firestore,
  adminUser: string = "Admin"
): Promise<MigrationReport> => {
  const report: MigrationReport = {
    scanned: 0,
    clientsCreated: 0,
    visitsCreated: 0,
    alreadyMigrated: 0,
    skipped: 0,
    errors: 0,
    timestamp: new Date().toISOString()
  };

  try {
    // 1. Fetch all tickets from Firestore
    const ticketsSnap = await getDocs(collection(db, "tickets"));
    const allTickets = ticketsSnap.docs.map(d => ({ docId: d.id, ...d.data() })) as any[];

    // 2. Filter for completed tickets
    const completedTickets = allTickets.filter(t => 
      t && t.status && t.status.toString().toLowerCase() === "completed"
    );

    report.scanned = completedTickets.length;

    // Track unique clients processed during this migration run
    const createdClientsSet = new Set<string>();

    for (const ticket of completedTickets) {
      try {
        const ticketDocId = ticket.docId || ticket.id;
        const deterministicVisitId = `visit_${ticketDocId}`;

        // Check if visit already exists
        const visitSnap = await getDoc(doc(db, "visits", deterministicVisitId));
        if (visitSnap.exists()) {
          report.alreadyMigrated++;
          continue;
        }

        const phone = normalizePhone(ticket.phone);
        const customerName = ticket.customerName || "Valued Client";
        const gender = ticket.gender || "Male";

        // Find or create client profile
        const client = await findOrCreateClient(db, { name: customerName, phone, gender }, adminUser);
        if (!createdClientsSet.has(client.clientId)) {
          createdClientsSet.add(client.clientId);
          report.clientsCreated++;
        }

        // Execute atomic visit creation transaction
        const result = await completeTicketAndCreateVisitTransaction(db, {
          ticketDocId,
          ticketId: ticket.id || ticketDocId,
          customerName,
          phone,
          serviceType: ticket.serviceType || "Haircut",
          serviceCategory: ticket.serviceCategory || "Hair",
          stylistName: ticket.stylistName || "Unassigned",
          colourNumber: ticket.colourNumber || "",
          price: ticket.price || 0,
          paymentMethod: ticket.paymentMethod || "UPI",
          gender,
          isSplit: ticket.isSplit || false,
          primaryStylistName: ticket.primaryStylistName,
          primaryStylistPrice: ticket.primaryStylistPrice,
          primaryStylistService: ticket.primaryStylistService,
          secondaryStylistName: ticket.secondaryStylistName,
          secondaryStylistPrice: ticket.secondaryStylistPrice,
          secondaryStylistService: ticket.secondaryStylistService,
          tertiaryStylistName: ticket.tertiaryStylistName,
          tertiaryStylistPrice: ticket.tertiaryStylistPrice,
          tertiaryStylistService: ticket.tertiaryStylistService,
          clientId: client.clientId
        }, adminUser);

        if (result.alreadyCompleted) {
          report.alreadyMigrated++;
        } else if (result.success) {
          report.visitsCreated++;
        } else {
          report.errors++;
        }
      } catch (ticketErr) {
        console.warn("Error migrating ticket:", ticket.docId, ticketErr);
        report.errors++;
      }
    }

    console.log("Migration finished cleanly:", report);
    return report;
  } catch (err) {
    console.error("Critical error running migration:", err);
    report.errors++;
    return report;
  }
};

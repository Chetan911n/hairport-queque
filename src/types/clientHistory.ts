export interface ClientProfile {
  clientId: string;
  name: string;
  phone: string; // Normalized 10-digit phone
  gender: "Male" | "Female";
  email?: string;
  firstVisit: string | null; // ISO string timestamp of first completed visit (null until completed)
  lastVisit: string | null;  // ISO string timestamp of most recent completed visit (null until completed)
  totalVisits: number;       // Number of completed visits
  totalSpent: number;        // Total revenue in ₹
  notes?: string;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface VisitRecord {
  visitId: string;           // visit_${ticketDocId}
  ticketId: string;          // Associated live ticket ID
  clientId: string;          // Link to clients/{clientId}
  clientName: string;
  phone: string;
  visitDate: string;         // ISO timestamp of completion
  services: string;          // Formatted service list string
  serviceCategory: string;   // Hair, Skin, Treatments, Waxing
  stylistName: string;       // Stylist or split team description
  colourNumber?: string;
  amount: number;            // Billed amount in ₹
  paymentMethod: "Cash" | "UPI" | "Pending";
  paymentStatus: "Paid" | "Pending";
  notes?: string;
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
  createdAt: string;
  createdBy?: string;
}

export interface MigrationReport {
  scanned: number;
  clientsCreated: number;
  visitsCreated: number;
  alreadyMigrated: number;
  skipped: number;
  errors: number;
  timestamp: string;
}

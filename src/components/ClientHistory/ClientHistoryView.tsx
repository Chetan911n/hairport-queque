import React, { useState, useEffect, useMemo } from 'react';
import { Firestore, collection, query, onSnapshot, orderBy, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  User, 
  Phone, 
  Calendar, 
  Scissors, 
  DollarSign, 
  Clock, 
  FileText, 
  RefreshCw, 
  Download, 
  Shield, 
  Database, 
  Loader2, 
  Receipt, 
  Trash2, 
  X,
  Edit2
} from 'lucide-react';
import { ClientProfile, MigrationReport } from '../../types/clientHistory';
import { ClientProfileModal } from './ClientProfileModal';
import { runAdminClientHistoryMigration } from '../../services/migrationService';
import { exportCompleteSalonBackup } from '../../services/backupService';
import { normalizePhone } from '../../services/clientService';

interface ClientHistoryViewProps {
  db: Firestore;
  tickets?: any[];
  currentUser?: string;
  userRole?: string;
  onDeleteTicket?: (id: string) => void;
}

export const ClientHistoryView: React.FC<ClientHistoryViewProps> = ({
  db,
  tickets = [],
  currentUser = "Reception",
  userRole = "receptionist"
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"clients" | "billing">("clients");

  // Client Database states
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);

  // Billing Details states
  const [billingTickets, setBillingTickets] = useState<any[]>([]);
  const [loadingBilling, setLoadingBilling] = useState(true);
  const [editingTicket, setEditingTicket] = useState<any | null>(null);
  const [stylists, setStylists] = useState<{ id: string; name: string }[]>([]);

  // Edit ticket form states
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editServices, setEditServices] = useState("");
  const [editPrice, setEditPrice] = useState(0);
  const [editPaymentMethod, setEditPaymentMethod] = useState<"Cash" | "UPI" | "Pending">("UPI");
  const [editIsSplit, setEditIsSplit] = useState(false);
  const [editPrimaryName, setEditPrimaryName] = useState("");
  const [editPrimaryPrice, setEditPrimaryPrice] = useState(0);
  const [editPrimaryService, setEditPrimaryService] = useState("");
  const [editSecondaryName, setEditSecondaryName] = useState("");
  const [editSecondaryPrice, setEditSecondaryPrice] = useState(0);
  const [editSecondaryService, setEditSecondaryService] = useState("");
  const [editTertiaryName, setEditTertiaryName] = useState("");
  const [editTertiaryPrice, setEditTertiaryPrice] = useState(0);
  const [editTertiaryService, setEditTertiaryService] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Admin Migration state
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationReport, setMigrationReport] = useState<MigrationReport | null>(null);

  // 1. Listen to clients collection in Firestore in real-time
  useEffect(() => {
    const q = query(
      collection(db, "clients"),
      where("archived", "==", false),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map(d => ({ clientId: d.id, ...d.data() })) as ClientProfile[];
        // Deduplicate in-memory by clean phone or exact trimmed name
        const seen = new Set<string>();
        const uniqueClients: ClientProfile[] = [];

        list.forEach(c => {
          const normPhone = normalizePhone(c.phone);
          const key = (normPhone && normPhone.length >= 7) 
            ? `phone_${normPhone}` 
            : `name_${(c.name || "").trim().toLowerCase()}`;
          
          if (!seen.has(key)) {
            seen.add(key);
            uniqueClients.push(c);
          }
        });

        setClients(uniqueClients);
        setLoadingClients(false);
      },
      (error) => {
        console.warn("Firestore clients snapshot notice:", error);
        getDocsFallback();
      }
    );

    const getDocsFallback = async () => {
      try {
        const snap = await getDocs(query(collection(db, "clients"), where("archived", "==", false)));
        const list = snap.docs.map(d => ({ clientId: d.id, ...d.data() })) as ClientProfile[];
        const seen = new Set<string>();
        const uniqueClients: ClientProfile[] = [];
        list.forEach(c => {
          const normPhone = normalizePhone(c.phone);
          const key = (normPhone && normPhone.length >= 7) ? `phone_${normPhone}` : `name_${(c.name || "").trim().toLowerCase()}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueClients.push(c);
          }
        });
        setClients(uniqueClients);
      } catch (e) {
        console.warn("Fallback query error:", e);
      } finally {
        setLoadingClients(false);
      }
    };

    return () => unsubscribe();
  }, [db]);

  // 2. Fetch completed tickets for Billing Details
  useEffect(() => {
    const q = query(
      collection(db, "tickets"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const raw = snapshot.docs.map(d => ({ docId: d.id, ...d.data() }));
        const completed = raw.filter(t => t && t.status && t.status.toString().toLowerCase() === "completed");

        // Deduplicate billing entries: if two tickets have identical client name, phone, and time within 15s, keep one
        const deduplicatedBilling: any[] = [];
        const seenSignatures = new Set<string>();

        completed.forEach(t => {
          const name = (t.customerName || "").trim().toLowerCase();
          const phone = normalizePhone(t.phone) || "N/A";
          const timeSec = t.timestamp?.seconds ? Math.floor(t.timestamp.seconds / 15) : "na";
          const signature = `${name}_${phone}_${timeSec}`;

          if (!seenSignatures.has(signature)) {
            seenSignatures.add(signature);
            deduplicatedBilling.push(t);
          }
        });

        setBillingTickets(deduplicatedBilling);
        setLoadingBilling(false);
      },
      (error) => {
        console.warn("Billing tickets listener error:", error);
        const completed = (tickets || []).filter(t => t && t.status && t.status.toString().toLowerCase() === "completed");
        setBillingTickets(completed);
        setLoadingBilling(false);
      }
    );

    return () => unsubscribe();
  }, [db, tickets]);

  // 3. Load stylists for edit modal
  useEffect(() => {
    const q = query(collection(db, "stylists"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => doc.data() as { name: string; role?: string })
        .filter(s => s.role !== "receptionist")
        .map(s => ({ id: s.name, name: s.name }));
      setStylists(data);
    });
    return () => unsubscribe();
  }, [db]);

  // Filter clients by search query
  const filteredClients = useMemo(() => {
    const qStr = searchQuery.toLowerCase().trim();
    if (!qStr) return clients;
    return clients.filter(c => {
      if (!c) return false;
      const name = (c.name || "").toLowerCase();
      const phone = (c.phone || "").toLowerCase();
      return name.includes(qStr) || phone.includes(qStr);
    });
  }, [clients, searchQuery]);

  // Filter billing tickets by search query
  const filteredBillingTickets = useMemo(() => {
    const qStr = searchQuery.toLowerCase().trim();
    if (!qStr) return billingTickets;
    return billingTickets.filter(t => {
      if (!t) return false;
      const name = (t.customerName || "").toLowerCase();
      const phone = (t.phone || "").toLowerCase();
      const stylist = (t.stylistName || "").toLowerCase();
      const service = (t.serviceType || "").toLowerCase();
      const payment = (t.paymentMethod || "").toLowerCase();
      return (
        name.includes(qStr) ||
        phone.includes(qStr) ||
        stylist.includes(qStr) ||
        service.includes(qStr) ||
        payment.includes(qStr)
      );
    });
  }, [billingTickets, searchQuery]);

  // Billing statistics
  const totalCompletedVisits = billingTickets.length;
  const totalRevenue = billingTickets.reduce((sum, t) => sum + (Number(t.price) || 0), 0);
  const avgTicketSpend = totalCompletedVisits > 0 ? totalRevenue / totalCompletedVisits : 0;

  const handleRunMigration = async () => {
    if (!window.confirm("🔒 ADMIN ACTION:\nDo you want to run the explicit Client History Migration?\nThis will scan completed tickets and idempotently backfill clients and visits.")) {
      return;
    }
    setIsMigrating(true);
    setMigrationReport(null);
    try {
      const rep = await runAdminClientHistoryMigration(db, currentUser);
      setMigrationReport(rep);
    } catch (err) {
      console.error("Migration error:", err);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleSettlePayment = async (docId: string, method: "UPI" | "Cash") => {
    try {
      await updateDoc(doc(db, "tickets", docId), {
        paymentMethod: method
      });
    } catch (err) {
      console.error("Error settling payment:", err);
    }
  };

  const handleDeleteEntry = async (ticket: any) => {
    if (!window.confirm(`Are you sure you want to permanently delete the billing entry for ${ticket.customerName}?`)) {
      return;
    }
    try {
      if (ticket.docId) {
        await deleteDoc(doc(db, "tickets", ticket.docId));
      }
      if (onDeleteTicket) {
        onDeleteTicket(ticket.docId || ticket.id);
      }
    } catch (err) {
      console.error("Error deleting entry:", err);
    }
  };

  const handleOpenEdit = (ticket: any) => {
    setEditingTicket(ticket);
    setEditName(ticket.customerName || "");
    setEditPhone(ticket.phone || "");
    setEditServices(ticket.serviceType || "");
    setEditPrice(ticket.price || 0);
    setEditPaymentMethod(ticket.paymentMethod || "UPI");
    setEditIsSplit(ticket.isSplit || false);
    setEditPrimaryName(ticket.primaryStylistName || ticket.stylistName || "");
    setEditPrimaryPrice(ticket.primaryStylistPrice || ticket.price || 0);
    setEditPrimaryService(ticket.primaryStylistService || "");
    setEditSecondaryName(ticket.secondaryStylistName || "");
    setEditSecondaryPrice(ticket.secondaryStylistPrice || 0);
    setEditSecondaryService(ticket.secondaryStylistService || "");
    setEditTertiaryName(ticket.tertiaryStylistName || "");
    setEditTertiaryPrice(ticket.tertiaryStylistPrice || 0);
    setEditTertiaryService(ticket.tertiaryStylistService || "");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;
    setIsSavingEdit(true);

    try {
      const finalPrice = editIsSplit
        ? Number(editPrimaryPrice) + Number(editSecondaryPrice) + Number(editTertiaryPrice)
        : Number(editPrice);

      const updateData: any = {
        customerName: editName.trim(),
        phone: editPhone.trim(),
        serviceType: editServices.trim(),
        price: finalPrice,
        paymentMethod: editPaymentMethod,
        isSplit: editIsSplit,
        stylistName: editIsSplit 
          ? `${editPrimaryName} & ${editSecondaryName}${editTertiaryName ? ` & ${editTertiaryName}` : ''}`
          : editPrimaryName,
      };

      if (editIsSplit) {
        updateData.primaryStylistName = editPrimaryName;
        updateData.primaryStylistPrice = Number(editPrimaryPrice);
        updateData.primaryStylistService = editPrimaryService;
        updateData.secondaryStylistName = editSecondaryName;
        updateData.secondaryStylistPrice = Number(editSecondaryPrice);
        updateData.secondaryStylistService = editSecondaryService;
        if (editTertiaryName) {
          updateData.tertiaryStylistName = editTertiaryName;
          updateData.tertiaryStylistPrice = Number(editTertiaryPrice);
          updateData.tertiaryStylistService = editTertiaryService;
        } else {
          updateData.tertiaryStylistName = "";
          updateData.tertiaryStylistPrice = 0;
          updateData.tertiaryStylistService = "";
        }
      } else {
        updateData.primaryStylistName = "";
        updateData.primaryStylistPrice = 0;
        updateData.primaryStylistService = "";
        updateData.secondaryStylistName = "";
        updateData.secondaryStylistPrice = 0;
        updateData.secondaryStylistService = "";
        updateData.tertiaryStylistName = "";
        updateData.tertiaryStylistPrice = 0;
        updateData.tertiaryStylistService = "";
      }

      await updateDoc(doc(db, "tickets", editingTicket.docId), updateData);
      setEditingTicket(null);
    } catch (err) {
      console.error("Error saving billing entry edit:", err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const formatDate = (dateVal: any) => {
    if (!dateVal) return "N/A";
    try {
      let d: Date;
      if (typeof dateVal.toDate === 'function') d = dateVal.toDate();
      else if (dateVal.seconds) d = new Date(dateVal.seconds * 1000);
      else d = new Date(dateVal);
      
      if (isNaN(d.getTime())) return "N/A";
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    } catch (e) {
      return "N/A";
    }
  };

  const formatDateTime = (dateVal: any) => {
    if (!dateVal) return "N/A";
    try {
      let d: Date;
      if (typeof dateVal.toDate === 'function') d = dateVal.toDate();
      else if (dateVal.seconds) d = new Date(dateVal.seconds * 1000);
      else d = new Date(dateVal);
      
      if (isNaN(d.getTime())) return "N/A";
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return "N/A";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-black/60 border border-[#D4AF37]/40 p-6 rounded-sm backdrop-blur-md shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-[#D4AF37] tracking-wider uppercase font-bold flex items-center gap-3">
            <Database className="w-6 h-6" />
            Client Database &amp; Billing Concierge
          </h2>
          <p className="text-xs text-gray-400 font-sans mt-1">
            Unique client profiles with lifetime history alongside deduplicated, verifiable billing records.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => exportCompleteSalonBackup({ tickets: billingTickets, clients })}
            className="bg-[#1A1A1A] hover:bg-[#2A2A2A] text-gray-200 border border-[#2A2A2A] px-3.5 py-2 rounded text-xs font-sans font-semibold flex items-center gap-2 cursor-pointer transition-colors"
            title="Export JSON Backup"
          >
            <Download className="w-4 h-4 text-[#D4AF37]" />
            Export Backup
          </button>

          {(userRole === "owner" || userRole === "owner_stylist" || userRole === "developer" || userRole === "admin") && (
            <button
              onClick={handleRunMigration}
              disabled={isMigrating}
              className="bg-[#D4AF37]/20 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#111111] border border-[#D4AF37]/40 px-3.5 py-2 rounded text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
              title="Run Admin History Migration"
            >
              {isMigrating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Run History Migration
            </button>
          )}
        </div>
      </div>

      {/* Migration Report Alert (If just executed) */}
      {migrationReport && (
        <div className="bg-[#1A1A1A] border border-[#D4AF37] p-5 rounded-sm shadow-xl text-white animate-fadeIn">
          <h4 className="text-sm font-serif font-bold text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Migration Execution Summary
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-sans">
            <div className="bg-black/60 p-2.5 rounded border border-[#2A2A2A]">
              <span className="text-gray-400 block text-[10px] uppercase">Scanned Tickets</span>
              <span className="font-bold text-white text-base">{migrationReport.scanned}</span>
            </div>
            <div className="bg-black/60 p-2.5 rounded border border-[#2A2A2A]">
              <span className="text-gray-400 block text-[10px] uppercase">Clients Created/Updated</span>
              <span className="font-bold text-[#D4AF37] text-base">{migrationReport.clientsCreated}</span>
            </div>
            <div className="bg-black/60 p-2.5 rounded border border-[#2A2A2A]">
              <span className="text-gray-400 block text-[10px] uppercase">Visits Created</span>
              <span className="font-bold text-emerald-400 text-base">{migrationReport.visitsCreated}</span>
            </div>
            <div className="bg-black/60 p-2.5 rounded border border-[#2A2A2A]">
              <span className="text-gray-400 block text-[10px] uppercase">Already Processed</span>
              <span className="font-bold text-blue-400 text-base">{migrationReport.alreadyMigrated}</span>
            </div>
            <div className="bg-black/60 p-2.5 rounded border border-[#2A2A2A]">
              <span className="text-gray-400 block text-[10px] uppercase">Errors</span>
              <span className="font-bold text-red-400 text-base">{migrationReport.errors}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-[#2A2A2A] bg-black/40 px-2 rounded-t-sm">
        <button
          onClick={() => setActiveSubTab("clients")}
          className={`pb-3 pt-3 px-6 text-xs sm:text-sm font-sans uppercase tracking-widest font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "clients"
              ? "border-[#D4AF37] text-[#D4AF37] bg-[#1A1A1A]/80 shadow-sm"
              : "border-transparent text-gray-400 hover:text-white hover:bg-[#1A1A1A]/30"
          }`}
        >
          <User className="w-4 h-4" />
          Client Database ({filteredClients.length})
        </button>
        <button
          onClick={() => setActiveSubTab("billing")}
          className={`pb-3 pt-3 px-6 text-xs sm:text-sm font-sans uppercase tracking-widest font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "billing"
              ? "border-[#D4AF37] text-[#D4AF37] bg-[#1A1A1A]/80 shadow-sm"
              : "border-transparent text-gray-400 hover:text-white hover:bg-[#1A1A1A]/30"
          }`}
        >
          <Receipt className="w-4 h-4" />
          Billing Details &amp; History ({filteredBillingTickets.length})
        </button>
      </div>

      {/* Universal Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            activeSubTab === "clients"
              ? "Search client database by name or phone number..."
              : "Search billing details by client, stylist, service, or payment method..."
          }
          className="w-full bg-black/70 border border-[#D4AF37]/40 text-white pl-12 pr-4 py-3.5 rounded-sm font-sans text-sm outline-none focus:border-[#D4AF37] shadow-lg transition-colors placeholder:text-gray-500"
        />
      </div>

      {/* ========================================================= */}
      {/* SUB-TAB 1: CLIENT DATABASE (UNIQUE PROFILES)              */}
      {/* ========================================================= */}
      {activeSubTab === "clients" && (
        <div>
          {loadingClients ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
              <p className="text-xs font-sans uppercase tracking-widest">Loading unique client profiles...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="bg-black/60 border border-[#2A2A2A] border-dashed p-12 text-center rounded-sm">
              <User className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-300 font-serif text-lg font-medium">No client profiles found matching your search.</p>
              <p className="text-xs text-gray-500 font-sans mt-1">Unique client profiles are maintained automatically with lifetime visit histories.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <motion.div
                  key={client.clientId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#1A1A1A] border border-[#D4AF37]/30 hover:border-[#D4AF37] p-5 rounded-sm flex flex-col justify-between shadow-xl group transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3 border-b border-[#2A2A2A] pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] font-serif font-bold text-lg">
                          {client.name ? client.name.charAt(0).toUpperCase() : "C"}
                        </div>
                        <div>
                          <h3 className="font-serif text-lg font-medium text-white group-hover:text-[#D4AF37] transition-colors">
                            {client.name}
                          </h3>
                          <p className="text-xs text-gray-400 font-sans flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-[#D4AF37]" /> 
                            {client.phone && client.phone !== "N/A" && client.phone !== "00" ? `+91 ${client.phone}` : "No phone provided"}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]">
                        {client.gender || "Male"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-sans bg-black/40 p-3 rounded border border-[#2A2A2A] mb-4">
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase tracking-wider block font-semibold">Total Completed</span>
                        <span className="font-serif text-base font-bold text-[#D4AF37]">{client.totalVisits || 0} Visits</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase tracking-wider block font-semibold">Lifetime Spent</span>
                        <span className="font-serif text-base font-bold text-emerald-400">₹{client.totalSpent || 0}</span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-[#2A2A2A] flex justify-between text-[11px]">
                        <span className="text-gray-400">Last Visit:</span>
                        <span className="text-gray-200 font-medium">{formatDate(client.lastVisit)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedClient(client)}
                    className="w-full bg-[#D4AF37]/15 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#111111] border border-[#D4AF37]/40 py-2.5 rounded text-xs font-sans font-bold uppercase tracking-widest transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View Profile &amp; Billing History
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 2: BILLING DETAILS & LOGS                         */}
      {/* ========================================================= */}
      {activeSubTab === "billing" && (
        <div className="space-y-6">
          {/* Billing Overview Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-black/60 border border-[#D4AF37]/30 p-5 rounded-sm shadow-xl flex flex-col gap-1 backdrop-blur-md">
              <span className="text-gray-400 text-xs uppercase tracking-widest font-semibold">Total Completed Visits</span>
              <span className="text-3xl font-serif font-bold text-white">{totalCompletedVisits}</span>
            </div>
            <div className="bg-black/60 border border-[#D4AF37]/40 p-5 rounded-sm shadow-xl flex flex-col gap-1 backdrop-blur-md">
              <span className="text-gray-400 text-xs uppercase tracking-widest font-semibold">Total Revenue Generated</span>
              <span className="text-3xl font-serif font-bold text-[#D4AF37]">
                ₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-black/60 border border-[#D4AF37]/30 p-5 rounded-sm shadow-xl flex flex-col gap-1 backdrop-blur-md">
              <span className="text-gray-400 text-xs uppercase tracking-widest font-semibold">Average Ticket Value</span>
              <span className="text-3xl font-serif font-bold text-white">
                ₹{avgTicketSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Billing Log Table */}
          <div className="bg-black/60 border border-[#D4AF37]/30 p-6 rounded-sm shadow-2xl backdrop-blur-md">
            <div className="overflow-x-auto">
              {loadingBilling ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                  <p className="text-xs font-sans uppercase tracking-widest">Loading billing records...</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#2A2A2A] text-gray-400 text-xs uppercase tracking-widest">
                      <th className="py-4 font-semibold">Client Name</th>
                      <th className="py-4 font-semibold">Contact</th>
                      <th className="py-4 font-semibold">Services Rendered</th>
                      <th className="py-4 font-semibold">Attending Stylist</th>
                      <th className="py-4 font-semibold">Date Completed</th>
                      <th className="py-4 font-semibold">Payment Status</th>
                      <th className="py-4 font-semibold text-right">Amount Paid</th>
                      <th className="py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2A2A]">
                    {filteredBillingTickets.map((ticket) => {
                      const formattedDate = formatDateTime(ticket.completedAt || ticket.timestamp);
                      const isPending = ticket.paymentMethod === 'Pending';

                      return (
                        <tr key={ticket.docId || ticket.id} className="text-gray-300 hover:bg-[#1A1A1A]/80 transition-colors">
                          <td className="py-4 font-medium text-white flex items-center gap-2">
                            <User className="w-4 h-4 text-[#D4AF37]" />
                            {ticket.customerName}
                          </td>
                          <td className="py-4 text-sm font-mono text-gray-400">
                            {ticket.phone && ticket.phone !== "N/A" && ticket.phone !== "00" ? `+91 ${ticket.phone}` : "N/A"}
                          </td>
                          <td className="py-4">
                            <div className="flex flex-col gap-1 items-start">
                              <span className="text-xs uppercase tracking-wider text-white bg-[#2A2A2A] px-2.5 py-1 rounded-sm border border-[#333333]">
                                {ticket.serviceType}
                              </span>
                              {ticket.colourNumber && (
                                <span className="text-[10px] text-[#D4AF37] font-sans font-semibold">
                                  Shade: {ticket.colourNumber}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 font-medium">
                            {ticket.isSplit ? (
                              <div className="flex flex-col gap-1 text-xs">
                                <span className="font-semibold text-gray-200">
                                  {ticket.primaryStylistName} (₹{ticket.primaryStylistPrice}){ticket.primaryStylistService && ` - ${ticket.primaryStylistService}`}
                                </span>
                                <span className="text-gray-400 font-semibold">
                                  &amp; {ticket.secondaryStylistName} (₹{ticket.secondaryStylistPrice}){ticket.secondaryStylistService && ` - ${ticket.secondaryStylistService}`}
                                </span>
                                {ticket.tertiaryStylistName && (
                                  <span className="text-gray-400 font-semibold">
                                    &amp; {ticket.tertiaryStylistName} (₹{ticket.tertiaryStylistPrice}){ticket.tertiaryStylistService && ` - ${ticket.tertiaryStylistService}`}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-300">{ticket.stylistName || 'Unassigned'}</span>
                            )}
                          </td>
                          <td className="py-4 text-xs text-gray-400 font-mono">{formattedDate}</td>
                          <td className="py-4">
                            <span className={`text-[10px] font-sans tracking-wider uppercase px-2.5 py-1 rounded-sm font-bold border ${
                              isPending
                                ? 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                                : ticket.paymentMethod === 'Cash'
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                                  : 'bg-blue-950/40 text-blue-400 border-blue-800/40'
                            }`}>
                              {ticket.paymentMethod || 'UPI'}
                            </span>
                          </td>
                          <td className="py-4 text-right font-mono font-extrabold text-base text-white">
                            {isPending ? (
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-amber-400 font-extrabold">₹{(ticket.price || 0).toFixed(2)}</span>
                                <div className="flex gap-1 mt-1">
                                  <button
                                    onClick={() => handleSettlePayment(ticket.docId, "UPI")}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-0.5 rounded-sm text-[9px] font-sans font-bold transition-colors cursor-pointer"
                                  >
                                    Settle UPI
                                  </button>
                                  <button
                                    onClick={() => handleSettlePayment(ticket.docId, "Cash")}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 rounded-sm text-[9px] font-sans font-bold transition-colors cursor-pointer"
                                  >
                                    Settle Cash
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span className="text-white font-extrabold font-serif">₹{(ticket.price || 0).toFixed(2)}</span>
                            )}
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex gap-2 justify-end items-center">
                              <button
                                onClick={() => handleOpenEdit(ticket)}
                                className="bg-[#1A1A1A] hover:bg-[#2A2A2A] text-gray-300 hover:text-white px-2.5 py-1.5 rounded-sm text-xs font-bold transition-all border border-[#333333] cursor-pointer flex items-center gap-1.5"
                                title="Edit Entry"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteEntry(ticket)}
                                className="bg-red-950/30 hover:bg-red-900/60 text-red-400 hover:text-red-200 px-2.5 py-1.5 rounded-sm text-xs font-bold transition-all border border-red-900/40 cursor-pointer flex items-center gap-1.5"
                                title="Delete Entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredBillingTickets.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-500 italic font-sans text-sm">
                          No billing records found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EDIT BILLING ENTRY MODAL                                  */}
      {/* ========================================================= */}
      <AnimatePresence>
        {editingTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#141414] border border-[#D4AF37]/40 rounded-lg shadow-2xl w-full max-w-lg p-6 text-white max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6 border-b border-[#2A2A2A] pb-4">
                <h3 className="text-xl font-serif text-[#D4AF37] uppercase tracking-wider font-bold">
                  Edit Billing Entry
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingTicket(null)}
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 font-sans text-xs">
                {/* Client Name */}
                <div className="space-y-1">
                  <label className="text-gray-400 uppercase tracking-widest font-bold text-[10px]">Client Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-[#333333] rounded px-3 py-2 text-white text-sm outline-none focus:border-[#D4AF37]"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-gray-400 uppercase tracking-widest font-bold text-[10px]">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-[#333333] rounded px-3 py-2 text-white text-sm outline-none focus:border-[#D4AF37]"
                  />
                </div>

                {/* Services */}
                <div className="space-y-1">
                  <label className="text-gray-400 uppercase tracking-widest font-bold text-[10px]">Services</label>
                  <input
                    type="text"
                    required
                    value={editServices}
                    onChange={e => setEditServices(e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-[#333333] rounded px-3 py-2 text-white text-sm outline-none focus:border-[#D4AF37]"
                  />
                </div>

                {/* Stylist & Price (Single Mode) */}
                {!editIsSplit && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-gray-400 uppercase tracking-widest font-bold text-[10px]">Stylist</label>
                      <select
                        value={editPrimaryName}
                        onChange={e => setEditPrimaryName(e.target.value)}
                        className="w-full bg-[#1F1F1F] border border-[#333333] rounded px-3 py-2 text-white text-sm outline-none focus:border-[#D4AF37]"
                      >
                        {stylists.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-400 uppercase tracking-widest font-bold text-[10px]">Total Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={editPrice}
                        onChange={e => setEditPrice(Number(e.target.value))}
                        className="w-full bg-[#1F1F1F] border border-[#333333] rounded px-3 py-2 text-white text-sm outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div className="space-y-1">
                  <label className="text-gray-400 uppercase tracking-widest font-bold text-[10px]">Payment Method</label>
                  <select
                    value={editPaymentMethod}
                    onChange={e => setEditPaymentMethod(e.target.value as any)}
                    className="w-full bg-[#1F1F1F] border border-[#333333] rounded px-3 py-2 text-white text-sm outline-none focus:border-[#D4AF37]"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2A2A]">
                  <button
                    type="button"
                    onClick={() => setEditingTicket(null)}
                    className="px-4 py-2 bg-transparent text-gray-400 hover:text-white border border-[#333333] rounded text-xs uppercase tracking-wider font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-5 py-2 bg-[#D4AF37] hover:bg-[#C5A059] text-black rounded text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer flex items-center gap-2"
                  >
                    {isSavingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* CLIENT PROFILE MODAL                                      */}
      {/* ========================================================= */}
      {selectedClient && (
        <ClientProfileModal
          client={selectedClient}
          db={db}
          onClose={() => setSelectedClient(null)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

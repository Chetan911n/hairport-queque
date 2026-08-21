import React, { useState, useEffect } from 'react';
import { Firestore, collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Search, User, Phone, Calendar, Scissors, DollarSign, Clock, FileText, RefreshCw, Download, Upload, Shield, Database, Loader2 } from 'lucide-react';
import { ClientProfile, MigrationReport } from '../../types/clientHistory';
import { ClientProfileModal } from './ClientProfileModal';
import { runAdminClientHistoryMigration } from '../../services/migrationService';
import { exportCompleteSalonBackup } from '../../services/backupService';

interface ClientHistoryViewProps {
  db: Firestore;
  tickets?: any[];
  currentUser?: string;
  userRole?: string;
}

export const ClientHistoryView: React.FC<ClientHistoryViewProps> = ({
  db,
  tickets = [],
  currentUser = "Reception",
  userRole = "receptionist"
}) => {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);

  // Admin Migration state
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationReport, setMigrationReport] = useState<MigrationReport | null>(null);

  // Listen to clients collection in Firestore in real-time
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
        setClients(list);
        setLoading(false);
      },
      (error) => {
        console.warn("Firestore clients snapshot notice:", error);
        // Fallback query without orderBy in case index building
        const fallbackQ = query(collection(db, "clients"), where("archived", "==", false));
        getDocsFallback(fallbackQ);
      }
    );

    const getDocsFallback = async (fallbackQ: any) => {
      try {
        const snap = await getDocs(fallbackQ);
        const list = snap.docs.map(d => ({ clientId: d.id, ...d.data() })) as ClientProfile[];
        setClients(list);
      } catch (e) {
        console.warn("Fallback query error:", e);
      } finally {
        setLoading(false);
      }
    };

    return () => unsubscribe();
  }, [db]);

  // Filter clients by name or phone
  const filteredClients = clients.filter(c => {
    if (!c) return false;
    const queryStr = searchQuery.toLowerCase().trim();
    if (!queryStr) return true;
    const name = (c.name || "").toLowerCase();
    const phone = (c.phone || "").toLowerCase();
    return name.includes(queryStr) || phone.includes(queryStr);
  });

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

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
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

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-black/60 border border-[#D4AF37]/40 p-6 rounded-sm backdrop-blur-md shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-[#D4AF37] tracking-wider uppercase font-bold flex items-center gap-3">
            <Database className="w-6 h-6" />
            Permanent Client History &amp; Profiles
          </h2>
          <p className="text-xs text-gray-400 font-sans mt-1">
            Complete database of client profiles, lifetime statistics, and immutable visit records.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => exportCompleteSalonBackup({ tickets, clients })}
            className="bg-[#1A1A1A] hover:bg-[#2A2A2A] text-gray-200 border border-[#2A2A2A] px-3 py-2 rounded text-xs font-sans font-semibold flex items-center gap-2 cursor-pointer transition-colors"
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
              <span className="text-gray-400 block text-[10px] uppercase">Clients Created</span>
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

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search clients by Name or 10-digit Phone Number..."
          className="w-full bg-black/70 border border-[#D4AF37]/40 text-white pl-12 pr-4 py-3.5 rounded-sm font-sans text-sm outline-none focus:border-[#D4AF37] shadow-lg transition-colors placeholder:text-gray-500"
        />
      </div>

      {/* Client List Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
          <p className="text-xs font-sans uppercase tracking-widest">Loading client profiles...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-black/60 border border-[#2A2A2A] border-dashed p-12 text-center rounded-sm">
          <User className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-300 font-serif text-lg font-medium">No client profiles found matching your search.</p>
          <p className="text-xs text-gray-500 font-sans mt-1">Client profiles are created automatically when walk-in clients enter reception.</p>
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
                      <h3 className="font-serif text-lg font-medium text-white group-hover:text-[#D4AF37] transition-colors">{client.name}</h3>
                      <p className="text-xs text-gray-400 font-sans flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-[#D4AF37]" /> +91 {client.phone}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]">
                    {client.gender || "Male"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-sans bg-black/40 p-3 rounded border border-[#2A2A2A] mb-4">
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase tracking-wider block font-semibold">Total Visits</span>
                    <span className="font-serif text-base font-bold text-[#D4AF37]">{client.totalVisits || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase tracking-wider block font-semibold">Total Spent</span>
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
                className="w-full bg-[#D4AF37]/15 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#111111] border border-[#D4AF37]/40 py-2 rounded text-xs font-sans font-bold uppercase tracking-widest transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                <FileText className="w-3.5 h-3.5" />
                View Profile &amp; History
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Client Profile Modal */}
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

import React, { useState, useEffect } from 'react';
import { Firestore } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Phone, User, Scissors, DollarSign, Clock, ShieldAlert, Archive, Save, Loader2, Award, CheckCircle } from 'lucide-react';
import { ClientProfile, VisitRecord } from '../../types/clientHistory';
import { getClientVisits } from '../../services/visitService';
import { updateClientNotes, archiveClient } from '../../services/clientService';

interface ClientProfileModalProps {
  client: ClientProfile | null;
  db: Firestore;
  onClose: () => void;
  onClientUpdated?: () => void;
  currentUser?: string;
}

export const ClientProfileModal: React.FC<ClientProfileModalProps> = ({
  client,
  db,
  onClose,
  onClientUpdated,
  currentUser = "Reception"
}) => {
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [loadingVisits, setLoadingVisits] = useState(true);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [activeTab, setActiveTab] = useState<"timeline" | "notes">("timeline");

  useEffect(() => {
    if (!client) return;
    setNotes(client.notes || "");
    setLoadingVisits(true);

    getClientVisits(db, client.clientId).then(fetchedVisits => {
      setVisits(fetchedVisits);
      setLoadingVisits(false);
    }).catch(err => {
      console.warn("Error fetching client visits:", err);
      setLoadingVisits(false);
    });
  }, [client, db]);

  if (!client) return null;

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await updateClientNotes(db, client.clientId, notes, currentUser);
      if (onClientUpdated) onClientUpdated();
    } catch (err) {
      console.error("Error saving notes:", err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleArchive = async () => {
    if (window.confirm(`Are you sure you want to archive the profile for ${client.name}?`)) {
      try {
        await archiveClient(db, client.clientId, currentUser);
        if (onClientUpdated) onClientUpdated();
        onClose();
      } catch (err) {
        console.error("Error archiving client:", err);
      }
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
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return "N/A";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#141414] border border-[#D4AF37]/40 rounded-lg shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[#2A2A2A] bg-black/60 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] font-serif text-2xl font-bold">
              {client.name ? client.name.charAt(0).toUpperCase() : "C"}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-serif text-white font-semibold tracking-wide">{client.name}</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]">
                  {client.gender || "Male"}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-sans mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#D4AF37]" /> +91 {client.phone}</span>
                <span className="text-gray-600">•</span>
                <span>Client ID: <code className="text-gray-300 bg-black/40 px-1.5 py-0.5 rounded text-[10px]">{client.clientId}</code></span>
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Client Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-black/40 border-b border-[#2A2A2A]">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-3 rounded text-center">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-sans font-bold">Total Visits</p>
            <p className="text-xl font-serif font-bold text-[#D4AF37] mt-1">{client.totalVisits || 0}</p>
          </div>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-3 rounded text-center">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-sans font-bold">Total Spent</p>
            <p className="text-xl font-serif font-bold text-emerald-400 mt-1">₹{client.totalSpent || 0}</p>
          </div>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-3 rounded text-center">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-sans font-bold">First Visit</p>
            <p className="text-xs font-sans font-medium text-gray-200 mt-2">{client.firstVisit ? formatDate(client.firstVisit).split(',')[0] : 'Pending'}</p>
          </div>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-3 rounded text-center">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-sans font-bold">Last Visit</p>
            <p className="text-xs font-sans font-medium text-gray-200 mt-2">{client.lastVisit ? formatDate(client.lastVisit).split(',')[0] : 'Pending'}</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#2A2A2A] bg-[#1A1A1A] px-6">
          <button
            onClick={() => setActiveTab("timeline")}
            className={`py-3 px-4 text-xs font-sans font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
              activeTab === "timeline"
                ? "border-[#D4AF37] text-[#D4AF37]"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Visit History ({visits.length})
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`py-3 px-4 text-xs font-sans font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
              activeTab === "notes"
                ? "border-[#D4AF37] text-[#D4AF37]"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Client Notes &amp; Preferences
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 hide-scrollbar bg-[#111111]">
          {activeTab === "timeline" ? (
            <div>
              {loadingVisits ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                  <p className="text-xs font-sans uppercase tracking-widest">Loading visit records...</p>
                </div>
              ) : visits.length === 0 ? (
                <div className="text-center py-12 border border-[#2A2A2A] border-dashed rounded bg-black/30">
                  <Scissors className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-300 font-serif text-base">No completed visits recorded yet.</p>
                  <p className="text-xs text-gray-500 font-sans mt-1">Visit records are created automatically when services are completed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {visits.map((v) => (
                    <div 
                      key={v.visitId}
                      className="bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#D4AF37]/40 p-4 rounded transition-all shadow-md relative pl-5"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37] rounded-l"></div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A2A2A] pb-3 mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-sans font-bold text-gray-400 bg-black/60 px-2 py-1 rounded border border-[#2A2A2A] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                            {formatDate(v.visitDate)}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-[#111111] bg-[#D4AF37] font-bold px-2 py-0.5 rounded">
                            {v.serviceCategory || "Hair"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-sans font-semibold text-gray-400">Amount:</span>
                          <span className="text-lg font-serif font-bold text-emerald-400">₹{v.amount}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            v.paymentMethod === "Pending" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          }`}>
                            {v.paymentMethod}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                        <div>
                          <p className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Services Rendered</p>
                          <p className="text-white font-medium mt-0.5 text-sm">{v.services}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Attending Stylist</p>
                          <p className="text-gray-200 font-semibold mt-0.5">{v.stylistName}</p>
                        </div>
                      </div>

                      {v.colourNumber && (
                        <div className="mt-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 p-2 rounded flex items-center justify-between text-xs">
                          <span className="text-[#D4AF37] font-bold">Shade / Colour Code:</span>
                          <span className="text-white font-mono font-bold bg-black/60 px-2 py-0.5 rounded">{v.colourNumber}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-gray-300 mb-2">
                  Client Technical Notes &amp; Hair/Skin Preferences
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter client haircut preferences, allergy warnings, favorite stylists, skin sensitivity details, etc."
                  rows={6}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#D4AF37] text-white p-4 rounded text-sm font-sans outline-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleArchive}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 text-xs font-sans font-bold uppercase tracking-wider hover:bg-red-950/30 px-3 py-2 rounded transition-colors cursor-pointer border border-red-900/40"
                >
                  <Archive className="w-4 h-4" />
                  Archive Client Profile
                </button>

                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="flex items-center gap-2 bg-[#D4AF37] text-[#111111] hover:bg-[#C5A059] px-5 py-2 rounded font-sans text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer shadow-md disabled:opacity-50"
                >
                  {savingNotes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Profile Notes
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

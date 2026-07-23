import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp,
  getDocs,
  where,
  setDoc,
  getDoc
} from "firebase/firestore";
import { motion, AnimatePresence } from 'motion/react';
import { Play, CheckCircle, Trash2, Monitor, Scissors, UserPlus, Phone, Loader2, User, Clock, ChevronRight, Search, X } from 'lucide-react';

// Firebase Configuration
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

// Types
type TicketStatus = "Waiting" | "Serving" | "Completed";
type Role = "receptionist" | "stylist" | "owner" | "owner_stylist" | "tv";

interface User {
  username: string;
  role: Role;
  name: string;
}

interface Ticket {
  docId: string;
  id: string;
  customerName: string;
  phone: string;
  serviceType: string;
  status: TicketStatus;
  timestamp: any;
  stylistName?: string;
  servedAt?: any;
  completedAt?: any;
  price?: number;
  paymentMethod?: "Cash" | "UPI" | "Pending";
  gender?: "Male" | "Female";
  serviceCategory?: "Hair" | "Skin" | "Waxing";
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
}

const SERVICES_CONFIG = {
  Male: {
    Hair: [
      "Haircut",
      "Global Colour",
      "Highlights Colour",
      "Hair Spa",
      "Head Massage",
      "Beard Style",
      "Clean Shave",
      "Hair Styling"
    ],
    Skin: [
      "Manicure",
      "Pedicure",
      "Facial",
      "Cleanup",
      "Face Massage"
    ],
    Waxing: [
      "Chest Wax",
      "Back Wax",
      "Full Arms Wax",
      "Full Legs Wax",
      "Underarms Wax",
      "Rica Wax (Arms/Legs)"
    ]
  },
  Female: {
    Hair: [
      "Haircut",
      "Hair Spa",
      "Global Colour",
      "Highlights Colour",
      "Root Touch Up",
      "Oil Massage",
      "Hair Fall Treatment"
    ],
    Skin: [
      "Threading",
      "Facial",
      "Clean Up",
      "Regular Pedicure & Spa",
      "Bleach & D-Tan"
    ],
    Waxing: [
      "Regular Wax",
      "Rica Wax",
      "Hard Wax",
      "Roll-On Wax",
      "Full Arms Wax",
      "Full Legs Wax",
      "Underarms Wax",
      "Half Arms Wax",
      "Half Legs Wax",
      "Full Body Wax",
      "Face Waxing"
    ]
  }
};


// Notifications removed


// Live Counter Component
const LiveCounter: React.FC<{ timestamp: any }> = ({ timestamp }) => {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    if (!timestamp) {
      setElapsed('0m 0s');
      return;
    }
    const updateTime = () => {
      let start = 0;
      if (typeof timestamp.toDate === 'function') {
        start = timestamp.toDate().getTime();
      } else if (timestamp.seconds) {
        start = timestamp.seconds * 1000;
      } else {
        setElapsed('0m 0s');
        return;
      }

      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((now - start) / 1000));
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      setElapsed(`${m}m ${s}s`);
    };

    updateTime(); // Initial call
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timestamp]);

  return <span>{elapsed || '0m 0s'}</span>;
};

// Login Component
const Login: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Predefined TV terminal display account
    if (username.toLowerCase() === "tv") {
      onLogin({ username: "tv", role: "tv", name: "TV Display" });
      return;
    }

    try {
      // Query stylist by name
      const formattedName = username.charAt(0).toUpperCase() + username.slice(1);
      
      const q = query(collection(db, "stylists"), where("name", "==", formattedName));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const stylistDoc = querySnapshot.docs[0].data();
        const role = stylistDoc.role || (formattedName.toLowerCase().includes('reception') ? 'receptionist' : 'stylist');
        onLogin({ username, role, name: formattedName });
        return;
      }
      
      setError('Member name not found. Contact administration to register.');
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 relative gap-10 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.01] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] invert"></div>
      
      {/* 3D Floating Scissors Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[10%] opacity-[0.18] animate-float-3d-1 text-[#D4AF37]">
          <Scissors className="w-16 h-16 drop-shadow-[0_10px_20px_rgba(212,175,55,0.4)]" />
        </div>
        <div className="absolute top-[20%] right-[15%] opacity-[0.12] animate-float-3d-2 text-gray-400">
          <Scissors className="w-24 h-24 drop-shadow-[0_15px_30px_rgba(0,0,0,0.15)]" />
        </div>
        <div className="absolute bottom-[25%] left-[15%] opacity-[0.12] animate-float-3d-3 text-gray-400">
          <Scissors className="w-20 h-20 drop-shadow-[0_15px_25px_rgba(0,0,0,0.15)]" />
        </div>
        <div className="absolute bottom-[10%] right-[20%] opacity-[0.18] animate-float-3d-1 text-[#D4AF37]">
          <Scissors className="w-28 h-28 drop-shadow-[0_20px_35px_rgba(212,175,55,0.4)]" />
        </div>
        <div className="absolute top-[60%] left-[5%] opacity-[0.08] animate-float-3d-2 text-gray-400">
          <Scissors className="w-12 h-12" />
        </div>
        <div className="absolute top-[50%] right-[5%] opacity-[0.15] animate-float-3d-3 text-[#D4AF37]">
          <Scissors className="w-16 h-16 drop-shadow-[0_10px_20px_rgba(212,175,55,0.3)]" />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-scissor-1 {
          0% { transform: translateY(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1); }
          50% { transform: translateY(-40px) rotateX(180deg) rotateY(90deg) rotateZ(45deg) scale(1.1); }
          100% { transform: translateY(0px) rotateX(360deg) rotateY(180deg) rotateZ(0deg) scale(1); }
        }
        @keyframes float-scissor-2 {
          0% { transform: translateY(0px) rotateX(45deg) rotateY(0deg) rotateZ(90deg) scale(0.9); }
          50% { transform: translateY(30px) rotateX(-90deg) rotateY(180deg) rotateZ(-45deg) scale(0.85); }
          100% { transform: translateY(0px) rotateX(45deg) rotateY(360deg) rotateZ(90deg) scale(0.9); }
        }
        @keyframes float-scissor-3 {
          0% { transform: translateY(0px) rotateX(0deg) rotateY(-45deg) rotateZ(180deg) scale(1.1); }
          50% { transform: translateY(-50px) rotateX(90deg) rotateY(180deg) rotateZ(270deg) scale(1); }
          100% { transform: translateY(0px) rotateX(0deg) rotateY(315deg) rotateZ(180deg) scale(1.1); }
        }
        .animate-float-3d-1 {
          animation: float-scissor-1 15s infinite ease-in-out;
          perspective: 1000px;
          transform-style: preserve-3d;
        }
        .animate-float-3d-2 {
          animation: float-scissor-2 20s infinite ease-in-out;
          perspective: 1000px;
          transform-style: preserve-3d;
        }
        .animate-float-3d-3 {
          animation: float-scissor-3 25s infinite ease-in-out;
          perspective: 1000px;
          transform-style: preserve-3d;
        }
      `}} />

      {/* Left Column: Brand Showcase */}
      <div 
        style={{ textShadow: '0 2px 10px rgba(0,0,0,0.95)' }}
        className="max-w-md flex flex-col text-left gap-6 z-10 text-white animate-fadeIn pr-0 md:pr-10 border-b md:border-b-0 md:border-r border-[#D4AF37]/20 pb-6 md:pb-0"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-sm border border-[#D4AF37]/50 bg-[#1A1A1A] flex items-center justify-center shadow-lg">
            <Scissors className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-widest font-serif uppercase text-[#D4AF37] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Hairport
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-sans font-bold mt-0.5">Premium Grooming</p>
          </div>
        </div>

        <div className="space-y-4 mt-2">
          <h2 className="text-2xl sm:text-3xl font-serif text-white leading-relaxed font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            Where Precision Meets <span className="text-[#D4AF37]">Premium Luxury</span>.
          </h2>
          <p className="text-sm text-gray-200 font-sans leading-relaxed font-medium">
            Welcome to Hairport, a state-of-the-art grooming sanctuary engineered for those who demand excellence. Every cut, shade, and detail is sculpted with absolute precision.
          </p>
        </div>

        <div className="space-y-4 mt-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-sm bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] mt-0.5 shadow-md shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider text-[#D4AF37] font-serif font-bold">Elite Stylists</h3>
              <p className="text-xs text-gray-200 mt-1 font-sans font-medium">Crafted by certified master barbers using advanced styling techniques tailored to your lifestyle.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-sm bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] mt-0.5 shadow-md shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider text-[#D4AF37] font-serif font-bold">Premium Care</h3>
              <p className="text-xs text-gray-200 mt-1 font-sans font-medium">Premium Igora shades, premium skin therapies, and organic formulations for hair and scalp wellness.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-sm bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] mt-0.5 shadow-md shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider text-[#D4AF37] font-serif font-bold">Real-time Queue Concierge</h3>
              <p className="text-xs text-gray-200 mt-1 font-sans font-medium">Zero phone call queues. Track wait times live and check in instantly via digital concierge display.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Main Authentication Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/60 backdrop-blur-xl border border-[#D4AF37]/30 p-10 rounded-sm shadow-2xl w-full max-w-md relative z-10 text-white"
      >
        <div className="flex flex-col items-center mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-sans font-bold">Welcome Back</p>
          <h2 className="text-2xl font-serif text-white mt-1 uppercase tracking-wider">Access Portal</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-sans text-gray-400 uppercase tracking-widest">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#1A1A1A]/80 border border-[#2A2A2A] rounded-sm px-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-all text-white placeholder-gray-500 font-sans"
              placeholder="Enter username"
              required
            />
          </div>
          
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <button 
            type="submit"
            className="w-full mt-4 bg-[#D4AF37] hover:bg-[#C5A059] text-[#111111] font-serif font-bold tracking-widest uppercase py-4 px-6 rounded-sm transition-colors duration-300 cursor-pointer shadow-lg"
          >
            Authenticate
          </button>
        </form>
      </motion.div>
    </div>
  );
};

interface CompletionModalProps {
  ticket: Ticket;
  onClose: () => void;
  onConfirm: (
    price: number, 
    stylistName: string, 
    paymentMethod: "Cash" | "UPI" | "Pending",
    splitDetails?: {
      isSplit: boolean;
      primaryStylistName: string;
      secondaryStylistName: string;
      tertiaryStylistName?: string;
      primaryStylistPrice: number;
      secondaryStylistPrice: number;
      tertiaryStylistPrice?: number;
      primaryStylistService?: string;
      secondaryStylistService?: string;
      tertiaryStylistService?: string;
    }
  ) => Promise<void>;
}

const CompletionModal: React.FC<CompletionModalProps> = ({ ticket, onClose, onConfirm }) => {
  const ticketServicesList = ticket.serviceType
    ? ticket.serviceType.split(",").map(s => s.trim()).filter(Boolean)
    : [];
  const serviceCount = Math.min(ticketServicesList.length, 4);

  // Dynamic per-service state: array of { stylist, price, service }
  const [rows, setRows] = useState<{ stylist: string; price: string; service: string }[]>([]);
  const [stylists, setStylists] = useState<{ id: string; name: string }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "UPI" | "Pending">("UPI");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // billingMode: "auto" means one stylist per service, "single" means one stylist for all
  const [billingMode, setBillingMode] = useState<"single" | "split">("single");

  useEffect(() => {
    // Init rows from services
    const initRows = ticketServicesList.slice(0, 4).map((svc, i) => ({
      stylist: ticket.stylistName || "",
      price: "",
      service: svc,
    }));
    setRows(initRows.length > 0 ? initRows : [{ stylist: ticket.stylistName || "", price: "", service: "" }]);

    // Auto-suggest split mode if > 1 service
    if (ticketServicesList.length > 1) {
      setBillingMode("split");
    } else {
      setBillingMode("single");
    }

    const q = query(collection(db, "stylists"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => doc.data() as { name: string; role?: string })
        .filter(s => s.role !== "receptionist")
        .map(s => ({ id: s.name, name: s.name }));
      setStylists(data);
      if (!ticket.stylistName && data.length > 0) {
        setRows(prev => prev.map(r => r.stylist ? r : { ...r, stylist: data[0].name }));
      }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket]);

  const updateRow = (i: number, field: "stylist" | "price" | "service", value: string) => {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  };

  const computedTotal = billingMode === "split"
    ? rows.reduce((sum, r) => sum + (parseFloat(r.price) || 0), 0)
    : parseFloat(rows[0]?.price || "") || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (billingMode === "single") {
      const parsedPrice = parseFloat(rows[0]?.price || "");
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        setError("Please enter a valid price.");
        return;
      }
      if (!rows[0]?.stylist) {
        setError("Please select a stylist.");
        return;
      }
      setSubmitting(true);
      try {
        await onConfirm(parsedPrice, rows[0].stylist, paymentMethod);
      } catch {
        setError("Failed to complete ticket. Please try again.");
        setSubmitting(false);
      }
    } else {
      // Split mode — validate all rows
      for (let i = 0; i < rows.length; i++) {
        const price = parseFloat(rows[i].price);
        if (isNaN(price) || price < 0) {
          setError(`Please enter a valid price for Stylist ${i + 1}.`);
          return;
        }
        if (!rows[i].stylist) {
          setError(`Please select a stylist for row ${i + 1}.`);
          return;
        }
      }
      // Check for duplicate stylists
      const names = rows.map(r => r.stylist);
      if (new Set(names).size !== names.length) {
        setError("Each stylist must be different. Please assign unique stylists.");
        return;
      }

      const total = rows.reduce((sum, r) => sum + (parseFloat(r.price) || 0), 0);
      setSubmitting(true);
      try {
        await onConfirm(total, rows[0].stylist, paymentMethod, {
          isSplit: true,
          primaryStylistName: rows[0].stylist,
          secondaryStylistName: rows[1]?.stylist || "",
          tertiaryStylistName: rows[2]?.stylist,
          primaryStylistPrice: parseFloat(rows[0].price) || 0,
          secondaryStylistPrice: parseFloat(rows[1]?.price || "0") || 0,
          tertiaryStylistPrice: rows[2] ? (parseFloat(rows[2].price) || 0) : undefined,
          primaryStylistService: rows[0].service,
          secondaryStylistService: rows[1]?.service || "",
          tertiaryStylistService: rows[2]?.service,
        });
      } catch {
        setError("Failed to complete split ticket. Please try again.");
        setSubmitting(false);
      }
    }
  };

  const STYLIST_COLORS = ["from-[#D4AF37] to-[#8B7523]", "from-blue-500 to-blue-800", "from-purple-500 to-purple-800", "from-green-500 to-green-800"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#111111] border border-[#D4AF37]/30 p-6 rounded-sm shadow-2xl w-full max-w-lg relative text-gray-200 font-sans max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-xl font-serif text-[#D4AF37] mb-5 border-b border-[#2A2A2A] pb-4 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Complete Appointment
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Client & Services */}
          <div className="grid grid-cols-2 gap-4 bg-[#0D0D0D] border border-[#2A2A2A] rounded-sm p-3">
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-0.5">Client</span>
              <span className="text-sm text-white font-medium">{ticket.customerName}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-0.5">Services ({ticketServicesList.length})</span>
              <div className="flex flex-wrap gap-1">
                {ticketServicesList.map((s, i) => (
                  <span key={i} className="text-[10px] bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-1.5 py-0.5 rounded-sm font-medium">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Billing Mode */}
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest block">Billing Mode</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBillingMode("single")}
                className={`flex-1 py-2 rounded-sm border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  billingMode === "single"
                    ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]"
                    : "bg-[#1A1A1A] border-[#2A2A2A] text-gray-500 hover:text-white"
                }`}
              >
                Single Stylist
              </button>
              <button
                type="button"
                onClick={() => setBillingMode("split")}
                className={`flex-1 py-2 rounded-sm border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  billingMode === "split"
                    ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]"
                    : "bg-[#1A1A1A] border-[#2A2A2A] text-gray-500 hover:text-white"
                }`}
              >
                Split ({rows.length} Stylist{rows.length > 1 ? "s" : ""})
              </button>
            </div>
          </div>

          {/* Single mode */}
          {billingMode === "single" && (
            <div className="space-y-3 bg-[#1A1A1A]/40 border border-[#2A2A2A] rounded-sm p-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest">Stylist</label>
                <select
                  value={rows[0]?.stylist || ""}
                  onChange={e => updateRow(0, "stylist", e.target.value)}
                  disabled={!!ticket.stylistName}
                  className="w-full bg-[#111111] text-white border border-[#2A2A2A] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37] disabled:opacity-60 cursor-pointer"
                >
                  {ticket.stylistName ? (
                    <option value={ticket.stylistName}>{ticket.stylistName}</option>
                  ) : (
                    stylists.map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                  )}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest">Total Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={rows[0]?.price || ""}
                  onChange={e => updateRow(0, "price", e.target.value)}
                  required
                  className="w-full bg-[#111111] text-white border border-[#2A2A2A] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37]"
                  placeholder="Enter total (₹)"
                />
              </div>
            </div>
          )}

          {/* Split mode — dynamic rows, one per stylist */}
          {billingMode === "split" && (
            <div className="space-y-3">
              {rows.map((row, i) => (
                <div
                  key={i}
                  className="bg-[#1A1A1A]/40 border border-[#2A2A2A] rounded-sm p-4 space-y-3"
                >
                  {/* Stylist header */}
                  <div className="flex items-center gap-2 border-b border-[#2A2A2A] pb-2 mb-2">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${STYLIST_COLORS[i]} flex items-center justify-center text-[10px] font-bold text-black`}>
                      {i + 1}
                    </div>
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">
                      Stylist {i + 1}
                      {row.stylist && <span className="text-[#D4AF37] ml-1">— {row.stylist}</span>}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 uppercase tracking-wider">Name</label>
                      <select
                        value={row.stylist}
                        onChange={e => updateRow(i, "stylist", e.target.value)}
                        className="w-full bg-[#111111] text-white border border-[#2A2A2A] rounded-sm px-2 py-2 text-xs focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                      >
                        <option value="">Select Stylist</option>
                        {stylists.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 uppercase tracking-wider">Amount (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={row.price}
                        onChange={e => updateRow(i, "price", e.target.value)}
                        placeholder="₹"
                        className="w-full bg-[#111111] text-white border border-[#2A2A2A] rounded-sm px-2 py-2 text-xs focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider">Service Performed</label>
                    <select
                      value={row.service}
                      onChange={e => updateRow(i, "service", e.target.value)}
                      className="w-full bg-[#111111] text-white border border-[#2A2A2A] rounded-sm px-2 py-2 text-xs focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                    >
                      <option value="">Select service</option>
                      {ticketServicesList.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}

              {/* Add/Remove row buttons */}
              <div className="flex gap-2">
                {rows.length < Math.max(4, ticketServicesList.length) && (
                  <button
                    type="button"
                    onClick={() => setRows(prev => [...prev, { stylist: "", price: "", service: ticketServicesList[prev.length] || "" }])}
                    className="flex-1 py-2 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] uppercase tracking-wider rounded-sm hover:bg-[#D4AF37]/10 transition-all cursor-pointer"
                  >
                    + Add Stylist
                  </button>
                )}
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setRows(prev => prev.slice(0, -1))}
                    className="px-4 py-2 border border-[#2A2A2A] text-gray-500 text-[10px] uppercase tracking-wider rounded-sm hover:bg-red-900/20 hover:text-red-400 hover:border-red-800/40 transition-all cursor-pointer"
                  >
                    − Remove
                  </button>
                )}
              </div>

              {/* Total Summary */}
              <div className="bg-[#0D0D0D] border border-[#D4AF37]/20 rounded-sm p-3 flex justify-between items-center">
                <span className="text-xs text-gray-500 uppercase tracking-widest">Total Billed</span>
                <span className="text-lg font-serif font-bold text-[#D4AF37]">₹{computedTotal.toFixed(0)}</span>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest block">Payment Method</label>
            <div className="flex gap-2">
              {(["UPI", "Cash", "Pending"] as const).map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`flex-1 py-3 rounded-sm border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    paymentMethod === method
                      ? method === "Pending"
                        ? "bg-red-600/20 border-red-500 text-red-400"
                        : "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]"
                      : "bg-[#1A1A1A] border-[#2A2A2A] text-gray-500 hover:text-white"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-xs bg-red-950/30 border border-red-800/30 rounded-sm px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 bg-transparent hover:bg-white/5 border border-gray-600 text-gray-400 hover:text-white py-3 rounded-sm text-xs uppercase tracking-widest transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#D4AF37] hover:bg-[#C5A059] text-[#111111] py-3 rounded-sm text-xs uppercase tracking-widest transition-colors font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : `Confirm ₹${computedTotal.toFixed(0)}`}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hairport_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
    return null;
  });
  const [view, setView] = useState<"reception" | "staff" | "tv" | "owner" | "analytics">("reception");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingTicket, setCompletingTicket] = useState<Ticket | null>(null);
  
  // Audio notification tracking
  const prevServingCount = useRef(0);
  const isInitialLoad = useRef(true);


  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);



  // Persist user state to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("hairport_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("hairport_user");
    }
  }, [user]);

  const formattedHeaderDate = currentDateTime.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedHeaderTime = currentDateTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  useEffect(() => {
    const q = query(collection(db, "tickets"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newTickets = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      })) as Ticket[];
      
      setTickets(newTickets);
      setLoading(false);

      // Check for new serving tickets — no audio
      const currentServing = newTickets.filter(t => t.status === "Serving").length;
      prevServingCount.current = currentServing;
      isInitialLoad.current = false;

    });

    return () => unsubscribe();
  }, [view]);

  // Record attendance on login for tracked staff
  const TRACKED_STAFF = ["Prashant", "Tejas", "Kunal"];
  useEffect(() => {
    if (!user || user.role === "tv") return;
    const staffName = user.name;
    if (!TRACKED_STAFF.includes(staffName)) return;

    // Write a login attendance record for today
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0]; // "YYYY-MM-DD"
    const attendanceDocId = `${staffName}_${dateStr}`;

    const writeAttendance = async () => {
      try {
        const attendanceRef = doc(db, "attendance", attendanceDocId);
        const existing = await getDoc(attendanceRef);
        if (!existing.exists()) {
          // First login today — create record
          await setDoc(attendanceRef, {
            name: staffName,
            date: dateStr,
            loginAt: new Date().toISOString(),
            loginTimestamp: today.getTime(),
          });
        }
        // If already exists, don't overwrite — first login of the day is canonical
      } catch (e) {
        console.error("Failed to write attendance", e);
      }
    };
    writeAttendance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Set default view on login based on role
  useEffect(() => {
    if (user) {
      if (user.role === "tv") {
        setView("tv");
      } else {
        if (user.role === "receptionist") setView("reception");
        else if (user.role === "stylist") setView("staff");
        else if (user.role === "owner" || user.role === "owner_stylist") setView("owner");
      }
    }
  }, [user]);

  const handleConfirmCompletion = async (
    price: number, 
    stylistName: string, 
    paymentMethod: "Cash" | "UPI" | "Pending",
    splitDetails?: {
      isSplit: boolean;
      primaryStylistName: string;
      secondaryStylistName: string;
      tertiaryStylistName?: string;
      primaryStylistPrice: number;
      secondaryStylistPrice: number;
      tertiaryStylistPrice?: number;
      primaryStylistService?: string;
      secondaryStylistService?: string;
      tertiaryStylistService?: string;
    }
  ) => {
    if (!completingTicket) return;
    try {
      const updateData: any = {
        status: "Completed",
        price,
        stylistName,
        paymentMethod,
        completedAt: serverTimestamp()
      };
      if (splitDetails && splitDetails.isSplit) {
        updateData.isSplit = true;
        updateData.primaryStylistName = splitDetails.primaryStylistName;
        updateData.secondaryStylistName = splitDetails.secondaryStylistName;
        updateData.primaryStylistPrice = splitDetails.primaryStylistPrice;
        updateData.secondaryStylistPrice = splitDetails.secondaryStylistPrice;
        updateData.primaryStylistService = splitDetails.primaryStylistService || "";
        updateData.secondaryStylistService = splitDetails.secondaryStylistService || "";
        
        let stylistsDisplay = `${splitDetails.primaryStylistName} & ${splitDetails.secondaryStylistName}`;
        
        if (splitDetails.tertiaryStylistName) {
          updateData.tertiaryStylistName = splitDetails.tertiaryStylistName;
          updateData.tertiaryStylistPrice = splitDetails.tertiaryStylistPrice;
          updateData.tertiaryStylistService = splitDetails.tertiaryStylistService || "";
          stylistsDisplay += ` & ${splitDetails.tertiaryStylistName}`;
        }
        updateData.stylistName = stylistsDisplay;
      }
      if (!completingTicket.servedAt) {
        updateData.servedAt = serverTimestamp();
      }
      await updateDoc(doc(db, "tickets", completingTicket.docId), updateData);
      
      // Auto-compose and trigger native SMS to thank the client
      let smsBody = "";
      const displayStylist = splitDetails?.isSplit 
        ? `${splitDetails.primaryStylistName} and ${splitDetails.secondaryStylistName}`
        : stylistName;
      if (paymentMethod === "Pending") {
        smsBody = `Hi ${completingTicket.customerName}, thank you for visiting Hairport! Your service with ${displayStylist} is complete. Your total bill is ₹${price} (marked as pending). We hope you loved our service! Please visit again.`;
      } else {
        smsBody = `Hi ${completingTicket.customerName}, thank you for visiting Hairport! Your service with ${displayStylist} is complete. Your payment of ₹${price} via ${paymentMethod} has been received. We hope you love your new look. Please visit again!`;
      }
      const smsUrl = `sms:${completingTicket.phone}?body=${encodeURIComponent(smsBody)}`;
      window.location.href = smsUrl;

      setCompletingTicket(null);
    } catch (err) {
      console.error("Error completing ticket:", err);
      throw err;
    }
  };

  // If no user is logged in, show Login, unless we are forcing TV view.
  // Wait, TV view doesn't require login. But how do we get to TV view if we are logged out?
  // We can add a "TV Mode" button to the login page. Let's add that.
  // If no user is logged in, show Login, unless we are forcing TV view.
  // Handled inline in the main render tree below.

  const isDarkView = true;

  return (
    <div className="min-h-screen font-sans selection:bg-[#D4AF37]/30 overflow-x-hidden flex flex-col bg-[#0A0A0A] text-gray-100">
      
      {/* Slow Panning & Scaling Luxury Flow Animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes luxury-flow {
          0% { transform: scale(1) translate(0px, 0px) rotate(0deg); }
          33% { transform: scale(1.06) translate(-10px, -8px) rotate(0.2deg); }
          66% { transform: scale(1.03) translate(8px, 6px) rotate(-0.2deg); }
          100% { transform: scale(1) translate(0px, 0px) rotate(0deg); }
        }
        .animate-wallpaper-flow {
          animation: luxury-flow 30s ease-in-out infinite;
        }
      `}} />
      
      {/* Universal High-Res Option 3 Luxury Dark Wallpaper */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          style={{
            backgroundImage: 'url("/option3_bg.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          className="absolute -inset-10 animate-wallpaper-flow"
        />
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      {/* Header */}
      {view !== 'tv' && user && (
        <header className="relative z-20 flex flex-col lg:flex-row justify-between items-center px-4 sm:px-8 py-4 sm:py-6 gap-4 sm:gap-6 border-b transition-colors duration-500 bg-black/60 border-[#D4AF37]/30 backdrop-blur-md">
          <div className="flex items-center justify-between w-full lg:w-auto gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-sm border transition-colors duration-500 flex items-center justify-center ${isDarkView ? 'border-[#D4AF37]/50 bg-[#1A1A1A]' : 'border-[#111111] bg-[#111111]'}`}>
                <Scissors className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37]" />
              </div>
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold tracking-widest font-serif uppercase transition-colors duration-500 ${isDarkView ? 'text-[#D4AF37]' : 'text-[#111111]'}`}>
                  Hairport
                </h1>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-gray-500 font-sans mt-0.5 sm:mt-1">Premium Grooming</p>
              </div>

              {/* Live Date display */}
              <div className="hidden md:flex flex-col border-l border-gray-300 dark:border-[#2A2A2A] pl-4 ml-2">
                <span className="text-[9px] uppercase tracking-widest text-gray-400 font-sans font-bold">Current Date</span>
                <span className={`text-xs font-mono font-bold ${isDarkView ? 'text-[#D4AF37]' : 'text-[#111111]'}`}>
                  {formattedHeaderDate}
                </span>
                <span className="text-[10px] text-gray-500 font-mono mt-0.5">
                  {formattedHeaderTime}
                </span>
              </div>
            </div>
            
            {/* Mobile Sign Out */}
            <div className="flex flex-col items-end lg:hidden">
              <span className={`text-xs font-serif font-bold ${isDarkView ? 'text-white' : 'text-[#111111]'}`}>{user?.name}</span>
              <button 
                onClick={() => setUser(null)}
                className="text-[10px] font-sans tracking-widest uppercase text-gray-500 hover:text-[#D4AF37] transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center w-full lg:w-auto gap-4 sm:gap-6">
            <div className={`flex flex-wrap items-center justify-center p-1 rounded-sm border transition-colors duration-500 w-full lg:w-auto ${isDarkView ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-[#F5F5F0] border-[#E5E5E0]'}`}>
              {(user?.role === "owner" || user?.role === "owner_stylist") && (
                <button
                  onClick={() => setView("owner")}
                  className={`flex items-center justify-center gap-1.5 px-3 sm:px-6 py-2.5 rounded-sm text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer flex-1 lg:flex-none ${
                    view === "owner" 
                      ? "bg-[#2A2A2A] text-[#D4AF37] shadow-[0_2px_10px_rgba(0,0,0,0.5)] border-b border-[#D4AF37]/50" 
                      : isDarkView ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">OWNER</span>
                </button>
              )}
              {(user?.role === "owner" || user?.role === "owner_stylist") && (
                <button
                  onClick={() => setView("analytics")}
                  className={`flex items-center justify-center gap-1.5 px-3 sm:px-6 py-2.5 rounded-sm text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer flex-1 lg:flex-none ${
                    view === "analytics" 
                      ? "bg-[#2A2A2A] text-[#D4AF37] shadow-[0_2px_10px_rgba(0,0,0,0.5)] border-b border-[#D4AF37]/50" 
                      : isDarkView ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">ANALYTICS</span>
                </button>
              )}
              {(user?.role === "receptionist" || user?.role === "owner" || user?.role === "owner_stylist") && (
                <button
                  onClick={() => setView("reception")}
                  className={`flex items-center justify-center gap-1.5 px-3 sm:px-6 py-2.5 rounded-sm text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer flex-1 lg:flex-none ${
                    view === "reception" 
                      ? isDarkView 
                        ? "bg-[#2A2A2A] text-[#D4AF37] shadow-[0_2px_10px_rgba(0,0,0,0.5)] border-b border-[#D4AF37]/50"
                        : "bg-[#111111] text-[#D4AF37] shadow-md"
                      : isDarkView ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>RECEPTION</span>
                </button>
              )}
              {(user?.role === "stylist" || user?.role === "owner_stylist") && (
                <button
                  onClick={() => setView("reception")}
                  className={`flex items-center justify-center gap-1.5 px-3 sm:px-6 py-2.5 rounded-sm text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer flex-1 lg:flex-none ${
                    view === "reception" 
                      ? "bg-[#2A2A2A] text-[#D4AF37] shadow-[0_2px_10px_rgba(0,0,0,0.5)] border-b border-[#D4AF37]/50" 
                      : isDarkView ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">RECEPTION</span>
                </button>
              )}
              {(user?.role === "stylist" || user?.role === "owner_stylist") && (
                <button
                  onClick={() => setView("staff")}
                  className={`flex items-center justify-center gap-1.5 px-3 sm:px-6 py-2.5 rounded-sm text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer flex-1 lg:flex-none ${
                    view === "staff" 
                      ? "bg-[#2A2A2A] text-[#D4AF37] shadow-[0_2px_10px_rgba(0,0,0,0.5)] border-b border-[#D4AF37]/50" 
                      : isDarkView ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">STAFF</span>
                </button>
              )}
              <button
                onClick={() => setView("tv")}
                className={`flex items-center justify-center gap-1.5 px-3 sm:px-6 py-2.5 rounded-sm text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer flex-1 lg:flex-none ${
                  view === "tv" 
                    ? "bg-[#2A2A2A] text-[#D4AF37] shadow-[0_2px_10px_rgba(0,0,0,0.5)] border-b border-[#D4AF37]/50" 
                    : isDarkView ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">TV</span>
              </button>
            </div>
            
            {/* Desktop Sign Out */}
            <div className="hidden lg:flex flex-col items-end border-l border-gray-300 dark:border-[#2A2A2A] pl-6">
              <span className={`text-sm font-serif font-bold ${isDarkView ? 'text-white' : 'text-[#111111]'}`}>{user?.name}</span>
              <button 
                onClick={() => setUser(null)}
                className="text-xs font-sans tracking-widest uppercase text-gray-500 hover:text-[#D4AF37] transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={`relative z-10 flex-1 flex flex-col ${view === 'tv' ? '' : 'p-6 md:p-10'}`}>
        {!user && view !== 'tv' ? (
          <div className="flex-1 flex flex-col relative">
            <Login onLogin={setUser} />
            <div className="absolute top-0 right-4 z-30">
              <button 
                onClick={() => setView('tv')}
                className="flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-sans tracking-widest uppercase text-gray-400 hover:text-[#D4AF37] transition-colors cursor-pointer"
              >
                <Monitor className="w-4 h-4" />
                Launch TV Display
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-4">
            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            <p className="text-sm tracking-widest font-serif text-gray-400">LOADING CONCIERGE...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {view === "owner" && (
              <OwnerDashboard key="owner" tickets={tickets} />
            )}
            {view === "analytics" && (
              <StaffAnalyticsDashboard key="analytics" tickets={tickets} />
            )}
            {view === "reception" && (
              <ReceptionDashboard key="reception" tickets={tickets} onCompleteTicket={setCompletingTicket} />
            )}
            {view === "staff" && user && (
              <StaffLineView key="staff" tickets={tickets} user={user} onCompleteTicket={setCompletingTicket} />
            )}
            {view === "tv" && (
              <TVDisplay 
                key="tv" 
                tickets={tickets} 
                onExit={user?.role === 'tv' ? undefined : () => setView(user ? ((user.role === 'owner' || user.role === 'owner_stylist') ? 'owner' : (user.role === 'stylist' ? 'staff' : 'reception')) : 'reception')} 
                onSignOut={user?.role === 'tv' ? () => setUser(null) : undefined}
              />
            )}
          </AnimatePresence>
        )}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
      `}} />

      {completingTicket && (
        <CompletionModal
          ticket={completingTicket}
          onClose={() => setCompletingTicket(null)}
          onConfirm={handleConfirmCompletion}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------
// REVENUE ANALYTICS VIEW COMPONENT (FOR RECEPTIONIST)
// ---------------------------------------------------------
interface RevenueAnalyticsViewProps {
  tickets: Ticket[];
}

const RevenueAnalyticsView: React.FC<RevenueAnalyticsViewProps> = ({ tickets }) => {
  const completedTickets = tickets.filter(t => t.status === "Completed");

  const getTicketDate = (ticket: Ticket): Date | null => {
    if (!ticket.completedAt) return null;
    if (typeof ticket.completedAt.toDate === 'function') {
      return ticket.completedAt.toDate();
    }
    if (ticket.completedAt.seconds) {
      return new Date(ticket.completedAt.seconds * 1000);
    }
    return null;
  };

  const monthlyData: Record<string, number> = {};
  const dailyData: Record<string, number> = {};

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${(lastMonthDate.getMonth() + 1).toString().padStart(2, '0')}`;

  let cashRevenue = 0;
  let upiRevenue = 0;
  let pendingRevenue = 0;

  completedTickets.forEach(ticket => {
    const date = getTicketDate(ticket);
    if (!date) return;

    const price = ticket.price || 0;

    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + price;

    const dayKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    dailyData[dayKey] = (dailyData[dayKey] || 0) + price;

    if (ticket.paymentMethod === "Cash") {
      cashRevenue += price;
    } else if (ticket.paymentMethod === "Pending") {
      pendingRevenue += price;
    } else {
      upiRevenue += price;
    }
  });

  const totalBreakdown = cashRevenue + upiRevenue + pendingRevenue;
  const cashPercent = totalBreakdown > 0 ? (cashRevenue / totalBreakdown) * 100 : 0;
  const upiPercent = totalBreakdown > 0 ? (upiRevenue / totalBreakdown) * 100 : 0;
  const pendingPercent = totalBreakdown > 0 ? (pendingRevenue / totalBreakdown) * 100 : 0;

  const thisMonthRevenue = monthlyData[currentMonthKey] || 0;
  const lastMonthRevenue = monthlyData[lastMonthKey] || 0;

  let percentageChange = 0;
  let hasGrowth = true;
  if (lastMonthRevenue > 0) {
    percentageChange = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    hasGrowth = percentageChange >= 0;
  } else if (thisMonthRevenue > 0) {
    percentageChange = 100;
    hasGrowth = true;
  }

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(now.getDate() - i);
    return d;
  }).reverse();

  const dailyChartData = last7Days.map(d => {
    const dayKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    const label = d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
    return {
      label,
      value: dailyData[dayKey] || 0
    };
  });

  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return d;
  }).reverse();

  const monthlyChartData = last6Months.map(d => {
    const monthKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    const label = d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
    return {
      label,
      value: monthlyData[monthKey] || 0
    };
  });

  const maxDaily = Math.max(...dailyChartData.map(d => d.value), 1);
  const maxMonthly = Math.max(...monthlyChartData.map(m => m.value), 1);

  const totalComparison = thisMonthRevenue + lastMonthRevenue;
  const thisMonthPercent = totalComparison > 0 ? (thisMonthRevenue / totalComparison) * 100 : 50;
  const lastMonthPercent = totalComparison > 0 ? (lastMonthRevenue / totalComparison) * 100 : 50;

  return (
    <div className="flex flex-col gap-10 w-full text-white font-sans">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black/60 border border-[#D4AF37]/40 p-6 rounded-sm shadow-2xl flex flex-col gap-2 relative overflow-hidden backdrop-blur-md">
          <span className="text-gray-400 text-xs uppercase tracking-widest font-semibold">This Month's Revenue</span>
          <span className="text-4xl font-serif font-bold text-[#D4AF37]">₹{thisMonthRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">{now.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</span>
        </div>

        <div className="bg-black/60 border border-[#D4AF37]/30 p-6 rounded-sm shadow-2xl flex flex-col gap-2 relative overflow-hidden backdrop-blur-md">
          <span className="text-gray-400 text-xs uppercase tracking-widest font-semibold">Last Month's Revenue</span>
          <span className="text-4xl font-serif font-bold text-gray-300">₹{lastMonthRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">
            {new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="bg-black/60 border border-[#D4AF37]/30 p-6 rounded-sm shadow-2xl flex flex-col justify-between gap-2 backdrop-blur-md">
          <div className="flex flex-col gap-1">
            <span className="text-gray-400 text-xs uppercase tracking-widest font-semibold">Monthly Performance Change</span>
            <span className={`text-4xl font-serif font-bold ${hasGrowth ? 'text-green-400' : 'text-red-400'}`}>
              {hasGrowth ? '+' : ''}{percentageChange.toFixed(1)}%
            </span>
          </div>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Compared to previous month</span>
        </div>
      </div>

      <div className="bg-black/60 border border-[#D4AF37]/30 p-8 rounded-sm shadow-2xl flex flex-col gap-6 backdrop-blur-md">
        <h3 className="text-lg font-serif uppercase tracking-wider text-[#D4AF37]">
          Monthly Revenue Balance Check
        </h3>
        
        <div className="flex flex-col gap-2">
          <div className="h-6 w-full bg-[#1A1A1A]/80 rounded-full overflow-hidden flex border border-[#2A2A2A]">
            <div 
              style={{ width: `${lastMonthPercent}%` }} 
              className="bg-gray-600 transition-all duration-500 animate-pulse-once"
              title={`Last Month: ${lastMonthPercent.toFixed(1)}%`}
            />
            <div 
              style={{ width: `${thisMonthPercent}%` }} 
              className="bg-gradient-to-r from-[#C5A059] to-[#D4AF37] transition-all duration-500"
              title={`This Month: ${thisMonthPercent.toFixed(1)}%`}
            />
          </div>
          
          <div className="flex justify-between text-xs font-semibold uppercase tracking-wider mt-1">
            <span className="text-gray-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-gray-500 rounded-full"></span>
              Last Month ({lastMonthPercent.toFixed(0)}%)
            </span>
            <span className="text-[#D4AF37] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#D4AF37] rounded-full"></span>
              This Month ({thisMonthPercent.toFixed(0)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="bg-black/60 border border-[#D4AF37]/30 p-8 rounded-sm shadow-2xl flex flex-col gap-6 backdrop-blur-md">
        <h3 className="text-lg font-serif uppercase tracking-wider text-[#D4AF37]">
          Payment Breakdown & Outstanding Balances
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="border border-[#2A2A2A] p-4 rounded-sm bg-[#1A1A1A]/80 flex flex-col gap-1">
            <span className="text-gray-400 text-[10px] uppercase tracking-widest font-semibold">UPI Revenue</span>
            <span className="text-2xl font-bold text-blue-400">₹{upiRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-gray-500 font-medium">{upiPercent.toFixed(1)}% of total</span>
          </div>
          
          <div className="border border-[#2A2A2A] p-4 rounded-sm bg-[#1A1A1A]/80 flex flex-col gap-1">
            <span className="text-gray-400 text-[10px] uppercase tracking-widest font-semibold">Cash Revenue</span>
            <span className="text-2xl font-bold text-green-400">₹{cashRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-gray-500 font-medium">{cashPercent.toFixed(1)}% of total</span>
          </div>

          <div className="border border-red-900/40 p-4 rounded-sm bg-red-950/20 flex flex-col gap-1">
            <span className="text-red-400 text-[10px] uppercase tracking-widest font-semibold">Pending Balance</span>
            <span className="text-2xl font-bold text-red-500">₹{pendingRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-red-400/70 font-medium">{pendingPercent.toFixed(1)}% outstanding</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <div className="h-4 w-full bg-[#1A1A1A] rounded-full overflow-hidden flex border border-[#2A2A2A]">
            <div 
              style={{ width: `${upiPercent}%` }} 
              className="bg-blue-500 transition-all duration-500"
              title={`UPI: ${upiPercent.toFixed(1)}%`}
            />
            <div 
              style={{ width: `${cashPercent}%` }} 
              className="bg-green-500 transition-all duration-500"
              title={`Cash: ${cashPercent.toFixed(1)}%`}
            />
            <div 
              style={{ width: `${pendingPercent}%` }} 
              className="bg-red-500 transition-all duration-500"
              title={`Pending: ${pendingPercent.toFixed(1)}%`}
            />
          </div>
          <div className="flex flex-wrap gap-4 justify-between text-[10px] font-semibold uppercase tracking-wider mt-1">
            <span className="text-blue-400 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              UPI ({upiPercent.toFixed(0)}%)
            </span>
            <span className="text-green-400 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Cash ({cashPercent.toFixed(0)}%)
            </span>
            <span className="text-red-400 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Pending ({pendingPercent.toFixed(0)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        <div className="bg-black/60 border border-[#D4AF37]/30 p-8 rounded-sm shadow-2xl flex flex-col gap-6 backdrop-blur-md">
          <div>
            <h3 className="text-xl font-serif uppercase tracking-wider text-[#D4AF37] mb-1">
              Daily Income Overview
            </h3>
            <p className="text-xs text-gray-400 font-sans uppercase tracking-widest">Last 7 Days of Business Operations</p>
          </div>

          <div className="flex items-end justify-between h-64 pt-8 pb-2 px-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm relative">
            <div className="absolute inset-y-8 left-0 right-0 flex flex-col justify-between pointer-events-none">
              <div className="border-b border-[#2A2A2A] w-full"></div>
              <div className="border-b border-[#2A2A2A] w-full"></div>
              <div className="border-b border-[#2A2A2A] w-full"></div>
            </div>

            {dailyChartData.map((item, idx) => {
              const pct = (item.value / maxDaily) * 100;
              return (
                <div key={idx} className="flex flex-col items-center flex-1 group relative z-10 font-sans">
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-[#D4AF37]/50 text-white text-xs px-2.5 py-1.5 rounded-sm shadow-md font-mono z-30 pointer-events-none">
                    ₹{item.value.toFixed(2)}
                  </div>
                  <div 
                    style={{ height: `${Math.min(100, Math.max(4, pct))}%` }}
                    className={`w-8 sm:w-10 transition-all duration-500 rounded-t-sm ${
                      item.value > 0 ? 'bg-gradient-to-t from-[#C5A059] to-[#D4AF37] hover:brightness-110 shadow-sm' : 'bg-gray-800'
                    }`}
                  ></div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-2.5 font-sans">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-black/60 border border-[#D4AF37]/30 p-8 rounded-sm shadow-2xl flex flex-col gap-6 backdrop-blur-md">
          <div>
            <h3 className="text-xl font-serif uppercase tracking-wider text-[#D4AF37] mb-1">
              Monthly Trend Comparison
            </h3>
            <p className="text-xs text-gray-400 font-sans uppercase tracking-widest">Last 6 Months of Revenue Flow</p>
          </div>

          <div className="flex items-end justify-between h-64 pt-8 pb-2 px-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm relative">
            <div className="absolute inset-y-8 left-0 right-0 flex flex-col justify-between pointer-events-none">
              <div className="border-b border-[#2A2A2A] w-full"></div>
              <div className="border-b border-[#2A2A2A] w-full"></div>
              <div className="border-b border-[#2A2A2A] w-full"></div>
            </div>

            {monthlyChartData.map((item, idx) => {
              const pct = (item.value / maxMonthly) * 100;
              return (
                <div key={idx} className="flex flex-col items-center flex-1 group relative z-10 font-sans">
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#111111] text-white text-xs px-2.5 py-1.5 rounded-sm shadow-md font-mono z-30 pointer-events-none">
                    ₹{item.value.toFixed(2)}
                  </div>
                  <div 
                    style={{ height: `${Math.min(100, Math.max(4, pct))}%` }}
                    className={`w-10 sm:w-12 transition-all duration-500 rounded-t-sm ${
                      item.value > 0 ? 'bg-gradient-to-t from-[#C5A059] to-[#D4AF37] hover:brightness-110 shadow-sm' : 'bg-gray-200'
                    }`}
                  ></div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-2.5 font-sans">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

// ---------------------------------------------------------
// CLIENT HISTORY VIEW COMPONENT (FOR RECEPTIONIST)
// ---------------------------------------------------------
interface ClientHistoryViewProps {
  tickets: Ticket[];
}

const ClientHistoryView: React.FC<ClientHistoryViewProps> = ({ tickets }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [stylists, setStylists] = useState<{ id: string; name: string }[]>([]);

  // Edit form states
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
  const [isSaving, setIsSaving] = useState(false);

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
  }, []);

  const completedTickets = tickets.filter(t => t.status === "Completed");

  const filteredTickets = completedTickets.filter(t => {
    const queryStr = searchQuery.toLowerCase();
    return (
      t.customerName.toLowerCase().includes(queryStr) ||
      t.phone.toLowerCase().includes(queryStr) ||
      (t.stylistName && t.stylistName.toLowerCase().includes(queryStr)) ||
      t.serviceType.toLowerCase().includes(queryStr) ||
      (t.paymentMethod && t.paymentMethod.toLowerCase().includes(queryStr))
    );
  }).sort((a, b) => {
    const aTime = a.completedAt?.toDate ? a.completedAt.toDate().getTime() : (a.completedAt?.seconds * 1000 || 0);
    const bTime = b.completedAt?.toDate ? b.completedAt.toDate().getTime() : (b.completedAt?.seconds * 1000 || 0);
    return bTime - aTime;
  });

  const handleSettlePayment = async (docId: string, method: "UPI" | "Cash") => {
    try {
      await updateDoc(doc(db, "tickets", docId), {
        paymentMethod: method
      });
    } catch (err) {
      console.error("Error settling payment:", err);
    }
  };

  const handleDeleteEntry = async (ticket: Ticket) => {
    if (window.confirm(`Are you sure you want to permanently delete the entry for ${ticket.customerName}?`)) {
      try {
        await deleteDoc(doc(db, "tickets", ticket.docId));
      } catch (err) {
        console.error("Error deleting entry:", err);
      }
    }
  };

  const handleOpenEdit = (ticket: Ticket) => {
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
    setIsSaving(true);

    try {
      const finalPrice = editIsSplit
        ? Number(editPrimaryPrice) + Number(editSecondaryPrice) + Number(editTertiaryPrice)
        : Number(editPrice);

      const updateData: any = {
        customerName: editName,
        phone: editPhone,
        serviceType: editServices,
        price: finalPrice,
        paymentMethod: editPaymentMethod,
        isSplit: editIsSplit,
        stylistName: editIsSplit ? editPrimaryName : editPrimaryName,
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
          // Clear tertiary if not used
          updateData.tertiaryStylistName = "";
          updateData.tertiaryStylistPrice = 0;
          updateData.tertiaryStylistService = "";
        }
      } else {
        // Clear split data if turned off
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
      console.error("Error saving client entry:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const totalVisits = completedTickets.length;
  const totalRevenue = completedTickets.reduce((sum, t) => sum + (t.price || 0), 0);
  const avgSpend = totalVisits > 0 ? totalRevenue / totalVisits : 0;

  return (
    <div className="flex flex-col gap-8 w-full text-white font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-black/60 border border-[#D4AF37]/30 p-6 rounded-sm shadow-2xl flex flex-col gap-2 backdrop-blur-md">
          <span className="text-gray-400 text-xs uppercase tracking-widest font-semibold">Total Completed Visits</span>
          <span className="text-4xl font-serif font-bold text-white">{totalVisits}</span>
        </div>
        <div className="bg-black/60 border border-[#D4AF37]/40 p-6 rounded-sm shadow-2xl flex flex-col gap-2 backdrop-blur-md">
          <span className="text-gray-400 text-xs uppercase tracking-widest font-semibold">Total Revenue Generated</span>
          <span className="text-4xl font-serif font-bold text-[#D4AF37]">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-black/60 border border-[#D4AF37]/30 p-6 rounded-sm shadow-2xl flex flex-col gap-2 backdrop-blur-md">
          <span className="text-gray-400 text-xs uppercase tracking-widest font-semibold">Average Ticket Value</span>
          <span className="text-4xl font-serif font-bold text-white">₹{avgSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="bg-black/60 border border-[#D4AF37]/30 p-8 rounded-sm shadow-2xl flex flex-col gap-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-4">
          <h3 className="text-xl font-serif uppercase tracking-wider text-[#D4AF37]">
            Client Database & Billing Logs
          </h3>
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#D4AF37] transition-all text-white placeholder-gray-500 font-sans"
              placeholder="Search by client, stylist, or service..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2A2A2A] text-gray-400 text-xs uppercase tracking-widest">
                <th className="py-4 font-semibold">Client Name</th>
                <th className="py-4 font-semibold">Contact</th>
                <th className="py-4 font-semibold">Service Type</th>
                <th className="py-4 font-semibold">Assigned Stylist</th>
                <th className="py-4 font-semibold">Date Completed</th>
                <th className="py-4 font-semibold">Status</th>
                <th className="py-4 font-semibold text-right">Amount Paid</th>
                <th className="py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {filteredTickets.map(ticket => {
                const date = ticket.completedAt?.toDate ? ticket.completedAt.toDate() : (ticket.completedAt?.seconds ? new Date(ticket.completedAt.seconds * 1000) : null);
                const formattedDate = date ? date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';

                return (
                  <tr key={ticket.docId} className="text-gray-300 hover:bg-[#1A1A1A]/80 transition-colors">
                    <td className="py-4 font-medium text-white">{ticket.customerName}</td>
                    <td className="py-4 text-sm font-mono text-gray-400">{ticket.phone}</td>
                    <td className="py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="text-xs uppercase tracking-wider text-white bg-[#2A2A2A] px-2.5 py-1 rounded-sm border border-[#333333]">
                          {ticket.serviceType}
                        </span>
                        {ticket.colourNumber && (
                          <span className="text-[10px] text-[#D4AF37] font-sans font-semibold">
                            Shade: {ticket.colourBook ? `${ticket.colourBook} - ` : ""}{ticket.colourNumber}
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
                      <span className={`text-[10px] font-sans tracking-wider uppercase px-2 py-0.5 rounded-sm font-bold border ${
                        ticket.paymentMethod === 'Pending'
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : ticket.paymentMethod === 'UPI'
                            ? 'bg-blue-50 text-blue-600 border-blue-200'
                            : 'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {ticket.paymentMethod || 'UPI'}
                      </span>
                    </td>
                    <td className="py-4 text-right font-mono font-bold text-[#111111]">
                      {ticket.paymentMethod === 'Pending' ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-red-600 font-bold">₹{(ticket.price || 0).toFixed(2)}</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSettlePayment(ticket.docId, "UPI")}
                              className="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 px-2 py-0.5 rounded-sm text-[9px] font-sans font-bold border border-blue-200 transition-colors cursor-pointer"
                            >
                              Settle UPI
                            </button>
                            <button
                              onClick={() => handleSettlePayment(ticket.docId, "Cash")}
                              className="bg-green-50 hover:bg-green-700 hover:text-white text-green-700 px-2 py-0.5 rounded-sm text-[9px] font-sans font-bold border border-green-200 transition-colors cursor-pointer"
                            >
                              Settle Cash
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span>₹{(ticket.price || 0).toFixed(2)}</span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex gap-2 justify-end items-center">
                        <button
                          onClick={() => handleOpenEdit(ticket)}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-2.5 py-1 rounded-sm text-xs font-bold transition-all border border-blue-200 cursor-pointer flex items-center gap-1"
                          title="Edit Entry"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(ticket)}
                          className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-2.5 py-1 rounded-sm text-xs font-bold transition-all border border-red-200 cursor-pointer flex items-center gap-1"
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
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-400 italic">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT HISTORY ENTRY MODAL */}
      <AnimatePresence>
        {editingTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#E5E5E0] rounded-sm shadow-2xl w-full max-w-lg p-8 text-[#111111] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6 border-b border-[#E5E5E0] pb-4">
                <h3 className="text-xl font-serif text-[#111111] uppercase tracking-wider">
                  Edit Client Entry
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingTicket(null)}
                  className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-5">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Client Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5E0] rounded-sm px-4 py-2.5 focus:outline-none focus:border-[#D4AF37] text-[#111111] font-sans text-sm"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Phone</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5E0] rounded-sm px-4 py-2.5 focus:outline-none focus:border-[#D4AF37] text-[#111111] font-sans text-sm"
                  />
                </div>

                {/* Services */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Services Performed (comma-separated)</label>
                  <input
                    type="text"
                    required
                    value={editServices}
                    onChange={e => setEditServices(e.target.value)}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5E0] rounded-sm px-4 py-2.5 focus:outline-none focus:border-[#D4AF37] text-[#111111] font-sans text-sm"
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block">Payment Method</label>
                  <div className="flex gap-2">
                    {(["UPI", "Cash", "Pending"] as const).map(method => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setEditPaymentMethod(method)}
                        className={`flex-1 py-2.5 rounded-sm border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          editPaymentMethod === method
                            ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]"
                            : "bg-[#F5F5F0] border-[#E5E5E0] text-gray-500 hover:text-[#111111]"
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Billing type toggle */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block">Billing Mode</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditIsSplit(false)}
                      className={`flex-1 py-2.5 rounded-sm border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        !editIsSplit
                          ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]"
                          : "bg-[#F5F5F0] border-[#E5E5E0] text-gray-500 hover:text-[#111111]"
                      }`}
                    >
                      Single Stylist
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditIsSplit(true)}
                      className={`flex-1 py-2.5 rounded-sm border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        editIsSplit
                          ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]"
                          : "bg-[#F5F5F0] border-[#E5E5E0] text-gray-500 hover:text-[#111111]"
                      }`}
                    >
                      Split Billing
                    </button>
                  </div>
                </div>

                {/* Single Stylist Fields */}
                {!editIsSplit && (
                  <div className="grid grid-cols-2 gap-3 bg-[#F5F5F0] p-4 border border-[#E5E5E0] rounded-sm">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 uppercase tracking-wider">Assigned Stylist</label>
                      <select
                        value={editPrimaryName}
                        onChange={e => setEditPrimaryName(e.target.value)}
                        className="w-full bg-white text-[#111111] border border-[#E5E5E0] rounded-sm px-2.5 py-2 text-sm focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                      >
                        <option value="">Select Stylist</option>
                        {stylists.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 uppercase tracking-wider">Amount Billed (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={editPrice || ""}
                        onChange={e => setEditPrice(Number(e.target.value))}
                        className="w-full bg-white border border-[#E5E5E0] rounded-sm px-2.5 py-2 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Split Stylist Fields */}
                {editIsSplit && (
                  <div className="space-y-4 bg-[#F5F5F0] p-4 border border-[#E5E5E0] rounded-sm">
                    {/* Stylist 1 */}
                    <div className="grid grid-cols-3 gap-2 pb-3 border-b border-gray-200">
                      <div className="col-span-1 space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase font-bold">Stylist 1</label>
                        <select
                          value={editPrimaryName}
                          onChange={e => setEditPrimaryName(e.target.value)}
                          className="w-full bg-white text-[#111111] border border-[#E5E5E0] rounded-sm px-2 py-1.5 text-xs focus:outline-none"
                        >
                          <option value="">Select</option>
                          {stylists.map(s => (
                            <option key={s.id} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1 space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase font-bold">Price (₹)</label>
                        <input
                          type="number"
                          value={editPrimaryPrice || ""}
                          onChange={e => setEditPrimaryPrice(Number(e.target.value))}
                          className="w-full bg-white border border-[#E5E5E0] rounded-sm px-2 py-1.5 text-xs focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1 space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase font-bold">Service</label>
                        <input
                          type="text"
                          value={editPrimaryService}
                          onChange={e => setEditPrimaryService(e.target.value)}
                          placeholder="e.g. Haircut"
                          className="w-full bg-white border border-[#E5E5E0] rounded-sm px-2 py-1.5 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Stylist 2 */}
                    <div className="grid grid-cols-3 gap-2 pb-3 border-b border-gray-200">
                      <div className="col-span-1 space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase font-bold">Stylist 2</label>
                        <select
                          value={editSecondaryName}
                          onChange={e => setEditSecondaryName(e.target.value)}
                          className="w-full bg-white text-[#111111] border border-[#E5E5E0] rounded-sm px-2 py-1.5 text-xs focus:outline-none"
                        >
                          <option value="">Select</option>
                          {stylists.map(s => (
                            <option key={s.id} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1 space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase font-bold">Price (₹)</label>
                        <input
                          type="number"
                          value={editSecondaryPrice || ""}
                          onChange={e => setEditSecondaryPrice(Number(e.target.value))}
                          className="w-full bg-white border border-[#E5E5E0] rounded-sm px-2 py-1.5 text-xs focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1 space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase font-bold">Service</label>
                        <input
                          type="text"
                          value={editSecondaryService}
                          onChange={e => setEditSecondaryService(e.target.value)}
                          placeholder="e.g. Colour"
                          className="w-full bg-white border border-[#E5E5E0] rounded-sm px-2 py-1.5 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Stylist 3 */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1 space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase font-bold">Stylist 3 (Optional)</label>
                        <select
                          value={editTertiaryName}
                          onChange={e => setEditTertiaryName(e.target.value)}
                          className="w-full bg-white text-[#111111] border border-[#E5E5E0] rounded-sm px-2 py-1.5 text-xs focus:outline-none"
                        >
                          <option value="">Select</option>
                          {stylists.map(s => (
                            <option key={s.id} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1 space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase font-bold">Price (₹)</label>
                        <input
                          type="number"
                          value={editTertiaryPrice || ""}
                          onChange={e => setEditTertiaryPrice(Number(e.target.value))}
                          className="w-full bg-white border border-[#E5E5E0] rounded-sm px-2 py-1.5 text-xs focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1 space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase font-bold">Service</label>
                        <input
                          type="text"
                          value={editTertiaryService}
                          onChange={e => setEditTertiaryService(e.target.value)}
                          placeholder="e.g. Spa"
                          className="w-full bg-white border border-[#E5E5E0] rounded-sm px-2 py-1.5 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit / Cancel Buttons */}
                <div className="flex gap-3 pt-4 border-t border-[#E5E5E0]">
                  <button
                    type="button"
                    onClick={() => setEditingTicket(null)}
                    className="flex-1 py-3 border border-gray-300 text-gray-500 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-3 bg-[#D4AF37] hover:bg-[#C5A059] text-[#111111] rounded-sm text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ---------------------------------------------------------
// EXPENSE TRACKER COMPONENT
// ---------------------------------------------------------
interface ExpenseItem {
  docId: string;
  title: string;
  amount: number;
  category: string;
  paymentMethod: "Cash" | "UPI";
  addedBy: string;
  timestamp: any;
}

const ExpenseTrackerView: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Salon Supplies");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "UPI">("Cash");
  const [addedBy, setAddedBy] = useState("Reception");
  const [submitting, setSubmitting] = useState(false);
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("today");

  useEffect(() => {
    const q = query(collection(db, "expenses"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(docSnap => ({
        docId: docSnap.id,
        ...docSnap.data()
      })) as ExpenseItem[];
      setExpenses(data);
    });
    return () => unsubscribe();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) {
      alert("Please enter a valid expense description and amount.");
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "expenses"), {
        title: title.trim(),
        amount: numAmount,
        category,
        paymentMethod,
        addedBy: addedBy.trim() || "Reception",
        timestamp: serverTimestamp()
      });
      setTitle("");
      setAmount("");
    } catch (err) {
      console.error("Error adding expense:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (docId: string, itemTitle: string) => {
    if (window.confirm(`Are you sure you want to delete expense "${itemTitle}"?`)) {
      try {
        await deleteDoc(doc(db, "expenses", docId));
      } catch (err) {
        console.error("Error deleting expense:", err);
      }
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const filteredExpenses = expenses.filter(e => {
    if (!e.timestamp) return true;
    const d = e.timestamp.toDate ? e.timestamp.toDate() : new Date(e.timestamp.seconds * 1000);
    const now = new Date();
    if (dateFilter === "today") return isToday(d);
    if (dateFilter === "week") {
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
      return d >= weekAgo;
    }
    if (dateFilter === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    return true;
  });

  const todayTotal = expenses.filter(e => {
    if (!e.timestamp) return false;
    const d = e.timestamp.toDate ? e.timestamp.toDate() : new Date(e.timestamp.seconds * 1000);
    return isToday(d);
  }).reduce((sum, e) => sum + (e.amount || 0), 0);

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const cashFiltered = filteredExpenses.filter(e => e.paymentMethod === "Cash").reduce((sum, e) => sum + (e.amount || 0), 0);
  const upiFiltered = filteredExpenses.filter(e => e.paymentMethod === "UPI").reduce((sum, e) => sum + (e.amount || 0), 0);

  const CATEGORIES = ["Salon Supplies", "Refreshments & Tea", "Utilities & Bills", "Staff / Salary", "Maintenance", "Misc"];

  return (
    <div className="flex flex-col gap-8 w-full text-white font-sans">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-black/60 border border-red-900/40 p-6 rounded-sm shadow-2xl flex flex-col gap-1 backdrop-blur-md">
          <span className="text-gray-400 text-xs uppercase tracking-widest font-semibold">Today's Expenses</span>
          <span className="text-3xl font-serif font-bold text-red-500">₹{todayTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-black/60 border border-[#D4AF37]/30 p-6 rounded-sm shadow-2xl flex flex-col gap-1 backdrop-blur-md">
          <span className="text-gray-400 text-xs uppercase tracking-widest font-semibold">Period Expenses ({dateFilter})</span>
          <span className="text-3xl font-serif font-bold text-white">₹{totalFiltered.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-black/60 border border-green-900/40 p-6 rounded-sm shadow-2xl flex flex-col gap-1 backdrop-blur-md">
          <span className="text-gray-400 text-xs uppercase tracking-widest font-semibold">Cash Spent</span>
          <span className="text-3xl font-serif font-bold text-green-400">₹{cashFiltered.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-black/60 border border-blue-900/40 p-6 rounded-sm shadow-2xl flex flex-col gap-1 backdrop-blur-md">
          <span className="text-gray-400 text-xs uppercase tracking-widest font-semibold">UPI Spent</span>
          <span className="text-3xl font-serif font-bold text-blue-400">₹{upiFiltered.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Add Expense Form */}
        <div className="xl:col-span-4 bg-black/60 border border-[#D4AF37]/30 p-8 rounded-sm shadow-2xl flex flex-col gap-6 backdrop-blur-md">
          <h3 className="text-xl font-serif uppercase tracking-wider text-[#D4AF37] border-b border-[#2A2A2A] pb-4">
            Record New Expense
          </h3>

          <form onSubmit={handleAddExpense} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-sans text-gray-400 uppercase tracking-widest">Expense Description</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Towels & Shampoo restock"
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm px-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-all text-white placeholder-gray-500 text-sm font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-sans text-gray-400 uppercase tracking-widest">Amount Spent (₹)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Enter amount (₹)"
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm px-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-all text-white placeholder-gray-500 text-sm font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-sans text-gray-400 uppercase tracking-widest">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm px-4 py-3 focus:outline-none focus:border-[#D4AF37] text-white text-sm font-sans cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-sans text-gray-400 uppercase tracking-widest block mb-1">Payment Method</label>
              <div className="flex gap-2">
                {(["Cash", "UPI"] as const).map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`flex-1 py-3 rounded-sm border text-xs font-sans tracking-widest uppercase transition-all duration-300 cursor-pointer font-bold ${
                      paymentMethod === method
                        ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] shadow-sm"
                        : "bg-[#1A1A1A] border-[#2A2A2A] text-gray-400 hover:text-white"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-sans text-gray-400 uppercase tracking-widest">Recorded By</label>
              <input
                type="text"
                value={addedBy}
                onChange={e => setAddedBy(e.target.value)}
                placeholder="e.g. Reception"
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm px-4 py-3 focus:outline-none focus:border-[#D4AF37] text-white text-sm font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-4 bg-[#D4AF37] hover:bg-[#C5A059] text-[#111111] font-serif font-bold tracking-widest uppercase py-4 px-6 rounded-sm transition-colors duration-300 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Expense"}
            </button>
          </form>
        </div>

        {/* Expenses List & Logs */}
        <div className="xl:col-span-8 bg-black/60 border border-[#D4AF37]/30 p-8 rounded-sm shadow-2xl flex flex-col gap-6 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-4">
            <h3 className="text-xl font-serif uppercase tracking-wider text-[#D4AF37]">
              Expense Log ({filteredExpenses.length})
            </h3>
            <div className="flex gap-2">
              {(["today", "week", "month", "all"] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setDateFilter(f)}
                  className={`px-3 py-1.5 rounded-sm text-xs font-sans uppercase tracking-wider font-semibold border transition-all cursor-pointer ${
                    dateFilter === f
                      ? "bg-[#D4AF37] text-[#111111] border-[#D4AF37]"
                      : "bg-[#1A1A1A] text-gray-400 border-[#2A2A2A] hover:text-white"
                  }`}
                >
                  {f === "today" ? "Today" : f === "week" ? "This Week" : f === "month" ? "This Month" : "All"}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2A2A2A] text-gray-400 text-xs uppercase tracking-widest">
                  <th className="py-4 font-semibold">Date & Time</th>
                  <th className="py-4 font-semibold">Description</th>
                  <th className="py-4 font-semibold">Category</th>
                  <th className="py-4 font-semibold">By</th>
                  <th className="py-4 font-semibold">Payment</th>
                  <th className="py-4 font-semibold text-right">Amount (₹)</th>
                  <th className="py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]">
                {filteredExpenses.map(item => {
                  const date = item.timestamp?.toDate ? item.timestamp.toDate() : (item.timestamp?.seconds ? new Date(item.timestamp.seconds * 1000) : new Date());
                  const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <tr key={item.docId} className="text-gray-300 hover:bg-[#1A1A1A]/80 transition-colors">
                      <td className="py-4 text-xs text-gray-400 font-mono">{formattedDate}</td>
                      <td className="py-4 font-medium text-white">{item.title}</td>
                      <td className="py-4">
                        <span className="text-[10px] font-sans uppercase tracking-wider bg-[#2A2A2A] text-white border border-[#333333] px-2 py-0.5 rounded-sm font-semibold">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 text-xs text-gray-300 font-medium">{item.addedBy}</td>
                      <td className="py-4">
                        <span className={`text-[10px] font-sans tracking-wider uppercase px-2 py-0.5 rounded-sm font-bold border ${
                          item.paymentMethod === "Cash"
                            ? "bg-green-950/40 text-green-400 border-green-800/40"
                            : "bg-blue-950/40 text-blue-400 border-blue-800/40"
                        }`}>
                          {item.paymentMethod}
                        </span>
                      </td>
                      <td className="py-4 text-right font-mono font-bold text-red-400">
                        ₹{(item.amount || 0).toFixed(2)}
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleDeleteExpense(item.docId, item.title)}
                          className="bg-red-950/40 text-red-400 hover:bg-red-600 hover:text-white p-1.5 rounded-sm transition-all border border-red-800/40 cursor-pointer inline-flex items-center justify-center"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400 italic">
                      No expense records for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// RECEPTION DASHBOARD COMPONENT
// ---------------------------------------------------------
const ReceptionDashboard: React.FC<{ tickets: Ticket[], onCompleteTicket: (ticket: Ticket) => void }> = ({ tickets, onCompleteTicket }) => {
  const [activeTab, setActiveTab] = useState<"queue" | "history" | "revenue" | "expenses">("queue");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [serviceCategory, setServiceCategory] = useState<"Hair" | "Skin" | "Waxing">("Hair");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [colourNumber, setColourNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit ticket state
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editGender, setEditGender] = useState<"Male" | "Female">("Male");
  const [editCategory, setEditCategory] = useState<"Hair" | "Skin" | "Waxing">("Hair");
  const [editServices, setEditServices] = useState<string[]>([]);
  const [editColour, setEditColour] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const openEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setEditName(ticket.customerName);
    setEditPhone(ticket.phone);
    setEditGender((ticket.gender as "Male" | "Female") || "Male");
    setEditCategory((ticket.serviceCategory as "Hair" | "Skin" | "Waxing") || "Hair");
    setEditServices(ticket.serviceType ? ticket.serviceType.split(", ").map(s => s.trim()).filter(Boolean) : []);
    setEditColour(ticket.colourNumber || "");
  };

  const saveEdit = async () => {
    if (!editingTicket || !editName || editServices.length === 0) return;
    setEditSaving(true);
    const hasColour = editServices.some(s =>
      s.toLowerCase().includes("colour") ||
      s.toLowerCase().includes("highlights") ||
      s.toLowerCase().includes("touch up")
    );
    await updateDoc(doc(db, "tickets", editingTicket.docId), {
      customerName: editName,
      phone: editPhone,
      gender: editGender,
      serviceCategory: editCategory,
      serviceType: editServices.join(", "),
      colourNumber: hasColour ? editColour : "",
    });
    setEditSaving(false);
    setEditingTicket(null);
  };

  const [stylists, setStylists] = useState<{ id: string, name: string, active: boolean }[]>([]);
  const [newStylistName, setNewStylistName] = useState("");

  useEffect(() => {
    const q = query(collection(db, "stylists"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as { id: string, name: string, active: boolean }[];
      setStylists(data);
    });
    return () => unsubscribe();
  }, []);

  const handleAddStylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStylistName) return;
    try {
      await addDoc(collection(db, "stylists"), {
        name: newStylistName,
        active: true
      });
      setNewStylistName("");
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStylistActive = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, "stylists", id), { active: !currentStatus });
  };

  const waitingTickets = tickets.filter(t => t.status === "Waiting");
  const servingTickets = tickets.filter(t => t.status === "Serving");

  const generateNextId = () => {
    const maxIdNum = tickets.reduce((max, t) => {
      const num = parseInt(t.id.replace('#', '')) || 0;
      return num > max ? num : max;
    }, 0);
    return `#${(maxIdNum + 1).toString().padStart(3, '0')}`;
  };

  const handleDeployTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone) return;
    if (selectedServices.length === 0) {
      alert("Please select at least one service.");
      return;
    }
    setIsSubmitting(true);
    
    try {
      const hasColourService = selectedServices.some(s => 
        s.toLowerCase().includes("colour") || 
        s.toLowerCase().includes("highlights") || 
        s.toLowerCase().includes("touch up")
      );

      await addDoc(collection(db, "tickets"), {
        id: generateNextId(),
        customerName,
        phone,
        serviceType: selectedServices.join(", "),
        colourNumber: hasColourService ? colourNumber : "",
        gender,
        serviceCategory,
        status: "Waiting",
        timestamp: serverTimestamp()
      });
      setCustomerName("");
      setPhone("");
      setSelectedServices([]);
      setColourNumber("");
    } catch (error) {
      console.error("Failed to add client:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (docId: string, status: TicketStatus) => {
    await updateDoc(doc(db, "tickets", docId), { status });
  };

  const deleteTicket = async (docId: string) => {
    await deleteDoc(doc(db, "tickets", docId));
  };

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 flex-1 text-white">
      {/* Tab Selector */}
      <div className="flex border-b border-[#2A2A2A] pb-2 gap-3 overflow-x-auto whitespace-nowrap hide-scrollbar">
        <button
          onClick={() => setActiveTab("queue")}
          className={`pb-2.5 px-4 py-2 text-xs sm:text-sm font-sans uppercase tracking-widest font-bold border-b-2 rounded-t-sm transition-all cursor-pointer ${
            activeTab === "queue"
              ? "border-[#D4AF37] text-[#D4AF37] bg-[#1F1F1F]/80 backdrop-blur-md shadow-sm"
              : "border-transparent text-gray-400 hover:text-white hover:bg-[#1A1A1A]/40"
          }`}
        >
          Queue Management
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-2.5 px-4 py-2 text-xs sm:text-sm font-sans uppercase tracking-widest font-bold border-b-2 rounded-t-sm transition-all cursor-pointer ${
            activeTab === "history"
              ? "border-[#D4AF37] text-[#D4AF37] bg-[#1F1F1F]/80 backdrop-blur-md shadow-sm"
              : "border-transparent text-gray-400 hover:text-white hover:bg-[#1A1A1A]/40"
          }`}
        >
          Client History & CRM
        </button>
        <button
          onClick={() => setActiveTab("revenue")}
          className={`pb-2.5 px-4 py-2 text-xs sm:text-sm font-sans uppercase tracking-widest font-bold border-b-2 rounded-t-sm transition-all cursor-pointer ${
            activeTab === "revenue"
              ? "border-[#D4AF37] text-[#D4AF37] bg-[#1F1F1F]/80 backdrop-blur-md shadow-sm"
              : "border-transparent text-gray-400 hover:text-white hover:bg-[#1A1A1A]/40"
          }`}
        >
          Revenue Analytics
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          className={`pb-2.5 px-4 py-2 text-xs sm:text-sm font-sans uppercase tracking-widest font-bold border-b-2 rounded-t-sm transition-all cursor-pointer ${
            activeTab === "expenses"
              ? "border-[#D4AF37] text-[#D4AF37] bg-[#1F1F1F]/80 backdrop-blur-md shadow-sm"
              : "border-transparent text-gray-400 hover:text-white hover:bg-[#1A1A1A]/40"
          }`}
        >
          Daily Expenses
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "queue" ? (
          <motion.div 
            key="queue"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full grid grid-cols-1 xl:grid-cols-12 gap-10 flex-1"
          >
            {/* Left Column: Form & Stylists */}
            <div className="xl:col-span-4 flex flex-col gap-6">
              <div className="bg-black/60 border border-[#D4AF37]/30 p-8 rounded-sm shadow-2xl backdrop-blur-md">
                <h2 className="text-2xl font-serif text-[#D4AF37] mb-8 border-b border-[#2A2A2A] pb-4 tracking-wide uppercase">
                  Add Client
                </h2>

                <form onSubmit={handleDeployTicket} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-sans text-gray-400 uppercase tracking-widest">Client Name</label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-500 group-focus-within/input:text-[#D4AF37] transition-colors" />
                      </div>
                      <input 
                        type="text" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-[#1A1A1A]/80 border border-[#2A2A2A] rounded-sm pl-10 pr-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-all text-white placeholder-gray-500 font-sans"
                        placeholder="Enter name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-sans text-gray-400 uppercase tracking-widest">Contact Number</label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-gray-500 group-focus-within/input:text-[#D4AF37] transition-colors" />
                      </div>
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#1A1A1A]/80 border border-[#2A2A2A] rounded-sm pl-10 pr-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-all text-white placeholder-gray-500 font-sans"
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-sans text-gray-400 uppercase tracking-widest block">Gender</label>
                    <div className="flex gap-2">
                      {(["Male", "Female"] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => {
                            setGender(g);
                            setSelectedServices([]);
                          }}
                          className={`flex-1 py-3 rounded-sm border text-xs font-sans tracking-widest uppercase transition-all duration-300 cursor-pointer font-bold ${
                            gender === g
                              ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                              : "bg-[#1A1A1A]/80 border-[#2A2A2A] text-gray-400 hover:text-white"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-sans text-gray-400 uppercase tracking-widest block">Service Category</label>
                    <div className="flex gap-2">
                      {(["Hair", "Skin", "Waxing"] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setServiceCategory(cat);
                          }}
                          className={`flex-1 py-3 rounded-sm border text-xs font-sans tracking-widest uppercase transition-all duration-300 cursor-pointer font-bold ${
                            serviceCategory === cat
                              ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                              : "bg-[#1A1A1A]/80 border-[#2A2A2A] text-gray-400 hover:text-white"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-sans text-gray-400 uppercase tracking-widest block mb-2">Select Services (Multiple)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 border border-[#2A2A2A] p-3 rounded-sm bg-[#1A1A1A]/80">
                      {SERVICES_CONFIG[gender][serviceCategory].map((serviceName) => {
                        const isSelected = selectedServices.includes(serviceName);
                        return (
                          <button
                            key={serviceName}
                            type="button"
                            onClick={() => {
                              setSelectedServices(prev => 
                                prev.includes(serviceName)
                                  ? prev.filter(s => s !== serviceName)
                                  : [...prev, serviceName]
                              );
                            }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-sm border text-xs font-sans text-left transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-semibold font-sans'
                                : 'bg-[#222222]/80 border-[#333333] text-gray-300 hover:border-gray-500 font-sans'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 border rounded-sm flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-[#D4AF37] bg-[#D4AF37] text-[#111111]' : 'border-gray-500 bg-[#1A1A1A]'
                            }`}>
                              {isSelected && <span className="text-[10px] leading-none font-bold">✓</span>}
                            </div>
                            <span className="truncate">{serviceName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedServices.length > 0 && (
                    <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 p-3 rounded-sm space-y-2 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-bold">Selected ({selectedServices.length})</span>
                        <button 
                          type="button" 
                          onClick={() => setSelectedServices([])}
                          className="text-[10px] text-red-400 hover:text-red-300 underline uppercase tracking-wider font-bold cursor-pointer"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                        {selectedServices.map(s => (
                          <span key={s} className="text-[10px] bg-[#1A1A1A] border border-[#2A2A2A] text-white px-2.5 py-1 rounded-sm font-sans flex items-center gap-1.5 font-medium">
                            {s}
                            <button 
                              type="button" 
                              onClick={() => setSelectedServices(prev => prev.filter(item => item !== s))}
                              className="text-red-400 hover:text-red-300 font-bold text-xs cursor-pointer focus:outline-none"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedServices.some(s => 
                    s.toLowerCase().includes("colour") || 
                    s.toLowerCase().includes("highlights") || 
                    s.toLowerCase().includes("touch up")
                  ) && (
                    <div className="space-y-2 mt-4 animate-fadeIn">
                      <label className="text-xs font-sans text-gray-400 uppercase tracking-widest block">Hair Colour Number / Shade</label>
                      <input 
                        type="text" 
                        value={colourNumber}
                        onChange={(e) => setColourNumber(e.target.value)}
                        placeholder="e.g. Igora 5-0, Yutika 4.0"
                        className="w-full bg-[#1A1A1A]/80 border border-[#2A2A2A] rounded-sm px-4 py-3 focus:outline-none focus:border-[#D4AF37] text-white placeholder-gray-500 font-sans"
                      />
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-8 bg-[#D4AF37] hover:bg-[#C5A059] text-[#111111] font-serif font-bold tracking-widest uppercase py-4 px-6 rounded-sm transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    {isSubmitting ? "Adding..." : "Add to Queue"}
                  </button>
                </form>
              </div>

              {/* Stylists Section */}
              <div className="bg-black/60 border border-[#D4AF37]/30 p-8 rounded-sm shadow-2xl flex-1 flex flex-col min-h-[350px] backdrop-blur-md">
                <h2 className="text-2xl font-serif text-[#D4AF37] mb-6 border-b border-[#2A2A2A] pb-4 tracking-wide uppercase">
                  Duty Stylists
                </h2>
                
                <form onSubmit={handleAddStylist} className="flex gap-2 mb-6">
                  <input 
                    type="text" 
                    value={newStylistName}
                    onChange={(e) => setNewStylistName(e.target.value)}
                    placeholder="New Stylist Name" 
                    className="flex-1 bg-[#1A1A1A]/80 border border-[#2A2A2A] rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-[#D4AF37] transition-all text-white placeholder-gray-500 font-sans"
                  />
                  <button 
                    type="submit"
                    className="bg-[#D4AF37] hover:bg-[#C5A059] text-[#111111] font-bold px-4 py-2 rounded-sm text-xs font-sans tracking-widest uppercase transition-colors"
                  >
                    Add
                  </button>
                </form>

                <div className="flex-1 overflow-y-auto space-y-4 max-h-[300px] hide-scrollbar">
                  {stylists.length === 0 ? (
                    <p className="text-gray-400 font-serif italic text-sm text-center py-6">No stylists active.</p>
                  ) : (
                    stylists.map(stylist => (
                      <div key={stylist.id} className="flex items-center justify-between p-3 border border-[#2A2A2A] rounded-sm bg-[#1A1A1A]/80">
                        <span className="font-serif text-white font-medium">{stylist.name}</span>
                        <button
                          onClick={() => toggleStylistActive(stylist.id, stylist.active)}
                          className={`px-3 py-1 rounded-sm text-[10px] font-sans tracking-widest uppercase font-bold transition-all border cursor-pointer ${
                            stylist.active 
                              ? 'bg-green-950/40 text-green-400 border-green-800/40' 
                              : 'bg-gray-800 text-gray-400 border-gray-700'
                          }`}
                        >
                          {stylist.active ? 'Active' : 'Offline'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Queues */}
            <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* Waiting Column */}
              <div className="bg-black/60 border border-[#D4AF37]/30 p-6 rounded-sm shadow-2xl flex flex-col h-[calc(100vh-180px)] xl:h-auto backdrop-blur-md">
                <div className="flex items-center justify-between mb-6 border-b border-[#2A2A2A] pb-4">
                  <h3 className="font-serif text-lg tracking-widest text-[#D4AF37] flex items-center gap-2 uppercase">
                    Waiting Lounge
                  </h3>
                  <span className="text-[#D4AF37] font-serif font-bold text-xl">{waitingTickets.length}</span>
                </div>

                <div className="overflow-y-auto flex-1 hide-scrollbar space-y-4 pr-2">
                  <AnimatePresence>
                    {waitingTickets.length === 0 ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 border border-[#2A2A2A] border-dashed rounded-sm">
                        <p className="text-gray-400 font-serif italic text-sm">No clients waiting.</p>
                      </motion.div>
                    ) : (
                      waitingTickets.map((ticket) => (
                        <motion.div
                          key={ticket.docId}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-[#1A1A1A]/90 border border-[#2A2A2A] p-5 rounded-sm flex items-center justify-between group hover:border-[#D4AF37] transition-colors shadow-md"
                        >
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-white font-sans font-medium text-sm">{ticket.id}</span>
                              {ticket.appointmentTime && (
                                <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-semibold border bg-green-950/40 text-green-400 border-green-800/40">
                                  Online
                                </span>
                              )}
                              {ticket.gender && (
                                <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-semibold border ${
                                  ticket.gender === 'Female' 
                                    ? 'bg-purple-950/40 text-purple-300 border-purple-800/40' 
                                    : 'bg-blue-950/40 text-blue-300 border-blue-800/40'
                                }`}>
                                  {ticket.gender}
                                </span>
                              )}
                              {ticket.serviceCategory && (
                                <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-semibold border ${
                                  ticket.serviceCategory === 'Hair'
                                    ? 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                                    : ticket.serviceCategory === 'Skin'
                                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                                      : 'bg-rose-950/40 text-rose-300 border-rose-800/40'
                                }`}>
                                  {ticket.serviceCategory}
                                </span>
                              )}
                              <span className="text-[10px] uppercase tracking-wider text-gray-300 bg-[#2A2A2A] px-2 py-0.5 rounded-sm border border-[#333333]">{ticket.serviceType}</span>
                            </div>
                            <p className="text-white font-serif text-lg font-medium">{ticket.customerName}</p>
                            <p className="text-xs text-gray-400 font-sans mt-1">{ticket.phone}</p>
                            {ticket.appointmentTime && (
                              <p className="text-xs text-green-400 font-medium font-sans mt-1.5 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> Appt: {ticket.appointmentTime}
                              </p>
                            )}
                            {ticket.notes && (
                              <p className="text-xs text-gray-400 italic font-sans mt-1">
                                Notes: "{ticket.notes}"
                              </p>
                            )}
                            {ticket.colourNumber && (
                              <p className="text-xs text-[#D4AF37] font-semibold font-sans mt-1">
                                Shade: {ticket.colourNumber}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <button 
                              onClick={() => updateStatus(ticket.docId, "Serving")}
                              className="bg-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#111111] p-2 rounded-sm transition-colors border border-[#D4AF37]/40 cursor-pointer flex items-center justify-center font-bold"
                              title="Seat Client"
                            >
                              <Play className="w-4 h-4 ml-0.5" />
                            </button>
                            <button
                              onClick={() => openEdit(ticket)}
                              className="bg-blue-950/40 text-blue-400 hover:bg-blue-600 hover:text-white p-2 rounded-sm transition-colors border border-blue-800/40 cursor-pointer flex items-center justify-center"
                              title="Edit Entry"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <a 
                              href={`sms:${ticket.phone}?body=${encodeURIComponent(`Hi ${ticket.customerName}, welcome to Hairport! You are next in line. Your stylist will be ready for you shortly. Thank you for waiting!`)}`}
                              className="bg-blue-950/40 text-blue-400 hover:bg-blue-600 hover:text-white p-2 rounded-sm transition-colors border border-blue-800/40 cursor-pointer flex items-center justify-center"
                              title="Send Waitlist SMS"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                            <button 
                              onClick={() => { if (window.confirm(`Delete ticket for ${ticket.customerName}?`)) deleteTicket(ticket.docId); }}
                              className="bg-red-950/40 text-red-400 hover:bg-red-600 hover:text-white p-2 rounded-sm transition-colors border border-red-800/40 cursor-pointer flex items-center justify-center"
                              title="Cancel Appointment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Serving Column */}
              <div className="bg-black/60 border border-[#D4AF37]/40 p-6 rounded-sm shadow-2xl flex flex-col h-[calc(100vh-180px)] xl:h-auto backdrop-blur-md">
                <div className="flex items-center justify-between mb-6 border-b border-[#2A2A2A] pb-4">
                  <h3 className="font-serif text-lg tracking-widest text-[#D4AF37] flex items-center gap-2 uppercase">
                    Now Serving
                  </h3>
                  <span className="text-[#D4AF37] font-serif font-bold text-xl">{servingTickets.length}</span>
                </div>

                <div className="overflow-y-auto flex-1 hide-scrollbar space-y-4 pr-2">
                  <AnimatePresence>
                    {servingTickets.length === 0 ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 border border-[#2A2A2A] border-dashed rounded-sm">
                        <p className="text-gray-400 font-serif italic text-sm">All stations available.</p>
                      </motion.div>
                    ) : (
                      servingTickets.map((ticket) => (
                        <motion.div
                          key={ticket.docId}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="relative bg-[#1A1A1A] border border-[#D4AF37]/50 p-5 rounded-sm flex items-center justify-between group shadow-md"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37]"></div>
                          
                          <div className="pl-2">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-white font-sans font-medium text-sm">{ticket.id}</span>
                              <span className="text-[10px] uppercase tracking-wider text-[#111111] bg-[#D4AF37] px-2 py-0.5 rounded-sm font-bold">{ticket.serviceType}</span>
                            </div>
                            <p className="text-white font-serif text-lg font-medium">{ticket.customerName}</p>
                            {ticket.stylistName && (
                              <p className="text-xs text-gray-400 font-sans mt-1">with <span className="font-semibold text-gray-200">{ticket.stylistName}</span></p>
                            )}
                            {ticket.colourNumber && (
                              <p className="text-xs text-[#D4AF37] font-semibold font-sans mt-1">
                                Shade: {ticket.colourNumber}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <button 
                              onClick={() => onCompleteTicket(ticket)}
                              className="flex items-center gap-2 bg-[#D4AF37] text-[#111111] hover:bg-[#C5A059] font-bold px-3 py-1.5 rounded-sm transition-colors font-sans text-xs uppercase tracking-widest cursor-pointer shadow-sm"
                              title="Complete Service"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Complete
                            </button>
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEdit(ticket)}
                                className="flex-1 bg-blue-950/40 text-blue-400 hover:bg-blue-600 hover:text-white py-1 px-2 rounded-sm transition-colors border border-blue-800/40 cursor-pointer flex items-center justify-center text-xs font-bold gap-1"
                                title="Edit Entry"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Edit
                              </button>
                              <button 
                                onClick={() => { if (window.confirm(`Delete ticket for ${ticket.customerName}?`)) deleteTicket(ticket.docId); }}
                                className="bg-red-950/40 text-red-400 hover:bg-red-600 hover:text-white py-1 px-2.5 rounded-sm transition-colors border border-red-800/40 cursor-pointer flex items-center justify-center text-xs font-bold gap-1"
                                title="Cancel Appointment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </div>
          </motion.div>
        ) : activeTab === "history" ? (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col gap-6 flex-1"
          >
            <ClientHistoryView tickets={tickets} />
          </motion.div>
        ) : activeTab === "revenue" ? (
          <motion.div
            key="revenue"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col gap-6 flex-1"
          >
            <RevenueAnalyticsView tickets={tickets} />
          </motion.div>
        ) : (
          <motion.div
            key="expenses"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col gap-6 flex-1"
          >
            <ExpenseTrackerView />
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT TICKET MODAL */}
      <AnimatePresence>
        {editingTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#141414] border border-[#D4AF37]/40 rounded-sm shadow-2xl w-full max-w-md p-8 text-white max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6 border-b border-[#2A2A2A] pb-4">
                <h3 className="text-xl font-serif text-[#D4AF37] uppercase tracking-wider">
                  Edit Client — {editingTicket.id}
                </h3>
                <button
                  onClick={() => setEditingTicket(null)}
                  className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <div className="space-y-5">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Client Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm px-4 py-2.5 focus:outline-none focus:border-[#D4AF37] text-white font-sans text-sm"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Phone</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm px-4 py-2.5 focus:outline-none focus:border-[#D4AF37] text-white font-sans text-sm"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block">Gender</label>
                  <div className="flex gap-2">
                    {(["Male", "Female"] as const).map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => { setEditGender(g); setEditServices([]); }}
                        className={`flex-1 py-2 rounded-sm border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          editGender === g
                            ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]"
                            : "bg-[#1A1A1A] border-[#2A2A2A] text-gray-400 hover:text-white"
                        }`}
                      >{g}</button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block">Category</label>
                  <div className="flex gap-2">
                    {(["Hair", "Skin", "Waxing"] as const).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setEditCategory(cat)}
                        className={`flex-1 py-2 rounded-sm border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          editCategory === cat
                            ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]"
                            : "bg-[#1A1A1A] border-[#2A2A2A] text-gray-400 hover:text-white"
                        }`}
                      >{cat}</button>
                    ))}
                  </div>
                </div>

                {/* Services */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block">Services</label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto border border-[#2A2A2A] rounded-sm p-2 bg-[#1A1A1A]">
                    {SERVICES_CONFIG[editGender][editCategory].map(svc => {
                      const sel = editServices.includes(svc);
                      return (
                        <button
                          key={svc}
                          type="button"
                          onClick={() => setEditServices(prev => sel ? prev.filter(s => s !== svc) : [...prev, svc])}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-sm border text-[11px] font-sans text-left transition-colors cursor-pointer ${
                            sel ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-semibold" : "bg-[#222222] border-[#333333] text-gray-300 hover:border-gray-500"
                          }`}
                        >
                          <div className={`w-3 h-3 border rounded-sm flex items-center justify-center shrink-0 ${sel ? "border-[#D4AF37] bg-[#D4AF37] text-[#111111]" : "border-gray-500 bg-[#1A1A1A]"}`}>
                            {sel && <span className="text-[8px] font-bold">✓</span>}
                          </div>
                          <span className="truncate">{svc}</span>
                        </button>
                      );
                    })}
                  </div>
                  {editServices.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {editServices.map(s => (
                        <span key={s} className="text-[10px] bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] px-2 py-0.5 rounded-sm flex items-center gap-1">
                          {s}
                          <button type="button" onClick={() => setEditServices(prev => prev.filter(x => x !== s))} className="text-red-400 hover:text-red-300 cursor-pointer">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Colour Number */}
                {editServices.some(s => s.toLowerCase().includes("colour") || s.toLowerCase().includes("highlights") || s.toLowerCase().includes("touch up")) && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Hair Colour Number / Shade</label>
                    <input
                      type="text"
                      value={editColour}
                      onChange={e => setEditColour(e.target.value)}
                      placeholder="e.g. Igora 5-0, Yutika 4.0"
                      className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm px-4 py-2.5 focus:outline-none focus:border-[#D4AF37] text-white font-sans text-sm"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingTicket(null)}
                    className="flex-1 py-3 border border-[#333333] text-gray-400 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveEdit}
                    disabled={editSaving || !editName || editServices.length === 0}
                    className="flex-1 py-3 bg-[#D4AF37] hover:bg-[#C5A059] text-[#111111] rounded-sm text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------
// TV WAITING DISPLAY COMPONENT
// ---------------------------------------------------------
interface TVDisplayProps {
  tickets: Ticket[];
  onExit?: () => void;
  onSignOut?: () => void;
}

const TVDisplay: React.FC<TVDisplayProps> = ({ tickets, onExit, onSignOut }) => {
  const waitingTickets = tickets.filter(t => t.status === "Waiting");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let animationFrameId: number;
    let scrollPos = 0;

    const scroll = () => {
      if (el.scrollHeight > el.clientHeight) {
        scrollPos += 0.5; // speed
        if (scrollPos >= el.scrollHeight - el.clientHeight) {
          scrollPos = 0; // Reset to top when it reaches the bottom
        }
        el.scrollTop = scrollPos;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [waitingTickets]);

  // Helper to mask names (e.g. "John Doe" -> "John D.")
  const maskName = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length > 1) {
      const first = parts[0];
      const last = parts[parts.length - 1];
      return `${first} ${last.charAt(0)}.`;
    }
    return name;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ backgroundImage: 'url("/botanical_retreat.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}
      className="absolute inset-0 z-50 flex overflow-hidden bg-white"
    >
      {onExit && (
        <button 
          onClick={onExit}
          className="absolute top-8 right-8 z-50 text-gray-500 hover:text-[#C5A059] transition-colors bg-white/80 px-4 py-2 rounded-sm border border-[#E5E5E0] backdrop-blur-sm text-xs font-sans tracking-widest uppercase shadow-sm"
        >
          Exit TV View
        </button>
      )}

      {onSignOut && (
        <button 
          onClick={onSignOut}
          className="absolute bottom-4 right-4 z-50 text-gray-400/20 hover:text-gray-500 hover:bg-white/40 transition-all px-2.5 py-1 rounded-sm border border-transparent hover:border-gray-200 backdrop-blur-sm text-[9px] font-sans tracking-widest uppercase"
        >
          Sign Out Terminal
        </button>
      )}

      {/* FULL SCREEN WAITING LOUNGE */}
      <div className="w-full max-w-7xl mx-auto p-16 relative z-10 flex flex-col">
        <div className="flex items-center justify-between mb-16 border-b border-[#E5E5E0] pb-8">
          <div>
            <h2 className="text-5xl font-serif text-[#111111] tracking-wider uppercase mb-2">
              Waiting Lounge
            </h2>
            <p className="text-gray-500 font-sans tracking-[0.2em] uppercase text-xl">Upcoming Appointments</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-7xl font-serif text-[#C5A059] font-bold">{waitingTickets.length}</span>
            <span className="text-gray-500 font-sans tracking-[0.2em] uppercase text-sm">Waiting</span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <div 
            ref={scrollRef}
            className="h-full overflow-y-auto space-y-6 pr-4 hide-scrollbar pb-32"
          >
            <AnimatePresence>
              {waitingTickets.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex items-center justify-center">
                   <p className="text-3xl font-serif text-gray-500 italic">No clients waiting.</p>
                </motion.div>
              ) : (
                waitingTickets.map((ticket, index) => (
                  <motion.div
                    key={ticket.docId}
                    layout
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/85 backdrop-blur-md border border-[#E5E5E0] p-10 rounded-sm flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-10">
                      <span className="text-5xl font-sans font-bold text-gray-400 w-24">{ticket.id}</span>
                      <div>
                        <p className="text-4xl text-[#111111] font-serif font-bold tracking-wide">
                          {maskName(ticket.customerName)}
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl font-sans text-[#C5A059] font-bold tracking-widest px-6 py-3 border border-[#C5A059]/30 rounded-sm uppercase bg-white/50">
                      {ticket.gender ? `${ticket.gender} - ` : ''}{ticket.serviceCategory ? `${ticket.serviceCategory} - ` : ''}{ticket.serviceType}
                    </span>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------
// HELPER FUNCTIONS & COMPONENT FOR WORK TIME
// ---------------------------------------------------------
const formatDuration = (totalSeconds: number) => {
  if (totalSeconds <= 0) return '0s';
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
};

const LiveStylistTimer: React.FC<{ servedAt: any, baseSeconds: number }> = ({ servedAt, baseSeconds }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!servedAt) {
      setSeconds(0);
      return;
    }
    const updateTime = () => {
      let start = 0;
      if (typeof servedAt.toDate === 'function') {
        start = servedAt.toDate().getTime();
      } else if (servedAt.seconds) {
        start = servedAt.seconds * 1000;
      } else {
        setSeconds(0);
        return;
      }
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((now - start) / 1000));
      setSeconds(diff);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [servedAt]);

  return <span>{formatDuration(seconds + baseSeconds)}</span>;
};

// ---------------------------------------------------------
// ATTENDANCE SHEET COMPONENT
// ---------------------------------------------------------
interface AttendanceRecord {
  id: string;
  name: string;
  date: string;
  loginAt: string;
  loginTimestamp: number;
}

const LiveWorkTimer: React.FC<{ loginTimestamp: number }> = ({ loginTimestamp }) => {
  const [elapsed, setElapsed] = useState("");
  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, Math.floor((Date.now() - loginTimestamp) / 1000));
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setElapsed(`${h}h ${m}m ${s}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [loginTimestamp]);
  return <span className="font-mono text-green-400 font-bold tabular-nums">{elapsed}</span>;
};

const AttendanceSheet: React.FC = () => {
  const TRACKED = ["Prashant", "Tejas", "Kunal"];
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"today" | "week" | "all">("today");

  useEffect(() => {
    // Listen to attendance collection in real-time
    const q = query(
      collection(db, "attendance"),
      orderBy("loginTimestamp", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as AttendanceRecord[];
      setRecords(data.filter(r => TRACKED.includes(r.name)));
      setLoading(false);
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);

  const filteredRecords = records.filter(r => {
    if (viewMode === "today") return r.date === todayStr;
    if (viewMode === "week") return new Date(r.loginTimestamp) >= weekAgo;
    return true;
  });

  // Group by date descending
  const grouped: Record<string, AttendanceRecord[]> = {};
  filteredRecords.forEach(r => {
    if (!grouped[r.date]) grouped[r.date] = [];
    grouped[r.date].push(r);
  });
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const formatLoginTime = (loginAt: string) => {
    try {
      const d = new Date(loginAt);
      return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
    } catch { return loginAt; }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    } catch { return dateStr; }
  };

  const getWorkedDuration = (loginTimestamp: number, dateStr: string): string => {
    if (dateStr === todayStr) return ""; // Live timer shown instead
    // For past days: approximate 9 hours of duty (we only have login, no logout)
    const diff = Math.max(0, Math.floor((Date.now() - loginTimestamp) / 1000));
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="bg-[#111111] border border-[#2A2A2A] rounded-sm p-6 flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A2A2A] pb-4">
        <div>
          <h3 className="text-xl font-serif text-[#D4AF37] uppercase tracking-wider">Attendance Sheet</h3>
          <p className="text-[10px] text-gray-500 font-sans uppercase tracking-widest mt-0.5">Daily clock-in records for Prashant · Tejas · Kunal</p>
        </div>
        <div className="flex gap-2">
          {(["today", "week", "all"] as const).map(m => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`px-3 py-1.5 rounded-sm text-[10px] font-sans tracking-wider uppercase font-semibold cursor-pointer border transition-all ${
                viewMode === m
                  ? "bg-[#D4AF37] text-[#111111] border-[#D4AF37]"
                  : "bg-[#1A1A1A] border-[#2A2A2A] text-gray-400 hover:text-white"
              }`}
            >
              {m === "today" ? "Today" : m === "week" ? "7 Days" : "All Time"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 gap-3">
          <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 text-sm font-sans">Loading attendance...</span>
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-4xl mb-2">📋</p>
          <p className="text-gray-600 text-sm font-sans">No attendance records yet for {viewMode === "today" ? "today" : "this period"}.</p>
          <p className="text-gray-700 text-xs font-sans mt-1">Staff will be automatically checked in when they log in.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {sortedDates.map(date => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-[#2A2A2A]" />
                <span className="text-[10px] font-sans text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  {formatDate(date)} {date === todayStr && <span className="text-green-400 font-bold">· Today</span>}
                </span>
                <div className="h-px flex-1 bg-[#2A2A2A]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TRACKED.map(name => {
                  const record = grouped[date]?.find(r => r.name === name);
                  const isToday = date === todayStr;
                  return (
                    <div
                      key={name}
                      className={`p-4 rounded-sm border flex flex-col gap-2 ${
                        record
                          ? isToday
                            ? "bg-green-950/20 border-green-800/30"
                            : "bg-[#1A1A1A] border-[#2A2A2A]"
                          : "bg-[#0D0D0D] border-[#1A1A1A] opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-serif ${
                            record ? "bg-gradient-to-br from-[#D4AF37] to-[#8B7523] text-black" : "bg-[#2A2A2A] text-gray-600"
                          }`}>
                            {name.charAt(0)}
                          </div>
                          <span className={`text-sm font-medium ${record ? "text-white" : "text-gray-600"}`}>{name}</span>
                        </div>
                        {record ? (
                          <span className="text-[9px] bg-green-900/40 text-green-400 border border-green-700/30 px-2 py-0.5 rounded-sm font-bold uppercase font-sans">Present</span>
                        ) : (
                          <span className="text-[9px] bg-red-900/20 text-red-500 border border-red-800/20 px-2 py-0.5 rounded-sm font-bold uppercase font-sans">Absent</span>
                        )}
                      </div>
                      {record ? (
                        <div className="flex flex-col gap-1 pl-10">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-gray-500 font-sans">Clock In:</span>
                            <span className="text-[10px] font-mono text-white">{formatLoginTime(record.loginAt)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-gray-500 font-sans">Time on Duty:</span>
                            {isToday ? (
                              <LiveWorkTimer loginTimestamp={record.loginTimestamp} />
                            ) : (
                              <span className="text-[10px] font-mono text-gray-300">{getWorkedDuration(record.loginTimestamp, date)}</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-700 pl-10 font-sans italic">Did not log in</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------
// Staff Analytics Dashboard
// ---------------------------------------------------------
interface StaffAnalyticsProps {
  tickets: Ticket[];
}

const StaffAnalyticsDashboard: React.FC<StaffAnalyticsProps> = ({ tickets }) => {
  const [stylists, setStylists] = useState<StylistDoc[]>([]);
  const [selectedStylist, setSelectedStylist] = useState<string>("all");
  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "all">("month");

  useEffect(() => {
    const q = query(collection(db, "stylists"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StylistDoc[];
      setStylists(data.filter(s => s.role !== 'receptionist'));
    });
    return () => unsubscribe();
  }, []);

  const getTicketDate = (ticket: Ticket): Date | null => {
    if (!ticket.completedAt) return null;
    if (typeof ticket.completedAt.toDate === 'function') return ticket.completedAt.toDate();
    if (ticket.completedAt.seconds) return new Date(ticket.completedAt.seconds * 1000);
    return null;
  };

  const isInRange = (ticket: Ticket): boolean => {
    const d = getTicketDate(ticket);
    if (!d) return false;
    const now = new Date();
    if (dateRange === "today") {
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (dateRange === "week") {
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
      return d >= weekAgo;
    }
    if (dateRange === "month") {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return true; // "all"
  };

  const completedTickets = tickets.filter(t => t.status === "Completed" && isInRange(t));

  // Per-stylist revenue calculation (handles split up to 3 ways)
  const getStylistEarnings = (stylistName: string, ticketList: Ticket[]): number => {
    return ticketList.reduce((sum, t) => {
      if (t.isSplit) {
        if (t.primaryStylistName === stylistName) return sum + (t.primaryStylistPrice || 0);
        if (t.secondaryStylistName === stylistName) return sum + (t.secondaryStylistPrice || 0);
        if ((t as any).tertiaryStylistName === stylistName) return sum + ((t as any).tertiaryStylistPrice || 0);
        return sum;
      }
      if (t.stylistName === stylistName) return sum + (t.price || 0);
      return sum;
    }, 0);
  };

  const getStylistTickets = (stylistName: string, ticketList: Ticket[]): Ticket[] => {
    return ticketList.filter(t =>
      t.stylistName === stylistName ||
      t.primaryStylistName === stylistName ||
      t.secondaryStylistName === stylistName ||
      (t as any).tertiaryStylistName === stylistName
    );
  };

  const allStylistStats = stylists.map(stylist => {
    const stylistTickets = getStylistTickets(stylist.name, completedTickets);
    const revenue = getStylistEarnings(stylist.name, completedTickets);
    const cashRevenue = getStylistEarnings(stylist.name, completedTickets.filter(t => t.paymentMethod === "Cash"));
    const upiRevenue = getStylistEarnings(stylist.name, completedTickets.filter(t => t.paymentMethod === "UPI"));
    const pendingRevenue = getStylistEarnings(stylist.name, completedTickets.filter(t => t.paymentMethod === "Pending"));
    const clientCount = stylistTickets.length;

    // Top services
    const serviceCounts: Record<string, number> = {};
    stylistTickets.forEach(t => {
      if (t.serviceType) {
        t.serviceType.split(",").forEach(s => {
          const svc = s.trim();
          serviceCounts[svc] = (serviceCounts[svc] || 0) + 1;
        });
      }
    });
    const topServices = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Last 7 days daily earnings
    const dailyEarnings: { label: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(); day.setDate(day.getDate() - i);
      const dayStr = day.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      const dayTickets = completedTickets.filter(t => {
        const d = getTicketDate(t);
        return d && d.getDate() === day.getDate() && d.getMonth() === day.getMonth() && d.getFullYear() === day.getFullYear();
      });
      dailyEarnings.push({ label: dayStr, amount: getStylistEarnings(stylist.name, dayTickets) });
    }

    return { stylist, revenue, cashRevenue, upiRevenue, pendingRevenue, clientCount, topServices, dailyEarnings, stylistTickets };
  }).sort((a, b) => b.revenue - a.revenue);

  const totalRevenue = allStylistStats.reduce((sum, s) => sum + s.revenue, 0);
  const totalClients = completedTickets.length;

  const filteredStats = selectedStylist === "all" ? allStylistStats : allStylistStats.filter(s => s.stylist.name === selectedStylist);
  const maxRevenue = Math.max(...allStylistStats.map(s => s.revenue), 1);

  const GOLD = "#D4AF37";
  const DARK = "#111111";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto w-full flex flex-col gap-8 flex-1 relative z-10"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4AF37]/30 pb-6">
        <div>
          <h2 className="text-4xl font-serif text-[#D4AF37] tracking-wider uppercase mb-1">Staff Analytics</h2>
          <p className="text-gray-500 font-sans tracking-[0.2em] uppercase text-sm">Revenue & Performance Breakdown by Stylist</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["today", "week", "month", "all"] as const).map(r => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-4 py-2 rounded-sm text-xs font-sans tracking-wider uppercase font-semibold transition-all cursor-pointer border ${
                dateRange === r
                  ? "bg-[#D4AF37] text-[#111111] border-[#D4AF37]"
                  : "bg-[#1A1A1A] border-[#2A2A2A] text-gray-400 hover:text-white hover:border-[#D4AF37]/40"
              }`}
            >
              {r === "all" ? "All Time" : r === "today" ? "Today" : r === "week" ? "7 Days" : "This Month"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#111111] border border-[#2A2A2A] p-6 rounded-sm flex flex-col gap-1">
          <span className="text-gray-500 text-xs font-sans uppercase tracking-widest">Total Revenue</span>
          <span className="text-3xl font-serif font-bold text-[#D4AF37]">₹{totalRevenue.toLocaleString('en-IN')}</span>
          <span className="text-xs text-gray-600 font-sans">{dateRange === "today" ? "Today" : dateRange === "week" ? "Last 7 days" : dateRange === "month" ? "This month" : "All time"}</span>
        </div>
        <div className="bg-[#111111] border border-[#2A2A2A] p-6 rounded-sm flex flex-col gap-1">
          <span className="text-gray-500 text-xs font-sans uppercase tracking-widest">Clients Served</span>
          <span className="text-3xl font-serif font-bold text-white">{totalClients}</span>
          <span className="text-xs text-gray-600 font-sans">Completed appointments</span>
        </div>
        <div className="bg-[#111111] border border-[#2A2A2A] p-6 rounded-sm flex flex-col gap-1">
          <span className="text-gray-500 text-xs font-sans uppercase tracking-widest">Avg Revenue / Client</span>
          <span className="text-3xl font-serif font-bold text-green-400">₹{totalClients > 0 ? Math.round(totalRevenue / totalClients).toLocaleString('en-IN') : 0}</span>
          <span className="text-xs text-gray-600 font-sans">Per completed service</span>
        </div>
      </div>

      {/* Revenue Leaderboard Bar Chart */}
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-sans uppercase tracking-widest text-[#D4AF37] font-semibold">Revenue Leaderboard</h3>
          <select
            value={selectedStylist}
            onChange={e => setSelectedStylist(e.target.value)}
            className="bg-[#1A1A1A] text-white border border-[#2A2A2A] rounded-sm px-3 py-1.5 text-xs focus:outline-none focus:border-[#D4AF37] cursor-pointer"
          >
            <option value="all">All Stylists</option>
            {stylists.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-3">
          {allStylistStats.map((stat, i) => {
            const pct = totalRevenue > 0 ? (stat.revenue / maxRevenue) * 100 : 0;
            const isTop = i === 0;
            return (
              <div key={stat.stylist.id} className="flex items-center gap-4">
                <div className="w-6 text-center">
                  {isTop && stat.revenue > 0 ? (
                    <span className="text-[#D4AF37] text-sm">★</span>
                  ) : (
                    <span className="text-gray-600 text-xs font-mono">#{i + 1}</span>
                  )}
                </div>
                <div className="w-28 flex-shrink-0">
                  <span className="text-sm font-medium text-white truncate block">{stat.stylist.name}</span>
                  <span className="text-[10px] text-gray-500">{stat.clientCount} clients</span>
                </div>
                <div className="flex-1 relative h-7 bg-[#1A1A1A] rounded-sm overflow-hidden">
                  <div
                    className={`h-full rounded-sm transition-all duration-700 ${isTop && stat.revenue > 0 ? 'bg-gradient-to-r from-[#D4AF37] to-[#F0CE5E]' : 'bg-gradient-to-r from-[#2A2A2A] to-[#3A3A3A]'}`}
                    style={{ width: `${pct}%` }}
                  />
                  <span className="absolute inset-0 flex items-center px-2 text-xs font-mono font-bold text-white">
                    ₹{stat.revenue.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="w-20 text-right">
                  <span className="text-[10px] font-sans text-gray-500">{totalRevenue > 0 ? ((stat.revenue / totalRevenue) * 100).toFixed(1) : 0}%</span>
                </div>
              </div>
            );
          })}
          {allStylistStats.length === 0 && (
            <p className="text-gray-600 text-sm font-sans text-center py-4">No data for selected period</p>
          )}
        </div>
      </div>

      {/* Per-Stylist Detailed Cards */}
      {filteredStats.map(stat => (
        <div key={stat.stylist.id} className="bg-[#111111] border border-[#2A2A2A] rounded-sm p-6 flex flex-col gap-6">
          {/* Stylist Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A2A2A] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7523] flex items-center justify-center text-black font-bold font-serif text-lg">
                {stat.stylist.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-lg font-serif text-white">{stat.stylist.name}</h4>
                <span className="text-[10px] font-sans uppercase tracking-widest text-gray-500">{stat.stylist.role}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-serif text-[#D4AF37] font-bold">₹{stat.revenue.toLocaleString('en-IN')}</div>
              <div className="text-xs text-gray-500 font-sans">{stat.clientCount} services completed</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Payment Breakdown */}
            <div className="flex flex-col gap-3">
              <h5 className="text-[10px] font-sans uppercase tracking-widest text-gray-500">Payment Breakdown</h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    <span className="text-xs text-gray-300 font-sans">UPI</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-400">₹{stat.upiRevenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    <span className="text-xs text-gray-300 font-sans">Cash</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-green-400">₹{stat.cashRevenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="text-xs text-gray-300 font-sans">Pending</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-red-400">₹{stat.pendingRevenue.toLocaleString('en-IN')}</span>
                </div>
              </div>
              {/* Stacked payment bar */}
              {stat.revenue > 0 && (
                <div className="flex h-2 rounded-full overflow-hidden mt-1">
                  <div className="bg-blue-400 transition-all" style={{ width: `${(stat.upiRevenue / stat.revenue) * 100}%` }} />
                  <div className="bg-green-400 transition-all" style={{ width: `${(stat.cashRevenue / stat.revenue) * 100}%` }} />
                  <div className="bg-red-400 transition-all" style={{ width: `${(stat.pendingRevenue / stat.revenue) * 100}%` }} />
                </div>
              )}
            </div>

            {/* Top Services */}
            <div className="flex flex-col gap-3">
              <h5 className="text-[10px] font-sans uppercase tracking-widest text-gray-500">Top Services</h5>
              {stat.topServices.length > 0 ? (
                <div className="space-y-2">
                  {stat.topServices.map(([svc, count], i) => {
                    const maxCount = stat.topServices[0][1];
                    return (
                      <div key={svc} className="flex items-center gap-2">
                        <div className="w-24 text-[10px] text-gray-400 font-sans truncate">{svc}</div>
                        <div className="flex-1 h-4 bg-[#1A1A1A] rounded-sm overflow-hidden">
                          <div
                            className="h-full rounded-sm transition-all duration-500"
                            style={{
                              width: `${(count / maxCount) * 100}%`,
                              background: i === 0 ? 'linear-gradient(90deg,#D4AF37,#F0CE5E)' : '#2A2A2A'
                            }}
                          />
                        </div>
                        <div className="w-6 text-[10px] text-gray-400 text-right font-mono">{count}x</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600 text-xs font-sans">No services yet</p>
              )}
            </div>

            {/* Last 7-Day Bar Chart */}
            <div className="flex flex-col gap-3">
              <h5 className="text-[10px] font-sans uppercase tracking-widest text-gray-500">Daily Earnings (Last 7 Days)</h5>
              <div className="flex items-end gap-1 h-24">
                {stat.dailyEarnings.map(({ label, amount }) => {
                  const maxDay = Math.max(...stat.dailyEarnings.map(d => d.amount), 1);
                  const height = Math.max((amount / maxDay) * 100, amount > 0 ? 4 : 0);
                  return (
                    <div key={label} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div
                        className={`w-full rounded-t-sm transition-all duration-500 cursor-default ${amount > 0 ? 'bg-gradient-to-t from-[#D4AF37]/70 to-[#D4AF37]' : 'bg-[#1A1A1A]'}`}
                        style={{ height: `${height}%` }}
                      />
                      {/* Tooltip */}
                      {amount > 0 && (
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          ₹{amount.toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-1">
                {stat.dailyEarnings.map(({ label }) => (
                  <div key={label} className="flex-1 text-center text-[8px] text-gray-600 font-sans truncate">{label}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          {stat.stylistTickets.length > 0 && (
            <div>
              <h5 className="text-[10px] font-sans uppercase tracking-widest text-gray-500 mb-3">Recent Transactions</h5>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px]">
                  <thead>
                    <tr className="text-[10px] text-gray-600 uppercase tracking-widest border-b border-[#2A2A2A]">
                      <th className="text-left pb-2 font-sans font-medium">Client</th>
                      <th className="text-left pb-2 font-sans font-medium">Service</th>
                      <th className="text-left pb-2 font-sans font-medium">Date</th>
                      <th className="text-left pb-2 font-sans font-medium">Method</th>
                      <th className="text-right pb-2 font-sans font-medium">Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1A1A]">
                    {stat.stylistTickets.slice(0, 8).map(t => {
                      const earned = t.isSplit
                        ? t.primaryStylistName === stat.stylist.name ? (t.primaryStylistPrice || 0)
                        : t.secondaryStylistName === stat.stylist.name ? (t.secondaryStylistPrice || 0)
                        : ((t as any).tertiaryStylistName === stat.stylist.name ? ((t as any).tertiaryStylistPrice || 0) : (t.price || 0))
                        : (t.price || 0);
                      const d = getTicketDate(t);
                      return (
                        <tr key={t.docId} className="hover:bg-[#1A1A1A]/40 transition-colors">
                          <td className="py-2.5 text-xs text-white font-medium">{t.customerName}</td>
                          <td className="py-2.5 text-xs text-gray-400 max-w-[120px] truncate">{t.serviceType}</td>
                          <td className="py-2.5 text-xs text-gray-500 font-mono">{d ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
                          <td className="py-2.5">
                            <span className={`text-[9px] px-2 py-0.5 rounded-sm font-bold uppercase font-sans border ${
                              t.paymentMethod === 'Pending' ? 'bg-red-950/40 text-red-400 border-red-800/40'
                              : t.paymentMethod === 'UPI' ? 'bg-blue-950/40 text-blue-400 border-blue-800/40'
                              : 'bg-green-950/40 text-green-400 border-green-800/40'
                            }`}>{t.paymentMethod || 'UPI'}</span>
                          </td>
                          <td className={`py-2.5 text-right text-xs font-mono font-bold ${t.paymentMethod === 'Pending' ? 'text-red-400' : 'text-[#D4AF37]'}`}>
                            ₹{earned.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}

      {filteredStats.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-5xl">📊</span>
          <p className="text-gray-500 font-sans text-sm">No analytics data available for this period.</p>
        </div>
      )}
    </motion.div>
  );
};

// ---------------------------------------------------------
// Owner Dashboard
// ---------------------------------------------------------
interface StylistDoc {
  id: string;
  name: string;
  active: boolean;
  role: string;
}

interface OwnerDashboardProps {
  tickets: Ticket[];
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ tickets }) => {
  const [stylists, setStylists] = useState<StylistDoc[]>([]);
  const [loadingStylists, setLoadingStylists] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "stylists"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StylistDoc[];
      // Filter out pure receptionist accounts for tracking
      setStylists(data.filter(s => s.role !== 'receptionist'));
      setLoadingStylists(false);
    });
    return () => unsubscribe();
  }, []);

  const isCompletedToday = (ticket: Ticket): boolean => {
    if (!ticket.completedAt) return false;
    let date: Date;
    if (typeof ticket.completedAt.toDate === 'function') {
      date = ticket.completedAt.toDate();
    } else if (ticket.completedAt.seconds) {
      date = new Date(ticket.completedAt.seconds * 1000);
    } else {
      return false;
    }
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const activeStylists = stylists.filter(s => s.active);
  const activeServings = tickets.filter(t => t.status === "Serving");
  const completedTickets = tickets.filter(t => t.status === "Completed");
  const completedTodayTickets = completedTickets.filter(isCompletedToday);

  let totalServiceTimeSeconds = 0;
  let completedWithTimeCount = 0;
  completedTodayTickets.forEach(t => {
    if (t.servedAt && t.completedAt) {
      const start = t.servedAt.toDate ? t.servedAt.toDate().getTime() : (t.servedAt.seconds * 1000);
      const end = t.completedAt.toDate ? t.completedAt.toDate().getTime() : (t.completedAt.seconds * 1000);
      totalServiceTimeSeconds += Math.max(0, Math.floor((end - start) / 1000));
      completedWithTimeCount++;
    }
  });
  const avgDuration = completedWithTimeCount > 0 ? Math.floor(totalServiceTimeSeconds / completedWithTimeCount) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto w-full flex flex-col gap-10 flex-1 relative z-10"
    >
      <div className="flex items-center justify-between mb-2 border-b border-[#D4AF37]/30 pb-6">
        <div>
          <h2 className="text-4xl font-serif text-[#D4AF37] tracking-wider uppercase mb-2">
            Owner Dashboard
          </h2>
          <p className="text-gray-500 font-sans tracking-[0.2em] uppercase text-sm">Real-time Performance & Work Hour Analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#111111] border border-[#2A2A2A] p-6 rounded-sm shadow-xl flex flex-col gap-2">
          <span className="text-gray-500 text-xs font-sans uppercase tracking-widest">Active Stylists</span>
          <span className="text-4xl font-serif font-bold text-white">{activeStylists.length} <span className="text-xs text-gray-500 font-sans">/ {stylists.length}</span></span>
        </div>
        <div className="bg-[#111111] border border-[#2A2A2A] p-6 rounded-sm shadow-xl flex flex-col gap-2">
          <span className="text-gray-500 text-xs font-sans uppercase tracking-widest">Current Servings</span>
          <span className="text-4xl font-serif font-bold text-[#D4AF37]">{activeServings.length}</span>
        </div>
        <div className="bg-[#111111] border border-[#2A2A2A] p-6 rounded-sm shadow-xl flex flex-col gap-2">
          <span className="text-gray-500 text-xs font-sans uppercase tracking-widest">Completed Today</span>
          <span className="text-4xl font-serif font-bold text-white">{completedTodayTickets.length}</span>
        </div>
        <div className="bg-[#111111] border border-[#2A2A2A] p-6 rounded-sm shadow-xl flex flex-col gap-2">
          <span className="text-gray-500 text-xs font-sans uppercase tracking-widest">Avg Service Time</span>
          <span className="text-4xl font-serif font-bold text-[#D4AF37]">{formatDuration(avgDuration)}</span>
        </div>
      </div>

      <div className="bg-[#111111] border border-[#2A2A2A] p-8 rounded-sm shadow-xl flex-1 flex flex-col">
        <h3 className="text-xl font-serif text-white mb-6 border-b border-[#2A2A2A] pb-4 uppercase tracking-wider">
          Stylist Performance Tracking
        </h3>

        {loadingStylists ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12 gap-4">
            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            <p className="text-sm tracking-widest font-serif text-gray-400">LOADING ANALYTICS...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2A2A2A] text-gray-500 text-xs uppercase tracking-widest font-sans">
                  <th className="py-4 font-semibold">Stylist</th>
                  <th className="py-4 font-semibold">Duty Status</th>
                  <th className="py-4 font-semibold">Current Client</th>
                  <th className="py-4 font-semibold text-center">Served Today</th>
                  <th className="py-4 font-semibold text-center">Earnings Today</th>
                  <th className="py-4 font-semibold text-right">Total Work Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]">
                {stylists.map(stylist => {
                  const completedList = completedTickets.filter(t => 
                    (t.stylistName === stylist.name || 
                     t.primaryStylistName === stylist.name || 
                     t.secondaryStylistName === stylist.name || 
                     t.tertiaryStylistName === stylist.name) 
                    && isCompletedToday(t)
                  );
                  
                  let completedSecs = 0;
                  let earningsToday = 0;

                  completedList.forEach(t => {
                    if (t.servedAt && t.completedAt) {
                      const start = t.servedAt.toDate ? t.servedAt.toDate().getTime() : (t.servedAt.seconds * 1000);
                      const end = t.completedAt.toDate ? t.completedAt.toDate().getTime() : (t.completedAt.seconds * 1000);
                      completedSecs += Math.max(0, Math.floor((end - start) / 1000));
                    }
                    if (t.isSplit) {
                      if (t.primaryStylistName === stylist.name) {
                        earningsToday += t.primaryStylistPrice || 0;
                      } else if (t.secondaryStylistName === stylist.name) {
                        earningsToday += t.secondaryStylistPrice || 0;
                      } else if (t.tertiaryStylistName === stylist.name) {
                        earningsToday += t.tertiaryStylistPrice || 0;
                      }
                    } else {
                      earningsToday += t.price || 0;
                    }
                  });

                  const activeServingTicket = activeServings.find(t => t.stylistName === stylist.name);

                  return (
                    <tr key={stylist.id} className="text-gray-300 font-sans hover:bg-[#1A1A1A]/30 transition-colors">
                      <td className="py-5 font-medium text-white flex items-center gap-2">
                        {stylist.name}
                        {stylist.role === 'owner_stylist' && (
                          <span className="text-[9px] uppercase tracking-widest bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded-sm">Owner</span>
                        )}
                      </td>
                      <td className="py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider ${
                          stylist.active 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${stylist.active ? 'bg-green-400' : 'bg-gray-500'}`}></span>
                          {stylist.active ? 'On Duty' : 'Offline'}
                        </span>
                      </td>
                      <td className="py-5">
                        {activeServingTicket ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-white font-medium">{activeServingTicket.customerName}</span>
                            <span className="text-xs text-gray-500">{activeServingTicket.serviceType}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic text-sm">
                            {stylist.active ? 'Idle / Waiting for client' : 'Offline'}
                          </span>
                        )}
                      </td>
                      <td className="py-5 text-center font-semibold text-white">
                        {completedList.length}
                      </td>
                      <td className="py-5 text-center font-semibold text-[#D4AF37]">
                        ₹{earningsToday}
                      </td>
                      <td className="py-5 text-right font-mono text-white">
                        {activeServingTicket ? (
                          <div className="flex items-center justify-end gap-1.5 text-amber-400 font-bold">
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
                            <LiveStylistTimer servedAt={activeServingTicket.servedAt} baseSeconds={completedSecs} />
                          </div>
                        ) : (
                          formatDuration(completedSecs)
                        )}
                      </td>
                    </tr>
                  );
                })}
                {stylists.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-500 italic">
                      No stylists registered in system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Attendance Sheet */}
      <AttendanceSheet />

    </motion.div>
  );
};

// ---------------------------------------------------------
// STAFF LINE VIEW COMPONENT
// ---------------------------------------------------------
const StaffLineView: React.FC<{ tickets: Ticket[], user: User, onCompleteTicket: (ticket: Ticket) => void }> = ({ tickets, user, onCompleteTicket }) => {
  const handleAcceptCustomer = async (ticketId: string) => {
    try {
      await updateDoc(doc(db, "tickets", ticketId), { 
        status: "Serving",
        stylistName: user.name,
        servedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Failed to accept customer", err);
    }
  };

  const activeTickets = tickets.filter(t => t.status !== 'Completed');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col relative z-10 w-full h-full max-w-7xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8 border-b border-[#D4AF37]/30 pb-6">
        <div>
          <h2 className="text-4xl font-serif text-[#D4AF37] tracking-wider uppercase mb-2">
            Queue Management Overview
          </h2>
          <p className="text-gray-500 font-sans tracking-[0.2em] uppercase text-sm">Staff Monitoring Dashboard</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-4xl font-serif text-[#D4AF37]">{activeTickets.length}</span>
          <span className="text-gray-500 font-sans tracking-[0.2em] uppercase text-xs">Active Clients</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-12">
        <div className="flex flex-col gap-6">
          <AnimatePresence>
            {activeTickets.map(ticket => (
              <motion.div
                key={ticket.docId}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 md:px-8 border rounded-sm transition-all duration-300 ${
                  ticket.status === 'Waiting' 
                    ? 'border-[#D4AF37]/50 bg-[#111111] shadow-[0_4px_20px_rgba(0,0,0,0.4)]' 
                    : 'border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#0A0A0A] shadow-[0_4px_20px_rgba(212,175,55,0.15)]'
                }`}
              >
                <div className="md:col-span-2 flex items-center gap-2">
                   <span className={`font-sans font-bold text-2xl ${ticket.status === 'Waiting' ? 'text-[#D4AF37]' : 'text-[#0A0A0A]'}`}>{ticket.id}</span>
                   {ticket.appointmentTime && (
                     <span className={`text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-semibold border ${
                       ticket.status === 'Waiting'
                         ? 'bg-green-500/20 text-green-400 border-green-500/30'
                         : 'bg-green-100 text-green-800 border-green-300'
                     }`}>
                       Online
                     </span>
                   )}
                </div>
                <div className="md:col-span-3">
                  <p className={`font-serif text-3xl tracking-wide ${ticket.status === 'Waiting' ? 'text-white' : 'text-[#0A0A0A] font-bold'}`}>{ticket.customerName}</p>
                  {ticket.appointmentTime && (
                    <p className={`text-xs mt-1.5 font-sans flex items-center gap-1 font-medium ${ticket.status === 'Waiting' ? 'text-green-400' : 'text-green-800'}`}>
                      <Clock className="w-3.5 h-3.5" /> Appt: {ticket.appointmentTime}
                    </p>
                  )}
                  {ticket.notes && (
                    <p className={`text-xs mt-1 italic font-sans ${ticket.status === 'Waiting' ? 'text-gray-400' : 'text-[#0A0A0A]/70'}`}>
                      Notes: "{ticket.notes}"
                    </p>
                  )}
                  {ticket.colourNumber && (
                    <p className={`text-xs mt-1 font-semibold font-sans ${ticket.status === 'Waiting' ? 'text-[#D4AF37]' : 'text-amber-950'}`}>
                      Shade: {ticket.colourNumber}
                    </p>
                  )}
                </div>
                <div className="md:col-span-3 flex flex-wrap gap-2 items-center">
                  {ticket.gender && (
                    <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-semibold border ${
                      ticket.status === 'Waiting'
                        ? ticket.gender === 'Female' 
                          ? 'bg-purple-950/40 text-purple-400 border-purple-800/40' 
                          : 'bg-blue-950/40 text-blue-400 border-blue-800/40'
                        : ticket.gender === 'Female'
                          ? 'bg-purple-100 text-purple-800 border-purple-300'
                          : 'bg-blue-100 text-blue-800 border-blue-300'
                    }`}>
                      {ticket.gender}
                    </span>
                  )}
                  {ticket.serviceCategory && (
                    <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-semibold border ${
                      ticket.status === 'Waiting'
                        ? ticket.serviceCategory === 'Hair'
                          ? 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                          : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                        : ticket.serviceCategory === 'Hair'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      {ticket.serviceCategory}
                    </span>
                  )}
                  <span className={`text-xs tracking-[0.2em] uppercase px-4 py-2 border rounded-sm ${
                    ticket.status === 'Waiting' 
                      ? 'border-[#D4AF37]/30 text-gray-300' 
                      : 'border-[#0A0A0A]/30 text-[#0A0A0A] font-bold'
                  }`}>
                    {ticket.serviceType}
                  </span>
                </div>
                <div className="md:col-span-4 flex justify-end items-center gap-6">
                   <div className="flex flex-col items-end">
                     <span className={`text-[10px] uppercase tracking-widest mb-1 ${ticket.status === 'Waiting' ? 'text-gray-500' : 'text-[#0A0A0A]/70 font-bold'}`}>Wait Time</span>
                     <span className={`font-mono text-xl ${ticket.status === 'Waiting' ? 'text-amber-400' : 'text-[#0A0A0A] font-bold'}`}>
                       <LiveCounter timestamp={ticket.timestamp} />
                     </span>
                   </div>
                   
                   {ticket.status === 'Waiting' ? (
                     <button
                       onClick={() => handleAcceptCustomer(ticket.docId)}
                       className="bg-[#D4AF37] hover:bg-[#C5A059] text-[#111111] px-6 py-3 rounded-sm font-sans text-xs uppercase tracking-widest font-bold transition-colors whitespace-nowrap"
                     >
                       Accept
                     </button>
                    ) : ticket.stylistName === user.name ? (
                      <button
                        onClick={() => onCompleteTicket(ticket)}
                        className="bg-[#0A0A0A] hover:bg-[#1A1A1A] text-white px-6 py-3 rounded-sm font-sans text-xs uppercase tracking-widest font-bold transition-colors whitespace-nowrap shadow-md"
                      >
                        Complete
                      </button>
                    ) : (
                     <div className="bg-[#0A0A0A]/10 px-6 py-3 rounded-sm font-sans text-xs uppercase tracking-widest font-bold text-[#0A0A0A] whitespace-nowrap">
                       With {ticket.stylistName || 'Stylist'}
                     </div>
                   )}
                </div>
              </motion.div>
            ))}
            {activeTickets.length === 0 && (
               <div className="text-center py-20 border border-[#2A2A2A] border-dashed rounded-sm">
                  <p className="text-gray-500 font-serif italic text-lg">No active queue.</p>
               </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
export default App;

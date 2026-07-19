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
  where
} from "firebase/firestore";
import { motion, AnimatePresence } from 'motion/react';
import { Play, CheckCircle, Trash2, Monitor, Scissors, UserPlus, Phone, Loader2, User, Clock, ChevronRight, Search } from 'lucide-react';

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
type Role = "receptionist" | "stylist" | "owner" | "owner_stylist";

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
}

const SERVICE_TYPES = [
  "Classic Cut",
  "Hot Towel Shave",
  "Beard Sculpting",
  "Executive Grooming",
  "Color Treatment"
];

const SERVICE_PRICES: Record<string, number> = {
  "Classic Cut": 45,
  "Hot Towel Shave": 35,
  "Beard Sculpting": 30,
  "Executive Grooming": 75,
  "Color Treatment": 90
};

// Audio Synthesizer for Notifications
const playChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Elegant bell-like chime
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1); // C6
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.5);
  } catch (e) {
    console.error("Audio error", e);
  }
};

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
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerRole, setRegisterRole] = useState<Role>('stylist');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Query stylist by name
      const formattedName = username.charAt(0).toUpperCase() + username.slice(1);
      
      // Special check for a registered receptionist (stored in same collection for simplicity)
      const q = query(collection(db, "stylists"), where("name", "==", formattedName));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const stylistDoc = querySnapshot.docs[0].data();
        if (stylistDoc.password && stylistDoc.password === password) {
          const role = stylistDoc.role || (formattedName.toLowerCase().includes('reception') ? 'receptionist' : 'stylist');
          onLogin({ username, role, name: formattedName });
          return;
        }
      }
      
      setError('Invalid credentials');
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (createPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (createPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      const formattedName = username.charAt(0).toUpperCase() + username.slice(1);
      const isStylist = registerRole === 'stylist' || registerRole === 'owner_stylist';
      
      await addDoc(collection(db, "stylists"), {
        name: formattedName,
        active: isStylist,
        role: registerRole,
        password: createPassword // Storing password in plain text for prototype demo purposes
      });
      
      const roleDisplayName = 
        registerRole === 'receptionist' ? 'Receptionist' :
        registerRole === 'owner' ? 'Owner' :
        registerRole === 'owner_stylist' ? 'Owner & Stylist' : 'Stylist';

      setSuccess(`${roleDisplayName} ${username} registered successfully!`);
      setTimeout(() => {
        setMode('login');
        setCreatePassword('');
        setConfirmPassword('');
        setRegisterRole('stylist');
      }, 2000);
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col md:flex-row items-center justify-center p-6 relative gap-10 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] invert"></div>
      
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

      {/* Main Authentication Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-[#111111] p-10 rounded-sm shadow-xl w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-sm border border-[#111111] bg-[#111111] flex items-center justify-center mb-6">
            <Scissors className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-3xl font-bold tracking-widest font-serif uppercase text-[#111111]">
            Hairport
          </h1>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500 font-sans mt-2">Staff Portal</p>
        </div>

        <div className="flex bg-[#F5F5F0] p-1 rounded-sm border border-[#E5E5E0] mb-8">
          <button
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 rounded-sm text-xs font-sans tracking-widest uppercase transition-all duration-300 ${
              mode === 'login' ? 'bg-[#111111] text-[#D4AF37] shadow-md' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 rounded-sm text-xs font-sans tracking-widest uppercase transition-all duration-300 ${
              mode === 'register' ? 'bg-[#111111] text-[#D4AF37] shadow-md' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-sans text-gray-500 uppercase tracking-widest">{mode === 'login' ? 'Username' : 'Display Name'}</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#E5E5E0] rounded-sm px-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-all text-[#111111] font-sans"
              placeholder={mode === 'login' ? "Enter username" : "Enter preferred display name"}
              required
            />
          </div>

          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-xs font-sans text-gray-500 uppercase tracking-widest">Role</label>
              <select
                value={registerRole}
                onChange={(e) => setRegisterRole(e.target.value as Role)}
                className="w-full bg-[#F5F5F0] border border-[#E5E5E0] rounded-sm px-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-all text-[#111111] font-sans appearance-none cursor-pointer"
              >
                <option value="stylist">Stylist</option>
                <option value="receptionist">Receptionist</option>
                <option value="owner">Owner</option>
                <option value="owner_stylist">Owner + Stylist</option>
              </select>
            </div>
          )}
          
          {mode === 'login' && (
            <div className="space-y-2">
              <label className="text-xs font-sans text-gray-500 uppercase tracking-widest">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-[#E5E5E0] rounded-sm px-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-all text-[#111111] font-sans"
                placeholder="Enter password"
                required
              />
            </div>
          )}
          
          {mode === 'register' && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-sans text-gray-500 uppercase tracking-widest">Create Password</label>
                <input 
                  type="password" 
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-[#E5E5E0] rounded-sm px-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-all text-[#111111] font-sans"
                  placeholder="Create password"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-sans text-gray-500 uppercase tracking-widest">Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-[#E5E5E0] rounded-sm px-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-all text-[#111111] font-sans"
                  placeholder="Confirm password"
                  required
                />
              </div>
            </>
          )}
          
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          {success && <p className="text-green-600 text-xs text-center">{success}</p>}

          <button 
            type="submit"
            className="w-full mt-4 bg-[#D4AF37] hover:bg-[#C5A059] text-[#111111] font-serif font-bold tracking-widest uppercase py-4 px-6 rounded-sm transition-colors duration-300"
          >
            {mode === 'login' ? 'Authenticate' : 'Register User'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

interface CompletionModalProps {
  ticket: Ticket;
  onClose: () => void;
  onConfirm: (price: number, stylistName: string) => Promise<void>;
}

const CompletionModal: React.FC<CompletionModalProps> = ({ ticket, onClose, onConfirm }) => {
  const [price, setPrice] = useState<string>("");
  const [stylist, setStylist] = useState<string>("");
  const [stylists, setStylists] = useState<{ id: string, name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const defaultPrice = SERVICE_PRICES[ticket.serviceType] || 0;
    setPrice(defaultPrice.toString());

    if (ticket.stylistName) {
      setStylist(ticket.stylistName);
    }

    const q = query(collection(db, "stylists"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => doc.data() as { name: string, role?: string })
        .filter(s => s.role !== 'receptionist')
        .map(s => ({ id: s.name, name: s.name }));
      setStylists(data);
      
      if (!ticket.stylistName && data.length > 0) {
        setStylist(data[0].name);
      }
    });

    return () => unsubscribe();
  }, [ticket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Please enter a valid price.");
      return;
    }
    if (!stylist) {
      setError("Please select a stylist.");
      return;
    }

    setSubmitting(true);
    try {
      await onConfirm(parsedPrice, stylist);
    } catch (err) {
      setError("Failed to complete ticket. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#111111] border border-[#D4AF37]/30 p-8 rounded-sm shadow-2xl w-full max-w-md relative text-gray-200 font-sans"
      >
        <h3 className="text-2xl font-serif text-[#D4AF37] mb-6 border-b border-[#2A2A2A] pb-4 uppercase tracking-wider">
          Complete Appointment
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1">Client Name</span>
            <span className="text-lg text-white font-medium">{ticket.customerName}</span>
          </div>

          <div>
            <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1">Service Type</span>
            <span className="text-lg text-[#D4AF37] font-medium">{ticket.serviceType}</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-500 uppercase tracking-widest block">Stylist Assigned</label>
            <select
              value={stylist}
              onChange={(e) => setStylist(e.target.value)}
              disabled={!!ticket.stylistName}
              className="w-full bg-[#1A1A1A] text-white border border-[#2A2A2A] rounded-sm px-4 py-3 focus:outline-none focus:border-[#D4AF37] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {ticket.stylistName ? (
                <option value={ticket.stylistName}>{ticket.stylistName}</option>
              ) : (
                stylists.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-500 uppercase tracking-widest block">Amount Charged ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full bg-[#1A1A1A] text-white border border-[#2A2A2A] rounded-sm px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
              placeholder="0.00"
            />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 bg-transparent hover:bg-white/5 border border-gray-600 text-gray-400 hover:text-white py-3 rounded-sm font-sans text-xs uppercase tracking-widest transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#D4AF37] hover:bg-[#C5A059] text-[#111111] py-3 rounded-sm font-sans text-xs uppercase tracking-widest transition-colors font-bold flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<"reception" | "staff" | "tv" | "owner">("reception");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingTicket, setCompletingTicket] = useState<Ticket | null>(null);
  
  // Audio notification tracking
  const prevServingCount = useRef(0);

  useEffect(() => {
    // If not TV and no user, we don't necessarily need to stop listening, but let's keep it listening.
    const q = query(collection(db, "tickets"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newTickets = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      })) as Ticket[];
      
      setTickets(newTickets);
      setLoading(false);
      
      // Check for new serving tickets to play audio
      const currentServing = newTickets.filter(t => t.status === "Serving").length;
      if (currentServing > prevServingCount.current && view === "tv") {
        playChime();
      }
      prevServingCount.current = currentServing;
    });

    return () => unsubscribe();
  }, [view]);

  // Set default view on login based on role
  useEffect(() => {
    if (user && view !== "tv") {
      if (user.role === "receptionist") setView("reception");
      else if (user.role === "stylist") setView("staff");
      else if (user.role === "owner" || user.role === "owner_stylist") setView("owner");
    }
  }, [user, view]);

  const handleConfirmCompletion = async (price: number, stylistName: string) => {
    if (!completingTicket) return;
    try {
      const updateData: any = {
        status: "Completed",
        price,
        stylistName,
        completedAt: serverTimestamp()
      };
      if (!completingTicket.servedAt) {
        updateData.servedAt = serverTimestamp();
      }
      await updateDoc(doc(db, "tickets", completingTicket.docId), updateData);
      setCompletingTicket(null);
    } catch (err) {
      console.error("Error completing ticket:", err);
      throw err;
    }
  };

  // If no user is logged in, show Login, unless we are forcing TV view.
  // Wait, TV view doesn't require login. But how do we get to TV view if we are logged out?
  // We can add a "TV Mode" button to the login page. Let's add that.
  if (!user && view !== 'tv') {
    return (
      <div className="relative">
        <Login onLogin={setUser} />
        <div className="absolute top-4 right-4">
          <button 
            onClick={() => setView('tv')}
            className="flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-sans tracking-widest uppercase text-gray-500 hover:text-gray-800 transition-colors"
          >
            <Monitor className="w-4 h-4" />
            Launch TV Display
          </button>
        </div>
      </div>
    );
  }

  const isDarkView = view === 'tv' || view === 'staff' || view === 'owner';

  return (
    <div className={`min-h-screen font-sans selection:bg-[#D4AF37]/30 overflow-x-hidden flex flex-col transition-colors duration-500 ${isDarkView ? 'bg-[#0A0A0A] text-gray-100' : 'bg-[#F5F5F0] text-[#111111]'}`}>
      
      {/* Elegant Background Texture */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className={`absolute inset-0 transition-colors duration-500 ${isDarkView ? 'bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A]' : 'bg-[#F5F5F0]'}`}></div>
        <div className={`absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] ${isDarkView ? '' : 'invert opacity-[0.02]'}`}></div>
      </div>

      {/* Header (Hide in TV View to make it fully full-screen as requested) */}
      {view !== 'tv' && (
        <header className={`relative z-20 flex justify-between items-center px-8 py-6 border-b transition-colors duration-500 ${isDarkView ? 'bg-[#0A0A0A]/90 border-[#2A2A2A]' : 'bg-white/90 border-[#111111]'} backdrop-blur-md`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-sm border transition-colors duration-500 flex items-center justify-center ${isDarkView ? 'border-[#D4AF37]/50 bg-[#1A1A1A]' : 'border-[#111111] bg-[#111111]'}`}>
              <Scissors className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold tracking-widest font-serif uppercase transition-colors duration-500 ${isDarkView ? 'text-[#D4AF37]' : 'text-[#111111]'}`}>
                Hairport
              </h1>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500 font-sans mt-1">Premium Grooming</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className={`flex p-1 rounded-sm border transition-colors duration-500 ${isDarkView ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-[#F5F5F0] border-[#E5E5E0]'}`}>
              {(user?.role === "owner" || user?.role === "owner_stylist") && (
                <button
                  onClick={() => setView("owner")}
                  className={`flex items-center gap-2 px-6 py-2 rounded-sm text-sm font-medium transition-all duration-300 cursor-pointer ${
                    view === "owner" 
                      ? "bg-[#2A2A2A] text-[#D4AF37] shadow-[0_2px_10px_rgba(0,0,0,0.5)] border-b border-[#D4AF37]/50" 
                      : isDarkView ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  OWNER DASHBOARD
                </button>
              )}
              {(user?.role === "receptionist" || user?.role === "owner" || user?.role === "owner_stylist") && (
                <button
                  onClick={() => setView("reception")}
                  className={`flex items-center gap-2 px-6 py-2 rounded-sm text-sm font-medium transition-all duration-300 cursor-pointer ${
                    view === "reception" 
                      ? isDarkView 
                        ? "bg-[#2A2A2A] text-[#D4AF37] shadow-[0_2px_10px_rgba(0,0,0,0.5)] border-b border-[#D4AF37]/50"
                        : "bg-[#111111] text-[#D4AF37] shadow-md"
                      : isDarkView ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  RECEPTION
                </button>
              )}
              {(user?.role === "stylist" || user?.role === "owner_stylist") && (
                <button
                  onClick={() => setView("staff")}
                  className={`flex items-center gap-2 px-6 py-2 rounded-sm text-sm font-medium transition-all duration-300 cursor-pointer ${
                    view === "staff" 
                      ? "bg-[#2A2A2A] text-[#D4AF37] shadow-[0_2px_10px_rgba(0,0,0,0.5)] border-b border-[#D4AF37]/50" 
                      : isDarkView ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  STAFF LINE
                </button>
              )}
              <button
                onClick={() => { setView("tv"); playChime(); }}
                className={`flex items-center gap-2 px-6 py-2 rounded-sm text-sm font-medium transition-all duration-300 cursor-pointer ${
                  view === "tv" 
                    ? "bg-[#2A2A2A] text-[#D4AF37] shadow-[0_2px_10px_rgba(0,0,0,0.5)] border-b border-[#D4AF37]/50" 
                    : isDarkView ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Monitor className="w-4 h-4" />
                TV DISPLAY
              </button>
            </div>
            
            <div className="flex flex-col items-end border-l border-gray-300 dark:border-[#2A2A2A] pl-6">
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
        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-4">
            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            <p className="text-sm tracking-widest font-serif text-gray-400">LOADING CONCIERGE...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {view === "owner" && (
              <OwnerDashboard key="owner" tickets={tickets} />
            )}
            {view === "reception" && (
              <ReceptionDashboard key="reception" tickets={tickets} onCompleteTicket={setCompletingTicket} />
            )}
            {view === "staff" && user && (
              <StaffLineView key="staff" tickets={tickets} user={user} onCompleteTicket={setCompletingTicket} />
            )}
            {view === "tv" && (
              <TVDisplay key="tv" tickets={tickets} onExit={() => setView(user ? ((user.role === 'owner' || user.role === 'owner_stylist') ? 'owner' : (user.role === 'stylist' ? 'staff' : 'reception')) : 'reception')} />
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
// CLIENT HISTORY VIEW COMPONENT (FOR RECEPTIONIST)
// ---------------------------------------------------------
interface ClientHistoryViewProps {
  tickets: Ticket[];
}

const ClientHistoryView: React.FC<ClientHistoryViewProps> = ({ tickets }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const completedTickets = tickets.filter(t => t.status === "Completed");

  const filteredTickets = completedTickets.filter(t => {
    const query = searchQuery.toLowerCase();
    return (
      t.customerName.toLowerCase().includes(query) ||
      t.phone.toLowerCase().includes(query) ||
      (t.stylistName && t.stylistName.toLowerCase().includes(query)) ||
      t.serviceType.toLowerCase().includes(query)
    );
  }).sort((a, b) => {
    const aTime = a.completedAt?.toDate ? a.completedAt.toDate().getTime() : (a.completedAt?.seconds * 1000 || 0);
    const bTime = b.completedAt?.toDate ? b.completedAt.toDate().getTime() : (b.completedAt?.seconds * 1000 || 0);
    return bTime - aTime;
  });

  const totalVisits = completedTickets.length;
  const totalRevenue = completedTickets.reduce((sum, t) => sum + (t.price || 0), 0);
  const avgSpend = totalVisits > 0 ? totalRevenue / totalVisits : 0;

  return (
    <div className="flex flex-col gap-8 w-full text-[#111111] font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E5E5E0] p-6 rounded-sm shadow-sm flex flex-col gap-2">
          <span className="text-gray-500 text-xs uppercase tracking-widest font-semibold">Total Completed Visits</span>
          <span className="text-4xl font-serif font-bold text-[#111111]">{totalVisits}</span>
        </div>
        <div className="bg-white border border-[#E5E5E0] p-6 rounded-sm shadow-sm flex flex-col gap-2">
          <span className="text-gray-500 text-xs uppercase tracking-widest font-semibold">Total Revenue Generated</span>
          <span className="text-4xl font-serif font-bold text-[#D4AF37]">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-white border border-[#E5E5E0] p-6 rounded-sm shadow-sm flex flex-col gap-2">
          <span className="text-gray-500 text-xs uppercase tracking-widest font-semibold">Average Ticket Value</span>
          <span className="text-4xl font-serif font-bold text-[#111111]">${avgSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="bg-white border border-[#111111] p-8 rounded-sm shadow-xl flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E5E0] pb-4">
          <h3 className="text-xl font-serif uppercase tracking-wider text-[#111111]">
            Client Database & Billing Logs
          </h3>
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#E5E5E0] rounded-sm pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#D4AF37] transition-all text-[#111111] placeholder-gray-500 font-sans"
              placeholder="Search by client, stylist, or service..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5E0] text-gray-500 text-xs uppercase tracking-widest">
                <th className="py-4 font-semibold">Client Name</th>
                <th className="py-4 font-semibold">Contact</th>
                <th className="py-4 font-semibold">Service Type</th>
                <th className="py-4 font-semibold">Assigned Stylist</th>
                <th className="py-4 font-semibold">Date Completed</th>
                <th className="py-4 font-semibold text-right">Amount Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E0]">
              {filteredTickets.map(ticket => {
                const date = ticket.completedAt?.toDate ? ticket.completedAt.toDate() : (ticket.completedAt?.seconds ? new Date(ticket.completedAt.seconds * 1000) : null);
                const formattedDate = date ? date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';

                return (
                  <tr key={ticket.docId} className="text-gray-700 hover:bg-[#F5F5F0]/50 transition-colors">
                    <td className="py-4 font-medium text-[#111111]">{ticket.customerName}</td>
                    <td className="py-4 text-sm font-mono">{ticket.phone}</td>
                    <td className="py-4">
                      <span className="text-xs uppercase tracking-wider text-[#111111] bg-[#E5E5E0] px-2.5 py-1 rounded-sm">
                        {ticket.serviceType}
                      </span>
                    </td>
                    <td className="py-4 font-medium">{ticket.stylistName || 'Unassigned'}</td>
                    <td className="py-4 text-xs text-gray-500">{formattedDate}</td>
                    <td className="py-4 text-right font-mono font-bold text-[#111111]">
                      ${(ticket.price || 0).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400 italic">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// RECEPTION DASHBOARD COMPONENT
// ---------------------------------------------------------
const ReceptionDashboard: React.FC<{ tickets: Ticket[], onCompleteTicket: (ticket: Ticket) => void }> = ({ tickets, onCompleteTicket }) => {
  const [activeTab, setActiveTab] = useState<"queue" | "history">("queue");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, "tickets"), {
        id: generateNextId(),
        customerName,
        phone,
        serviceType,
        status: "Waiting",
        timestamp: serverTimestamp()
      });
      setCustomerName("");
      setPhone("");
      setServiceType(SERVICE_TYPES[0]);
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
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 flex-1 text-[#111111]">
      {/* Tab Selector */}
      <div className="flex border-b border-[#E5E5E0] pb-2 gap-6">
        <button
          onClick={() => setActiveTab("queue")}
          className={`pb-2 text-sm font-sans uppercase tracking-widest font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "queue"
              ? "border-[#D4AF37] text-[#111111]"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Queue Management
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-2 text-sm font-sans uppercase tracking-widest font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "history"
              ? "border-[#D4AF37] text-[#111111]"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Client History & CRM
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
              <div className="bg-white border border-[#111111] p-8 rounded-sm shadow-xl">
                <h2 className="text-2xl font-serif text-[#111111] mb-8 border-b border-[#E5E5E0] pb-4 tracking-wide">
                  Add Client
                </h2>

                <form onSubmit={handleDeployTicket} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-sans text-gray-500 uppercase tracking-widest">Client Name</label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-400 group-focus-within/input:text-[#D4AF37] transition-colors" />
                      </div>
                      <input 
                        type="text" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-[#F5F5F0] border border-[#E5E5E0] rounded-sm pl-10 pr-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-all text-[#111111] placeholder-gray-500 font-sans"
                        placeholder="Enter name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-sans text-gray-500 uppercase tracking-widest">Contact Number</label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-gray-400 group-focus-within/input:text-[#D4AF37] transition-colors" />
                      </div>
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#F5F5F0] border border-[#E5E5E0] rounded-sm pl-10 pr-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-all text-[#111111] placeholder-gray-500 font-sans"
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-sans text-gray-500 uppercase tracking-widest">Service</label>
                    <div className="relative group/input">
                      <select 
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                        className="w-full bg-[#F5F5F0] border border-[#E5E5E0] rounded-sm pl-4 pr-10 py-3 focus:outline-none focus:border-[#D4AF37] transition-all text-[#111111] appearance-none cursor-pointer font-sans"
                      >
                        {SERVICE_TYPES.map(type => (
                          <option key={type} value={type} className="bg-white text-[#111111]">{type}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ChevronRight className="h-4 w-4 text-gray-400 group-focus-within/input:text-[#D4AF37] rotate-90 transition-colors" />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-8 bg-[#D4AF37] hover:bg-[#C5A059] text-[#111111] font-serif font-bold tracking-widest uppercase py-4 px-6 rounded-sm transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    {isSubmitting ? "Adding..." : "Add to Queue"}
                  </button>
                </form>
              </div>

              {/* Stylists Section */}
              <div className="bg-white border border-[#111111] p-8 rounded-sm shadow-xl flex-1 flex flex-col min-h-[350px]">
                <h2 className="text-2xl font-serif text-[#111111] mb-6 border-b border-[#E5E5E0] pb-4 tracking-wide uppercase">
                  Duty Stylists
                </h2>
                
                <form onSubmit={handleAddStylist} className="flex gap-2 mb-6">
                  <input 
                    type="text" 
                    value={newStylistName}
                    onChange={(e) => setNewStylistName(e.target.value)}
                    placeholder="New Stylist Name" 
                    className="flex-1 bg-[#F5F5F0] border border-[#E5E5E0] rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-[#D4AF37] transition-all text-[#111111] placeholder-gray-500 font-sans"
                  />
                  <button 
                    type="submit"
                    className="bg-[#111111] hover:bg-[#2A2A2A] text-white px-4 py-2 rounded-sm text-xs font-sans tracking-widest uppercase transition-colors"
                  >
                    Add
                  </button>
                </form>

                <div className="flex-1 overflow-y-auto space-y-4 max-h-[300px] hide-scrollbar">
                  {stylists.length === 0 ? (
                    <p className="text-gray-500 font-serif italic text-sm text-center py-6">No stylists active.</p>
                  ) : (
                    stylists.map(stylist => (
                      <div key={stylist.id} className="flex items-center justify-between p-3 border border-[#E5E5E0] rounded-sm bg-[#F5F5F0]">
                        <span className="font-serif text-[#111111] font-medium">{stylist.name}</span>
                        <button
                          onClick={() => toggleStylistActive(stylist.id, stylist.active)}
                          className={`px-3 py-1 rounded-sm text-[10px] font-sans tracking-widest uppercase font-bold transition-all border cursor-pointer ${
                            stylist.active 
                              ? 'bg-green-50/50 text-green-700 border-green-200' 
                              : 'bg-gray-50 text-gray-500 border-gray-200'
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
              <div className="bg-white border border-[#111111] p-6 rounded-sm shadow-xl flex flex-col h-[calc(100vh-180px)] xl:h-auto">
                <div className="flex items-center justify-between mb-6 border-b border-[#E5E5E0] pb-4">
                  <h3 className="font-serif text-lg tracking-widest text-[#111111] flex items-center gap-2 uppercase">
                    Waiting Lounge
                  </h3>
                  <span className="text-[#D4AF37] font-serif font-bold text-xl">{waitingTickets.length}</span>
                </div>

                <div className="overflow-y-auto flex-1 hide-scrollbar space-y-4 pr-2">
                  <AnimatePresence>
                    {waitingTickets.length === 0 ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 border border-[#E5E5E0] border-dashed rounded-sm">
                        <p className="text-gray-500 font-serif italic text-sm">No clients waiting.</p>
                      </motion.div>
                    ) : (
                      waitingTickets.map((ticket) => (
                        <motion.div
                          key={ticket.docId}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-[#F5F5F0] border border-[#E5E5E0] p-5 rounded-sm flex items-center justify-between group hover:border-[#D4AF37] transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-[#111111] font-sans font-medium text-sm">{ticket.id}</span>
                              <span className="text-[10px] uppercase tracking-wider text-gray-600 bg-[#E5E5E0] px-2 py-0.5 rounded-sm">{ticket.serviceType}</span>
                            </div>
                            <p className="text-[#111111] font-serif text-lg font-medium">{ticket.customerName}</p>
                            <p className="text-xs text-gray-500 font-sans mt-1">{ticket.phone}</p>
                          </div>
                          
                          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => updateStatus(ticket.docId, "Serving")}
                              className="bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#111111] p-2 rounded-sm transition-colors border border-[#D4AF37]/20 cursor-pointer"
                              title="Seat Client"
                            >
                              <Play className="w-4 h-4 ml-0.5" />
                            </button>
                            <button 
                              onClick={() => deleteTicket(ticket.docId)}
                              className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white p-2 rounded-sm transition-colors border border-red-200 cursor-pointer"
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
              <div className="bg-white border border-[#111111] p-6 rounded-sm shadow-xl flex flex-col h-[calc(100vh-180px)] xl:h-auto">
                <div className="flex items-center justify-between mb-6 border-b border-[#E5E5E0] pb-4">
                  <h3 className="font-serif text-lg tracking-widest text-[#D4AF37] flex items-center gap-2 uppercase">
                    Now Serving
                  </h3>
                  <span className="text-[#D4AF37] font-serif font-bold text-xl">{servingTickets.length}</span>
                </div>

                <div className="overflow-y-auto flex-1 hide-scrollbar space-y-4 pr-2">
                  <AnimatePresence>
                    {servingTickets.length === 0 ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 border border-[#E5E5E0] border-dashed rounded-sm">
                        <p className="text-gray-500 font-serif italic text-sm">All stations available.</p>
                      </motion.div>
                    ) : (
                      servingTickets.map((ticket) => (
                        <motion.div
                          key={ticket.docId}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="relative bg-[#F5F5F0] border border-[#D4AF37] p-5 rounded-sm flex items-center justify-between group"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37]"></div>
                          
                          <div className="pl-2">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-[#111111] font-sans font-medium text-sm">{ticket.id}</span>
                              <span className="text-[10px] uppercase tracking-wider text-[#111111] bg-[#D4AF37] px-2 py-0.5 rounded-sm">{ticket.serviceType}</span>
                            </div>
                            <p className="text-[#111111] font-serif text-lg font-medium">{ticket.customerName}</p>
                            {ticket.stylistName && (
                              <p className="text-xs text-gray-500 font-sans mt-1">with <span className="font-semibold">{ticket.stylistName}</span></p>
                            )}
                          </div>
                          
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => onCompleteTicket(ticket)}
                              className="flex items-center gap-2 bg-white border border-[#E5E5E0] text-gray-500 hover:text-[#111111] hover:border-[#D4AF37] px-4 py-2 rounded-sm transition-colors font-sans text-xs uppercase tracking-widest cursor-pointer"
                              title="Complete Service"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Complete
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </div>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col gap-6 flex-1"
          >
            <ClientHistoryView tickets={tickets} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------
// TV WAITING DISPLAY COMPONENT
// ---------------------------------------------------------
const TVDisplay: React.FC<{ tickets: Ticket[], onExit?: () => void }> = ({ tickets, onExit }) => {
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
      className="absolute inset-0 bg-[#0F0F0F] z-50 flex overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>

      {onExit && (
        <button 
          onClick={onExit}
          className="absolute top-8 right-8 z-50 text-gray-500 hover:text-[#D4AF37] transition-colors bg-[#111111]/80 px-4 py-2 rounded-sm border border-[#2A2A2A] backdrop-blur-sm text-xs font-sans tracking-widest uppercase"
        >
          Exit TV View
        </button>
      )}

      {/* FULL SCREEN WAITING LOUNGE */}
      <div className="w-full max-w-7xl mx-auto p-16 relative z-10 flex flex-col">
        <div className="flex items-center justify-between mb-16 border-b border-[#2A2A2A] pb-8">
          <div>
            <h2 className="text-5xl font-serif text-[#D4AF37] tracking-wider uppercase mb-2">
              Waiting Lounge
            </h2>
            <p className="text-gray-500 font-sans tracking-[0.2em] uppercase text-xl">Upcoming Appointments</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-7xl font-serif text-[#D4AF37]">{waitingTickets.length}</span>
            <span className="text-gray-500 font-sans tracking-[0.2em] uppercase text-sm">Waiting</span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#0F0F0F] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0F0F0F] to-transparent z-10 pointer-events-none"></div>
          
          <div 
            ref={scrollRef}
            className="h-full overflow-y-auto space-y-6 pr-4 hide-scrollbar pb-32"
          >
            <AnimatePresence>
              {waitingTickets.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex items-center justify-center">
                   <p className="text-3xl font-serif text-gray-600 italic">No clients waiting.</p>
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
                    className="bg-[#141414] border border-[#2A2A2A] p-10 rounded-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-10">
                      <span className="text-5xl font-sans font-medium text-gray-500 w-24">{ticket.id}</span>
                      <div>
                        <p className="text-4xl text-gray-200 font-serif tracking-wide">
                          {maskName(ticket.customerName)}
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl font-sans text-[#D4AF37] tracking-widest px-6 py-3 border border-[#D4AF37]/30 rounded-sm uppercase">
                      {ticket.serviceType}
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
// OWNER DASHBOARD COMPONENT
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

  const activeStylists = stylists.filter(s => s.active);
  const activeServings = tickets.filter(t => t.status === "Serving");
  const completedTickets = tickets.filter(t => t.status === "Completed");

  let totalServiceTimeSeconds = 0;
  let completedWithTimeCount = 0;
  completedTickets.forEach(t => {
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
          <span className="text-4xl font-serif font-bold text-white">{completedTickets.length}</span>
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
                  <th className="py-4 font-semibold text-right">Total Work Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]">
                {stylists.map(stylist => {
                  const completedList = completedTickets.filter(t => t.stylistName === stylist.name);
                  
                  let completedSecs = 0;
                  completedList.forEach(t => {
                    if (t.servedAt && t.completedAt) {
                      const start = t.servedAt.toDate ? t.servedAt.toDate().getTime() : (t.servedAt.seconds * 1000);
                      const end = t.completedAt.toDate ? t.completedAt.toDate().getTime() : (t.completedAt.seconds * 1000);
                      completedSecs += Math.max(0, Math.floor((end - start) / 1000));
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
                    <td colSpan={5} className="py-10 text-center text-gray-500 italic">
                      No stylists registered in system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
                <div className="md:col-span-2 flex items-center">
                   <span className={`font-sans font-bold text-2xl ${ticket.status === 'Waiting' ? 'text-[#D4AF37]' : 'text-[#0A0A0A]'}`}>{ticket.id}</span>
                </div>
                <div className="md:col-span-3">
                  <p className={`font-serif text-3xl tracking-wide ${ticket.status === 'Waiting' ? 'text-white' : 'text-[#0A0A0A] font-bold'}`}>{ticket.customerName}</p>
                </div>
                <div className="md:col-span-3">
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

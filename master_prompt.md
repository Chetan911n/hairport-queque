# Hairport Salon Queue Management System

## package.json
```json
{
  "name": "react-example",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port=3000 --host=0.0.0.0",
    "build": "vite build",
    "preview": "vite preview",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@supabase/supabase-js": "^2.110.7",
    "@tailwindcss/vite": "^4.1.14",
    "@vitejs/plugin-react": "^5.0.4",
    "clsx": "^2.1.1",
    "date-fns": "^4.4.0",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "firebase": "^12.16.0",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "tailwind-merge": "^3.6.0",
    "vite": "^6.2.3"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.25.0",
    "tailwindcss": "^4.1.14",
    "tsx": "^4.21.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.3",
    "@types/express": "^4.17.21"
  }
}
```

## src/index.css
```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap');
@import "tailwindcss";

@theme {
  --font-serif: "Playfair Display", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --color-gold-light: #E6C875;
  --color-gold: #D4AF37;
  --color-gold-dark: #C5A059;
  --color-charcoal-light: #2A2A2A;
  --color-charcoal: #1A1A1A;
  --color-charcoal-dark: #0A0A0A;
}

@layer base {
  body {
    @apply bg-[#F5F5F0] text-[#111111] antialiased selection:bg-gold/30;
    font-family: var(--font-sans);
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-serif);
  }
}

@layer utilities {
  .gold-gradient {
    @apply bg-gradient-to-br from-gold-light via-gold to-gold-dark;
  }
  .gold-gradient-text {
    @apply bg-clip-text text-transparent bg-gradient-to-r from-gold-light via-gold to-gold-dark;
  }
  .border-gold-gradient {
    position: relative;
    background: linear-gradient(to right, #0A0A0A, #0A0A0A) padding-box,
                linear-gradient(to bottom right, #E6C875, #C5A059) border-box;
    border: 1px solid transparent;
  }
}```

## src/supabaseClient.ts
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseKey);
```

## src/components/ReceptionDashboard.tsx
```tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Play, Loader2, User, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type QueueItem = {
  id: string;
  created_at: string;
  customer_name: string;
  service_type: string;
  status: string;
};

const SERVICE_TYPES = [
  "Signature Haircut",
  "Color & Highlights",
  "Balayage & Styling",
  "Keratin Treatment",
  "Bridal Consultation"
];

export const ReceptionDashboard: React.FC = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const { data, error } = await supabase
        .from('queue')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      setQueue(data || []);
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('queue_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setQueue((prev) => {
            const newRecord = payload.new as QueueItem;
            if (newRecord.status === 'waiting') {
              return [...prev, newRecord].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            }
            return prev;
          });
        } else if (payload.eventType === 'UPDATE') {
          setQueue((prev) => {
            const updatedRecord = payload.new as QueueItem;
            if (updatedRecord.status !== 'waiting') {
              return prev.filter((item) => item.id !== updatedRecord.id);
            }
            
            const exists = prev.find((item) => item.id === updatedRecord.id);
            if (exists) {
              return prev.map((item) => item.id === updatedRecord.id ? updatedRecord : item);
            } else {
              return [...prev, updatedRecord].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            }
          });
        } else if (payload.eventType === 'DELETE') {
          setQueue((prev) => prev.filter((item) => item.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('queue')
        .insert([
          { 
            customer_name: customerName.trim(),
            service_type: serviceType,
            status: 'waiting'
          }
        ]);

      if (error) throw error;
      
      setCustomerName("");
      setServiceType(SERVICE_TYPES[0]);
    } catch (error) {
      console.error('Error adding to queue:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10 w-full max-w-7xl mx-auto items-start font-sans">
      
      {/* Registration Panel */}
      <div className="bg-[#111111] w-full lg:w-1/3 p-10 border border-[#2A2A2A] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]"></div>
        
        <div className="mb-10">
          <h2 className="text-3xl font-serif text-[#F5F5F0] mb-2 tracking-wide">Registration</h2>
          <p className="text-sm text-[#A0A0A0] tracking-widest uppercase">Client Check-In</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-xs text-[#A0A0A0] uppercase tracking-widest block font-medium">Guest Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter full name"
                required
                className="w-full bg-[#1A1A1A] text-[#F5F5F0] border-b border-[#2A2A2A] px-12 py-4 focus:outline-none focus:border-[#D4AF37] focus:bg-[#222] transition-colors placeholder:text-[#444]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-[#A0A0A0] uppercase tracking-widest block font-medium">Service Selection</label>
            <div className="relative">
              <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full bg-[#1A1A1A] text-[#F5F5F0] border-b border-[#2A2A2A] px-12 py-4 focus:outline-none focus:border-[#D4AF37] focus:bg-[#222] transition-colors appearance-none cursor-pointer"
              >
                {SERVICE_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-[#111111] text-[#F5F5F0]">
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-8 bg-[#D4AF37] text-[#111111] uppercase tracking-widest text-sm font-semibold py-4 hover:bg-[#E6C875] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Add to Queue
                <Play className="w-3 h-3 fill-current" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Waiting List Panel */}
      <div className="bg-[#F5F5F0] w-full lg:w-2/3 border border-[#E5E5E0] shadow-xl p-10 min-h-[600px]">
        <div className="flex items-end justify-between mb-10 pb-6 border-b border-[#E5E5E0]">
          <div>
            <h2 className="text-4xl font-serif text-[#111111] mb-2">Waiting Lounge</h2>
            <p className="text-sm text-[#666666] tracking-widest uppercase">Current Queue</p>
          </div>
          <div className="text-right">
            <span className="text-5xl font-serif text-[#D4AF37] font-light leading-none">
              {queue.length}
            </span>
            <p className="text-[10px] text-[#666666] tracking-widest uppercase mt-2">Waiting</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-[#D4AF37]">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-sm text-[#666666] uppercase tracking-widest">Loading Queue...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {queue.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 border border-dashed border-[#CCCCCC]"
                >
                  <p className="text-[#666666] font-serif text-xl italic mb-2">The lounge is empty</p>
                  <p className="text-xs text-[#999999] uppercase tracking-widest">Awaiting new arrivals</p>
                </motion.div>
              ) : (
                queue.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="group bg-white border border-[#E5E5E0] p-6 hover:border-[#D4AF37] transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-[#F5F5F0] flex items-center justify-center text-[#D4AF37] font-serif text-xl border border-[#E5E5E0] group-hover:bg-[#111111] transition-colors">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-serif text-[#111111] capitalize mb-1">
                          {item.customer_name}
                        </h3>
                        <p className="text-xs text-[#666666] uppercase tracking-wider flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full inline-block"></span>
                          {item.service_type}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[#999999]">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-mono">
                        {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
```

## src/App.tsx
```tsx
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
import { Play, CheckCircle, Trash2, Monitor, Scissors, UserPlus, Phone, Loader2, User, Clock, ChevronRight } from 'lucide-react';

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
type Role = "receptionist" | "stylist";

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
}

const SERVICE_TYPES = [
  "Classic Cut",
  "Hot Towel Shave",
  "Beard Sculpting",
  "Executive Grooming",
  "Color Treatment"
];

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
      const isReceptionist = formattedName.toLowerCase().includes('reception');
      
      await addDoc(collection(db, "stylists"), {
        name: formattedName,
        active: !isReceptionist,
        role: isReceptionist ? 'receptionist' : 'stylist',
        password: createPassword // Storing password in plain text for prototype demo purposes
      });
      setSuccess(`${isReceptionist ? 'Receptionist' : 'Stylist'} ${username} registered successfully!`);
      setTimeout(() => {
        setMode('login');
        setCreatePassword('');
        setConfirmPassword('');
      }, 2000);
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col md:flex-row items-center justify-center p-6 relative gap-10">
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] invert"></div>
      

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
            <label className="text-xs font-sans text-gray-500 uppercase tracking-widest">{mode === 'login' ? 'Username' : 'New Stylist Name'}</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#E5E5E0] rounded-sm px-4 py-3 focus:outline-none focus:border-[#D4AF37] transition-all text-[#111111] font-sans"
              placeholder={mode === 'login' ? "Enter username" : "Enter preferred display name"}
              required
            />
          </div>
          
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
            {mode === 'login' ? 'Authenticate' : 'Register Stylist'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<"reception" | "staff" | "tv">("reception");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  
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
    }
  }, [user, view]);

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

  const isDarkView = view === 'tv' || view === 'staff';

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
              {user?.role === "receptionist" && (
                <button
                  onClick={() => setView("reception")}
                  className={`flex items-center gap-2 px-6 py-2 rounded-sm text-sm font-medium transition-all duration-300 cursor-pointer ${
                    view === "reception" 
                      ? "bg-[#111111] text-[#D4AF37] shadow-md" 
                      : isDarkView ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  RECEPTION
                </button>
              )}
              {user?.role === "stylist" && (
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
            {view === "reception" && (
              <ReceptionDashboard key="reception" tickets={tickets} />
            )}
            {view === "staff" && user && (
              <StaffLineView key="staff" tickets={tickets} user={user} />
            )}
            {view === "tv" && (
              <TVDisplay key="tv" tickets={tickets} onExit={() => setView(user ? (user.role === 'stylist' ? 'staff' : 'reception') : 'reception')} />
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
    </div>
  );
}

// ---------------------------------------------------------
// RECEPTION DASHBOARD COMPONENT
// ---------------------------------------------------------
const ReceptionDashboard: React.FC<{ tickets: Ticket[] }> = ({ tickets }) => {
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto w-full grid grid-cols-1 xl:grid-cols-12 gap-10 flex-1"
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

        <div className="bg-white border border-[#111111] p-8 rounded-sm shadow-xl flex-1">
          <h2 className="text-xl font-serif text-[#111111] mb-6 border-b border-[#E5E5E0] pb-4 tracking-wide">
            Stylists On Duty
          </h2>
          
          <form onSubmit={handleAddStylist} className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={newStylistName}
              onChange={(e) => setNewStylistName(e.target.value)}
              className="flex-1 bg-[#F5F5F0] border border-[#E5E5E0] rounded-sm px-4 py-2 focus:outline-none focus:border-[#D4AF37] transition-all text-[#111111] placeholder-gray-500 font-sans text-sm"
              placeholder="Add stylist name..."
              required
            />
            <button 
              type="submit"
              className="bg-[#111111] hover:bg-[#2A2A2A] text-white font-sans text-xs tracking-widest uppercase py-2 px-4 rounded-sm transition-colors"
            >
              Add
            </button>
          </form>

          <div className="space-y-3 overflow-y-auto max-h-[200px] pr-2 hide-scrollbar">
            {stylists.length === 0 ? (
              <p className="text-gray-500 font-serif italic text-sm text-center py-4">No stylists registered.</p>
            ) : (
              stylists.map(stylist => (
                <div key={stylist.id} className="flex items-center justify-between p-3 border border-[#E5E5E0] rounded-sm bg-[#F5F5F0]">
                  <span className="font-sans font-medium text-[#111111] text-sm">{stylist.name}</span>
                  <button 
                    onClick={() => toggleStylistActive(stylist.id, stylist.active)}
                    className={`text-xs uppercase tracking-widest px-3 py-1 rounded-sm border transition-colors ${
                      stylist.active 
                        ? 'bg-[#D4AF37] text-[#111111] border-[#D4AF37]' 
                        : 'bg-white text-gray-500 border-[#E5E5E0] hover:border-gray-400'
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
                        className="bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#111111] p-2 rounded-sm transition-colors border border-[#D4AF37]/20"
                        title="Seat Client"
                      >
                        <Play className="w-4 h-4 ml-0.5" />
                      </button>
                      <button 
                        onClick={() => deleteTicket(ticket.docId)}
                        className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white p-2 rounded-sm transition-colors border border-red-200"
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
                        onClick={() => updateStatus(ticket.docId, "Completed")}
                        className="flex items-center gap-2 bg-white border border-[#E5E5E0] text-gray-500 hover:text-[#111111] hover:border-[#D4AF37] px-4 py-2 rounded-sm transition-colors font-sans text-xs uppercase tracking-widest"
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
// STAFF LINE VIEW COMPONENT
// ---------------------------------------------------------
const StaffLineView: React.FC<{ tickets: Ticket[], user: User }> = ({ tickets, user }) => {
  const handleAcceptCustomer = async (ticketId: string) => {
    try {
      await updateDoc(doc(db, "tickets", ticketId), { 
        status: "Serving",
        stylistName: user.name 
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
                   ) : (
                     <div className="bg-[#111111]/10 px-6 py-3 rounded-sm font-sans text-xs uppercase tracking-widest font-bold text-[#111111] whitespace-nowrap">
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

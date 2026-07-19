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

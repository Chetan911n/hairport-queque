import React, { useState } from 'react';
import { X, Dumbbell, Send, CheckCircle } from 'lucide-react';
import { gymDetails } from '../data/gymData';
import { saveAppointmentToSupabase } from '../data/supabaseClient';

export default function BookingModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    program: 'Classic Gym Training',
    date: new Date().toISOString().split('T')[0],
    time: '06:00 PM'
  });
  const [status, setStatus] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    // Attempt Supabase live database sync
    await saveAppointmentToSupabase({
      name: formData.name,
      phone: formData.phone,
      service: formData.program,
      date: formData.date,
      time: formData.time
    });

    setStatus('success');

    // Direct WhatsApp Message Trigger for instant enquiry confirmation
    const whatsappMsg = `Hi M Square Fitness! I want to enquire about gym membership & rates.%0A%0A*Name:* ${encodeURIComponent(formData.name)}%0A*Phone:* ${encodeURIComponent(formData.phone)}%0A*Program:* ${encodeURIComponent(formData.program)}%0A*Preferred Date:* ${encodeURIComponent(formData.date)}%0A*Time Slot:* ${encodeURIComponent(formData.time)}`;
    
    setTimeout(() => {
      window.open(`https://wa.me/${gymDetails.whatsapp}?text=${whatsappMsg}`, '_blank');
      onClose();
      setStatus(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card rounded-2xl max-w-lg w-full p-6 sm:p-8 relative border border-[#ff5500]/40 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#ff5500] mb-1">
            <Dumbbell className="w-4 h-4" />
            MEMBERSHIP & RATE ENQUIRY
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Enquire Membership Rates
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Get instant membership rates, personal training packages, and steam bath schedule.
          </p>
        </div>

        {status === 'success' ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#ff5500]/20 border border-[#ff5500] flex items-center justify-center mx-auto text-[#ff5500]">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Enquiry Submitted!</h3>
            <p className="text-gray-300 text-xs max-w-xs mx-auto">
              Redirecting you to M Square WhatsApp (+91 77750 77653) for instant membership rates...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                Program / Interest
              </label>
              <select
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                className="w-full bg-[#151722] border border-gray-700 rounded-lg px-4 py-3 text-white text-xs outline-none focus:border-[#ff5500]"
              >
                <option value="1 Month Starter Membership (₹3,000)">1 Month Membership (₹3,000)</option>
                <option value="3 Months Membership (₹6,000)">3 Months Membership (₹6,000)</option>
                <option value="6 Months Crown Club (₹10,000)">6 Months Crown Club (₹10,000)</option>
                <option value="12 Months Elite VIP (₹15,000)">12 Months Elite VIP (₹15,000)</option>
                <option value="16 Months Mega Offer (₹15,000)">16 Months Mega Offer (₹15,000)</option>
                <option value="Personal Training (1-on-1)">Personal Training (1-on-1)</option>
                <option value="Steam Bath Recovery">Steam Bath Recovery</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-[#151722] border border-gray-700 rounded-lg px-4 py-3 text-white text-xs outline-none focus:border-[#ff5500]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Preferred Time Slot
                </label>
                <select
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full bg-[#151722] border border-gray-700 rounded-lg px-4 py-3 text-white text-xs outline-none focus:border-[#ff5500]"
                >
                  <option value="06:00 AM">06:00 AM (Morning Batch)</option>
                  <option value="09:00 AM">09:00 AM (Midday)</option>
                  <option value="05:00 PM">05:00 PM (Peak Evening)</option>
                  <option value="08:00 PM">08:00 PM (Late Evening)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Verma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#151722] border border-gray-700 rounded-lg px-4 py-3 text-white text-xs outline-none focus:border-[#ff5500]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+91 77750 77653"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#151722] border border-gray-700 rounded-lg px-4 py-3 text-white text-xs outline-none focus:border-[#ff5500]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="gold-glow-btn w-full py-4 rounded-lg text-xs uppercase tracking-widest font-extrabold flex items-center justify-center gap-2 mt-4"
            >
              <Send className="w-4 h-4" />
              {status === 'submitting' ? 'Submitting...' : 'Submit Enquiry'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, CheckCircle, Send, Dumbbell } from 'lucide-react';
import { gymDetails } from '../data/gymData';
import { saveAppointmentToSupabase } from '../lib/supabase';

export default function BookingModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    program: '1-Day Free Trial Pass',
    date: new Date().toISOString().split('T')[0],
    time: '5:00 PM – 7:00 PM',
    name: '',
    phone: ''
  });
  const [status, setStatus] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    // Attempt Supabase live database sync
    const res = await saveAppointmentToSupabase({
      name: formData.name,
      phone: formData.phone,
      service: formData.program,
      date: formData.date,
      time: formData.time
    });

    setStatus('success');

    // Direct WhatsApp Message Trigger for instant booking confirmation
    const whatsappMsg = `Hi M Square Fitness! I want to claim my Free Trial Pass.%0A%0A*Name:* ${encodeURIComponent(formData.name)}%0A*Phone:* ${encodeURIComponent(formData.phone)}%0A*Program:* ${encodeURIComponent(formData.program)}%0A*Preferred Date:* ${encodeURIComponent(formData.date)}%0A*Time Slot:* ${encodeURIComponent(formData.time)}`;
    
    setTimeout(() => {
      window.open(`https://wa.me/${gymDetails.whatsapp}?text=${whatsappMsg}`, '_blank');
      onClose();
      setStatus(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card rounded-2xl max-w-lg w-full p-6 sm:p-8 relative border border-[#d4af37]/40 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#d4af37] mb-1">
            <Dumbbell className="w-4 h-4" />
            FREE TRIAL PASS
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Claim Your 1-Day Trial
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Experience our heavy gym floor, cardio zone, and sauna recovery for free!
          </p>
        </div>

        {status === 'success' ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#d4af37]/20 border border-[#d4af37] flex items-center justify-center mx-auto text-[#f3d266]">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Trial Pass Requested!</h3>
            <p className="text-gray-300 text-xs max-w-xs mx-auto">
              Redirecting you to M Square WhatsApp (+91 77750 77653) for instant pass confirmation...
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
                className="w-full bg-[#151722] border border-gray-700 rounded-lg px-4 py-3 text-white text-xs outline-none focus:border-[#d4af37]"
                required
              >
                <option>1-Day Free Trial Pass</option>
                <option>Heavy Gym & Strength Training</option>
                <option>1-on-1 Personal Coaching</option>
                <option>Zumba & Aerobics Pass</option>
                <option>Sauna & Steam Bath Recovery</option>
                <option>FREE Pickup & Drop Shuttle Inquiry</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-[#151722] border border-gray-700 rounded-lg px-4 py-3 text-white text-xs outline-none focus:border-[#d4af37]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Time Slot
                </label>
                <select
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full bg-[#151722] border border-gray-700 rounded-lg px-4 py-3 text-white text-xs outline-none focus:border-[#d4af37]"
                  required
                >
                  <option>6:00 AM – 8:00 AM</option>
                  <option>8:00 AM – 10:00 AM</option>
                  <option>10:00 AM – 12:00 PM</option>
                  <option>5:00 PM – 7:00 PM</option>
                  <option>7:00 PM – 10:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#151722] border border-gray-700 rounded-lg px-4 py-3 text-white text-xs outline-none focus:border-[#d4af37]"
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
                className="w-full bg-[#151722] border border-gray-700 rounded-lg px-4 py-3 text-white text-xs outline-none focus:border-[#d4af37]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="gold-glow-btn w-full py-4 rounded-lg text-xs uppercase tracking-widest font-extrabold flex items-center justify-center gap-2 mt-4"
            >
              <Send className="w-4 h-4" />
              {status === 'submitting' ? 'Confirming...' : 'Claim Free Trial Pass'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

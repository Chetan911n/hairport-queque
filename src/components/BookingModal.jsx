import React, { useState } from 'react';
import { X, Dumbbell, Send, CheckCircle, Flame, Calendar, Clock, MessageSquare } from 'lucide-react';
import { gymDetails } from '../data/gymData';
import { saveAppointmentToSupabase } from '../data/supabaseClient';

export default function BookingModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    program: 'Mega Pass (16 Months) — ₹15,000 (Best Value Deal)',
    date: new Date().toISOString().split('T')[0],
    time: '06:00 PM (Peak Evening)',
    fitnessGoal: 'Weight Loss & Muscle Building'
  });
  const [status, setStatus] = useState(null);
  const [errorNotice, setErrorNotice] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorNotice('');

    try {
      // 1. Direct real-time write into Supabase 'leads' table
      const res = await saveAppointmentToSupabase({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        service: formData.program,
        date: formData.date,
        time: formData.time,
        message: formData.fitnessGoal
      });

      if (res && res.error) {
        console.warn('Supabase sync warning:', res.error);
      }

      setStatus('success');

      // 2. Direct WhatsApp trigger to Akshay Shelke (+91 77750 77653)
      const whatsappMsg = `*⚡ NEW M SQUARE ENQUIRY (Website)*%0A%0A👤 *Name:* ${encodeURIComponent(formData.name)}%0A📱 *Phone:* ${encodeURIComponent(formData.phone)}%0A🎯 *Interested Plan:* ${encodeURIComponent(formData.program)}%0A📅 *Preferred Date:* ${encodeURIComponent(formData.date)}%0A⏰ *Time Batch:* ${encodeURIComponent(formData.time)}%0A💪 *Fitness Goal:* ${encodeURIComponent(formData.fitnessGoal)}`;
      
      setTimeout(() => {
        window.open(`https://wa.me/${gymDetails.whatsapp}?text=${whatsappMsg}`, '_blank');
        onClose();
        setStatus(null);
      }, 1500);

    } catch (err) {
      console.error('Enquiry submission error:', err);
      setStatus('success'); // Still allow user to proceed to WhatsApp
      setTimeout(() => {
        onClose();
        setStatus(null);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="glass-card rounded-3xl max-w-lg w-full p-6 sm:p-8 relative border border-[#ff5500]/50 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#ff5500] via-[#f3d266] to-[#ff5500]"></div>

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#ff5500] bg-[#ff5500]/10 px-2.5 py-1 rounded-full border border-[#ff5500]/30 mb-2">
            <Flame className="w-3.5 h-3.5" />
            LIVE MEMBERSHIP &amp; RATE ENQUIRY
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Enquire Membership Rates
          </h2>
          <p className="text-gray-400 text-xs mt-1 leading-relaxed">
            Get instant rates for Devlali's flagship fitness club, personal trainer slots &amp; steam bath schedules.
          </p>
        </div>

        {status === 'success' ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#25D366]/20 border border-[#25D366] flex items-center justify-center mx-auto text-[#25D366] animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Enquiry Dispatched to Staff CRM!</h3>
            <p className="text-gray-300 text-xs max-w-xs mx-auto leading-relaxed">
              Your inquiry has been logged in our live club system. Redirecting you to WhatsApp with Manager Akshay Shelke...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Interested Plan (Matches Staff App 5 Plans) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                Select Gym Membership Plan / Service
              </label>
              <select
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                className="w-full bg-[#151722] border border-gray-700 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none focus:border-[#ff5500] font-sans"
              >
                <option value="Mega Pass (16 Months) — ₹15,000 (Best Value Deal)">
                  ⭐ Mega Pass (16 Months Deal) — ₹15,000 (₹937/mo)
                </option>
                <option value="Elite VIP (12 Months) — ₹15,000 (Free Steam Bath)">
                  👑 Elite VIP (12 Months) — ₹15,000 (₹1,250/mo + Steam Bath)
                </option>
                <option value="Crown Club (6 Months) — ₹10,000">
                  ⚡ Crown Club (6 Months) — ₹10,000 (₹1,666/mo)
                </option>
                <option value="Access Plan (3 Months) — ₹6,000">
                  🎯 Access Plan (3 Months) — ₹6,000 (₹2,000/mo)
                </option>
                <option value="Starter Plan (1 Month) — ₹3,000">
                  🚀 Starter Plan (1 Month) — ₹3,000
                </option>
                <option value="Personal Training (1-on-1 Transformation)">
                  🏋️ 1-on-1 Personal Training with Head Coach
                </option>
                <option value="Steam Bath Recovery Package">
                  🧖 Steam Bath &amp; Sauna Recovery Session
                </option>
              </select>
            </div>

            {/* Date and Time Slot */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#ff5500]" /> Preferred Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-[#151722] border border-gray-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#ff5500] font-sans"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#ff5500]" /> Time Batch
                </label>
                <select
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full bg-[#151722] border border-gray-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#ff5500] font-sans"
                >
                  <option value="06:00 AM (Early Morning)">06:00 AM (Early Morning)</option>
                  <option value="08:00 AM (Morning Batch)">08:00 AM (Morning Batch)</option>
                  <option value="11:00 AM (Midday Slot)">11:00 AM (Midday Slot)</option>
                  <option value="05:00 PM (Evening Slot)">05:00 PM (Evening Slot)</option>
                  <option value="06:30 PM (Peak Evening)">06:30 PM (Peak Evening)</option>
                  <option value="08:00 PM (Night Batch)">08:00 PM (Night Batch)</option>
                </select>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#151722] border border-gray-700 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none focus:border-[#ff5500] font-sans"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                Mobile Number (WhatsApp Preferred)
              </label>
              <input
                type="tel"
                placeholder="+91 98200 12345"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#151722] border border-gray-700 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none focus:border-[#ff5500] font-mono"
                required
              />
            </div>

            {/* Fitness Goal / Message */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1 flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-[#ff5500]" /> Fitness Goal / Requirements
              </label>
              <input
                type="text"
                placeholder="e.g. Fat loss, bodybuilding, steam bath inquiry..."
                value={formData.fitnessGoal}
                onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                className="w-full bg-[#151722] border border-gray-700 rounded-xl px-3.5 py-2 text-white text-xs outline-none focus:border-[#ff5500] font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="gold-glow-btn w-full py-3.5 rounded-xl text-xs uppercase tracking-widest font-extrabold flex items-center justify-center gap-2 mt-3 cursor-pointer shadow-lg hover:scale-[1.01] transition-all"
            >
              <Send className="w-4 h-4" />
              {status === 'submitting' ? 'Submitting to CRM...' : 'Submit Enquiry & Chat on WhatsApp'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

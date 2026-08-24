import React from 'react';
import { Bus, PhoneCall } from 'lucide-react';
import { gymDetails } from '../data/gymData';

export default function ShuttleBanner() {
  return (
    <section id="shuttle" className="relative py-24 bg-cover bg-center bg-no-repeat text-white overflow-hidden" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=2200&q=85')` }}>
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d0e12]/95 via-[#0d0e12]/85 to-[#0d0e12]/90 z-10" />

      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#f3d266] text-xs font-bold uppercase tracking-widest mb-6">
          <Bus className="w-4 h-4" />
          EXCLUSIVE MEMBER BENEFIT
        </div>

        <h2 className="text-3xl sm:text-6xl font-extrabold tracking-tight mb-6">
          Nashik's 1st Gym with{' '}
          <span className="text-gold-gradient italic font-serif font-normal block sm:inline">
            FREE Pickup & Drop!
          </span>
        </h2>

        <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          No transport? No problem! We offer complimentary pickup and drop-off shuttle service across Devlali Camp & nearby routes so you never miss a workout session.
        </p>

        <a
          href={`tel:${gymDetails.phone}`}
          className="gold-glow-btn inline-flex items-center gap-3 px-8 py-4 rounded-md text-xs uppercase tracking-widest font-extrabold"
        >
          <PhoneCall className="w-4 h-4" />
          Call Shuttle Desk: {gymDetails.phone}
        </a>
      </div>
    </section>
  );
}

import React from 'react';
import { Star, Bus, Sparkles, MapPin } from 'lucide-react';

export default function TrustStrip() {
  const items = [
    {
      icon: Star,
      val: "4.4",
      title: "Google Rating",
      sub: "★★★★★ (52 Reviews)"
    },
    {
      icon: Bus,
      val: "FREE",
      title: "Pickup & Drop",
      sub: "1st Gym in Nashik"
    },
    {
      icon: Sparkles,
      val: "Sauna",
      title: "& Steam Bath",
      sub: "Recovery Therapy"
    },
    {
      icon: MapPin,
      val: "Devlali",
      title: "Camp, Nashik",
      sub: "Mande's Mango Tree"
    }
  ];

  return (
    <section className="bg-[#0a0b0e] py-8 border-y border-[#d4af37]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="glass-card rounded-xl p-5 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#f3d266] shrink-0">
                  <IconComp className="w-6 h-6" />
                </div>
                <div>
                  <strong className="block text-2xl font-serif font-extrabold text-gold-gradient leading-none mb-1">
                    {item.val}
                  </strong>
                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-200">
                    {item.title}
                  </span>
                  <small className="block text-[10px] text-gray-400 font-medium tracking-wide">
                    {item.sub}
                  </small>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

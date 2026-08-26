import React from 'react';
import { Star, Flame, Dumbbell, MapPin } from 'lucide-react';

export default function TrustStrip() {
  const items = [
    {
      icon: Star,
      val: "4.4",
      title: "Google Rating",
      sub: "★★★★★ (52 Verified Reviews)"
    },
    {
      icon: Flame,
      val: "Steam",
      title: "Bath Recovery",
      sub: "Muscle Relaxation"
    },
    {
      icon: Dumbbell,
      val: "Crossfit",
      title: "& Heavy Strength",
      sub: "Modern Gym Floor"
    },
    {
      icon: MapPin,
      val: "Devlali",
      title: "Camp, Nashik",
      sub: "Mahalaxmi Road, Naka No. 6"
    }
  ];

  return (
    <section className="bg-[#0a0b0e] py-8 border-y border-[#ff5500]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="glass-card rounded-xl p-5 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-[#ff5500]/15 border border-[#ff5500]/40 flex items-center justify-center text-[#ff5500] shrink-0">
                  <IconComp className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold text-white tracking-tight">
                      {item.val}
                    </span>
                    <span className="text-xs font-bold text-[#ff5500] uppercase tracking-wider">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                    {item.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

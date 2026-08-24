import React from 'react';
import { Dumbbell, ShieldCheck, Flame, HeartPulse, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Equipment() {
  const equipmentItems = [
    {
      icon: Dumbbell,
      title: "Heavy Plate-Loaded Machines",
      desc: "Commercial pin-selected lat pulldowns, chest press, leg press, hack squats & cable crossover stations.",
      tag: "Biomechanic Precision"
    },
    {
      icon: ShieldCheck,
      title: "Olympic Free Weights & Dumbbells",
      desc: "Full dumbbell racks (2kg to 40kg+), Olympic barbells, bumper plates, and adjustable bench stations.",
      tag: "Heavy Strength"
    },
    {
      icon: HeartPulse,
      title: "Commercial Cardio Suite",
      desc: "Motorized treadmills with heart-rate monitoring, elliptical cross-trainers, and spinning bikes.",
      tag: "High Stamina"
    },
    {
      icon: Flame,
      title: "Powerlifting & Functional Rig",
      desc: "Heavy-duty power cages, smith machines, pull-up bars, battle ropes, and kettlebells.",
      tag: "Core & Athletic"
    },
    {
      icon: Sparkles,
      title: "Sauna & Steam Recovery Suite",
      desc: "Hot steam spa room designed for post-workout muscle relaxation and body detoxification.",
      tag: "Spa Recovery"
    },
    {
      icon: CheckCircle2,
      title: "Sanitized & Rubber Floored",
      desc: "Daily sanitized equipment, non-slip shock-absorbing rubber flooring, and spacious workout layout.",
      tag: "Hygiene Standard"
    }
  ];

  return (
    <section id="equipment" className="py-20 bg-[#0d0e12] text-white border-t border-[#d4af37]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37] block mb-3">
            STATE-OF-THE-ART GYM FLOOR
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            World-Class <em className="text-gold-gradient italic font-serif">Equipment & Machinery</em>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Engineered for performance, safety, and max biomechanic activation across all fitness levels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {equipmentItems.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="glass-card rounded-2xl p-8 relative flex flex-col justify-between group hover:border-[#d4af37]"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#f3d266] group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#f3d266] bg-[#d4af37]/10 px-3 py-1 rounded-full border border-[#d4af37]/30">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#f3d266] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-800/80 flex items-center gap-2 text-xs text-[#d4af37] font-semibold">
                  <span>Available on Main Gym Floor</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

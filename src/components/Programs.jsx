import React from 'react';
import { ArrowRight } from 'lucide-react';
import { verifiedRates } from '../data/gymData';

export default function Programs({ onOpenTrialModal }) {
  return (
    <section id="programs" className="py-20 bg-[#10121a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37] block mb-3">
            WORLD-CLASS OFFERINGS
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Fitness Programs & <em className="text-gold-gradient italic font-serif">Wellness Services</em>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Customized training regimens, group fitness energy, and full-body recovery under one roof.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {verifiedRates.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-2xl overflow-hidden group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-[#0d0e12]/90 backdrop-blur-md px-3 py-1 rounded-full border border-[#d4af37]/40 text-[10px] font-bold uppercase tracking-wider text-[#f3d266]">
                    {item.tag}
                  </div>
                </div>

                <div className="p-6">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#d4af37] block mb-2">
                    {item.category}
                  </span>

                  <h3 className="text-xl font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-0">
                <button
                  onClick={onOpenTrialModal}
                  className="w-full py-3.5 rounded-lg border border-[#d4af37]/40 hover:bg-[#d4af37] hover:text-[#0d0e12] text-[#f3d266] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  Claim Free Trial Pass
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

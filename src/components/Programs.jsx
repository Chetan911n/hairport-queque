import React from 'react';
import { ArrowRight } from 'lucide-react';
import { officialServices } from '../data/gymData';

export default function Programs({ onOpenTrialModal }) {
  return (
    <section id="services" className="py-20 bg-[#10121a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#ff5500] block mb-3">
            OUR OFFICIAL SERVICES
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Fitness & <em className="text-gold-gradient italic font-serif">Wellness Services</em>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Customized training regimens, heavy strength floor, crossfit rigs, diet orientation, and relaxing steam bath recovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {officialServices.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-2xl overflow-hidden group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    onError={(e) => { if (item.fallback) e.target.src = item.fallback; }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-[#0d0e12]/90 backdrop-blur-md px-3 py-1 rounded-full border border-[#ff5500]/40 text-[10px] font-bold uppercase tracking-wider text-[#ff5500]">
                    {item.tag}
                  </div>
                </div>

                <div className="p-6">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ff5500] block mb-2">
                    MSQUARE SERVICE
                  </span>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#ff5500] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={onOpenTrialModal}
                  className="w-full border border-[#ff5500]/50 text-white hover:bg-[#ff5500] hover:border-[#ff5500] py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(255,85,0,0.4)]"
                >
                  Enquire Service Rate
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

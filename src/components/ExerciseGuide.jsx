import React from 'react';
import { Dumbbell, Target, Info } from 'lucide-react';
import { exerciseGuides } from '../data/gymData';

export default function ExerciseGuide() {
  return (
    <section id="exercise-guide" className="py-20 bg-[#0d0e12] text-white border-t border-[#ff5500]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#ff5500] block mb-3">
            DIGITAL TRAINING LAB & FORM GUIDE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Master Your <em className="text-gold-gradient italic font-serif">Movement Technique</em>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Expert biomechanic cues and exercise tips curated by M Square certified personal coaches.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {exerciseGuides.map((ex, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl overflow-hidden group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={ex.image}
                    alt={ex.title}
                    onError={(e) => { if (ex.fallback) e.target.src = ex.fallback; }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-[#0d0e12]/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#ff5500]/40 text-[9px] font-extrabold uppercase tracking-wider text-[#ff5500]">
                    {ex.category}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#ff5500] transition-colors">
                    {ex.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-[#ff5500] font-semibold mb-3">
                    <Target className="w-3.5 h-3.5" />
                    <span>Target: {ex.target}</span>
                  </div>

                  <p className="text-gray-400 text-xs leading-relaxed">
                    {ex.tip}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-gray-800 flex items-center gap-1.5 text-[11px] text-gray-400">
                  <Info className="w-3.5 h-3.5 text-[#ff5500]" />
                  <span>Coach Approved Technique</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

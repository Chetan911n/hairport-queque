import React from 'react';
import { Star, ChevronRight, Bus, Dumbbell } from 'lucide-react';
import { gymDetails } from '../data/gymData';

export default function Hero({ onOpenTrialModal }) {
  return (
    <section className="relative h-screen min-h-screen flex items-center justify-center pt-20 pb-12 overflow-hidden">
      {/* Background Image with Dark Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2200&q=85')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0e12] via-[#0d0e12]/80 to-[#0d0e12]/60 z-10" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#f3d266] text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
            DEVLALI CAMP · NASHIK
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] mb-6">
            Transform Your Body.{' '}
            <span className="block text-gold-gradient italic font-serif font-normal">
              Elevate Your Life.
            </span>
          </h1>

          {/* Copy */}
          <p className="text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed mb-8">
            Nashik’s premier fitness centre featuring heavy strength machinery, steam & sauna recovery, certified personal coaching, and <strong className="text-[#f3d266]">FREE pickup & drop facility</strong>.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenTrialModal}
              className="gold-glow-btn px-7 py-4 rounded-md font-bold uppercase tracking-wider text-xs flex items-center gap-2"
            >
              Claim Free Trial Pass
              <ChevronRight className="w-4 h-4" />
            </button>
            <a
              href="#programs"
              className="px-7 py-4 rounded-md border border-gray-400 text-white hover:border-[#d4af37] hover:text-[#f3d266] transition-all font-bold uppercase tracking-wider text-xs"
            >
              Explore Programs
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <a
        href="#about"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-[10px] uppercase font-bold tracking-widest text-gray-400 hover:text-[#f3d266] transition-colors flex flex-col items-center gap-1 animate-bounce"
      >
        <span>SCROLL TO EXPLORE</span>
        <span className="text-base">↓</span>
      </a>
    </section>
  );
}

import React from 'react';
import { CheckCircle2, Zap, ArrowRight } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-20 bg-[#0b0c10] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Grid */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-[#ff5500]/30 group">
              <img
                src="/photos/official_gmaps_photo_1.jpg"
                alt="M Square Fitness Gym Floor"
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=85"; }}
                className="w-full h-[450px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Floating Highlight Card */}
            <div className="absolute -bottom-6 -right-4 sm:right-6 glass-card p-5 rounded-xl max-w-xs border border-[#ff5500]/50 hidden sm:block z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ff5500]/20 flex items-center justify-center text-[#ff5500]">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-sm text-white font-bold">Nashik's 1st Gym</strong>
                  <span className="text-xs text-[#ff5500]">With Free Shuttle Pickup & Drop</span>
                </div>
              </div>
            </div>
          </div>

          {/* Copy Content */}
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#ff5500] block mb-3">
              THE M SQUARE EXPERIENCE
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6">
              Built for your <em className="text-gold-gradient italic font-serif">fitness goals.</em>
            </h2>
            <p className="text-gray-300 text-base leading-relaxed mb-6">
              M Square Fitness & Wellness Club is Devlali Camp’s premier health and training destination. Equipped with heavy strength machinery, dedicated cardio zones, steam baths, and expert certified personal trainers.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              We believe fitness should be accessible and enjoyable for everyone — offering family-friendly workouts, ladies & gents floors, and exclusive free pickup & drop service.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                "Heavy Strength Machinery",
                "Sauna & Steam Bath Recovery",
                "1-on-1 Personal Coaching",
                "Zumba & Group Aerobics",
                "FREE Shuttle Service",
                "Custom Nutrition Counseling"
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-200">
                  <CheckCircle2 className="w-4 h-4 text-[#ff5500] shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <a
              href="#plans"
              className="gold-glow-btn px-7 py-4 rounded-lg font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2"
            >
              Explore Membership Packages
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { membershipPlans } from '../data/gymData';

export default function MembershipPlans({ onOpenTrialModal }) {
  return (
    <section id="plans" className="py-20 bg-[#0b0c10] text-white border-t border-[#ff5500]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#ff5500] block mb-3">
            SELECT YOUR MEMBERSHIP PLAN
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Membership Packages & <em className="text-gold-gradient italic font-serif">Inclusions</em>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Choose the membership tier that matches your goals. Every plan includes personal gym floor consultation and free pickup & drop shuttle access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {membershipPlans.map((plan) => (
            <div
              key={plan.id}
              className={`glass-card rounded-2xl p-8 relative flex flex-col justify-between ${
                plan.popular ? 'border-2 border-[#ff5500] shadow-[0_0_30px_rgba(255,85,0,0.35)] scale-105' : ''
              }`}
            >
              <div>
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#ff5500] text-white px-3.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
                    <Sparkles className="w-3 h-3 fill-white" />
                    MOST POPULAR
                  </div>
                )}

                <span className="text-xs font-bold uppercase tracking-widest text-[#ff5500] block mb-2">
                  {plan.duration}
                </span>

                <h3 className="text-2xl font-extrabold text-white mb-6">
                  {plan.title}
                </h3>

                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-300">
                      <Check className="w-4 h-4 text-[#ff5500] shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <button
                  onClick={onOpenTrialModal}
                  className={`w-full py-3.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'gold-glow-btn'
                      : 'border border-[#ff5500]/40 text-[#ff5500] hover:bg-[#ff5500] hover:text-white'
                  }`}
                >
                  {plan.cta}
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

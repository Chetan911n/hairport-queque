import React from 'react';
import { Check, ArrowRight, Sparkles, Flame, Tag } from 'lucide-react';
import { membershipPlans, megaOffers } from '../data/gymData';

export default function MembershipPlans({ onOpenTrialModal }) {
  return (
    <section id="plans" className="py-20 bg-[#0b0c10] text-white border-t border-[#ff5500]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#ff5500] block mb-3">
            OFFICIAL MEMBERSHIP RATES & PACKAGES
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Select Your <em className="text-gold-gradient italic font-serif">Membership Tier</em>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Transparent official pricing for M Square Fitness & Wellness Club in Devlali Camp. Flexible installment options available!
          </p>
        </div>

        {/* Mega Offers Banner */}
        <div className="mb-16 glass-card border-2 border-[#ff5500] rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-[#ff5500]/15 via-transparent to-[#ff5500]/10 relative overflow-hidden shadow-[0_0_30px_rgba(255,85,0,0.2)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#ff5500] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 shadow-md">
                <Tag className="w-3.5 h-3.5" />
                MEGA OFFERS & INSTALLMENTS AVAILABLE
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Special Limited-Time Membership Offers
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm mt-1">
                Flexible installment payments accepted. Enquire today for instant enrollment!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              {megaOffers.map((offer, idx) => (
                <div key={idx} className="bg-[#0b0c10]/90 border border-[#ff5500]/40 p-4 rounded-xl flex-1 md:flex-initial min-w-[200px]">
                  <span className="text-[10px] font-extrabold text-[#ff5500] uppercase tracking-wider block">
                    {offer.badge}
                  </span>
                  <strong className="block text-xl font-black text-white mt-1">
                    {offer.price}
                  </strong>
                  <span className="text-[11px] text-gray-300 block">
                    {offer.title}
                  </span>
                  <small className="text-[10px] text-gray-400 block mt-0.5">
                    {offer.note}
                  </small>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Membership Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {membershipPlans.map((plan) => (
            <div
              key={plan.id}
              className={`glass-card rounded-2xl p-8 relative flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1.5 ${
                plan.popular ? 'border-2 border-[#ff5500] shadow-[0_0_30px_rgba(255,85,0,0.35)] scale-105 z-10' : 'border border-gray-800'
              }`}
            >
              <div>
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#ff5500] text-white px-3.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
                    <Sparkles className="w-3 h-3 fill-white" />
                    {plan.badge}
                  </div>
                )}

                <span className="text-xs font-bold uppercase tracking-widest text-[#ff5500] block mb-1">
                  {plan.duration}
                </span>

                <h3 className="text-2xl font-extrabold text-white mb-3">
                  {plan.title}
                </h3>

                <div className="mb-6 pb-4 border-b border-gray-800">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs text-gray-400 font-medium ml-1">
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
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

import React from 'react';
import { Star, Quote } from 'lucide-react';
import { reviewsList, gymDetails } from '../data/gymData';

export default function Reviews() {
  return (
    <section id="reviews" className="py-20 bg-[#10121a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37] block mb-3">
            VERIFIED MEMBER REVIEWS
          </span>
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-2">
            {gymDetails.googleRating}{' '}
            <span className="text-gold-gradient font-serif italic text-3xl sm:text-5xl">
              ★★★★★
            </span>
          </h2>
          <p className="text-gray-400 text-sm">{gymDetails.reviewCount}+ Verified Google Reviews</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviewsList.map((rev, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-8 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-[#f3d266] mb-4">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#f3d266]" />
                  ))}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">"{rev.title}"</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-6 font-normal">
                  "{rev.comment}"
                </p>
              </div>
              <div className="pt-4 border-t border-gray-800 flex items-center justify-between text-xs">
                <span className="font-bold text-white">{rev.author}</span>
                <span className="text-[#d4af37] font-semibold">Verified Member</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="https://www.google.com/maps/place/M+Square+fitness+-+Premium+Fitness+Centre+in+Nashik"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#f3d266] hover:text-white transition-colors"
          >
            Read All Reviews on Google Maps <span>↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}

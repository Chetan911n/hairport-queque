import React, { useState, useEffect } from 'react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';

export default function QuotesBanner() {
  const fitnessQuotes = [
    {
      quote: "The body achieves what the mind believes.",
      author: "Napoleon Hill",
      tag: "MINDSET & DISCIPLINE"
    },
    {
      quote: "Discipline is choosing between what you want now and what you want most.",
      author: "Abraham Lincoln",
      tag: "DAILY CONSISTENCY"
    },
    {
      quote: "The only bad workout is the one that didn't happen.",
      author: "M Square Fitness Motto",
      tag: "ATHLETIC SPIRIT"
    },
    {
      quote: "Success starts with self-discipline and relentless effort.",
      author: "Dwayne 'The Rock' Johnson",
      tag: "PEAK PERFORMANCE"
    },
    {
      quote: "Pain is temporary. Glory and pride are forever.",
      author: "M Square Athletes",
      tag: "STRENGTH & RECOVERY"
    }
  ];

  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % fitnessQuotes.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [fitnessQuotes.length]);

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + fitnessQuotes.length) % fitnessQuotes.length);
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % fitnessQuotes.length);
  };

  return (
    <section className="py-16 bg-[#0b0c10] text-white border-y border-[#ff5500]/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient from-[#ff5500]/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="w-12 h-12 rounded-full bg-[#ff5500]/15 border border-[#ff5500]/40 flex items-center justify-center text-[#ff5500] mx-auto mb-6">
          <Quote className="w-6 h-6" />
        </div>

        <div className="min-h-[140px] flex flex-col justify-center items-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#ff5500] bg-[#ff5500]/10 px-3 py-1 rounded-full border border-[#ff5500]/30 mb-4 inline-block">
            {fitnessQuotes[currentIdx].tag}
          </span>

          <blockquote className="text-2xl sm:text-4xl font-extrabold italic tracking-tight leading-snug mb-4 max-w-3xl font-serif">
            "{fitnessQuotes[currentIdx].quote}"
          </blockquote>

          <cite className="text-xs font-bold uppercase tracking-wider text-gray-400 not-italic block">
            — {fitnessQuotes[currentIdx].author}
          </cite>
        </div>

        {/* Carousel Indicators & Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={handlePrev}
            className="w-9 h-9 rounded-full border border-gray-800 hover:border-[#ff5500] text-gray-400 hover:text-white flex items-center justify-center transition-all"
            aria-label="Previous Quote"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            {fitnessQuotes.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIdx ? 'w-8 bg-[#ff5500]' : 'w-2 bg-gray-800 hover:bg-gray-600'
                }`}
                aria-label={`Go to quote ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-9 h-9 rounded-full border border-gray-800 hover:border-[#ff5500] text-gray-400 hover:text-white flex items-center justify-center transition-all"
            aria-label="Next Quote"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

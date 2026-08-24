import React, { useState } from 'react';
import { galleryPhotos } from '../data/gymData';

export default function Gallery() {
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Strength', 'Cardio', 'Coaching', 'Steam Spa'];

  const filteredPhotos =
    activeTab === 'All'
      ? galleryPhotos
      : galleryPhotos.filter((item) => item.category === activeTab);

  return (
    <section id="gallery" className="py-20 bg-[#0d0e12] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37] block mb-3">
            INSIDE M SQUARE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Club Gallery & <em className="text-gold-gradient italic font-serif">Gym Vibe</em>
          </h2>
          <p className="text-gray-400 text-sm">
            Take a glance at our high-energy workout floor, cardio zone, and steam spa.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-[#d4af37] text-[#0d0e12] shadow-lg shadow-[#d4af37]/30'
                  : 'bg-[#151722] text-gray-400 border border-gray-800 hover:text-white hover:border-[#d4af37]/40'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredPhotos.map((photo, idx) => (
            <div
              key={idx}
              className="group relative aspect-square rounded-xl overflow-hidden glass-card"
            >
              <img
                src={photo.url}
                alt={`M Square Gym ${idx}`}
                onError={(e) => { if (photo.fallback) e.target.src = photo.fallback; }}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e12]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#f3d266]">
                  {photo.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

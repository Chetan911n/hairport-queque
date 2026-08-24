import React from 'react';
import { Instagram, Facebook, Dumbbell } from 'lucide-react';
import { gymDetails } from '../data/gymData';

export default function Footer() {
  return (
    <footer className="bg-[#07080a] text-gray-400 text-xs border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="M Square Fitness Logo"
                className="h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(255,85,0,0.5)]"
              />
              <div>
                <strong className="block text-white text-sm tracking-widest font-extrabold">
                  M SQUARE
                </strong>
                <small className="block text-[#ff5500] text-[8px] tracking-wider uppercase font-bold">
                  Fitness & Wellness Club
                </small>
              </div>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">
              Devlali Camp’s premier fitness destination featuring heavy strength machinery, steam spa, and FREE shuttle service.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#d4af37] mb-4">
              QUICK LINKS
            </p>
            <ul className="space-y-2">
              <li><a href="#programs" className="hover:text-white transition-colors">Programs & Services</a></li>
              <li><a href="#shuttle" className="hover:text-white transition-colors">Free Shuttle Service</a></li>
              <li><a href="#gallery" className="hover:text-white transition-colors">Club Gallery</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">About M Square</a></li>
              <li><a href="#reviews" className="hover:text-white transition-colors">Member Reviews</a></li>
            </ul>
          </div>

          {/* Operating Hours */}
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#d4af37] mb-4">
              OPERATING HOURS
            </p>
            <p className="text-white font-semibold mb-1">Monday — Sunday</p>
            <p className="text-gray-400 mb-3">6:00 AM — 10:00 PM</p>
            <p className="text-gray-500 text-[11px]">Peak Hours: 5 PM – 10 PM</p>
          </div>

          {/* Social & Contact */}
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#d4af37] mb-4">
              CONNECT WITH US
            </p>
            <div className="flex items-center gap-3 mb-4">
              <a
                href={gymDetails.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-[#d4af37] hover:text-[#0d0e12] flex items-center justify-center transition-colors text-white"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={gymDetails.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-[#d4af37] hover:text-[#0d0e12] flex items-center justify-center transition-colors text-white"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
            <p className="text-gray-400">Call: {gymDetails.phone}</p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-[11px]">
          <span>© 2026 M Square Fitness & Wellness Club®️. All rights reserved.</span>
          <span>Designed for High Performance</span>
        </div>
      </div>
    </footer>
  );
}

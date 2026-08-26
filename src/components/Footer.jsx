import React from 'react';
import { Instagram, Facebook } from 'lucide-react';
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
                  MSQUARE
                </strong>
                <small className="block text-[#ff5500] text-[8px] tracking-wider uppercase font-bold">
                  Fitness & Wellness Club
                </small>
              </div>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">
              Devlali Camp’s premier fitness destination featuring heavy strength machinery, crossfit zone, diet orientation, and relaxing steam bath recovery.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#ff5500] mb-4">
              QUICK LINKS
            </p>
            <ul className="space-y-2">
              <li><a href="#services" className="hover:text-white transition-colors">Official Services</a></li>
              <li><a href="#plans" className="hover:text-white transition-colors">Membership Packages</a></li>
              <li><a href="#equipment" className="hover:text-white transition-colors">Gym Machinery</a></li>
              <li><a href="#exercise-guide" className="hover:text-white transition-colors">Form Guide</a></li>
              <li><a href="#gallery" className="hover:text-white transition-colors">Club Gallery</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">About M Square</a></li>
            </ul>
          </div>

          {/* Operating Hours */}
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#ff5500] mb-4">
              OPERATING HOURS
            </p>
            <ul className="space-y-2">
              <li className="text-white font-bold">{gymDetails.hours}</li>
              <li className="text-[#ff5500]">Peak Hours: {gymDetails.peakHours}</li>
              <li className="pt-2 text-gray-500">Open for Ladies & Gents</li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#ff5500] mb-4">
              CONNECT WITH US
            </p>
            <p className="mb-2 text-gray-300">Manager: <span className="text-white font-bold">{gymDetails.managerName}</span></p>
            <p className="mb-4 text-gray-300">Call: <a href={`tel:${gymDetails.phone}`} className="text-white font-bold hover:text-[#ff5500]">{gymDetails.phone}</a></p>

            <div className="flex items-center gap-3">
              <a
                href={gymDetails.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#ff5500] hover:text-white flex items-center justify-center transition-colors text-gray-300"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={gymDetails.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#ff5500] hover:text-white flex items-center justify-center transition-colors text-gray-300"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-12 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-600">
          <p>© {new Date().getFullYear()} {gymDetails.name}. All Rights Reserved.</p>
          <p className="text-[11px]">Mahalaxmi Road, Devlali Camp, Nashik</p>
        </div>
      </div>
    </footer>
  );
}

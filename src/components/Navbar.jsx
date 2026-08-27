import React, { useState, useEffect } from 'react';
import { Menu, X, Dumbbell, Phone } from 'lucide-react';
import { gymDetails } from '../data/gymData';

export default function Navbar({ onOpenTrialModal }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'Membership Plans', href: '#plans' },
    { name: 'Equipment', href: '#equipment' },
    { name: 'Form Guide', href: '#exercise-guide' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'About', href: '#about' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0d0e12]/95 backdrop-blur-md border-b border-[#d4af37]/25 py-3 shadow-2xl'
          : 'bg-gradient-to-b from-[#0d0e12]/90 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#top" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="M Square Fitness Logo"
            className="h-11 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-[0_0_12px_rgba(255,85,0,0.5)]"
          />
          <div>
            <strong className="block text-white text-base tracking-widest font-extrabold">
              M SQUARE
            </strong>
            <small className="block text-[#ff5500] text-[9px] tracking-wider uppercase font-bold">
              Fitness & Wellness Club
            </small>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-gray-300">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="hover:text-[#f3d266] transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="https://m-square-fitness-app.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-md border border-gray-700/80 hover:border-[#ff5500] text-gray-300 hover:text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all bg-[#151722]/60"
            title="Open Staff Operating System"
          >
            <Dumbbell className="w-3.5 h-3.5 text-[#ff5500]" />
            Staff Portal
          </a>
          <a
            href={`tel:${gymDetails.phone}`}
            className="flex items-center gap-2 text-xs text-gray-300 hover:text-white px-3 py-2"
          >
            <Phone className="w-4 h-4 text-[#d4af37]" />
            <span className="hidden lg:inline">{gymDetails.phone}</span>
          </a>
          <button
            onClick={onOpenTrialModal}
            className="gold-glow-btn text-xs px-5 py-2.5 rounded-md font-bold uppercase tracking-wider"
          >
            Enquire Now
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white p-2"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-7 h-7 text-[#d4af37]" /> : <Menu className="w-7 h-7 text-white" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#14161f] border-b border-[#d4af37]/30 px-6 py-6 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm uppercase tracking-wider font-semibold text-gray-200 hover:text-[#f3d266]"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-4 border-t border-gray-800 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTrialModal();
              }}
              className="gold-glow-btn w-full text-center py-3 rounded-md font-bold uppercase tracking-wider text-xs"
            >
              Claim Free Trial Pass
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

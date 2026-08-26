import React from 'react';
import { Phone, MessageCircle, Navigation, MapPin, Clock, UserCheck } from 'lucide-react';
import { gymDetails } from '../data/gymData';

export default function ContactMap() {
  return (
    <section id="contact" className="py-20 bg-[#0d0e12] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Contact Details */}
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#ff5500] block mb-3">
              VISIT OUR CLUB
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6">
              Find us in <em className="text-gold-gradient italic font-serif">Devlali Camp.</em>
            </h2>

            <div className="space-y-6 mb-8 text-gray-300">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#ff5500]/15 border border-[#ff5500]/40 flex items-center justify-center text-[#ff5500] shrink-0 mt-1">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-white text-sm mb-1 font-bold">Address</strong>
                  <p className="text-xs leading-relaxed text-gray-400">
                    {gymDetails.address}<br />
                    <span className="text-[#ff5500] font-semibold">{gymDetails.landmark}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#ff5500]/15 border border-[#ff5500]/40 flex items-center justify-center text-[#ff5500] shrink-0 mt-1">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-white text-sm mb-1 font-bold">Club Management</strong>
                  <p className="text-xs text-gray-400">
                    Manager: <span className="text-white font-bold">{gymDetails.managerName}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#ff5500]/15 border border-[#ff5500]/40 flex items-center justify-center text-[#ff5500] shrink-0 mt-1">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-white text-sm mb-1 font-bold">Desk Phones</strong>
                  <p className="text-xs text-gray-400">
                    Main: <a href={`tel:${gymDetails.phone}`} className="text-white hover:text-[#ff5500] font-semibold">{gymDetails.phone}</a><br />
                    Direct: {gymDetails.alternatePhones.join(' · ')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#ff5500]/15 border border-[#ff5500]/40 flex items-center justify-center text-[#ff5500] shrink-0 mt-1">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-white text-sm mb-1 font-bold">Operating Hours</strong>
                  <p className="text-xs text-gray-400">
                    {gymDetails.hours}<br />
                    <span className="text-[#ff5500]">Peak Hours: {gymDetails.peakHours}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={`https://wa.me/${gymDetails.whatsapp}?text=Hi%20MSquare%20Fitness!%20I%20want%20to%20enquire%20about%20membership%20rates.`}
                target="_blank"
                rel="noopener noreferrer"
                className="gold-glow-btn px-6 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                WhatsApp Us Directly
              </a>
              <a
                href="https://www.google.com/maps/place/M+Square+fitness+-+Premium+Fitness+Centre+in+Nashik"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-lg border border-[#ff5500]/50 text-white hover:bg-[#ff5500] hover:text-white transition-all text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Get Directions
              </a>
            </div>
          </div>

          {/* Embedded Google Map */}
          <div className="h-[420px] rounded-2xl overflow-hidden glass-card border border-[#ff5500]/30 relative shadow-2xl">
            <iframe
              title="M Square Fitness Google Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3750.6015694200676!2d73.8441113!3d19.9405626!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bddeb6b509d3b1b%3A0x4a475d4a1324754!2sM%20Square%20fitness%20-%20Premium%20Fitness%20Centre%20in%20Nashik!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(0.2) contrast(1.1) invert(0.9) hue-rotate(180deg)' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

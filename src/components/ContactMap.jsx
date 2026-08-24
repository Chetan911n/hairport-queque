import React from 'react';
import { Phone, MessageCircle, Navigation, MapPin, Clock, Mail } from 'lucide-react';
import { gymDetails } from '../data/gymData';

export default function ContactMap() {
  return (
    <section id="contact" className="py-20 bg-[#0d0e12] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Contact Details */}
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37] block mb-3">
              VISIT OUR CLUB
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6">
              Find us in <em className="text-gold-gradient italic font-serif">Devlali Camp.</em>
            </h2>

            <div className="space-y-6 mb-8 text-gray-300">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#f3d266] shrink-0 mt-1">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-white text-sm mb-1 font-bold">Address</strong>
                  <p className="text-xs leading-relaxed text-gray-400">
                    {gymDetails.address}<br />
                    <span className="text-[#d4af37]">{gymDetails.landmark}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#f3d266] shrink-0 mt-1">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-white text-sm mb-1 font-bold">Desk Phones</strong>
                  <p className="text-xs text-gray-400">
                    Main: <a href={`tel:${gymDetails.phone}`} className="text-white hover:text-[#f3d266] font-semibold">{gymDetails.phone}</a><br />
                    Direct: {gymDetails.alternatePhones.join(' · ')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#f3d266] shrink-0 mt-1">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-white text-sm mb-1 font-bold">Operating Hours</strong>
                  <p className="text-xs text-gray-400">
                    Open Daily: <strong className="text-white">6:00 AM — 10:00 PM</strong><br />
                    Peak Hours: 5:00 PM – 10:00 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`tel:${gymDetails.phone}`}
                className="gold-glow-btn px-6 py-3.5 rounded-md text-xs uppercase tracking-widest font-extrabold flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call Gym Desk
              </a>
              <a
                href={`https://wa.me/${gymDetails.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-md border border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all text-xs uppercase tracking-widest font-extrabold flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              <a
                href="https://maps.google.com/?q=Mandes+mangotree,+Kothule+Mala,+Devlali,+Maharashtra+422501"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-md border border-gray-600 text-gray-300 hover:border-[#d4af37] hover:text-white transition-all text-xs uppercase tracking-widest font-extrabold flex items-center gap-2"
              >
                <Navigation className="w-4 h-4 text-[#d4af37]" />
                Directions ↗
              </a>
            </div>
          </div>

          {/* Live Google Maps Iframe */}
          <div className="h-[450px] rounded-2xl overflow-hidden glass-card border border-[#d4af37]/30 shadow-2xl">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3750.609462744654!2d73.8340!3d19.9200!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdd95637fa04639%3A0x893b394bf3cb5322!2sM%20Square%20fitness%20-%20Premium%20Fitness%20Centre%20in%20Nashik!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="M Square Fitness Google Maps Location"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

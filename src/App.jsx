import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustStrip from './components/TrustStrip';
import About from './components/About';
import Programs from './components/Programs';
import ShuttleBanner from './components/ShuttleBanner';
import Gallery from './components/Gallery';
import Reviews from './components/Reviews';
import ContactMap from './components/ContactMap';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';

export default function App() {
  const [trialModalOpen, setTrialModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white selection:bg-[#d4af37] selection:text-[#0d0e12]">
      <Navbar onOpenTrialModal={() => setTrialModalOpen(true)} />
      
      <main id="top">
        <Hero onOpenTrialModal={() => setTrialModalOpen(true)} />
        <TrustStrip />
        <About />
        <Programs onOpenTrialModal={() => setTrialModalOpen(true)} />
        <ShuttleBanner />
        <Gallery />
        <Reviews />
        <ContactMap />
      </main>

      <Footer />

      <BookingModal
        isOpen={trialModalOpen}
        onClose={() => setTrialModalOpen(false)}
      />
    </div>
  );
}

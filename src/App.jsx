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
import Equipment from './components/Equipment';
import MembershipPlans from './components/MembershipPlans';
import ExerciseGuide from './components/ExerciseGuide';
import QuotesBanner from './components/QuotesBanner';

export default function App() {
  const [trialModalOpen, setTrialModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white selection:bg-[#ff5500] selection:text-[#0b0c10]">
      <Navbar onOpenTrialModal={() => setTrialModalOpen(true)} />
      
      <main id="top">
        <Hero onOpenTrialModal={() => setTrialModalOpen(true)} />
        <About />
        <QuotesBanner />
        <Programs onOpenTrialModal={() => setTrialModalOpen(true)} />
        <MembershipPlans onOpenTrialModal={() => setTrialModalOpen(true)} />
        <Equipment />
        <ExerciseGuide />
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

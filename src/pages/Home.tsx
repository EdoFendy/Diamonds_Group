import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { FeaturesSection } from '../components/home/FeaturesSection';
import { LeadForm } from '../components/home/LeadForm';
import { VideoSection } from '../components/home/VideoSection';
import { Toaster } from 'sonner';
import { CookieConsent } from '../components/home/CookieConsent';

export function Home() {
  return (
    <div>
      <CookieConsent />
      <HeroSection />
      <VideoSection />
      
      <FeaturesSection />
       {/* Div per l'Immagine di Sfondo */}

      <LeadForm />
      <Toaster position="top-right" />
    </div>
  );
}

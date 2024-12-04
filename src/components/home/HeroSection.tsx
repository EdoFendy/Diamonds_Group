import { ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import logo2 from '../layout/logo_solo.png'; // Assicurati di aver importato il logo
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


export function HeroSection() {
  const [counter, setCounter] = useState(0);

  // Funzione per incrementare il contatore ogni volta che un utente visita la pagina
  useEffect(() => {
    const incrementCounter = async () => {
      const counterDocRef = doc(db, 'siteData', 'visitorCounter');
      const counterDoc = await getDoc(counterDocRef);

      if (counterDoc.exists()) {
        const newCount = counterDoc.data().count + 1;
        await setDoc(counterDocRef, { count: newCount });
        setCounter(newCount);
      } else {
        await setDoc(counterDocRef, { count: 1 });
        setCounter(1);
      }
    };

    incrementCounter();
  }, []);

  const handleScrollToLeadForm = () => {
    const element = document.getElementById('lead-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };


  return (
    <section className="relative min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/50 to-black z-10" />
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2070')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 mix-blend-overlay" />
      </div>

      <div className="relative z-20 container mx-auto px-4 pt-16 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <img
            className="block mx-auto h-48 sm:h-64 md:h-80 lg:h-96 w-auto mb-10" // Aumenta l'altezza del logo
            src={logo2}
            alt="U-WIN Network"
          />
          <h1 className="text-6xl font-bold mb-15 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-600">
            Money Generator System
          </h1>
          <p className="text-xl mb-8 text-gray-300">
            Unisciti alla rivoluzione della finanza decentralizzata con U-WIN Network. 
            Un sistema innovativo che combina blockchain, DeFi e meritocrazia.
          </p>

          {/* Avvolgi il bottone in un div flex centrato */}
          <div className="flex justify-center">
            <Button 
              size="lg"
              onClick={handleScrollToLeadForm}
              className="flex items-center justify-center bg-gradient-to-r from-yellow-400 to-amber-600 hover:from-yellow-500 hover:to-amber-700 text-black px-6 py-3">
              <span className="text-lg font-bold">Inizia Ora</span>
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </div>

          {/* Contatore Visite */}
          <div className="text-xl font-semibold mb-8 mt-8 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-600">
            {`Numero dei visitatori totali: ${counter}`}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 200" xmlns="http://www.w3.org/2000/svg">
          <path 
            fill="#000000"
            fillOpacity="0.2"
            d="M0,160L48,144C96,128,192,96,288,90.7C384,85,480,107,576,112C672,117,768,107,864,101.3C960,96,1056,96,1152,106.7C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>
    </section>
  );
}

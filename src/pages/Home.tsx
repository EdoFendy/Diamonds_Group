import React, { useEffect, useState } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { FeaturesSection } from '../components/home/FeaturesSection';
import { LeadForm } from '../components/home/LeadForm';
import { VideoSection } from '../components/home/VideoSection';
import { Toaster } from 'sonner';
import { CookieConsent } from '../components/home/CookieConsent';

// Funzione per rilevare se si tratta di un dispositivo iOS
function isIOS() {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(window.navigator.userAgent);
}

// Funzione per rilevare se è mobile
function isMobile() {
  if (typeof window === 'undefined') return false;
  return /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);
}

// Controlla se l'app è già in modalità standalone (già installata)
function isAppInstalled() {
  // Su iOS Safari PWA
  const iOSInstalled = (typeof window !== 'undefined' && 'standalone' in window.navigator && window.navigator.standalone);
  // Su altri browser, come Chrome su Android
  const otherInstalled = (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches);

  return iOSInstalled || otherInstalled;
}

export function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIOSInstallInstructions, setShowIOSInstallInstructions] = useState(false);

  useEffect(() => {
    // Se l'app è già installata in standalone, non mostrare nulla
    if (isAppInstalled()) {
      return;
    }

    // iOS: mostra le istruzioni dopo un delay se è mobile
    if (isIOS() && isMobile()) {
      const iosTimer = setTimeout(() => {
        setShowIOSInstallInstructions(true);
      }, 2000);

      return () => clearTimeout(iosTimer);
    }

    // Listener per l'evento beforeinstallprompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e) => {
      // Impedisci la visualizzazione automatica del prompt
      e.preventDefault();
      setDeferredPrompt(e);
      // Mostra il banner per installare solo se mobile e non iOS
      if (isMobile() && !isIOS()) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      console.log('Utente ha accettato l’installazione');
    } else {
      console.log('Utente ha rifiutato l’installazione');
    }
    // Nasconde il banner dopo il tentativo
    setShowInstallBanner(false);
    setDeferredPrompt(null);
  };

  const closeIOSInstructions = () => {
    setShowIOSInstallInstructions(false);
  };

  return (
    <div>
      <CookieConsent />
      <HeroSection />
      <VideoSection />
      <FeaturesSection />
      <LeadForm />
      <Toaster position="top-right" />

      {/* Banner Installazione Android */}
      {showInstallBanner && (
        <div style={styles.bannerContainer}>
          <p style={styles.bannerText}>Installa l’app sulla tua Home</p>
          <button style={styles.installButton} onClick={handleInstallApp}>
            Installa
          </button>
        </div>
      )}

      {/* Istruzioni iOS (background nero) */}
      {showIOSInstallInstructions && (
        <div style={styles.overlay}>
          <div style={styles.instructionsBox}>
            <h3 style={{color: '#fff'}}>Aggiungi alla schermata Home</h3>
            <p style={{color: '#fff'}}>
              Per installare questa app sul tuo iPhone/iPad: 
              <br />
              1. Tocca il pulsante Condividi (in basso, l'icona con la freccia) nel browser Safari. 
              <br />
              2. Seleziona "Aggiungi a Home" per aggiungere l’app alla schermata principale del tuo dispositivo.
            </p>
            <button style={styles.closeButton} onClick={closeIOSInstructions}>Chiudi</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  bannerContainer: {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    background: '#ffffff',
    padding: '10px',
    boxShadow: '0 -2px 5px rgba(0,0,0,0.2)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 9999
  },
  bannerText: {
    margin: '0',
    fontSize: '16px'
  },
  installButton: {
    background: '#007bff',
    color: '#ffffff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  overlay: {
    position: 'fixed', 
    top: '0', 
    left: '0', 
    width: '100%', 
    height: '100%', 
    background: 'rgba(0,0,0,0.9)', // sfondo più scuro
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 9999
  },
  instructionsBox: {
    background: 'rgba(0,0,0,0.8)',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '80%',
    textAlign: 'center'
  },
  closeButton: {
    marginTop: '10px',
    background: '#007bff',
    color: '#ffffff',
    padding: '8px 12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

import React, { useEffect, useState } from 'react';

export const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  // Controlla se l'utente ha già accettato i cookie
  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 text-white py-4 px-6 shadow-md z-50">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <p className="text-sm mb-4 md:mb-0 md:mr-4">
          Utilizziamo i cookie per migliorare la tua esperienza sul nostro sito. Continuando, accetti il nostro utilizzo dei cookie.
        </p>
        <button
          onClick={handleAccept}
          className="bg-yellow-400 text-black px-4 py-2 rounded-md hover:bg-yellow-500 transition"
        >
          Accetto
        </button>
      </div>
    </div>
  );
};

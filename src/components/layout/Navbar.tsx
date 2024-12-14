import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { auth } from '../../lib/firebase';
import logo from './logo.png';
import { Home, Calendar, Presentation, User, LogIn, LogOut, ChevronDown, MapPin } from 'lucide-react';

function isAppStandalone() {
  if (typeof window === 'undefined') return false;
  const isIOSStandalone = ('standalone' in window.navigator && window.navigator.standalone);
  const isOtherStandalone = window.matchMedia('(display-mode: standalone)').matches;
  return isIOSStandalone || isOtherStandalone;
}

export const Navbar = () => {
  const { user } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inAppMode = isAppStandalone();

  const handleLogout = async () => {
    await auth.signOut();
    setDropdownOpen(false);
  };

  // Classi comuni per i link: icona sopra, testo sotto
  // In desktop (md:) un po' più grande per un look professionale
  const linkClass = "text-white flex flex-col items-center text-[12px] md:text-sm hover:text-yellow-400 focus:text-yellow-400 transition-colors";
  const iconClass = "mb-1";

  return (
    <nav
      className="bg-black w-full overflow-x-hidden relative px-20"
      style={{
        paddingTop: inAppMode ? 'env(safe-area-inset-top)' : undefined,
      }}
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full px-4">
        {/* Logo: centrato con scritta sotto, su desktop a sinistra */}
        <div className="py-4 flex justify-center md:justify-start">
          <Link to="/">
            <div className="flex flex-col items-center">
              <img src={logo} alt="U-WIN Network" className="h-10 w-auto" />
            </div>
          </Link>
        </div>

        {/* Nav Links: una riga di icone sopra testo, su desktop a destra */}
        <div className="flex items-center justify-center md:justify-end space-x-4 pb-2 md:pb-0 w-full md:w-auto">
          <Link to="/" className={linkClass}>
            <Home className={`h-5 w-5 md:h-6 md:w-6 ${iconClass}`} />
            <span>Home</span>
          </Link>

          <Link to="/presentazioni" className={linkClass}>
            <Presentation className={`h-5 w-5 md:h-6 md:w-6 ${iconClass}`} />
            <span>Presentazioni</span>
          </Link>

          <Link to="/calendario" className={linkClass}>
            <Calendar className={`h-5 w-5 md:h-6 md:w-6 ${iconClass}`} />
            <span>Calendario</span>
          </Link>

          <Link to="/contatti" className={linkClass}>
            <MapPin className={`h-5 w-5 md:h-6 md:w-6 ${iconClass}`} />
            <span>Contatti</span>
          </Link>

          {user ? (
            // Bottone utente: icona sopra, testo e freccia nella stessa riga per non allungare troppo
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`${linkClass} relative`}
              >
                <User className={`h-5 w-5 md:h-6 md:w-6 ${iconClass}`} />
                <div className="flex items-center space-x-1">
                  <span>{user.nome}</span>
                  <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />
                </div>
              </button>
            </div>
          ) : (
            <Link to="/login" className={linkClass}>
              <LogIn className={`h-5 w-5 md:h-6 md:w-6 ${iconClass}`} />
              <span>Accedi</span>
            </Link>
          )}
        </div>
      </div>

      {/* Dropdown Menu con overlay */}
      {dropdownOpen && (
        <>
          {/* Overlay full-screen sopra tutto */}
          <div
            className="fixed inset-0 z-[9998] bg-black bg-opacity-50"
            onClick={() => setDropdownOpen(false)}
          ></div>

          {/* Menu a tendina posizionato in alto a destra */}
          <div className="fixed top-16 right-4 bg-black border border-gray-700 rounded shadow-lg py-2 w-40 z-[9999]">
            {user?.ruolo === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-2 text-white hover:bg-gray-800 text-sm"
              >
                Admin
              </Link>
            )}
            <Link
              to="/profilo"
              onClick={() => setDropdownOpen(false)}
              className="block px-4 py-2 text-white hover:bg-gray-800 text-sm"
            >
              Profilo
            </Link>
            <Link
              to="/formazione"
              onClick={() => setDropdownOpen(false)}
              className="block px-4 py-2 text-white hover:bg-gray-800 text-sm"
            >
              Formazione
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center w-full text-white hover:bg-gray-800 px-4 py-2 text-sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Esci
            </button>
          </div>
        </>
      )}
    </nav>
  );
};
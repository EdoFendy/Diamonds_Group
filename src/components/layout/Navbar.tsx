import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { auth } from '../../lib/firebase';
import logo from './logo.png';
import { Home, Calendar, Presentation, User, LogIn, LogOut, ChevronDown } from 'lucide-react';

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

  return (
    <nav 
      className="bg-black w-full overflow-x-hidden max-w-full"
      style={{
        paddingTop: inAppMode ? 'env(safe-area-inset-top)' : undefined,
      }}
    >
      <div className="flex flex-col items-center w-full px-4">
        {/* Logo al centro */}
        <div className="py-4">
          <Link to="/">
            <img src={logo} alt="U-WIN Network" className="h-10 w-auto mx-auto" />
          </Link>
        </div>

        {/* Barra di navigazione principale */}
        <div className="flex items-center justify-center space-x-4 w-full max-w-full pb-2">
          {/* Home */}
          <Link 
            to="/"
            className="text-white flex flex-col items-center text-sm hover:text-primary focus:text-primary"
          >
            <Home className="h-5 w-5 mb-1" />
            Home
          </Link>

          {/* Presentazioni */}
          <Link 
            to="/presentazioni"
            className="text-white flex flex-col items-center text-sm hover:text-primary focus:text-primary"
          >
            <Presentation className="h-5 w-5 mb-1" />
            Presentazioni
          </Link>

          {/* Calendario */}
          <Link 
            to="/calendario"
            className="text-white flex flex-col items-center text-sm hover:text-primary focus:text-primary"
          >
            <Calendar className="h-5 w-5 mb-1" />
            Calendario
          </Link>

          {/* Se l'utente è loggato */}
          {user ? (
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="relative text-white flex flex-col items-center text-sm hover:text-primary focus:text-primary"
            >
              <User className="h-5 w-5 mb-1" />
              {user.ruolo === 'admin' ? 'Admin' : 'Utente'}
              <ChevronDown className="h-4 w-4" />

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute top-full mt-2 right-0 bg-black border border-gray-700 rounded shadow-lg py-2 w-40 z-50">
                  {user.ruolo === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-white hover:bg-gray-800"
                    >
                      Admin
                    </Link>
                  )}
                  {/* Formazione (protetta) */}
                  <Link
                    to="/formazione"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-white hover:bg-gray-800"
                  >
                    Formazione
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-white hover:bg-gray-800 px-4 py-2"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Esci
                  </button>
                </div>
              )}
            </button>
          ) : (
            // Utente non loggato: Mostra pulsante Accedi
            <Link
              to="/login"
              className="text-white flex flex-col items-center text-sm hover:text-primary focus:text-primary"
            >
              <LogIn className="h-5 w-5 mb-1" />
              Accedi
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

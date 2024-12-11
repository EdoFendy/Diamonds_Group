import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogOut } from 'lucide-react';
import { auth } from '../../lib/firebase';
import logo from './logo.png';

// Funzione per verificare se l'app è in modalità standalone
function isAppStandalone() {
  if (typeof window === 'undefined') return false;
  const isIOSStandalone = ('standalone' in window.navigator && window.navigator.standalone);
  const isOtherStandalone = window.matchMedia('(display-mode: standalone)').matches;
  return isIOSStandalone || isOtherStandalone;
}

export const Navbar = () => {
  const { user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await auth.signOut();
  };

  const inAppMode = isAppStandalone();

  // Navbar per modalità App (standalone)
  if (inAppMode) {
    return (
      <nav 
        className="bg-black shadow-md"
        style={{
          // Usa le costanti safe area per iOS notch
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img
                className="h-10 w-auto"
                src={logo}
                alt="U-WIN Network"
              />
            </Link>

            {/* Menu sempre visibile, stile app */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-white hover:text-primary px-3 py-2">
                Home
              </Link>
              <Link to="/presentazioni" className="text-white hover:text-primary px-3 py-2">
                Presentazioni
              </Link>
              <Link to="/calendario" className="text-white hover:text-primary px-3 py-2">
                Calendario
              </Link>

              {user ? (
                <>
                  <Link to="/formazione" className="text-white hover:text-primary px-3 py-2">
                    Formazione
                  </Link>
                  {user.ruolo === 'admin' && (
                    <Link to="/admin" className="text-white hover:text-primary px-3 py-2">
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-white hover:text-primary px-3 py-2"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Esci
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-primary text-white px-4 py-2 rounded-md"
                >
                  Accedi
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Navbar per modalità normale (non standalone)
  return (
    <nav className="bg-black shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img
                className="h-10 w-auto"
                src={logo}
                alt="U-WIN Network"
              />
            </Link>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-white hover:text-primary px-3 py-2">
              Home
            </Link>

            <Link
              to="/presentazioni"
              className="text-white hover:text-primary px-3 py-2"
            >
              Presentazioni
            </Link>

            <Link
              to="/calendario"
              className="text-white hover:text-primary px-3 py-2"
            >
              Calendario
            </Link>

            {user ? (
              <>
                <Link
                  to="/formazione"
                  className="text-white hover:text-primary px-3 py-2"
                >
                  Formazione
                </Link>
                {user.ruolo === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-white hover:text-primary px-3 py-2"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center text-white hover:text-primary px-3 py-2"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Esci
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-primary text-white px-4 py-2 rounded-md"
              >
                Accedi
              </Link>
            )}
          </div>

          {/* Bottone per menu Mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-primary"
            >
              {/* Icona dell'hamburger menu */}
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block text-white hover:text-primary px-3 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>

            <Link
              to="/presentazioni"
              className="block text-white hover:text-primary px-3 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Presentazioni
            </Link>

            <Link
              to="/calendario"
              className="block text-white hover:text-primary px-3 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Calendario
            </Link>

            {user ? (
              <>
                <Link
                  to="/formazione"
                  className="block text-white hover:text-primary px-3 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Formazione
                </Link>
                {user.ruolo === 'admin' && (
                  <Link
                    to="/admin"
                    className="block text-white hover:text-primary px-3 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full text-white hover:text-primary px-3 py-2 block"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Esci
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block bg-primary text-white px-3 py-1 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Accedi
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

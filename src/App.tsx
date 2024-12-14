import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { AuthProvider } from './providers/AuthProvider';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Admin } from './pages/Admin';
import { Formazione } from './pages/Formazione';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { Toaster } from './components/ui/Toaster';
import { Footer } from './pages/footer'; // Assicurati che il percorso sia corretto
import { Presentazioni } from './pages/Presentazioni';
import { Calendario } from './pages/Calendario';
import { PolicyPage } from './pages/policy';
import { Contatti } from './pages/Contatti';

// Funzione per controllare se l'app è aperta in modalità standalone (PWA installata)
function isAppStandalone() {
  if (typeof window === 'undefined') return false;
  const isIOSStandalone = 'standalone' in window.navigator && window.navigator.standalone;
  const isOtherStandalone = window.matchMedia('(display-mode: standalone)').matches;
  return isIOSStandalone || isOtherStandalone;
}

function App() {
  const inAppMode = isAppStandalone();

  return (
    <Router>
      <AuthProvider>
        {/* Rimuoviamo la classe dark:bg-background per evitare sfondo bianco e manteniamo solo bg-black */}
        <div className="flex flex-col min-h-screen bg-black transition-colors duration-300">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/presentazioni" element={<Presentazioni />} />
              <Route path="/calendario" element={<Calendario />} />
              <Route path="/policy" element={<PolicyPage />} />
              <Route path="/contatti" element={<Contatti />} />
              
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />
              <Route
                path="/formazione"
                element={
                  <ProtectedRoute>
                    <Formazione />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          {/* Mostra il footer solo se NON in modalità standalone (app installata) */}
          {!inAppMode && <Footer />}
          <Toaster />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

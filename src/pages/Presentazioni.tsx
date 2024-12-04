import React from 'react';
import { Play, Trash } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuthStore } from '../store/authStore';
import ReactPlayer from 'react-player';

// Componente Riutilizzabile per il Testo con Gradiente Dorato
function GradientText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
}

interface Presentazione {
  id: string;
  titolo: string;
  descrizione: string;
  videoUrl: string;
}

export function Presentazioni() {
  const { user } = useAuthStore();
  const [presentazioni, setPresentazioni] = React.useState<Presentazione[]>([]);
  const [videoUrl, setVideoUrl] = React.useState<string>('');
  const [sezioneSelezionata, setSezioneSelezionata] = React.useState<string>('');
  const [titoloNuovaPresentazione, setTitoloNuovaPresentazione] = React.useState<string>('');
  const [descrizioneNuovaPresentazione, setDescrizioneNuovaPresentazione] = React.useState<string>('');
  const [videoUrlNuovaPresentazione, setVideoUrlNuovaPresentazione] = React.useState<string>('');

  // Funzione per ottenere le presentazioni da Firestore
  React.useEffect(() => {
    const q = query(collection(db, 'presentazioni'), orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const presentazioniData: Presentazione[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Presentazione, 'id'>),
      }));
      setPresentazioni(presentazioniData);
      if (presentazioniData.length > 0 && !videoUrl) {
        setVideoUrl(presentazioniData[0].videoUrl);
        setSezioneSelezionata(presentazioniData[0].id);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [videoUrl]);

  const handleSelectVideo = (url: string, sezioneId: string) => {
    setVideoUrl(url);
    setSezioneSelezionata(sezioneId);
  };

  // Funzione per aggiungere una nuova presentazione
  const handleAddPresentazione = async () => {
    try {
      const nuovaPresentazione = {
        titolo: titoloNuovaPresentazione,
        descrizione: descrizioneNuovaPresentazione,
        videoUrl: videoUrlNuovaPresentazione,
        createdAt: new Date(),
      };
      await addDoc(collection(db, 'presentazioni'), nuovaPresentazione);
      setTitoloNuovaPresentazione('');
      setDescrizioneNuovaPresentazione('');
      setVideoUrlNuovaPresentazione('');
      console.log("Nuova presentazione aggiunta:", nuovaPresentazione);
    } catch (error) {
      console.error("Errore nell'aggiungere la presentazione:", error);
    }
  };

  // Funzione per rimuovere una presentazione
  const handleRemovePresentazione = async (presentazioneId: string) => {
    try {
      await deleteDoc(doc(db, 'presentazioni', presentazioneId));
      console.log("Presentazione rimossa:", presentazioneId);
      if (sezioneSelezionata === presentazioneId) {
        setVideoUrl('');
        setSezioneSelezionata('');
      }
    } catch (error) {
      console.error("Errore nella rimozione della presentazione:", error);
    }
  };

  return (
    <section className="relative min-h-screen bg-black text-white">
      {/* Background Image and Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2070')] bg-cover bg-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/50 to-black" />
      </div>

      {/* Contenuto Principale */}
      <div className="relative z-10 max-w-7xl mx-auto p-4 min-h-screen text-white">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">
            <GradientText>Presentazioni</GradientText>
          </h1>
          <p className="text-gray-300">
            Scopri tutte le presentazioni disponibili sulla nostra piattaforma.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          {/* Lista Presentazioni */}
          <div className="md:col-span-8 md:col-start-3">
            <div className="bg-black/50 p-6 rounded-lg border border-yellow-600/20 shadow-sm backdrop-blur-sm">
              {videoUrl && (
                <div className="mb-8">
                  <ReactPlayer url={videoUrl} controls width="100%" />
                </div>
              )}

              <div className="space-y-4">
                {presentazioni.map((presentazione) => (
                  <div key={presentazione.id} className="flex items-center space-x-4">
                    <button
                      onClick={() => handleSelectVideo(presentazione.videoUrl, presentazione.id)}
                      className={`flex-grow flex items-center p-4 rounded-lg transition-colors ${
                        sezioneSelezionata === presentazione.id
                          ? 'bg-yellow-400/20 border-yellow-600'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      <Play className="w-8 h-8 text-yellow-400 mr-4" />
                      <div className="text-left">
                        <h3 className="font-medium text-transparent bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text">
                          {presentazione.titolo}
                        </h3>
                        <p className="text-sm text-gray-300">
                          {presentazione.descrizione}
                        </p>
                      </div>
                    </button>
                    {user?.ruolo === 'admin' && (
                      <button
                        onClick={() => handleRemovePresentazione(presentazione.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {user?.ruolo === 'admin' && (
          <div className="mt-8 max-w-3xl mx-auto bg-black/50 p-6 rounded-lg border border-yellow-600/20 shadow-sm backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-2">
              <GradientText>Aggiungi una nuova Presentazione</GradientText>
            </h3>
            <input
              type="text"
              value={titoloNuovaPresentazione}
              onChange={(e) => setTitoloNuovaPresentazione(e.target.value)}
              placeholder="Titolo della presentazione"
              className="w-full mb-2 p-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            />
            <textarea
              value={descrizioneNuovaPresentazione}
              onChange={(e) => setDescrizioneNuovaPresentazione(e.target.value)}
              placeholder="Descrizione della presentazione"
              className="w-full mb-2 p-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            />
            <input
              type="text"
              value={videoUrlNuovaPresentazione}
              onChange={(e) => setVideoUrlNuovaPresentazione(e.target.value)}
              placeholder="URL del video"
              className="w-full mb-2 p-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            />
            <button
              onClick={handleAddPresentazione}
              className="w-full bg-yellow-400 text-black py-2 rounded-md hover:bg-yellow-500 transition-colors"
            >
              Aggiungi Presentazione
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

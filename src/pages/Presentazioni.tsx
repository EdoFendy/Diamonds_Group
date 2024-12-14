// src/pages/Presentazioni.tsx

import React from 'react';
import { Play, Trash2, Pencil } from 'lucide-react';
import { db } from '../lib/firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { useAuthStore } from '../store/authStore';
import ReactPlayer from 'react-player';
import { canManageCourses } from '../services/permission'; // Import della funzione helper

// Componente Riutilizzabile per il Testo con Gradiente Dorato
function GradientText({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  );
}

interface Presentazione {
  id: string;
  titolo: string;
  descrizione: string;
  videoUrl: string;
  createdAt: Date;
}

export function Presentazioni() {
  const { user } = useAuthStore();
  const [presentazioni, setPresentazioni] = React.useState<Presentazione[]>([]);
  const [videoUrl, setVideoUrl] = React.useState<string>('');
  const [sezioneSelezionata, setSezioneSelezionata] = React.useState<string>('');
  const [titoloNuovaPresentazione, setTitoloNuovaPresentazione] = React.useState<string>('');
  const [descrizioneNuovaPresentazione, setDescrizioneNuovaPresentazione] = React.useState<string>('');
  const [videoUrlNuovaPresentazione, setVideoUrlNuovaPresentazione] = React.useState<string>('');

  // Stato per gestire la modalità modifica
  const [editMode, setEditMode] = React.useState<boolean>(false);
  const [currentPresentazioneId, setCurrentPresentazioneId] = React.useState<string | null>(null);

  // Stato per gestire gli errori
  const [error, setError] = React.useState<string>('');

  // Funzione per ottenere le presentazioni da Firestore
  React.useEffect(() => {
    const q = query(collection(db, 'presentazioni'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const presentazioniData: Presentazione[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Presentazione, 'id' | 'createdAt'>),
          createdAt: (doc.data() as any).createdAt?.toDate() || new Date(),
        }));
        setPresentazioni(presentazioniData);
        if (presentazioniData.length > 0 && !videoUrl) {
          setVideoUrl(presentazioniData[0].videoUrl);
          setSezioneSelezionata(presentazioniData[0].id);
        }
      },
      (error) => {
        console.error("Errore durante il recupero delle presentazioni:", error);
        setError("Impossibile caricare le presentazioni. Riprova più tardi.");
      }
    );

    return () => {
      unsubscribe();
    };
  }, [videoUrl]);

  const handleSelectVideo = (url: string, presentazioneId: string) => {
    setVideoUrl(url);
    setSezioneSelezionata(presentazioneId);
  };

  // Funzione per aggiungere una nuova presentazione
  const handleAddPresentazione = async () => {
    if (!canManageCourses(user?.ruolo)) {
      alert('Non hai i permessi per aggiungere una presentazione.');
      return;
    }

    if (!titoloNuovaPresentazione || !descrizioneNuovaPresentazione || !videoUrlNuovaPresentazione) {
      alert('Per favore, completa tutti i campi.');
      return;
    }

    try {
      const nuovaPresentazione = {
        titolo: titoloNuovaPresentazione,
        descrizione: descrizioneNuovaPresentazione,
        videoUrl: videoUrlNuovaPresentazione,
        createdAt: Timestamp.fromDate(new Date()),
      };
      const docRef = await addDoc(collection(db, 'presentazioni'), nuovaPresentazione);
      setTitoloNuovaPresentazione('');
      setDescrizioneNuovaPresentazione('');
      setVideoUrlNuovaPresentazione('');
      console.log("Nuova presentazione aggiunta:", docRef.id);
    } catch (error) {
      console.error("Errore nell'aggiungere la presentazione:", error);
      setError("Impossibile aggiungere la presentazione. Riprova più tardi.");
    }
  };

  // Funzione per rimuovere una presentazione
  const handleRemovePresentazione = async (presentazioneId: string) => {
    if (!canManageCourses(user?.ruolo)) {
      alert('Non hai i permessi per eliminare questa presentazione.');
      return;
    }

    const conferma = window.confirm("Sei sicuro di voler eliminare questa presentazione?");
    if (!conferma) return;

    try {
      await deleteDoc(doc(db, 'presentazioni', presentazioneId));
      console.log("Presentazione rimossa:", presentazioneId);
      if (sezioneSelezionata === presentazioneId) {
        setVideoUrl('');
        setSezioneSelezionata('');
      }
    } catch (error) {
      console.error("Errore nella rimozione della presentazione:", error);
      setError("Impossibile eliminare la presentazione. Riprova più tardi.");
    }
  };

  // Funzione per aprire il modal in modalità modifica
  const openEditModal = (presentazione: Presentazione) => {
    setEditMode(true);
    setCurrentPresentazioneId(presentazione.id);
    setTitoloNuovaPresentazione(presentazione.titolo);
    setDescrizioneNuovaPresentazione(presentazione.descrizione);
    setVideoUrlNuovaPresentazione(presentazione.videoUrl);
  };

  // Funzione per aggiornare una presentazione esistente
  const handleUpdatePresentazione = async () => {
    if (!canManageCourses(user?.ruolo) || !currentPresentazioneId) {
      alert('Non hai i permessi per modificare questa presentazione.');
      return;
    }

    if (!titoloNuovaPresentazione || !descrizioneNuovaPresentazione || !videoUrlNuovaPresentazione) {
      alert('Per favore, completa tutti i campi.');
      return;
    }

    try {
      const presentazioneRef = doc(db, 'presentazioni', currentPresentazioneId);
      const updatedPresentazione = {
        titolo: titoloNuovaPresentazione,
        descrizione: descrizioneNuovaPresentazione,
        videoUrl: videoUrlNuovaPresentazione,
      };
      await updateDoc(presentazioneRef, updatedPresentazione);
      setEditMode(false);
      setCurrentPresentazioneId(null);
      setTitoloNuovaPresentazione('');
      setDescrizioneNuovaPresentazione('');
      setVideoUrlNuovaPresentazione('');
      console.log("Presentazione aggiornata:", currentPresentazioneId);
    } catch (error) {
      console.error("Errore nell'aggiornare la presentazione:", error);
      setError("Impossibile aggiornare la presentazione. Riprova più tardi.");
    }
  };

  // Funzione per chiudere il modal e resettare lo stato
  const handleCloseModal = () => {
    setEditMode(false);
    setCurrentPresentazioneId(null);
    setTitoloNuovaPresentazione('');
    setDescrizioneNuovaPresentazione('');
    setVideoUrlNuovaPresentazione('');
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

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-600 text-white rounded-md">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-12 gap-8">
          {/* Lista Presentazioni */}
          <div className="md:col-span-8 md:col-start-3">
            <div className="bg-black/50 p-6 rounded-lg border border-yellow-600/20 shadow-sm backdrop-blur-sm">
              {/* Video Player */}
              {videoUrl && (
                <div className="mb-8">
                  <ReactPlayer url={videoUrl} controls width="100%" />
                </div>
              )}

              {/* Lista delle Presentazioni */}
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
                    {/* Bottoni di Modifica ed Eliminazione */}
                    {canManageCourses(user?.ruolo) && (
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => openEditModal(presentazione)}
                          className="flex items-center space-x-1 bg-yellow-400 text-black py-1 px-2 rounded hover:bg-yellow-500"
                        >
                          <Pencil className="w-4 h-4" />
                          <span>Modifica</span>
                        </button>
                        <button
                          onClick={() => handleRemovePresentazione(presentazione.id)}
                          className="flex items-center space-x-1 bg-red-600 text-white py-1 px-2 rounded hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Elimina</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Se l'utente può gestire presentazioni, mostra il form per aggiungere una nuova presentazione */}
        {canManageCourses(user?.ruolo) && (
          <div className="mt-8 max-w-3xl mx-auto bg-black/50 p-6 rounded-lg border border-yellow-600/20 shadow-sm backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-2">
              <GradientText>{editMode ? 'Modifica Presentazione' : 'Aggiungi una nuova Presentazione'}</GradientText>
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
              className="w-full mb-4 p-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            />
            <div className="flex justify-end space-x-2">
              {editMode ? (
                <>
                  <button
                    onClick={handleCloseModal}
                    className="bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleUpdatePresentazione}
                    className="bg-yellow-400 text-black py-2 px-4 rounded-md hover:bg-yellow-500 transition-colors"
                  >
                    Salva Modifiche
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAddPresentazione}
                  className="w-full bg-yellow-400 text-black py-2 rounded-md hover:bg-yellow-500 transition-colors"
                >
                  Aggiungi Presentazione
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// Funzioni di utilità
function getStartOfWeek(date: Date): Date {
  const day = date.getDay(); // 0 (domenica) - 6 (sabato)
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Inizio settimana da lunedì
  const startOfWeek = new Date(date);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getDayName(date: Date): string {
  return date.toLocaleDateString('it-IT', { weekday: 'long' });
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function setTimeToDate(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}

function formatInputTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

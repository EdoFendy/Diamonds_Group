import React from 'react';
import { useAuthStore } from '../store/authStore';
import { db } from '../lib/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
  FirestoreError,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { ZoomMeeting } from '../types';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';

// Componente per il Testo con Gradiente Dorato
function GradientText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
}

export function Calendario() {
  const { user } = useAuthStore();
  const [zoomMeetings, setZoomMeetings] = React.useState<ZoomMeeting[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = React.useState<Date>(getStartOfWeek(new Date()));
  const [showModal, setShowModal] = React.useState<boolean>(false);
  
  // Stato per gestire se siamo in modifica o aggiunta
  const [editMode, setEditMode] = React.useState<boolean>(false);
  const [currentMeetingId, setCurrentMeetingId] = React.useState<string | null>(null);
  
  const [newMeetingData, setNewMeetingData] = React.useState({
    titolo: '',
    descrizione: '',
    link: '',
    data: new Date(),
  });

  // Stato per gli errori
  const [error, setError] = React.useState<string>('');

  // Ottenere i meeting Zoom da Firestore
  React.useEffect(() => {
    const start = Timestamp.fromDate(currentWeekStart);
    const end = Timestamp.fromDate(addDays(currentWeekStart, 7));

    const q = query(
      collection(db, 'zoom_meetings'),
      where('data', '>=', start),
      where('data', '<', end),
      orderBy('data')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const meetingsData: ZoomMeeting[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        if (!data.data) {
          console.error("Il campo 'data' è mancante nel documento:", doc.id);
          return null;
        }
        return {
          ...(data as Omit<ZoomMeeting, 'id' | 'data'>),
          id: doc.id,
          data: data.data.toDate(),
        };
      }).filter(Boolean) as ZoomMeeting[];
      setZoomMeetings(meetingsData);
    }, (error: FirestoreError) => {
      console.error("Errore durante il recupero dei meeting Zoom:", error);
      setError("Impossibile caricare i meeting. Riprova più tardi.");
    });

    return () => unsubscribe();
  }, [currentWeekStart]);

  // Navigazione tra le settimane
  const handlePreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  // Aggiungere un nuovo meeting Zoom
  const handleAddMeeting = async () => {
    if (!user || user.ruolo !== 'admin') {
      alert('Non hai i permessi per aggiungere un meeting.');
      return;
    }
    try {
      const newMeeting = {
        titolo: newMeetingData.titolo,
        descrizione: newMeetingData.descrizione,
        link: newMeetingData.link,
        data: Timestamp.fromDate(newMeetingData.data),
      };
      await addDoc(collection(db, 'zoom_meetings'), newMeeting);
      setShowModal(false);
      resetModalState();
    } catch (error) {
      console.error("Errore nell'aggiungere il meeting Zoom:", error);
      setError("Impossibile aggiungere il meeting. Riprova più tardi.");
    }
  };

  // Aggiornare un meeting esistente
  const handleUpdateMeeting = async () => {
    if (!user || user.ruolo !== 'admin' || !currentMeetingId) {
      alert('Non hai i permessi per modificare questo meeting.');
      return;
    }
    try {
      const meetingRef = doc(db, 'zoom_meetings', currentMeetingId);
      const updatedMeeting = {
        titolo: newMeetingData.titolo,
        descrizione: newMeetingData.descrizione,
        link: newMeetingData.link,
        data: Timestamp.fromDate(newMeetingData.data),
      };
      await updateDoc(meetingRef, updatedMeeting);
      setShowModal(false);
      resetModalState();
    } catch (error) {
      console.error("Errore nell'aggiornare il meeting Zoom:", error);
      setError("Impossibile aggiornare il meeting. Riprova più tardi.");
    }
  };

  // Eliminare un meeting
  const handleDeleteMeeting = async (meetingId: string) => {
    if (!user || user.ruolo !== 'admin') {
      alert('Non hai i permessi per eliminare questo meeting.');
      return;
    }
    const conferma = confirm("Sei sicuro di voler eliminare questo meeting?");
    if (!conferma) return;

    try {
      const meetingRef = doc(db, 'zoom_meetings', meetingId);
      await deleteDoc(meetingRef);
    } catch (error) {
      console.error("Errore nell'eliminare il meeting Zoom:", error);
      setError("Impossibile eliminare il meeting. Riprova più tardi.");
    }
  };

  const resetModalState = () => {
    setNewMeetingData({
      titolo: '',
      descrizione: '',
      link: '',
      data: new Date(),
    });
    setEditMode(false);
    setCurrentMeetingId(null);
  };

  // Funzione per aprire il modal in modalità modifica
  const openEditModal = (meeting: ZoomMeeting) => {
    setEditMode(true);
    setCurrentMeetingId(meeting.id);
    setNewMeetingData({
      titolo: meeting.titolo,
      descrizione: meeting.descrizione,
      link: meeting.link,
      data: meeting.data,
    });
    setShowModal(true);
  };

  // Ottenere i giorni della settimana corrente
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  return (
    <section className="relative min-h-screen bg-black text-white">
      {/* Sfondo e Overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2070')] bg-cover bg-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/50 to-black" />
      </div>

      {/* Contenuto Principale */}
      <div className="relative z-10 mx-auto p-4 min-h-screen text-white">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold mb-2">
            <GradientText>Calendario Zoom</GradientText>
          </h1>
          <div className="flex items-center space-x-4">
            <button onClick={handlePreviousWeek} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <span>
              {formatDate(currentWeekStart)} - {formatDate(addDays(currentWeekStart, 6))}
            </span>
            <button onClick={handleNextWeek} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700">
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-600 text-white rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {daysOfWeek.map((day) => {
            const dayMeetings = zoomMeetings
              .filter((m) => isSameDay(m.data, day))
              .sort((a, b) => a.data.getTime() - b.data.getTime());

            return (
              <div key={day.toISOString()} className="bg-black/50 p-2 rounded-lg border border-yellow-600/20 shadow-sm backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-2">
                  {getDayName(day)}
                </h2>
                <p className="text-sm text-gray-300 mb-4">
                  {formatDate(day)}
                </p>
                <div className="space-y-2">
                  {dayMeetings.map((m) => (
                    <div key={m.id} className="p-2 bg-gray-800 rounded-lg">
                      <h3 className="font-medium text-yellow-400">{m.titolo}</h3>
                      <p className="text-sm text-gray-300">{m.descrizione}</p>
                      <p className="text-sm text-gray-400">{formatTime(m.data)}</p>
                      <a href={m.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">
                        Link al meeting Zoom
                      </a>
                      {user && user.ruolo === 'admin' && (
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => openEditModal(m)}
                            className="bg-yellow-400 text-black py-1 px-2 rounded hover:bg-yellow-500"
                          >
                            Modifica
                          </button>
                          <button
                            onClick={() => handleDeleteMeeting(m.id)}
                            className="bg-red-600 text-white py-1 px-2 rounded hover:bg-red-700"
                          >
                            Elimina
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {dayMeetings.length === 0 && (
                    <p className="text-sm text-gray-500">Nessun meeting programmato.</p>
                  )}
                </div>
                {user && user.ruolo === 'admin' && (
                  <button
                    onClick={() => {
                      resetModalState();
                      setShowModal(true);
                    }}
                    className="mt-4 flex items-center justify-center w-full bg-yellow-400 text-black py-2 rounded-md hover:bg-yellow-500 transition-colors"
                  >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Aggiungi Meeting Zoom
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal per Aggiungere o Modificare Meeting Zoom */}
      {showModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {editMode ? 'Modifica Meeting Zoom' : 'Aggiungi Meeting Zoom'}
            </h3>
            <input
              type="text"
              value={newMeetingData.titolo}
              onChange={(e) => setNewMeetingData({ ...newMeetingData, titolo: e.target.value })}
              placeholder="Titolo"
              className="w-full mb-2 p-2 border border-yellow-600 bg-gray-800 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            />
            <textarea
              value={newMeetingData.descrizione}
              onChange={(e) => setNewMeetingData({ ...newMeetingData, descrizione: e.target.value })}
              placeholder="Descrizione"
              className="w-full mb-2 p-2 border border-yellow-600 bg-gray-800 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            />
            <input
              type="time"
              value={formatInputTime(newMeetingData.data)}
              onChange={(e) => {
                setNewMeetingData({ ...newMeetingData, data: setTimeToDate(newMeetingData.data, e.target.value) });
              }}
              className="w-full mb-2 p-2 border border-yellow-600 bg-gray-800 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            />
            <input
              type="text"
              value={newMeetingData.link}
              onChange={(e) => setNewMeetingData({ ...newMeetingData, link: e.target.value })}
              placeholder="Link"
              className="w-full mb-4 p-2 border border-yellow-600 bg-gray-800 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetModalState();
                }}
                className="bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
              >
                Annulla
              </button>
              {editMode ? (
                <button
                  onClick={handleUpdateMeeting}
                  className="bg-yellow-400 text-black py-2 px-4 rounded-md hover:bg-yellow-500 transition-colors"
                >
                  Salva Modifiche
                </button>
              ) : (
                <button
                  onClick={handleAddMeeting}
                  className="bg-yellow-400 text-black py-2 px-4 rounded-md hover:bg-yellow-500 transition-colors"
                >
                  Salva
                </button>
              )}
            </div>
          </div>
        </div>
      )}
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
  return date.toISOString().substring(11, 16);
}

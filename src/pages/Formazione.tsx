import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Play, Book, ChevronRight } from 'lucide-react';
import type { Corso, Sezione, Ruolo } from '../types';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import ReactPlayer from 'react-player';

// Componente Riutilizzabile per il Testo con Gradiente Dorato
function GradientText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
}

export function Formazione() {
  const { user } = useAuthStore();
  const [corsi, setCorsi] = React.useState<Corso[]>([]);
  const [corsoSelezionato, setCorsoSelezionato] = React.useState<Corso | null>(null);
  const [videoUrl, setVideoUrl] = React.useState<string>('');
  const [sezioneSelezionata, setSezioneSelezionata] = React.useState<string>('');

  // Stato per i nuovi corsi/sezioni
  const [titoloNuovoCorso, setTitoloNuovoCorso] = React.useState<string>('');
  const [descrizioneNuovoCorso, setDescrizioneNuovoCorso] = React.useState<string>('');
  const [ruoliPermessi, setRuoliPermessi] = React.useState<Ruolo[]>([]); // Aggiunto

  const [titoloNuovaSezione, setTitoloNuovaSezione] = React.useState<string>('');
  const [descrizioneNuovaSezione, setDescrizioneNuovaSezione] = React.useState<string>('');
  const [videoUrlNuovaSezione, setVideoUrlNuovaSezione] = React.useState<string>('');

  // Ref per memorizzare gli unsubscribe dei listener delle sezioni
  const unsubscribeSezioniRef = React.useRef<{ [key: string]: () => void }>({});

  // Funzione per ottenere i corsi da Firestore
  React.useEffect(() => {
    const q = query(collection(db, 'corsi'), orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const corsiData: Corso[] = snapshot.docs.map((doc) => ({
        ...(doc.data() as Omit<Corso, 'id'>),
        id: doc.id,
        createdAt: (doc.data() as Corso).createdAt?.toDate(),
        sezioniCount: 0,
        ruoliPermessi: (doc.data() as Corso).ruoliPermessi || [], // Aggiunto
      }));
      setCorsi(corsiData);

      // Imposta i listener per aggiornare sezioniCount per ogni corso
      corsiData.forEach((corso) => {
        if (!unsubscribeSezioniRef.current[corso.id]) {
          const sezioniQuery = query(collection(db, 'corsi', corso.id, 'sezioni'));
          const unsubscribeSezioni = onSnapshot(sezioniQuery, (sezioniSnapshot) => {
            const count = sezioniSnapshot.size;
            setCorsi((prevCorsi) =>
              prevCorsi.map((c) =>
                c.id === corso.id ? { ...c, sezioniCount: count } : c
              )
            );
          });
          unsubscribeSezioniRef.current[corso.id] = unsubscribeSezioni;
        }
      });
    });

    return () => {
      unsubscribe();
      Object.values(unsubscribeSezioniRef.current).forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  const handleSelectCorso = (corso: Corso) => {
    if (!corso.ruoliPermessi.includes(user?.ruolo || '')) {
      alert('Non hai i permessi per accedere a questo corso.');
      return;
    }

    // Disiscrive il listener precedente se esiste
    if (unsubscribeSezioniRef.current[corso.id]) {
      unsubscribeSezioniRef.current[corso.id]();
    }

    // Crea un nuovo listener per il corso selezionato
    const sezioniQuery = query(
      collection(db, 'corsi', corso.id, 'sezioni'),
      orderBy('ordine')
    );
    const unsubscribe = onSnapshot(sezioniQuery, (snapshot) => {
      const sezioniData = snapshot.docs.map((doc) => {
        const data = doc.data() as Sezione;
        const { id: _, ...rest } = data; // Elimina la proprietà 'id' se esiste
        return {
          id: doc.id,
          ...rest,
        };
      });
      setCorsoSelezionato({ ...corso, sezioni: sezioniData });
      console.log(`Sezioni caricate per il corso ${corso.id}:`, sezioniData);
    });

    unsubscribeSezioniRef.current[corso.id] = unsubscribe;
    setVideoUrl('');
    setSezioneSelezionata('');
  };

  // Pulizia dei listener al smontaggio del componente
  React.useEffect(() => {
    return () => {
      Object.values(unsubscribeSezioniRef.current).forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  const handleSelectVideo = (url: string, sezioneId: string) => {
    setVideoUrl(url);
    setSezioneSelezionata(sezioneId);
  };

  // Funzione per aggiungere un nuovo corso
  const handleAddCorso = async () => {
    try {
      const nuovoCorso = {
        titolo: titoloNuovoCorso,
        descrizione: descrizioneNuovoCorso,
        createdAt: new Date(),
        sezioniCount: 0,
        ruoliPermessi, // Aggiunto
      };
      await addDoc(collection(db, 'corsi'), nuovoCorso);
      // Resetta gli stati
      setTitoloNuovoCorso('');
      setDescrizioneNuovoCorso('');
      setRuoliPermessi([]);
      console.log("Nuovo corso aggiunto:", nuovoCorso);
    } catch (error) {
      console.error("Errore nell'aggiungere il corso:", error);
    }
  };

  // Funzione per aggiungere una nuova sezione al corso selezionato
  const handleAddSezione = async () => {
    if (!corsoSelezionato) return;
    try {
      const nuovaSezione = {
        titolo: titoloNuovaSezione,
        videoUrl: videoUrlNuovaSezione,
        descrizione: descrizioneNuovaSezione,
        ordine: corsoSelezionato.sezioni.length + 1,
      };
      const corsoDocRef = doc(db, 'corsi', corsoSelezionato.id);
      await addDoc(collection(corsoDocRef, 'sezioni'), nuovaSezione);
      setTitoloNuovaSezione('');
      setDescrizioneNuovaSezione('');
      setVideoUrlNuovaSezione('');
      console.log("Nuova sezione aggiunta:", nuovaSezione);
    } catch (error) {
      console.error("Errore nell'aggiungere la sezione:", error);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <GradientText>Formazione</GradientText>
          </h1>
          <p className="text-gray-300">
            Benvenuto {user?.nome}, accedi ai corsi formativi
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          {/* Lista Corsi */}
          <div className="md:col-span-4">
            <div className="bg-black/50 p-6 rounded-lg border border-yellow-600/20 shadow-sm backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <Book className="w-6 h-6 text-yellow-400 mr-2" />
                <h2 className="text-xl font-semibold">
                  <GradientText>Corsi Disponibili</GradientText>
                </h2>
              </div>

              <div className="space-y-4">
                {corsi
                  .filter((corso) => corso.ruoliPermessi.includes(user?.ruolo || ''))
                  .map((corso) => (
                    <button
                      key={corso.id}
                      onClick={() => handleSelectCorso(corso)}
                      className={`w-full text-left p-4 rounded-lg border ${
                        corsoSelezionato?.id === corso.id
                          ? 'bg-yellow-400/20 border-yellow-600'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-white">{corso.titolo}</h3>
                          <p className="text-sm text-gray-300">
                            {corso.sezioniCount !== undefined ? corso.sezioniCount : 0} video
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </button>
                  ))}
              </div>

              {user?.ruolo === 'admin' && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">
                    <GradientText>Aggiungi un nuovo Corso</GradientText>
                  </h3>
                  <input
                    type="text"
                    value={titoloNuovoCorso}
                    onChange={(e) => setTitoloNuovoCorso(e.target.value)}
                    placeholder="Titolo del corso"
                    className="w-full mb-2 p-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <textarea
                    value={descrizioneNuovoCorso}
                    onChange={(e) => setDescrizioneNuovoCorso(e.target.value)}
                    placeholder="Descrizione del corso"
                    className="w-full mb-2 p-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <div className="mb-4">
                    <h4 className="text-md font-semibold mb-2">Seleziona i ruoli permessi:</h4>
                    {['Base', 'Avanzato', 'admin', 'utente'].map((ruolo) => (
                      <label key={ruolo} className="inline-flex items-center mr-4">
                        <input
                          type="checkbox"
                          value={ruolo}
                          checked={ruoliPermessi.includes(ruolo as Ruolo)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRuoliPermessi([...ruoliPermessi, ruolo as Ruolo]);
                            } else {
                              setRuoliPermessi(ruoliPermessi.filter((r) => r !== ruolo));
                            }
                          }}
                          className="form-checkbox h-4 w-4 text-yellow-500"
                        />
                        <span className="ml-2 text-white">{ruolo}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={handleAddCorso}
                    className="w-full bg-yellow-400 text-black py-2 rounded-md hover:bg-yellow-500 transition-colors"
                  >
                    Aggiungi Corso
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Contenuto Corso */}
          <div className="md:col-span-8">
            {corsoSelezionato ? (
              <div className="bg-black/50 p-6 rounded-lg border border-yellow-600/20 shadow-sm backdrop-blur-sm">
                <h2 className="text-2xl font-bold mb-4">
                  <GradientText>{corsoSelezionato.titolo}</GradientText>
                </h2>
                <p className="text-gray-300 mb-6">
                  {corsoSelezionato.descrizione}
                </p>

                {videoUrl && (
                  <div className="mb-8">
                    <ReactPlayer url={videoUrl} controls width="100%" />
                  </div>
                )}

                <div className="space-y-4">
                  {corsoSelezionato.sezioni.map((sezione) => (
                    <button
                      key={sezione.id}
                      onClick={() => handleSelectVideo(sezione.videoUrl, sezione.id)}
                      className={`w-full flex items-center p-4 rounded-lg transition-colors ${
                        sezioneSelezionata === sezione.id
                          ? 'bg-yellow-400/20 border-yellow-600'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      <Play className="w-8 h-8 text-yellow-400 mr-4" />
                      <div className="text-left">
                        <h3 className="font-medium text-transparent bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text">
                          {sezione.titolo}
                        </h3>
                        <p className="text-sm text-gray-300">
                          {sezione.descrizione}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {user?.ruolo === 'admin' && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">
                      <GradientText>Aggiungi una nuova Sezione</GradientText>
                    </h3>
                    <input
                      type="text"
                      value={titoloNuovaSezione}
                      onChange={(e) => setTitoloNuovaSezione(e.target.value)}
                      placeholder="Titolo della sezione"
                      className="w-full mb-2 p-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                    />
                    <textarea
                      value={descrizioneNuovaSezione}
                      onChange={(e) => setDescrizioneNuovaSezione(e.target.value)}
                      placeholder="Descrizione della sezione"
                      className="w-full mb-2 p-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                    />
                    <input
                      type="text"
                      value={videoUrlNuovaSezione}
                      onChange={(e) => setVideoUrlNuovaSezione(e.target.value)}
                      placeholder="URL del video"
                      className="w-full mb-2 p-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                    />
                    <button
                      onClick={handleAddSezione}
                      className="w-full bg-yellow-400 text-black py-2 rounded-md hover:bg-yellow-500 transition-colors"
                    >
                      Aggiungi Sezione
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-black/50 rounded-lg border border-yellow-600/20 shadow-sm backdrop-blur-sm p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
                <Book className="w-16 h-16 text-yellow-400 mb-4" />
                <h3 className="text-xl font-medium text-transparent bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text mb-2">
                  Seleziona un corso
                </h3>
                <p className="text-gray-300">
                  Scegli un corso dalla lista per iniziare il tuo percorso formativo
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

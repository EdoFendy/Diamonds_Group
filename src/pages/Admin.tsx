"use client";

import React from 'react';
import { useAuthStore } from '../store/authStore';
import { getFirestore, collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { GradientText } from '../components/layout/GradientText';
import { User, Ruolo } from '../types';
import { UserPlus, Pencil, Trash2 } from 'lucide-react';

const db = getFirestore(app);

const ruoliDisponibili: Ruolo[] = ["Base", "Avanzato", "admin", "utente"];

type Lead = {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  createdAt: Timestamp;
  contattato: boolean;
  sponsor: string; // Aggiungiamo sponsor anche nei leads
};

export function Admin() {
  const { user } = useAuthStore();
  const [users, setUsers] = React.useState<User[]>([]);
  const [leads, setLeads] = React.useState<Lead[]>([]);

  // Stati per nuovo utente
  const [nome, setNome] = React.useState('');
  const [cognome, setCognome] = React.useState('');
  const [sponsor, setSponsor] = React.useState('');
  const [ruolo, setRuolo] = React.useState<Ruolo>('utente');

  // Stati per modifica utente
  const [editingUserId, setEditingUserId] = React.useState<string | null>(null);
  const [editNome, setEditNome] = React.useState('');
  const [editCognome, setEditCognome] = React.useState('');
  const [editSponsor, setEditSponsor] = React.useState('');
  const [editRuolo, setEditRuolo] = React.useState<Ruolo>('utente');

  // Filtri per leads (nessun form di creazione leads)
  const [searchNameLead, setSearchNameLead] = React.useState('');
  const [searchSponsorLead, setSearchSponsorLead] = React.useState('');
  const [startDateLead, setStartDateLead] = React.useState('');
  const [endDateLead, setEndDateLead] = React.useState('');

  // Stati per modifica lead
  const [editingLeadId, setEditingLeadId] = React.useState<string | null>(null);
  const [editLeadNome, setEditLeadNome] = React.useState('');
  const [editLeadCognome, setEditLeadCognome] = React.useState('');
  const [editLeadEmail, setEditLeadEmail] = React.useState('');
  const [editLeadTelefono, setEditLeadTelefono] = React.useState('');

  React.useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData: User[] = snapshot.docs.map((doc) => ({
        ...(doc.data() as Omit<User, 'id'>),
        id: doc.id,
      }));
      setUsers(usersData);
    });

    const unsubscribeLeads = onSnapshot(collection(db, 'leads'), (snapshot) => {
      const leadsData: Lead[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          nome: data.nome,
          cognome: data.cognome,
          email: data.email,
          telefono: data.telefono,
          createdAt: data.createdAt,
          contattato: data.contattato || false,
          sponsor: data.sponsor || '',
        } as Lead;
      });
      setLeads(leadsData);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeLeads();
    };
  }, []);

  // Aggiungi un nuovo utente
  const handleAddUser = async () => {
    try {
      const newUser = {
        nome,
        cognome,
        sponsor,
        ruolo,
        dataRegistrazione: new Date(),
        codiceUnivoco: Math.random().toString(36).substring(2,10).toUpperCase()
      };
      await addDoc(collection(db, 'users'), newUser);
      setNome(''); setCognome(''); setSponsor(''); setRuolo('utente');
    } catch (error) {
      console.error('Errore nella creazione utente:', error);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUserId) return;
    try {
      const userRef = doc(db, 'users', editingUserId);
      await updateDoc(userRef, {
        nome: editNome,
        cognome: editCognome,
        sponsor: editSponsor,
        ruolo: editRuolo,
      });
      setEditingUserId(null);
    } catch (error) {
      console.error('Errore nell\'aggiornamento utente:', error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const userRef = doc(db, 'users', id);
      await deleteDoc(userRef);
    } catch (error) {
      console.error('Errore nell\'eliminazione utente:', error);
    }
  };

  const handleEditUser = (u: User) => {
    setEditingUserId(u.id);
    setEditNome(u.nome);
    setEditCognome(u.cognome);
    setEditSponsor(u.sponsor || '');
    setEditRuolo(u.ruolo);
  };

  // Modifica/Salvataggio Lead
  const handleEditLead = (l: Lead) => {
    setEditingLeadId(l.id);
    setEditLeadNome(l.nome);
    setEditLeadCognome(l.cognome);
    setEditLeadEmail(l.email);
    setEditLeadTelefono(l.telefono);
  };

  const handleUpdateLead = async () => {
    if (!editingLeadId) return;
    try {
      const leadRef = doc(db, 'leads', editingLeadId);
      await updateDoc(leadRef, {
        nome: editLeadNome,
        cognome: editLeadCognome,
        email: editLeadEmail,
        telefono: editLeadTelefono,
      });
      setEditingLeadId(null);
    } catch (error) {
      console.error('Errore nell\'aggiornamento lead:', error);
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      const leadRef = doc(db, 'leads', id);
      await deleteDoc(leadRef);
    } catch (error) {
      console.error('Errore nell\'eliminazione lead:', error);
    }
  };

  const handleToggleLeadContacted = async (lead: Lead) => {
    try {
      const leadRef = doc(db, 'leads', lead.id);
      await updateDoc(leadRef, {
        contattato: !lead.contattato
      });
    } catch (error) {
      console.error('Errore nell\'aggiornamento contatto lead:', error);
    }
  };

  // Filtraggio leads in base ai nuovi criteri: nome, sponsor, date
  const filteredLeads = React.useMemo(() => {
    return leads.filter((l) => {
      // Nome filter
      if (searchNameLead && !l.nome.toLowerCase().includes(searchNameLead.toLowerCase())) {
        return false;
      }

      // Sponsor filter
      if (searchSponsorLead && !l.sponsor.toLowerCase().includes(searchSponsorLead.toLowerCase())) {
        return false;
      }

      // Date filter (tra startDateLead e endDateLead se presenti)
      if (startDateLead) {
        const startDate = new Date(startDateLead);
        if (l.createdAt.toDate() < startDate) {
          return false;
        }
      }
      if (endDateLead) {
        const endDate = new Date(endDateLead);
        // per filtrare fino a fine giornata endDate, possiamo aggiungere 1 giorno
        endDate.setHours(23,59,59,999);
        if (l.createdAt.toDate() > endDate) {
          return false;
        }
      }

      return true;
    });
  }, [leads, searchNameLead, searchSponsorLead, startDateLead, endDateLead]);

  return (
    <section className="relative min-h-screen bg-black text-white">
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2070')] bg-cover bg-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/50 to-black" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 min-h-screen text-white">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <GradientText>Admin</GradientText>
          </h1>
          <p className="text-gray-300">
            Gestione semplice di utenti e leads, stile Formazione.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form Nuovo Utente */}
          <div className="bg-black/50 p-6 rounded-lg border border-yellow-600/20 shadow-sm backdrop-blur-sm">
            <div className="flex items-center mb-6">
              <UserPlus className="w-6 h-6 text-yellow-600 mr-2" />
              <h2 className="text-xl font-semibold">
                <GradientText>Nuovo Utente</GradientText>
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-yellow-600 mb-1">Nome</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md"
                  placeholder="Nome"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-yellow-600 mb-1">Cognome</label>
                <input
                  type="text"
                  value={cognome}
                  onChange={(e) => setCognome(e.target.value)}
                  className="w-full px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md"
                  placeholder="Cognome"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-yellow-600 mb-1">Ruolo</label>
                <select
                  value={ruolo}
                  onChange={(e) => setRuolo(e.target.value as Ruolo)}
                  className="w-full px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md"
                >
                  {ruoliDisponibili.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              
              <div>
                <label className="block text-sm font-medium text-yellow-600 mb-1">Sponsor</label>
                <input
                  type="text"
                  value={sponsor}
                  onChange={(e) => setSponsor(e.target.value)}
                  className="w-full px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md"
                  placeholder="Sponsor"
                />
              </div>

              <button
                onClick={handleAddUser}
                className="w-full bg-yellow-400 text-black py-2 rounded-md hover:bg-yellow-500 transition-colors"
              >
                Aggiungi Utente
              </button>
            </div>
          </div>

          {/* Lista Utenti */}
          <div className="bg-black/50 p-6 rounded-lg border border-yellow-600/20 shadow-sm backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4">
              <GradientText>Utenti</GradientText>
            </h2>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {users.map(u => (
                <div key={u.id} className="p-4 border border-yellow-600 rounded-lg bg-gray-800">
                  {editingUserId === u.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editNome}
                        onChange={(e) => setEditNome(e.target.value)}
                        className="w-full px-2 py-1 border border-yellow-600 bg-gray-700 text-white rounded-md"
                      />
                      <input
                        type="text"
                        value={editCognome}
                        onChange={(e) => setEditCognome(e.target.value)}
                        className="w-full px-2 py-1 border border-yellow-600 bg-gray-700 text-white rounded-md"
                      />

                      <input
                        type="text"
                        value={editSponsor}
                        onChange={(e) => setEditSponsor(e.target.value)}
                        className="w-full px-2 py-1 border border-yellow-600 bg-gray-700 text-white rounded-md"
                      />
                      <select
                        value={editRuolo}
                        onChange={(e) => setEditRuolo(e.target.value as Ruolo)}
                        className="w-full px-2 py-1 border border-yellow-600 bg-gray-700 text-white rounded-md"
                      >
                        {ruoliDisponibili.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={() => setEditingUserId(null)}
                          className="bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600"
                        >
                          Annulla
                        </button>
                        <button
                          onClick={handleUpdateUser}
                          className="bg-yellow-400 text-black px-2 py-1 rounded hover:bg-yellow-500"
                        >
                          Salva
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-white">{u.nome} {u.cognome}</h3>
                        {u.sponsor && <p className="text-sm text-gray-300">Sponsor: {u.sponsor}</p>}
                        <p className="text-sm text-gray-300">Ruolo: {u.ruolo}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono bg-yellow-600 text-black px-2 py-1 rounded">
                          {u.codiceUnivoco}
                        </p>
                      </div>
                    </div>
                  )}

                  {editingUserId !== u.id && (
                    <div className="flex space-x-2 mt-2 justify-end">
                      <button
                        onClick={() => {
                          setEditNome(u.nome);
                          setEditCognome(u.cognome);
                          setEditSponsor(u.sponsor || '');
                          setEditRuolo(u.ruolo);
                          setEditingUserId(u.id);
                        }}
                        className="bg-yellow-400 text-black py-1 px-2 rounded hover:bg-yellow-500 flex items-center"
                      >
                        <Pencil className="w-4 h-4 mr-1"/> Modifica
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="bg-red-600 text-white py-1 px-2 rounded hover:bg-red-700 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1"/> Elimina
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {users.length === 0 && (
                <p className="text-gray-300 text-center py-4">
                  Nessun utente presente
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Leads con Filtri per data, sponsor o nome (nessun form) */}
        <div className="bg-black/50 p-6 rounded-lg border border-yellow-600/20 shadow-sm backdrop-blur-sm mt-8">
          <h2 className="text-xl font-semibold mb-4">
            <GradientText>Leads</GradientText>
          </h2>

          <div className="grid md:grid-cols-3 gap-2 mb-4">
            <input
              type="text"
              value={searchNameLead}
              onChange={(e) => setSearchNameLead(e.target.value)}
              className="px-3 py-1 border border-yellow-600 bg-gray-700 text-white rounded-md"
              placeholder="Nome"
            />
            <input
              type="text"
              value={searchSponsorLead}
              onChange={(e) => setSearchSponsorLead(e.target.value)}
              className="px-3 py-1 border border-yellow-600 bg-gray-700 text-white rounded-md"
              placeholder="Sponsor"
            />
            <div className="flex space-x-1">
              <input
                type="date"
                value={startDateLead}
                onChange={(e) => setStartDateLead(e.target.value)}
                className="px-2 py-1 border border-yellow-600 bg-gray-700 text-white rounded-md w-1/2"
              />
              <input
                type="date"
                value={endDateLead}
                onChange={(e) => setEndDateLead(e.target.value)}
                className="px-2 py-1 border border-yellow-600 bg-gray-700 text-white rounded-md w-1/2"
              />
            </div>
          </div>

          {/* Filtraggio leads */}
          {(() => {
            const filteredLeads = leads.filter((l) => {
              if (searchNameLead && !l.nome.toLowerCase().includes(searchNameLead.toLowerCase())) return false;
              if (searchSponsorLead && !l.sponsor.toLowerCase().includes(searchSponsorLead.toLowerCase())) return false;

              if (startDateLead) {
                const start = new Date(startDateLead);
                if (l.createdAt.toDate() < start) return false;
              }
              if (endDateLead) {
                const end = new Date(endDateLead);
                end.setHours(23,59,59,999);
                if (l.createdAt.toDate() > end) return false;
              }
              return true;
            });

            return (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredLeads.map((l) => (
                  <div key={l.id} className="p-4 border border-yellow-600 rounded-lg bg-gray-800">
                    {editingLeadId === l.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editLeadNome}
                          onChange={(e) => setEditLeadNome(e.target.value)}
                          className="w-full px-2 py-1 border border-yellow-600 bg-gray-700 text-white rounded-md"
                        />
                        <input
                          type="text"
                          value={editLeadCognome}
                          onChange={(e) => setEditLeadCognome(e.target.value)}
                          className="w-full px-2 py-1 border border-yellow-600 bg-gray-700 text-white rounded-md"
                        />
                        <input
                          type="email"
                          value={editLeadEmail}
                          onChange={(e) => setEditLeadEmail(e.target.value)}
                          className="w-full px-2 py-1 border border-yellow-600 bg-gray-700 text-white rounded-md"
                        />
                        <input
                          type="text"
                          value={editLeadTelefono}
                          onChange={(e) => setEditLeadTelefono(e.target.value)}
                          className="w-full px-2 py-1 border border-yellow-600 bg-gray-700 text-white rounded-md"
                        />
                        <div className="flex space-x-2 justify-end">
                          <button
                            onClick={() => setEditingLeadId(null)}
                            className="bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600"
                          >
                            Annulla
                          </button>
                          <button
                            onClick={handleUpdateLead}
                            className="bg-yellow-400 text-black px-2 py-1 rounded hover:bg-yellow-500"
                          >
                            Salva
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-white">{l.nome} {l.cognome}</h3>
                          <p className="text-sm text-gray-300">Email: {l.email}</p>
                          <p className="text-sm text-gray-300">Telefono: {l.telefono}</p>
                          {l.sponsor && <p className="text-sm text-gray-300">Sponsor: {l.sponsor}</p>}
                          <div className="flex items-center space-x-2 mt-2">
                            <input
                              type="checkbox"
                              checked={l.contattato}
                              onChange={() => handleToggleLeadContacted(l)}
                            />
                            <span className="text-sm text-gray-300">Contattato</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-300">
                            {new Date(l.createdAt.toDate()).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {editingLeadId !== l.id && (
                      <div className="flex space-x-2 mt-2 justify-end">
                        <button
                          onClick={() => {
                            setEditingLeadId(l.id);
                            setEditLeadNome(l.nome);
                            setEditLeadCognome(l.cognome);
                            setEditLeadEmail(l.email);
                            setEditLeadTelefono(l.telefono);
                          }}
                          className="bg-yellow-400 text-black py-1 px-2 rounded hover:bg-yellow-500 flex items-center"
                        >
                          <Pencil className="w-4 h-4 mr-1"/> Modifica
                        </button>
                        <button
                          onClick={() => handleDeleteLead(l.id)}
                          className="bg-red-600 text-white py-1 px-2 rounded hover:bg-red-700 flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1"/> Elimina
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {filteredLeads.length === 0 && (
                  <p className="text-gray-300 text-center py-4">
                    Nessun lead trovato
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </section>
  );
}

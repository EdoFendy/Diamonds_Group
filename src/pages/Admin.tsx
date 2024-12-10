// Admin.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createNewUser } from '../services/admin'; // Assicurati del percorso corretto
import { useToast } from '../hooks/useToast';
import { UserPlus, Users, Pencil, Trash2 } from 'lucide-react';
import { User, Ruolo, Lead } from '../types';
import { getFirestore, collection, getDocs, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { GradientText } from '../components/layout/GradientText'; // Assicurati che il percorso sia corretto

// Definizione dei ruoli disponibili
const ruoliDisponibili: Ruolo[] = ["Base", "Avanzato", "admin", "utente"];

// Schema di validazione per la creazione di un nuovo utente
const userSchema = z.object({
  nome: z.string().min(2, 'Nome troppo corto'),
  cognome: z.string().min(2, 'Cognome troppo corto'),
  ruolo: z.enum(ruoliDisponibili, { required_error: 'Ruolo obbligatorio' }),
  sponsor: z.string().min(2, 'Sponsor troppo corto').optional(), // Sponsor opzionale
});

// Tipo per i dati del form utente
type UserFormData = z.infer<typeof userSchema>;

// Schema di validazione per la modifica di un lead
const leadSchema = z.object({
  nome: z.string().min(2, 'Nome troppo corto'),
  cognome: z.string().min(2, 'Cognome troppo corto'),
  email: z.string().email('Email non valida'),
  telefono: z.string().min(9, 'Numero di telefono troppo corto').max(11, 'Numero di telefono troppo lungo').regex(/^[0-9]+$/, 'Numero non valido'),
  contattato: z.boolean(),
  commenti: z.string().optional(), // Campo Commenti aggiunto
  sponsor: z.string().min(2, 'Sponsor troppo corto').optional(), // Campo Sponsor aggiunto
});

type LeadFormData = z.infer<typeof leadSchema>;

const db = getFirestore(app);

export function Admin() {
  const { addToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);

  // Stati per i filtri utenti
  const [searchUsersNome, setSearchUsersNome] = useState('');
  const [searchUsersCognome, setSearchUsersCognome] = useState('');
  const [searchUsersSponsor, setSearchUsersSponsor] = useState('');
  const [searchUsersCodice, setSearchUsersCodice] = useState('');

  // Stati per i filtri leads
  const [searchLeadsNome, setSearchLeadsNome] = useState('');
  const [searchLeadsCognome, setSearchLeadsCognome] = useState('');
  const [searchLeadsEmail, setSearchLeadsEmail] = useState('');
  const [searchLeadsTelefono, setSearchLeadsTelefono] = useState('');

  // Stati per modali di modifica
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserData, setEditUserData] = useState<User | null>(null);

  const [showEditLeadModal, setShowEditLeadModal] = useState(false);
  const [editLeadData, setEditLeadData] = useState<Lead | null>(null);

  // Form per nuovi utenti
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  // Form per lead (nel modal)
  const { register: registerLead, handleSubmit: handleSubmitLead, reset: resetLead, formState: { errors: errorsLead, isSubmitting: isSubmittingLead } } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  });

  // Funzione per creare un nuovo utente
  const onSubmitUser: SubmitHandler<UserFormData> = async (data) => {
    try {
      const newUser = await createNewUser({
        ...data,
        dataRegistrazione: new Date(),
      });
      addToast(`Utente creato con successo. Codice: ${newUser.codiceUnivoco}`, 'success');
      setUsers((prev) => [...prev, newUser]);
      setFilteredUsers((prev) => [...prev, newUser]);
      reset();
    } catch (error: any) {
      console.error('Errore durante la creazione dell\'utente:', error);
      addToast('Errore durante la creazione dell\'utente: ' + (error.message || error), 'error');
    }
  };

  // Effetto per recuperare utenti e leads
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const leadsCollection = collection(db, 'leads');
        const leadSnapshot = await getDocs(leadsCollection);
        const leadsList = leadSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            nome: data.nome,
            cognome: data.cognome,
            email: data.email,
            telefono: data.telefono,
            createdAt: data.createdAt,
            contattato: data.contattato || false,
            commenti: data.commenti || '',
            sponsor: data.sponsor || '', // Recupera il campo sponsor se presente
          } as Lead;
        });
        setLeads(leadsList);
        setFilteredLeads(leadsList);
      } catch (error) {
        console.error('Errore durante il recupero dei leads:', error);
        addToast('Errore durante il recupero dei leads', 'error');
      }
    };

    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const userSnapshot = await getDocs(usersCollection);
        const usersList = userSnapshot.docs.map(doc => {
          const data = doc.data() as User;
          return {
            ...data,
            id: doc.id,
          };
        });
        setUsers(usersList);
        setFilteredUsers(usersList);
      } catch (error) {
        console.error('Errore durante il recupero degli utenti:', error);
        addToast('Errore durante il recupero degli utenti', 'error');
      }
    };

    fetchLeads();
    fetchUsers();
  }, [addToast]);

  // Effetto per filtrare utenti
  useEffect(() => {
    setFilteredUsers(users.filter(user =>
      (user.nome?.toLowerCase() ?? '').includes(searchUsersNome.toLowerCase()) &&
      (user.cognome?.toLowerCase() ?? '').includes(searchUsersCognome.toLowerCase()) &&
      ((user.sponsor?.toLowerCase() ?? '').includes(searchUsersSponsor.toLowerCase())) &&
      (user.codiceUnivoco?.toLowerCase() ?? '').includes(searchUsersCodice.toLowerCase())
    ));
  }, [users, searchUsersNome, searchUsersCognome, searchUsersSponsor, searchUsersCodice]);

  // Effetto per filtrare leads
  useEffect(() => {
    setFilteredLeads(leads.filter(lead =>
      (lead.nome?.toLowerCase() ?? '').includes(searchLeadsNome.toLowerCase()) &&
      (lead.cognome?.toLowerCase() ?? '').includes(searchLeadsCognome.toLowerCase()) &&
      (lead.email?.toLowerCase() ?? '').includes(searchLeadsEmail.toLowerCase()) &&
      (lead.telefono?.toLowerCase() ?? '').includes(searchLeadsTelefono.toLowerCase())
    ));
  }, [leads, searchLeadsNome, searchLeadsCognome, searchLeadsEmail, searchLeadsTelefono]);

  // Funzioni per modificare/eliminare utenti
  const handleEditUser = (user: User) => {
    setEditUserData(user);
    setShowEditUserModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo utente?")) return;
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setFilteredUsers(prev => prev.filter(u => u.id !== userId));
      addToast('Utente eliminato con successo', 'success');
    } catch (error) {
      console.error('Errore durante l\'eliminazione utente:', error);
      addToast('Errore durante l\'eliminazione utente', 'error');
    }
  };

  const handleUpdateUserData = async (updatedData: UserFormData) => {
    if (!editUserData) return;
    try {
      const userRef = doc(db, 'users', editUserData.id);
      await updateDoc(userRef, {
        nome: updatedData.nome,
        cognome: updatedData.cognome,
        ruolo: updatedData.ruolo,
        sponsor: updatedData.sponsor ?? '',
      });
      setUsers(prev => prev.map(u => u.id === editUserData.id ? { ...u, ...updatedData } : u));
      setFilteredUsers(prev => prev.map(u => u.id === editUserData.id ? { ...u, ...updatedData } : u));
      addToast('Utente aggiornato con successo', 'success');
      setShowEditUserModal(false);
      setEditUserData(null);
    } catch (error) {
      console.error('Errore durante l\'aggiornamento utente:', error);
      addToast('Errore durante l\'aggiornamento utente', 'error');
    }
  };

  // Funzioni per modificare/eliminare leads
  const handleEditLead = (lead: Lead) => {
    setEditLeadData(lead);
    setShowEditLeadModal(true);
    resetLead({
      nome: lead.nome,
      cognome: lead.cognome,
      email: lead.email,
      telefono: lead.telefono,
      contattato: lead.contattato || false,
      commenti: lead.commenti || '',
      sponsor: lead.sponsor || '',
    });
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo lead?")) return;
    try {
      const leadRef = doc(db, 'leads', leadId);
      await deleteDoc(leadRef);
      setLeads(prev => prev.filter(l => l.id !== leadId));
      setFilteredLeads(prev => prev.filter(l => l.id !== leadId));
      addToast('Lead eliminato con successo', 'success');
    } catch (error) {
      console.error('Errore durante l\'eliminazione lead:', error);
      addToast('Errore durante l\'eliminazione lead', 'error');
    }
  };

  const handleUpdateLead = async (data: LeadFormData) => {
    if (!editLeadData) return;
    try {
      const leadRef = doc(db, 'leads', editLeadData.id);
      await updateDoc(leadRef, {
        nome: data.nome,
        cognome: data.cognome,
        email: data.email,
        telefono: data.telefono,
        contattato: data.contattato,
        commenti: data.commenti ?? '',
        sponsor: data.sponsor ?? '',
      });
      setLeads(prev => prev.map(l => l.id === editLeadData.id ? { ...l, ...data } : l));
      setFilteredLeads(prev => prev.map(l => l.id === editLeadData.id ? { ...l, ...data } : l));
      addToast('Lead aggiornato con successo', 'success');
      setShowEditLeadModal(false);
      setEditLeadData(null);
    } catch (error) {
      console.error('Errore durante l\'aggiornamento lead:', error);
      addToast('Errore durante l\'aggiornamento lead', 'error');
    }
  };

  // Funzione per toggle del campo "contattato" nei leads
  const toggleLeadContattato = async (lead: Lead) => {
    try {
      const leadRef = doc(db, 'leads', lead.id);
      await updateDoc(leadRef, { contattato: !lead.contattato });
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, contattato: !l.contattato } : l));
      setFilteredLeads(prev => prev.map(l => l.id === lead.id ? { ...l, contattato: !l.contattato } : l));
      addToast(`Lead ${!lead.contattato ? 'contattato' : 'non contattato'}`, 'success');
    } catch (error) {
      console.error('Errore nel toggle contattato:', error);
      addToast('Errore durante l\'aggiornamento del contatto lead', 'error');
    }
  };

  return (
    <section className="relative min-h-screen bg-black text-white">
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/50 to-black z-10" />

      {/* Background Image and Gradient Overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2070')] bg-cover bg-center opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 mix-blend-overlay" />
      </div>

      {/* Contenuto Principale */}
      <div className="relative z-20 max-w-6xl mx-auto p-4 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <GradientText>Pannello Amministratore</GradientText>
          </h1>
          <p className="text-gray-300">
            Gestisci gli utenti e monitora i leads
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

            <form onSubmit={handleSubmit(onSubmitUser)} className="space-y-4">
              {/* Campo Nome */}
              <div>
                <label
                  htmlFor="nome"
                  className="block text-sm font-medium text-yellow-600 mb-1"
                >
                  Nome
                </label>
                <input
                  type="text"
                  id="nome"
                  {...register('nome')}
                  className="w-full px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Nome"
                />
                {errors.nome && (
                  <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>
                )}
              </div>

              {/* Campo Cognome */}
              <div>
                <label
                  htmlFor="cognome"
                  className="block text-sm font-medium text-yellow-600 mb-1"
                >
                  Cognome
                </label>
                <input
                  type="text"
                  id="cognome"
                  {...register('cognome')}
                  className="w-full px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Cognome"
                />
                {errors.cognome && (
                  <p className="text-red-500 text-sm mt-1">{errors.cognome.message}</p>
                )}
              </div>

              {/* Campo Selezione Ruolo */}
              <div>
                <label
                  htmlFor="ruolo"
                  className="block text-sm font-medium text-yellow-600 mb-1"
                >
                  Ruolo
                </label>
                <select
                  id="ruolo"
                  {...register('ruolo')}
                  className="w-full px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  defaultValue=""
                >
                  <option value="" disabled>Seleziona un ruolo</option>
                  {ruoliDisponibili.map((ruolo) => (
                    <option key={ruolo} value={ruolo}>
                      {ruolo}
                    </option>
                  ))}
                </select>
                {errors.ruolo && (
                  <p className="text-red-500 text-sm mt-1">{errors.ruolo.message}</p>
                )}
              </div>

              {/* Campo Sponsor */}
              <div>
                <label
                  htmlFor="sponsor"
                  className="block text-sm font-medium text-yellow-600 mb-1"
                >
                  Sponsor (opzionale)
                </label>
                <input
                  type="text"
                  id="sponsor"
                  {...register('sponsor')}
                  className="w-full px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Sponsor se presente"
                />
                {errors.sponsor && (
                  <p className="text-red-500 text-sm mt-1">{errors.sponsor.message}</p>
                )}
              </div>

              {/* Bottone di Invio */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-yellow-400 text-black py-2 rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Creazione in corso...' : 'Crea Utente'}
              </button>
            </form>
          </div>

          {/* Filtro Utenti */}
          <div className="bg-black/50 p-6 rounded-lg border border-yellow-600/20 shadow-sm backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4">
              <GradientText>Filtri Utenti</GradientText>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              <input
                type="text"
                value={searchUsersNome}
                onChange={(e) => setSearchUsersNome(e.target.value)}
                className="px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md"
                placeholder="Nome"
              />
              <input
                type="text"
                value={searchUsersCognome}
                onChange={(e) => setSearchUsersCognome(e.target.value)}
                className="px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md"
                placeholder="Cognome"
              />
              <input
                type="text"
                value={searchUsersSponsor}
                onChange={(e) => setSearchUsersSponsor(e.target.value)}
                className="px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md"
                placeholder="Sponsor"
              />
              <input
                type="text"
                value={searchUsersCodice}
                onChange={(e) => setSearchUsersCodice(e.target.value)}
                className="px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md"
                placeholder="Codice Univoco"
              />
            </div>

            <h2 className="text-xl font-semibold mb-2">
              <GradientText>Utenti</GradientText>
            </h2>
            <div className="max-h-96 overflow-y-auto space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-4 border border-yellow-600 rounded-lg bg-gray-800 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-white">
                        {user.nome} {user.cognome}
                      </h3>
                      {user.sponsor && (
                        <p className="text-sm text-gray-300">Sponsor: {user.sponsor}</p>
                      )}
                      <p className="text-sm text-gray-300">Ruolo: {user.ruolo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono bg-yellow-600 text-black px-2 py-1 rounded">
                        {user.codiceUnivoco}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-2 justify-end">
                    <button onClick={() => handleEditUser(user)} className="bg-yellow-400 text-black py-1 px-2 rounded hover:bg-yellow-500 flex items-center space-x-1">
                      <Pencil className="w-4 h-4" />
                      <span>Modifica</span>
                    </button>
                    <button onClick={() => handleDeleteUser(user.id)} className="bg-red-600 text-white py-1 px-2 rounded hover:bg-red-700 flex items-center space-x-1">
                      <Trash2 className="w-4 h-4" />
                      <span>Elimina</span>
                    </button>
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <p className="text-gray-300 text-center py-4">
                  Nessun utente trovato
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Lista Leads con Filtri */}
        <div className="bg-black/50 p-6 rounded-lg border border-yellow-600/20 shadow-sm backdrop-blur-sm mt-8">
          <h2 className="text-xl font-semibold mb-4">
            <GradientText>Filtri Leads</GradientText>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
            <input
              type="text"
              value={searchLeadsNome}
              onChange={(e) => setSearchLeadsNome(e.target.value)}
              className="px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md"
              placeholder="Nome"
            />
            <input
              type="text"
              value={searchLeadsCognome}
              onChange={(e) => setSearchLeadsCognome(e.target.value)}
              className="px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md"
              placeholder="Cognome"
            />
            <input
              type="text"
              value={searchLeadsEmail}
              onChange={(e) => setSearchLeadsEmail(e.target.value)}
              className="px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md"
              placeholder="Email"
            />
            <input
              type="text"
              value={searchLeadsTelefono}
              onChange={(e) => setSearchLeadsTelefono(e.target.value)}
              className="px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md"
              placeholder="Telefono"
            />
          </div>

          <h2 className="text-xl font-semibold mb-2">
            <GradientText>Leads</GradientText>
          </h2>
          <div className="max-h-96 overflow-y-auto space-y-4">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="p-4 border border-yellow-600 rounded-lg bg-gray-800 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-white">
                      {lead.nome} {lead.cognome}
                    </h3>
                    <p className="text-sm text-gray-300">
                      Email: {lead.email}
                    </p>
                    <p className="text-sm text-gray-300">
                      Telefono: {lead.telefono}
                    </p>
                    <p className="text-sm text-gray-300">
                      Data: {new Date(lead.createdAt.toDate()).toLocaleDateString()}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        type="checkbox"
                        checked={lead.contattato || false}
                        onChange={() => toggleLeadContattato(lead)}
                        className="h-4 w-4 text-yellow-500 border-yellow-600"
                      />
                      <span className="text-sm text-gray-300">{lead.contattato ? 'Contattato' : 'Non contattato'}</span>
                    </div>
                    {lead.commenti && (
                      <p className="text-sm text-gray-300 mt-2">
                        Commenti: {lead.commenti}
                      </p>
                    )}
                    {lead.sponsor && (
                      <p className="text-sm text-gray-300 mt-2">
                        Sponsor: {lead.sponsor}
                      </p>
                    )}
                  </div>
                  <div className="text-right space-y-2">
                    <button onClick={() => handleEditLead(lead)} className="bg-yellow-400 text-black py-1 px-2 rounded hover:bg-yellow-500 flex items-center space-x-1">
                      <Pencil className="w-4 h-4" />
                      <span>Modifica</span>
                    </button>
                    <button onClick={() => handleDeleteLead(lead.id)} className="bg-red-600 text-white py-1 px-2 rounded hover:bg-red-700 flex items-center space-x-1">
                      <Trash2 className="w-4 h-4" />
                      <span>Elimina</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredLeads.length === 0 && (
              <p className="text-gray-300 text-center py-4">
                Nessun lead trovato
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal Modifica Utente */}
      {showEditUserModal && editUserData && (
        <EditUserModal
          userData={editUserData}
          onClose={() => {
            setShowEditUserModal(false);
            setEditUserData(null);
          }}
          onSave={handleUpdateUserData}
          ruoliDisponibili={ruoliDisponibili}
        />
      )}

      {/* Modal Modifica Lead */}
      {showEditLeadModal && editLeadData && (
        <EditLeadModal
          leadData={editLeadData}
          onClose={() => {
            setShowEditLeadModal(false);
            setEditLeadData(null);
          }}
          onSave={handleUpdateLead}
          isSubmitting={isSubmittingLead}
          errors={errorsLead}
          register={registerLead}
          handleSubmitLead={handleSubmitLead}
        />
      )}
    </section>
  );
}

// Modal per modificare l'utente
interface EditUserModalProps {
  userData: User;
  onClose: () => void;
  onSave: (data: UserFormData) => void;
  ruoliDisponibili: Ruolo[];
}

function EditUserModal({ userData, onClose, onSave, ruoliDisponibili }: EditUserModalProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nome: userData.nome,
      cognome: userData.cognome,
      ruolo: userData.ruolo,
      sponsor: userData.sponsor ?? '',
    },
  });

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">Modifica Utente</h3>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          {/* Campo Nome */}
          <div>
            <label className="block text-sm font-medium text-yellow-600 mb-1">Nome</label>
            <input
              type="text"
              {...register('nome')}
              className="w-full px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            />
            {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>}
          </div>

          {/* Campo Cognome */}
          <div>
            <label className="block text-sm font-medium text-yellow-600 mb-1">Cognome</label>
            <input
              type="text"
              {...register('cognome')}
              className="w-full px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            />
            {errors.cognome && <p className="text-red-500 text-sm mt-1">{errors.cognome.message}</p>}
          </div>

          {/* Campo Ruolo */}
          <div>
            <label className="block text-sm font-medium text-yellow-600 mb-1">Ruolo</label>
            <select
              {...register('ruolo')}
              className="w-full px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            >
              {ruoliDisponibili.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {errors.ruolo && <p className="text-red-500 text-sm mt-1">{errors.ruolo.message}</p>}
          </div>

          {/* Campo Sponsor */}
          <div>
            <label className="block text-sm font-medium text-yellow-600 mb-1">Sponsor (opzionale)</label>
            <input
              type="text"
              {...register('sponsor')}
              className="w-full px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            />
            {errors.sponsor && <p className="text-red-500 text-sm mt-1">{errors.sponsor.message}</p>}
          </div>

          {/* Pulsanti di Azione */}
          <div className="flex justify-end space-x-2">
            <button onClick={onClose} type="button" className="bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-600">
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-yellow-400 text-black py-2 px-4 rounded-md hover:bg-yellow-500 transition-colors"
            >
              {isSubmitting ? 'Salvataggio...' : 'Salva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal per modificare il lead
interface EditLeadModalProps {
  leadData: Lead;
  onClose: () => void;
  onSave: (data: LeadFormData) => void;
  isSubmitting: boolean;
  errors: any;
  register: ReturnType<typeof useForm>["register"];
  handleSubmitLead: ReturnType<typeof useForm>["handleSubmit"];
}

function EditLeadModal({ leadData, onClose, onSave, isSubmitting, errors, register, handleSubmitLead }: EditLeadModalProps) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">Modifica Lead</h3>
        <form onSubmit={handleSubmitLead(onSave)} className="space-y-4">
          {/* Campo Nome */}
          <div>
            <label className="block text-sm font-medium text-yellow-600 mb-1">Nome</label>
            <input
              type="text"
              {...register('nome')}
              className="w-full px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            />
            {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>}
          </div>

          {/* Campo Cognome */}
          <div>
            <label className="block text-sm font-medium text-yellow-600 mb-1">Cognome</label>
            <input
              type="text"
              {...register('cognome')}
              className="w-full px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            />
            {errors.cognome && <p className="text-red-500 text-sm mt-1">{errors.cognome.message}</p>}
          </div>

          {/* Campo Email */}
          <div>
            <label className="block text-sm font-medium text-yellow-600 mb-1">Email</label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          {/* Campo Telefono */}
          <div>
            <label className="block text-sm font-medium text-yellow-600 mb-1">Telefono</label>
            <input
              type="text"
              {...register('telefono')}
              className="w-full px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            />
            {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono.message}</p>}
          </div>

          {/* Campo Contattato */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('contattato')}
              className="h-4 w-4 text-yellow-500 border-yellow-600"
            />
            <span className="text-sm text-gray-300">Contattato</span>
          </div>
          {errors.contattato && <p className="text-red-500 text-sm mt-1">{errors.contattato.message}</p>}

          {/* Campo Commenti */}
          <div>
            <label className="block text-sm font-medium text-yellow-600 mb-1">Commenti (opzionale)</label>
            <textarea
              {...register('commenti')}
              className="w-full px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="Aggiungi commenti..."
              rows={3}
            ></textarea>
            {errors.commenti && <p className="text-red-500 text-sm mt-1">{errors.commenti.message}</p>}
          </div>

          {/* Campo Sponsor */}
          <div>
            <label className="block text-sm font-medium text-yellow-600 mb-1">Sponsor (opzionale)</label>
            <input
              type="text"
              {...register('sponsor')}
              className="w-full px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="Sponsor se presente"
            />
            {errors.sponsor && <p className="text-red-500 text-sm mt-1">{errors.sponsor.message}</p>}
          </div>

          {/* Pulsanti di Azione */}
          <div className="flex justify-end space-x-2">
            <button onClick={onClose} type="button" className="bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-600">
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-yellow-400 text-black py-2 px-4 rounded-md hover:bg-yellow-500 transition-colors"
            >
              {isSubmitting ? 'Salvataggio...' : 'Salva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

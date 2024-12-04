"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createNewUser } from '../services/admin';
import { useToast } from '../hooks/useToast';
import { UserPlus, Users, ChevronRight, Lock } from 'lucide-react';
import { User, Ruolo } from '../types';
import { getFirestore, collection, getDocs, Timestamp } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { GradientText } from '../components/layout/GradientText'; // Assicurati che il percorso sia corretto

const db = getFirestore(app);

// Definizione dei ruoli disponibili
const ruoliDisponibili: Ruolo[] = ["Base", "Avanzato", "admin", "utente"];

// Schema di validazione per la creazione di un nuovo utente
const userSchema = z.object({
  nome: z.string().min(2, 'Nome troppo corto'),
  cognome: z.string().min(2, 'Cognome troppo corto'),
  referral: z.string().min(2, 'Referral obbligatorio'), // Rimuovi questa riga se non vuoi più "referral"
  ruolo: z.enum(ruoliDisponibili, { required_error: 'Ruolo obbligatorio' }),
});

type UserFormData = z.infer<typeof userSchema>;

// Tipo Lead aggiornato
type Lead = {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  createdAt: Timestamp;
};

export function Admin() {
  const { addToast } = useToast();
  const [users, setUsers] = React.useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = React.useState<User[]>([]);
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = React.useState<Lead[]>([]);
  const [searchTermUsers, setSearchTermUsers] = React.useState('');
  const [searchTermLeads, setSearchTermLeads] = React.useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = async (data: UserFormData) => {
    console.debug('Invio del form con i dati:', data);
    try {
      const newUser = await createNewUser({
        ...data,
        dataRegistrazione: new Date(),
      });
      console.debug('Nuovo utente creato:', newUser);
      addToast(`Utente creato con successo. Codice: ${newUser.codiceUnivoco}`, 'success');
      setUsers((prev) => [...prev, newUser]);
      reset();
    } catch (error: any) { // Aggiunto tipo any per l'errore
      console.error('Errore durante la creazione dell\'utente:', error);
      addToast('Errore durante la creazione dell\'utente: ' + (error.message || error), 'error');
    }
  };

  React.useEffect(() => {
    const fetchLeads = async () => {
      console.debug('Inizio fetch dei leads');
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
          } as Lead;
        });
        console.debug('Leads recuperati:', leadsList);
        setLeads(leadsList);
        setFilteredLeads(leadsList);
      } catch (error) {
        console.error('Errore durante il recupero dei leads:', error);
        addToast('Errore durante il recupero dei leads', 'error');
      }
    };

    const fetchUsers = async () => {
      console.debug('Inizio fetch degli utenti');
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
        console.debug('Utenti recuperati:', usersList);
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

  const handleUserSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    console.debug('Termine di ricerca utenti:', value);
    setSearchTermUsers(value);
    setFilteredUsers(users.filter(user =>
      user.nome.toLowerCase().includes(value) ||
      user.cognome.toLowerCase().includes(value) ||
      user.referral.toLowerCase().includes(value) || // Rimuovi questa parte se "referral" non è più usato
      user.codiceUnivoco.toLowerCase().includes(value)
    ));
  };

  const handleLeadSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    console.debug('Termine di ricerca leads:', value);
    setSearchTermLeads(value);
    setFilteredLeads(leads.filter(lead =>
      lead.nome.toLowerCase().includes(value) ||
      lead.cognome.toLowerCase().includes(value) ||
      lead.email.toLowerCase().includes(value) ||
      lead.telefono.includes(value)
    ));
  };

  return (
    <section className="relative min-h-screen bg-black text-white">
      {/* Background Gradient Overlay */}
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

              {/* Se desideri rimuovere anche il campo Referral, commenta o elimina questa sezione */}
              <div>
                <label
                  htmlFor="referral"
                  className="block text-sm font-medium text-yellow-600 mb-1"
                >
                  Referral
                </label>
                <input
                  type="text"
                  id="referral"
                  {...register('referral')}
                  className="w-full px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Nome del referral"
                />
                {errors.referral && (
                  <p className="text-red-500 text-sm mt-1">{errors.referral.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-yellow-400 text-black py-2 rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Creazione in corso...' : 'Crea Utente'}
              </button>
            </form>
          </div>

          {/* Lista Utenti con Filtri */}
          <div className="bg-black/50 p-6 rounded-lg border border-yellow-600/20 shadow-sm backdrop-blur-sm">
            <div className="flex items-center mb-6">
              <Users className="w-6 h-6 text-yellow-600 mr-2" />
              <h2 className="text-xl font-semibold">
                <GradientText>Utenti Recenti</GradientText>
              </h2>
            </div>

            <input
              type="text"
              value={searchTermUsers}
              onChange={handleUserSearch}
              className="w-full mb-4 px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="Cerca per nome, cognome, referral, codice univoco..."
            />

            <div className="space-y-4">
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
                      {/* Rimuovi questa sezione se "referral" non è più usato */}
                      <p className="text-sm text-gray-300">
                        Referral: {user.referral}
                      </p>
                      {/* Visualizzazione del ruolo */}
                      <p className="text-sm text-gray-300">
                        Ruolo: {user.ruolo}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono bg-yellow-600 text-black px-2 py-1 rounded">
                        {user.codiceUnivoco}
                      </p>
                    </div>
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
          <div className="flex items-center mb-6">
            <Users className="w-6 h-6 text-yellow-600 mr-2" />
            <h2 className="text-xl font-semibold">
              <GradientText>Leads Raccolti</GradientText>
            </h2>
          </div>

          <input
            type="text"
            value={searchTermLeads}
            onChange={handleLeadSearch}
            className="w-full mb-4 px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
            placeholder="Cerca per nome, cognome, email, telefono..."
          />

          <div className="space-y-4">
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
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-300">
                      {new Date(lead.createdAt.toDate()).toLocaleDateString()}
                    </p>
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
    </section>
  );
}

import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '../lib/firebase'; // Assicurati che punti al file di configurazione Firebase
import { useAuth } from '../../hooks/useAuth'; // Hook personalizzato per gestire l'autenticazione (se presente)

const db = getFirestore(app);

type Lead = {
  id: string;
  email: string;
  referral: string;
  videoPreference: string;
  createdAt: string;
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Assicurati che `useAuth` restituisca le info sull'utente autenticato

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        // Recupera i lead dalla collezione "leads"
        const querySnapshot = await getDocs(collection(db, 'leads'));
        const leadsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Lead[];
        setLeads(leadsData);
      } catch (error) {
        console.error('Errore nel recupero dei leads:', error);
      } finally {
        setLoading(false);
      }
    };

    // Verifica se l'utente è admin
    if (user?.isAdmin) {
      fetchLeads();
    } else {
      console.error('Accesso negato: l’utente non è admin.');
    }
  }, [user]);

  if (!user?.isAdmin) {
    return <div>Accesso negato. Solo gli admin possono visualizzare questa pagina.</div>;
  }

  if (loading) {
    return <div>Caricamento in corso...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Leads</h1>
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Referral</th>
              <th className="px-6 py-3">Preferenza Video</th>
              <th className="px-6 py-3">Data Creazione</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-3">{lead.email}</td>
                <td className="px-6 py-3">{lead.referral}</td>
                <td className="px-6 py-3">{lead.videoPreference}</td>
                <td className="px-6 py-3">{new Date(lead.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

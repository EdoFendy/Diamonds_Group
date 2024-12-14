import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { toast } from 'sonner';
import { getFirestore, collection, addDoc, Timestamp, doc, getDoc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { app } from '../../lib/firebase';
import { GradientText } from '../layout/GradientText';
import { User } from '../../types/index'; // Importa l'interfaccia User

const db = getFirestore(app);

// Schema di validazione con Zod, aggiunta accettazionePolicy
const leadSchema = z.object({
  nome: z.string().min(2, 'Il nome è troppo corto'),
  cognome: z.string().min(2, 'Il cognome è troppo corto'),
  email: z.string().email('Email non valida'),
  telefono: z
    .string()
    .min(9, 'Numero di telefono troppo corto')
    .max(11, 'Numero di telefono troppo lungo')
    .regex(/^[0-9]+$/, 'Numero di telefono non valido'),
  sponsor: z.string().min(2, 'Lo sponsor è troppo corto'),
  accettazionePolicy: z.boolean().refine(val => val === true, {
    message: 'Devi accettare le policy prima di inviare il form',
  }),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-white">{label}</Label>
      {children}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

export function LeadForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  });

  const [counter, setCounter] = useState(0);
  const [referralId, setReferralId] = useState<string | null>(null);
  const [sponsorName, setSponsorName] = useState<string>('');

  useEffect(() => {
    // Incrementa il contatore dei visitatori
    const incrementCounter = async () => {
      const counterDocRef = doc(db, 'siteData', 'visitorCounter');
      const counterDoc = await getDoc(counterDocRef);

      if (counterDoc.exists()) {
        const newCount = counterDoc.data().count + 1;
        await setDoc(counterDocRef, { count: newCount });
        setCounter(newCount);
      } else {
        await setDoc(counterDocRef, { count: 1 });
        setCounter(1);
      }
    };

    incrementCounter();

    // Cattura il referral ID dalla URL
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralId(ref);
      fetchSponsorName(ref);
    }
  }, []);

  // Funzione per recuperare il nome dello sponsor basato sul referralId
  const fetchSponsorName = async (refId: string) => {
    try {
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where('referralId', '==', refId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const sponsorData = querySnapshot.docs[0].data() as User;
        setSponsorName(`${sponsorData.nome} ${sponsorData.cognome}`);
      } else {
        console.warn('Nessuno sponsor trovato per il referralId:', refId);
      }
    } catch (error) {
      console.error('Errore nel recuperare lo sponsor:', error);
    }
  };

  const onSubmit = async (data: LeadFormData) => {
    try {
      // Aggiungi il nome dello sponsor se presente
      const leadData = {
        nome: data.nome,
        cognome: data.cognome,
        email: data.email,
        telefono: data.telefono,
        sponsor: sponsorName || data.sponsor, // Priorità allo sponsor tramite referral link
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'leads'), leadData);

      toast.success('Richiesta inviata con successo!');
      reset();
    } catch (error) {
      console.error("Errore nell'invio della richiesta:", error);
      toast.error("Errore nell'invio della richiesta");
    }
  };

  return (
    <section id="lead-form" className="relative py-24 bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/50 to-black z-10" />

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2070')] bg-repeat bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 mix-blend-overlay" />
      </div>

      <div className="relative z-20 container mx-auto px-4">
        <Card className="max-w-md mx-auto bg-black/20 border-yellow-600/50 backdrop-blur-sm p-8">
          <h2 className="text-4xl font-bold text-center mb-3">
            <GradientText>Scopri di più</GradientText>
          </h2>
          <h3 className="text-l text-center">
            Verrai presto contattato da noi!
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField label="Nome" error={errors.nome?.message}>
              <Input
                type="text"
                {...register('nome')}
                className="bg-neutral-800 border-yellow-600/50 text-white placeholder-gray-400 w-full"
                placeholder="Il tuo nome"
              />
            </FormField>

            <FormField label="Cognome" error={errors.cognome?.message}>
              <Input
                type="text"
                {...register('cognome')}
                className="bg-neutral-800 border-yellow-600/50 text-white placeholder-gray-400 w-full"
                placeholder="Il tuo cognome"
              />
            </FormField>

            <FormField label="Email" error={errors.email?.message}>
              <Input
                type="email"
                {...register('email')}
                className="bg-neutral-800 border-yellow-600/50 text-white placeholder-gray-400 w-full"
                placeholder="La tua email"
              />
            </FormField>

            <FormField label="Telefono" error={errors.telefono?.message}>
              <Input
                type="text"
                {...register('telefono')}
                className="bg-neutral-800 border-yellow-600/50 text-white placeholder-gray-400 w-full"
                placeholder="Il tuo numero di telefono"
              />
            </FormField>

            {sponsorName ? (
              <div className="space-y-2">
                <Label className="text-white">Sponsor</Label>
                <Input
                  type="text"
                  value={sponsorName}
                  readOnly
                  className="bg-neutral-800 border-yellow-600/50 text-white placeholder-gray-400 w-full"
                />
              </div>
            ) : (
              <FormField label="Sponsor" error={errors.sponsor?.message}>
                <Input
                  type="text"
                  {...register('sponsor')}
                  className="bg-neutral-800 border-yellow-600/50 text-white placeholder-gray-400 w-full"
                  placeholder="Chi ti ha condiviso il sito"
                />
              </FormField>
            )}

            {/* Campo Accettazione Policy */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  id="accettazionePolicy"
                  type="checkbox"
                  {...register('accettazionePolicy')}
                  className="h-4 w-4 border-yellow-600/50 bg-neutral-800 text-yellow-600 focus:ring-0"
                />
                <label htmlFor="accettazionePolicy" className="text-white text-sm">
                  Accetto le{' '}
                  <a href="/policy" target="_blank" rel="noopener noreferrer" className="underline">
                    policy per il trattamento dei dati
                  </a>
                </label>
              </div>
              {errors.accettazionePolicy && (
                <p className="text-red-500 text-sm">{errors.accettazionePolicy.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-600 hover:from-yellow-500 hover:to-amber-700 text-black"
            >
              {isSubmitting ? 'Invio in corso...' : 'Invia Richiesta'}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
}

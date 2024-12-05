import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { toast } from 'sonner';
import { getFirestore, collection, addDoc, Timestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { app } from '../../lib/firebase'; // Assicurati che il percorso sia corretto
import logo from '../layout/logo.png'; // Assicurati di aver importato il logo
import logo2 from '../layout/logo2.png'; // Importa il logo per HeroSection (se necessario)
import { GradientText } from '../layout/GradientText';

const db = getFirestore(app);

// Schema di validazione con Zod
const leadSchema = z.object({
  nome: z.string().min(2, 'Il nome è troppo corto'),
  cognome: z.string().min(2, 'Il cognome è troppo corto'),
  email: z.string().email('Email non valida'),
  telefono: z
    .string()
    .min(9, 'Numero di telefono troppo corto')
    .max(11, 'Numero di telefono troppo lungo')
    .regex(/^[0-9]+$/, 'Numero di telefono non valido'),
});

type LeadFormData = z.infer<typeof leadSchema>;

// Component per i campi del form
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

  const [counter, setCounter] = useState(0); // Aggiunto il contatore

  // Funzione per incrementare il contatore ogni volta che un utente visita la pagina
  useEffect(() => {
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
  }, []);

  const onSubmit = async (data: LeadFormData) => {
    try {
      // Aggiungi i dati del lead a Firestore
      await addDoc(collection(db, 'leads'), {
        nome: data.nome,
        cognome: data.cognome,
        email: data.email,
        telefono: data.telefono,
        createdAt: Timestamp.now(),
      });

      // Mostra un toast di successo
      toast.success('Richiesta inviata con successo!');
      reset();
    } catch (error) {
      console.error("Errore nell'invio della richiesta:", error);
      toast.error("Errore nell'invio della richiesta");
    }
  };

  return (
    <section id="lead-form" className="relative py-24 bg-black text-white">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/50 to-black z-10" />

      {/* Background Image and Gradient Overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2070')] bg-repeat bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 mix-blend-overlay" />
      </div>



      {/* Contenuto della LeadForm */}
      <div className="relative z-20 container mx-auto px-4">
        <Card className="max-w-md mx-auto bg-black/20 border-yellow-600/50 backdrop-blur-sm p-8">
        <h2 className="text-4xl font-bold text-center mb-3">
          <GradientText>Scopri di più</GradientText>
        </h2>
        <h3 className="text-l text-center">
          Verrai presto contattato da noi!

        </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Campo Nome */}
            <FormField label="Nome" error={errors.nome?.message}>
              <Input
                type="text"
                {...register('nome')}
                className="bg-neutral-800 border-yellow-600/50 text-white placeholder-gray-400 w-full"
                placeholder="Il tuo nome"
              />
            </FormField>

            {/* Campo Cognome */}
            <FormField label="Cognome" error={errors.cognome?.message}>
              <Input
                type="text"
                {...register('cognome')}
                className="bg-neutral-800 border-yellow-600/50 text-white placeholder-gray-400 w-full"
                placeholder="Il tuo cognome"
              />
            </FormField>

            {/* Campo Email */}
            <FormField label="Email" error={errors.email?.message}>
              <Input
                type="email"
                {...register('email')}
                className="bg-neutral-800 border-yellow-600/50 text-white placeholder-gray-400 w-full"
                placeholder="La tua email"
              />
            </FormField>

            {/* Campo Telefono */}
            <FormField label="Telefono" error={errors.telefono?.message}>
              <Input
                type="text"
                {...register('telefono')}
                className="bg-neutral-800 border-yellow-600/50 text-white placeholder-gray-400 w-full"
                placeholder="Il tuo numero di telefono"
              />
            </FormField>

            {/* Bottone di Invio */}
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

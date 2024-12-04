"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginWithCode, loginAdmin } from '../services/auth';
import { useToast } from '../hooks/useToast';
import { Lock } from 'lucide-react';
import { GradientText } from '../components/layout/GradientText'; // Assicurati che il percorso sia corretto

const userLoginSchema = z.object({
  codiceUnivoco: z.string().min(8, 'Il codice deve essere di 8 caratteri'),
});

const adminLoginSchema = z.object({
  username: z.string().nonempty('Il nome utente è obbligatorio'),
  password: z.string().nonempty('La password è obbligatoria'),
});

type UserLoginFormData = z.infer<typeof userLoginSchema>;
type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

export function Login() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isAdminLogin, setIsAdminLogin] = React.useState(false);

  // Form per utenti
  const {
    register: registerUser,
    handleSubmit: handleSubmitUser,
    formState: { errors: userErrors, isSubmitting: isSubmittingUser },
  } = useForm<UserLoginFormData>({
    resolver: zodResolver(userLoginSchema),
  });

  // Form per admin
  const {
    register: registerAdmin,
    handleSubmit: handleSubmitAdmin,
    formState: { errors: adminErrors, isSubmitting: isSubmittingAdmin },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmitUser: SubmitHandler<UserLoginFormData> = async (data) => {
    try {
      console.log('Tentativo di login con codice:', data.codiceUnivoco);
      await loginWithCode(data.codiceUnivoco.toUpperCase());
      addToast('Login effettuato con successo', 'success');
      navigate('/formazione');
    } catch (error: any) {
      console.error('Errore durante il login:', error);
      addToast('Codice non valido', 'error');
    }
  };

  const onSubmitAdmin: SubmitHandler<AdminLoginFormData> = async (data) => {
    try {
      await loginAdmin(data.username, data.password);
      addToast('Login amministratore effettuato con successo', 'success');
      navigate('/admin');
    } catch (error: any) {
      addToast('Credenziali amministratore non valide', 'error');
    }
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
      <div className="relative z-20 flex items-center justify-center min-h-screen">
        <div className="bg-black/50 p-8 rounded-lg border border-yellow-600/20 shadow-lg  w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-yellow-400/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold">
              <GradientText>Accedi a U-WIN Network</GradientText>
            </h2>
            <p className="text-gray-300 mt-2">
              {isAdminLogin
                ? 'Inserisci le tue credenziali amministratore'
                : 'Inserisci il tuo codice univoco per accedere'}
            </p>
          </div>

          {/* Toggle per switchare tra utente e admin */}
          <div className="flex justify-center mb-6">
            <button
              className={`mr-2 px-4 py-2 rounded-md ${
                !isAdminLogin ? 'bg-yellow-400 text-black' : 'bg-gray-700 text-gray-300'
              }`}
              onClick={() => setIsAdminLogin(false)}
            >
              Utente
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                isAdminLogin ? 'bg-yellow-400 text-black' : 'bg-gray-700 text-gray-300'
              }`}
              onClick={() => setIsAdminLogin(true)}
            >
              Admin
            </button>
          </div>

          {/* Form per Admin */}
          {isAdminLogin ? (
            <form onSubmit={handleSubmitAdmin(onSubmitAdmin)} className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-yellow-600 mb-1"
                >
                  Nome Utente
                </label>
                <input
                  type="text"
                  id="username"
                  {...registerAdmin('username')}
                  className="w-full px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Inserisci il nome utente"
                />
                {adminErrors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {adminErrors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-yellow-600 mb-1"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  {...registerAdmin('password')}
                  className="w-full px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Inserisci la password"
                />
                {adminErrors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {adminErrors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingAdmin}
                className="w-full bg-yellow-400 text-black py-2 rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-50"
              >
                {isSubmittingAdmin ? 'Accesso in corso...' : 'Accedi come Admin'}
              </button>
            </form>
          ) : (
            /* Form per Utenti */
            <form onSubmit={handleSubmitUser(onSubmitUser)} className="space-y-6">
              <div>
                <label
                  htmlFor="codiceUnivoco"
                  className="block text-sm font-medium text-yellow-600 mb-1"
                >
                  Codice Univoco
                </label>
                <input
                  type="text"
                  id="codiceUnivoco"
                  {...registerUser('codiceUnivoco')}
                  className="w-full px-3 py-2 border border-yellow-600 bg-gray-700 text-white rounded-md focus:ring-yellow-500 focus:border-yellow-500 uppercase"
                  placeholder="Inserisci il tuo codice"
                />
                {userErrors.codiceUnivoco && (
                  <p className="text-red-500 text-sm mt-1">
                    {userErrors.codiceUnivoco.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingUser}
                className="w-full bg-yellow-400 text-black py-2 rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-50"
              >
                {isSubmittingUser ? 'Accesso in corso...' : 'Accedi'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

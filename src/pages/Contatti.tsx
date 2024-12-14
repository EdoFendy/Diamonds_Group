import React from 'react';
import contactBg from '../components/layout/BG.jpg'; // Immagine di sfondo locale
import aboutImage1 from '../components/layout/contatti2.png';
import aboutImage2 from '../components/layout/contatti3.png';
import aboutImage3 from '../components/layout/contatti4.png';

import { GradientText } from '../components/layout/GradientText';

// Loghi da web
const instagramLogoUrl = 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg';
const telegramLogoUrl = 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg';
const whatsappLogoUrl = 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg';

export function Contatti() {
  return (
    <section className="relative min-h-screen bg-black text-white">
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/50 to-black z-10" />

      {/* Sfondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${contactBg})` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 mix-blend-overlay" />
      </div>

      {/* Contenuto Principale */}
      <div className="relative z-20 max-w-3xl lg:max-w-4xl xl:max-w-6xl mx-auto px-4 pt-16 pb-10">
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
            <GradientText>Contatti</GradientText>
          </h1>
          <p className="text-gray-300 text-sm md:text-base lg:text-lg">
            Resta in contatto con noi attraverso i nostri canali ufficiali.
          </p>
        </div>

        {/* Sezione Contatti */}
        <div className="bg-black/50 p-3 md:p-4 lg:p-6 rounded-md shadow-sm backdrop-blur-sm mb-8 md:mb-12">
 
          <div className="space-y-2 md:space-y-3 lg:space-y-4 text-sm md:text-base">
            <div className="flex items-center justify-center space-x-2 md:space-x-3">
              <img src={instagramLogoUrl} alt="Instagram" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
              <a
                href="https://instagram.com/xeldorado369"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-yellow-400 transition-colors"
              >
                Instagram: @xeldorado369
              </a>
            </div>
            <div className="flex items-center justify-center space-x-2 md:space-x-3">
              <img src={telegramLogoUrl} alt="Telegram" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
              <a
                href="https://t.me/xeldorado369"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-yellow-400 transition-colors"
              >
                Telegram: t.me/xeldorado369
              </a>
            </div>
            <div className="flex items-center justify-center space-x-2 md:space-x-3">
              <img src={whatsappLogoUrl} alt="WhatsApp" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
              <a
                href="https://wa.me/393533852892"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-yellow-400 transition-colors"
              >
                WhatsApp: +39 3533852892
              </a>
            </div>
          </div>
        </div>

        {/* Sezione Chi Siamo */}
        {/* Più simile alla Hero: centrale su mobile, più spazioso e grande su desktop */}
        <div className="space-y-6 md:space-y-8 lg:space-y-10">
          {/* Blocco 1 */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
            <div className="md:w-1/2 order-2 md:order-1 flex flex-col md:items-end text-sm md:text-base lg:text-lg">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-2 md:mb-4 text-center md:text-right">
                <GradientText>Chi Siamo</GradientText>
              </h2>
              <p className="text-gray-300 mb-2 md:mb-3 md:text-right">
                Siamo un gruppo di professionisti esperti nel campo della finanza decentralizzata e dell'online business. La nostra missione è guidarti verso il successo.
              </p>
              <p className="text-gray-300 md:text-right">
                Con la nostra visione globale e il nostro approccio innovativo, ti aiutiamo a cogliere le opportunità del mercato digitale con soluzioni su misura.
              </p>
            </div>
            <div className="md:w-1/2 order-1 md:order-2 flex justify-center">
              <img
                src={aboutImage1}
                alt="Chi Siamo"
                className="h-32 w-auto md:h-48 lg:h-64 object-cover rounded-sm"
              />
            </div>
          </div>

          {/* Blocco 2 */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
            <div className="md:w-1/2 flex justify-center">
              <img
                src={aboutImage2}
                alt="Il nostro Approccio"
                className="h-32 w-auto md:h-48 lg:h-64 object-cover rounded-sm"
              />
            </div>
            <div className="md:w-1/2 flex flex-col md:items-start text-sm md:text-base lg:text-lg">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-2 md:mb-4 text-center md:text-left">
                <GradientText>Il Nostro Approccio</GradientText>
              </h2>
              <p className="text-gray-300 mb-2 md:mb-3 md:text-left">
                Puntiamo sulla formazione continua, trasparenza e attenzione ai dettagli. Ascoltiamo le tue esigenze per creare strategie vincenti.
              </p>
              <p className="text-gray-300 md:text-left">
                La fiducia e la meritocrazia guidano le nostre scelte, accompagnandoti verso risultati concreti e duraturi.
              </p>
            </div>
          </div>

          {/* Blocco 3 */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
            <div className="md:w-1/2 order-2 md:order-1 flex flex-col md:items-end text-sm md:text-base lg:text-lg">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-2 md:mb-4 text-center md:text-right">
                <GradientText>Il Tuo Successo</GradientText>
              </h2>
              <p className="text-gray-300 mb-2 md:mb-3 md:text-right">
                Il tuo successo è la nostra priorità. Ti aiutiamo a crescere nel mercato globale, sfruttando l'economia digitale.
              </p>
              <p className="text-gray-300 md:text-right">
                Con il nostro supporto, affronterai ogni sfida e svilupperai al massimo il tuo potenziale.
              </p>
            </div>
            <div className="md:w-1/2 order-1 md:order-2 flex justify-center">
              <img
                src={aboutImage3}
                alt="Successo"
                className="h-32 w-auto md:h-48 lg:h-64 object-cover rounded-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { GradientText } from '../../src/components/layout/GradientText'; // Assicurati che il percorso sia corretto

export const PolicyPage: React.FC = () => {
  return (
    <main className="bg-black text-white">
      {/* Contenitore principale */}
      <section className="container mx-auto px-4 py-12">
        {/* Titolo principale */}
        <h1 className="text-xl font-bold text-center mb-6">
          <GradientText>Privacy Policy</GradientText>
        </h1>

        {/* Layout a due colonne */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto text-xs leading-normal">
          {/* Colonna Sinistra */}
          <div className="space-y-6 text-xs">
            <section>
              <h2 className="text-base font-semibold mb-3">1. Titolare del Trattamento dei Dati</h2>
              <p>
                Il titolare del trattamento dei dati è:  
                <strong> Riccardo Calandrino </strong>  
                <br />
                Indirizzo: Via Nausica 21, Marinella, 91022, TP, Italia  
                <br />
                Email: rcalandrino8@gmail.com  
                <br />
                Telefono: +39 3533852892
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3">2. Tipologia di Dati Raccolti</h2>
              <p>Raccogliamo i seguenti dati personali forniti volontariamente dagli utenti:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Nome e cognome</li>
                <li>Indirizzo email</li>
                <li>Numero di telefono</li>
                <li>Nome dello sponsor (se applicabile)</li>
                <li>Eventuali altri dati forniti nei campi del modulo</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3">3. Finalità del Trattamento</h2>
              <p>I dati personali raccolti saranno utilizzati per i seguenti scopi:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Rispondere alle richieste di informazioni o contatto.</li>
                <li>Fornire servizi o informazioni richieste dall'utente.</li>
                <li>Invio di comunicazioni di carattere informativo o promozionale, previo consenso.</li>
                <li>Miglioramento della qualità dei nostri servizi e analisi dei feedback.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3">8. Diritti dell’Interessato</h2>
              <p>Gli utenti hanno il diritto di:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Accedere ai propri dati personali per verificarne l'uso.</li>
                <li>Richiedere la rettifica di dati errati o incompleti.</li>
                <li>Richiedere la cancellazione dei dati personali.</li>
                <li>Limitare o opporsi al trattamento dei dati personali.</li>
                <li>Richiedere il trasferimento dei dati ad altro titolare (portabilità dei dati).</li>
                <li>Revocare il consenso in qualsiasi momento.</li>
              </ul>
            </section>
          </div>

          {/* Colonna Destra */}
          <div className="space-y-6">
            <section>
              <h2 className="text-base font-semibold mb-3">4. Base Giuridica del Trattamento</h2>
              <p>Il trattamento dei dati è effettuato sulla base di:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Consenso esplicito</strong> fornito dall’utente al momento della compilazione del modulo.</li>
                <li><strong>Necessità contrattuale</strong> per rispondere alle richieste e fornire i servizi richiesti.</li>
                <li><strong>Adempimento di obblighi legali</strong>, laddove applicabile.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3">5. Modalità del Trattamento</h2>
              <p>
                I dati personali saranno trattati mediante strumenti elettronici e/o manuali, garantendo misure di sicurezza
                adeguate per prevenirne la perdita, l'accesso non autorizzato o la divulgazione.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3">6. Comunicazione e Condivisione dei Dati</h2>
              <p>
                I dati personali non saranno ceduti a terzi senza il tuo consenso, salvo obblighi di legge o per le seguenti
                eccezioni:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Fornitori di servizi essenziali per la gestione del sito o delle comunicazioni.</li>
                <li>Autorità giudiziarie o amministrative, ove richiesto dalla legge.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3">7. Conservazione dei Dati</h2>
              <p>
                I dati personali saranno conservati per il periodo strettamente necessario a soddisfare le finalità per cui
                sono stati raccolti:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Per finalità contrattuali o amministrative: massimo 5 anni.</li>
                <li>Per finalità promozionali: fino a revoca del consenso.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3">9. Consenso al Trattamento</h2>
              <p>
                Inviando il modulo, l’utente conferma di aver letto e accettato questa informativa, fornendo il proprio consenso
                esplicito al trattamento dei dati personali per le finalità sopra descritte.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-3">10. Contatti</h2>
              <p>Per qualsiasi domanda o richiesta relativa alla privacy, puoi contattarci:</p>
              <ul className="list-disc list-inside">
                <li>Email: <strong>rcalandrino8@gmail.com</strong></li>
                <li>Telefono: <strong>+39 3533852892</strong></li>
              </ul>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
};

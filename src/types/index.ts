import { ReactNode } from "react";

// types.ts
export type Ruolo = "Base" | "Avanzato" | "admin" | "utente";

export interface User {
  uid: string;
  id: string;
  nome: string;
  cognome: string;
  email: string;
  codiceUnivoco: string;
  referral: string;
  ruolo: Ruolo;
  dataRegistrazione: Date;
  sponsor: string;
}

// types.ts
export interface ZoomMeeting {
  id: string;
  titolo: string;
  descrizione: string;
  link: string;
  data: Date; // Include sia la data che l'ora del meeting
}



// types.ts
export interface Corso {
  id: string;
  titolo: string;
  descrizione: string;
  sezioni: Sezione[];
  createdAt: Date;
  ruoliPermessi: Ruolo[]; // Aggiunto
}


export interface Sezione {
  id: string;
  titolo: string;
  videoUrl: string;
  descrizione: string;
  ordine: number;
}

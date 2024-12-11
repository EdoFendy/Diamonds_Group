import { Timestamp } from "firebase/firestore";
import { ReactNode } from "react";

export type Ruolo = "Base" | "Avanzato" | "admin" | "utente";

export interface User {
  uid: string;
  id: string;
  nome: string;
  cognome: string;
  email: string;
  codiceUnivoco: string;
  ruolo: Ruolo;
  dataRegistrazione: Date;
  sponsor?: string; // Sponsor è ora opzionale
}

export interface Lead {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  createdAt: Timestamp;
  contattato?: boolean;
  commenti?: string;
  sponsor?: string; // Sponsor è opzionale
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

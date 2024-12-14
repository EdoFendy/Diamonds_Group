import { Timestamp } from "firebase/firestore";
export type Ruolo = "Base" | "Avanzato" | "manager" | "admin" | "utente";

export interface User {
  id: string;
  uid: string;
  nome: string;
  cognome: string;
  email: string;
  ruolo: Ruolo;
  sponsor?: string;
  codiceUnivoco: string;
  referralId: string;
  referralLink: string;
  dataRegistrazione: Date;
}


export interface Lead {
  readonly id: string;

  nome: string;

  cognome: string;

  email: string;

  telefono: string;

  createdAt: Timestamp;

  contattato?: boolean;

  commenti?: string;

  sponsor?: string;
}


export interface ZoomMeeting {
  readonly id: string;

  titolo: string;

  descrizione: string;

  link: string;

  data: Date;
}

export interface Corso {
  readonly id: string;

  titolo: string;

  descrizione: string;

  sezioni: Sezione[];

  createdAt: Date;

  ruoliPermessi: Ruolo[];
}

export interface Sezione {
  readonly id: string;

  titolo: string;

  videoUrl: string;

  descrizione: string;

  ordine: number;
}

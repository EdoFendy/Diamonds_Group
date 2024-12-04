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
}

export interface Corso {
  [x: string]: ReactNode;
  sezioniCount: undefined;
  id: string;
  titolo: string;
  descrizione: string;
  sezioni: Sezione[];
  createdAt: Date;
}

export interface Sezione {
  id: string;
  titolo: string;
  videoUrl: string;
  descrizione: string;
  ordine: number;
}

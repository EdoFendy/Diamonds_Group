import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types';

export async function loginWithCode(codiceUnivoco: string): Promise<User> {
  try {
    const userQuery = await getDoc(doc(db, 'codici', codiceUnivoco));
    
    if (!userQuery.exists()) {
      throw new Error('Codice non valido');
    }

    const { email, password } = userQuery.data();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      throw new Error('Utente non trovato');
    }

    return userDoc.data() as User;
  } catch (error) {
    throw new Error('Errore durante il login');
  }
}
export async function loginAdmin(email: string, password: string): Promise<void> {
  try {
    // Effettua il login con email e password
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Recupera i dati dell'utente da Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

    if (!userDoc.exists()) {
      throw new Error('Utente non trovato');
    }

    const userData = userDoc.data() as User;

    // Verifica che l'utente abbia il ruolo di amministratore
    if (userData.ruolo !== 'admin') {
      throw new Error('Accesso non autorizzato');
    }

    // Login amministratore riuscito
  } catch (error) {
    throw new Error('Errore durante il login amministratore');
  }
}


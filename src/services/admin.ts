import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { User, Ruolo } from '../types';

export async function createNewUser(userData: {
  nome: string;
  cognome: string;
  referral: string;
  ruolo: Ruolo;
}): Promise<User> {
  try {
    // Assicurati che la persistenza sia attiva
    await setPersistence(auth, browserSessionPersistence);

    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Utente non autenticato. Assicurati che l\'utente sia loggato correttamente.');
    }
    
    console.log('Utente corrente autenticato:', currentUser);

    const adminDocRef = doc(db, 'users', currentUser.uid);
    const adminDoc = await getDoc(adminDocRef);
    
    console.log('Verifica ruolo admin:', adminDoc.data()?.ruolo);

    if (!adminDoc.exists() || adminDoc.data().ruolo !== 'admin') {
      throw new Error('Permesso negato. Solo gli amministratori possono creare nuovi utenti.');
    }

    const codiceUnivoco = generateUniqueCode();
    const tempEmail = `${codiceUnivoco}@domain.com`;
    const tempPassword = generateRandomPassword();

    console.log('Creazione dell\'utente Firebase con:', tempEmail, tempPassword);

    // Creazione dell'utente in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      tempEmail,
      tempPassword
    );

    const uid = userCredential.user.uid;

    const newUser: User = {
      uid,
      id: uid,
      nome: userData.nome,
      cognome: userData.cognome,
      email: tempEmail,
      codiceUnivoco,
      referral: userData.referral,
      ruolo: userData.ruolo,
      dataRegistrazione: new Date(),
    };

    const newUserDocRef = doc(db, 'users', uid);
    await setDoc(newUserDocRef, newUser);

    const codiceDocRef = doc(db, 'codici', codiceUnivoco);
    await setDoc(codiceDocRef, {
      email: tempEmail,
      password: tempPassword,
      uid,
    });

    console.log('Utente creato con successo:', newUser);
    return newUser;
  } catch (error) {
    console.error('Errore durante la creazione del nuovo utente:', error);
    throw error;
  }
}

// Helper functions
function generateUniqueCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function generateRandomPassword(): string {
  return (
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 4).toUpperCase() +
    '!1'
  );
}

import { auth, db, firebaseConfig } from '../lib/firebase';
import { initializeApp, FirebaseApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { User, Ruolo } from '../types';

export async function createNewUser(userData: {
  nome: string;
  cognome: string;
  // Rimuovi la linea sotto se "referral" non serve più
  referral?: string;
  sponsor: string; // Nuovo campo sponsor
  ruolo: Ruolo;
}): Promise<User> {
  let secondaryApp: FirebaseApp | null = null;
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Utente non autenticato. Assicurati che l\'utente sia loggato correttamente.');
    }

    console.log('Utente corrente autenticato:', currentUser);

    const adminDocRef = doc(db, 'users', currentUser.uid);
    const adminDoc = await getDoc(adminDocRef);

    console.log('Verifica ruolo admin:', adminDoc.data()?.ruolo);

    if (!adminDoc.exists() || adminDoc.data()?.ruolo !== 'admin') {
      throw new Error('Permesso negato. Solo gli amministratori possono creare nuovi utenti.');
    }

    const codiceUnivoco = generateUniqueCode();
    const tempEmail = `${codiceUnivoco}@domain.com`;
    const tempPassword = generateRandomPassword();

    console.log('Creazione dell\'utente Firebase con:', tempEmail, tempPassword);

    // Inizializza una seconda istanza dell'app Firebase per non disconnettere l'admin
    secondaryApp = initializeApp(firebaseConfig, 'Secondary');
    const secondaryAuth = getAuth(secondaryApp);

    // Creazione dell'utente in Firebase Authentication usando la seconda istanza
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
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
      // Se `referral` non serve più, rimuovi questa linea:
      referral: userData.referral || '',
      sponsor: userData.sponsor, // Assegna il campo sponsor
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
  } finally {
    // Elimina la seconda istanza per liberare le risorse
    if (secondaryApp) {
      await deleteApp(secondaryApp);
    }
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

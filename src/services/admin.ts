import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { User, Ruolo } from '../types';

export async function createNewUser(userData: {
  nome: string;
  cognome: string;
  sponsor?: string;
  ruolo: Ruolo;
}): Promise<User> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Utente non autenticato. Assicurati che l\'utente sia loggato correttamente.');
    }

    const adminDocRef = doc(db, 'users', currentUser.uid);
    const adminDoc = await getDoc(adminDocRef);

    if (!adminDoc.exists() || adminDoc.data()?.ruolo !== 'admin') {
      throw new Error('Permesso negato. Solo gli amministratori possono creare nuovi utenti.');
    }

    const codiceUnivoco = generateUniqueCode();
    const tempEmail = `${codiceUnivoco}@domain.com`;
    const tempPassword = generateRandomPassword();
    const referralId = generateReferralId();
    const referralLink = `https://diamonds-group.com/?ref=${referralId}`;

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
      sponsor: userData.sponsor ?? '',
      ruolo: userData.ruolo,
      referralId,
      referralLink,
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

    return newUser;
  } catch (error) {
    console.error('Errore durante la creazione del nuovo utente:', error);
    throw error;
  }
}

// Funzioni di supporto
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

function generateReferralId(): string {
  return (crypto as any).randomUUID 
    ? (crypto as any).randomUUID() 
    : 'ref-' + Math.random().toString(36).substring(2, 12);
}
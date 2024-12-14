import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { User, Ruolo } from '../types';

export async function createNewUser(userData: {
  nome: string;
  cognome: string;
  sponsor?: string;
  ruolo: Ruolo;
}): Promise<User> {
  try {
    // 1. Verifica che l'admin sia loggato
    const adminUser = auth.currentUser;
    if (!adminUser) {
      throw new Error('Utente non autenticato. Assicurati che l\'utente sia loggato correttamente.');
    }

    // 2. Salva le credenziali dell'admin per il re-login successivo
    const adminCredential = await adminUser.getIdTokenResult();
    const adminEmail = adminUser.email;
    if (!adminEmail) {
      throw new Error('Email admin non trovata');
    }

    // 3. Verifica che l'utente sia effettivamente un admin
    const adminDocRef = doc(db, 'users', adminUser.uid);
    const adminDoc = await getDoc(adminDocRef);

    if (!adminDoc.exists() || adminDoc.data()?.ruolo !== 'admin') {
      throw new Error('Permesso negato. Solo gli amministratori possono creare nuovi utenti.');
    }

    // 4. Genera i dati per il nuovo utente
    const codiceUnivoco = generateUniqueCode();
    const tempEmail = `${codiceUnivoco}@domain.com`;
    const tempPassword = generateRandomPassword();
    const referralId = generateReferralId();
    const referralLink = `https://diamonds-group.com/?ref=${referralId}`;

    // 5. Crea il nuovo utente in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      tempEmail,
      tempPassword
    );

    const uid = userCredential.user.uid;

    // 6. Prepara i dati del nuovo utente
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

    // 7. Salva i dati del nuovo utente in Firestore
    const newUserDocRef = doc(db, 'users', uid);
    await setDoc(newUserDocRef, newUser);

    // 8. Salva le credenziali temporanee nella collezione codici
    const codiceDocRef = doc(db, 'codici', codiceUnivoco);
    await setDoc(codiceDocRef, {
      email: tempEmail,
      password: tempPassword,
      uid,
    });

    // 9. Esegui il logout del nuovo utente
    await signOut(auth);

    // 10. Esegui il re-login dell'admin
    const adminAuthCredential = EmailAuthProvider.credential(
      adminEmail,
      adminCredential.token
    );
    await signInWithCredential(auth, adminAuthCredential);

    return newUser;
  } catch (error) {
    // 11. In caso di errore, prova comunque a ripristinare l'admin
    try {
      const adminUser = auth.currentUser;
      if (adminUser?.email) {
        await signOut(auth);
        // Qui dovresti implementare una logica per recuperare la password dell'admin
        // da un posto sicuro o richiedere un nuovo login manuale
      }
    } catch (loginError) {
      console.error('Errore durante il ripristino dell\'admin:', loginError);
    }

    console.error('Errore durante la creazione del nuovo utente:', error);
    throw error;
  }
}

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
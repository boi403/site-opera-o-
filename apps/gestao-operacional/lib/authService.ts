import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  deleteUser,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, getDocs, setDoc, collection } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { User, UserRole } from '../types';
import { ALL_MODULES } from '../constants';

// Único e-mail autorizado a criar o próprio perfil ADMIN quando o Firestore
// ainda não tem nenhum usuário cadastrado (ver firestore.rules). Depois
// desse primeiro cadastro, só admins já existentes podem criar/editar outros.
const OWNER_BOOTSTRAP_EMAIL = 'mateus.orezende@gmail.com';

function docToUser(email: string, data: any): User {
  return {
    id: email,
    name: data?.name || '',
    email,
    role: data?.role || UserRole.HOUSEKEEPING,
    contact: data?.contact || '',
    photo: data?.photo || `https://picsum.photos/seed/${encodeURIComponent(email)}/200`,
    active: data?.active !== false,
    permissions: Array.isArray(data?.permissions) ? data.permissions : [],
  };
}

export async function getUserProfile(email: string): Promise<User | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const snap = await getDoc(doc(db, 'users', normalizedEmail));
  if (!snap.exists()) return null;
  return docToUser(normalizedEmail, snap.data());
}

export async function getAllUserProfiles(): Promise<User[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => docToUser(d.id, d.data()));
}

export async function upsertUserProfile(user: User): Promise<void> {
  const email = user.email.trim().toLowerCase();
  await setDoc(
    doc(db, 'users', email),
    {
      name: user.name,
      role: user.role,
      contact: user.contact,
      photo: user.photo,
      active: user.active,
      permissions: user.permissions,
    },
    { merge: true },
  );
}

async function bootstrapOwnerProfileIfNeeded(firebaseUser: FirebaseUser, email: string): Promise<User | null> {
  if (email !== OWNER_BOOTSTRAP_EMAIL) return null;
  await upsertUserProfile({
    id: email,
    email,
    name: firebaseUser.displayName || 'Administrador',
    role: UserRole.ADMIN,
    contact: '',
    photo: firebaseUser.photoURL || '',
    active: true,
    permissions: [...ALL_MODULES],
  });
  return getUserProfile(email);
}

type AuthResult = { user?: User; error?: string };

/** Login para quem já definiu senha antes. */
export async function signInWithEmailPassword(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  let credential;
  try {
    credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
  } catch {
    return { error: 'E-mail ou senha incorretos.' };
  }

  let profile = await getUserProfile(normalizedEmail);
  if (!profile) {
    profile = await bootstrapOwnerProfileIfNeeded(credential.user, normalizedEmail);
  }
  if (!profile || !profile.active) {
    await signOut(auth);
    return { error: 'Esta conta não está autorizada. Contate o administrador.' };
  }
  return { user: profile };
}

/**
 * Primeiro acesso: cria a conta no Firebase Auth com a senha escolhida.
 * Só fica valendo se o e-mail já foi autorizado pelo administrador no
 * Firestore — caso contrário a conta recém-criada é apagada na hora.
 */
export async function setupPassword(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  let credential;
  try {
    credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
  } catch (err: any) {
    if (err?.code === 'auth/email-already-in-use') {
      return { error: 'Já existe uma conta com esse e-mail. Use "Entrar" com sua senha.' };
    }
    return { error: 'Não foi possível criar o acesso. Verifique o e-mail e use uma senha com pelo menos 6 caracteres.' };
  }

  let profile = await getUserProfile(normalizedEmail);
  if (!profile) {
    profile = await bootstrapOwnerProfileIfNeeded(credential.user, normalizedEmail);
  }
  if (!profile || !profile.active) {
    await deleteUser(credential.user);
    return { error: 'Este e-mail não está autorizado pelo administrador do sistema.' };
  }
  return { user: profile };
}

export async function signInWithGoogle(): Promise<AuthResult> {
  let credential;
  try {
    credential = await signInWithPopup(auth, googleProvider);
  } catch (err: any) {
    if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
      return {};
    }
    return { error: 'Não foi possível entrar com o Google.' };
  }

  const email = (credential.user.email || '').trim().toLowerCase();
  if (!email) {
    await signOut(auth);
    return { error: 'Não foi possível obter o e-mail da conta Google.' };
  }

  let profile = await getUserProfile(email);
  if (!profile) {
    profile = await bootstrapOwnerProfileIfNeeded(credential.user, email);
  }
  if (!profile || !profile.active) {
    await signOut(auth);
    return { error: `Acesso negado: o e-mail Google (${email}) não possui cadastro autorizado no sistema.` };
  }
  return { user: profile };
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim().toLowerCase());
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export function watchAuthState(callback: (firebaseUser: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, updateProfile, User, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Standard auth error handler
export function handleAuthError(error: any) {
  console.error("Auth Error:", error);
  const domain = window.location.hostname;
  
  if (error.code === 'auth/popup-blocked') {
    return "Popups are blocked. Please allow popups for this site.";
  }
  if (error.code === 'auth/unauthorized-domain') {
    return `Domain "${domain}" is not authorized. Please add it to your Firebase Console -> Authentication -> Authorized Domains.`;
  }
  if (error.code === 'auth/popup-closed-by-user') {
    return "Login window was closed.";
  }
  if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/admin-restricted-operation') {
    return "This login method (Google or Anonymous) is not enabled in your Firebase Console. Please go to Authentications -> Sign-in method and enable them.";
  }
  return (error.message || "An unknown authentication error occurred.").replace('Firebase:', '').trim();
}

// Standard error handler for Firestore
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection CRITICAL CONSTRAINT
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export { signInWithPopup, onAuthStateChanged, updateProfile, signInAnonymously };
export type { User };

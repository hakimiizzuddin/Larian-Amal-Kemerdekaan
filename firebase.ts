import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with databaseId as instructed in skill
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Export active Database ID and Project info
export const FIRESTORE_DATABASE_ID = firebaseConfig.firestoreDatabaseId;
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Operational Types for Error Reporting
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
  };
}

/**
 * Standardized error handler conforming strictly to FirestoreErrorInfo requirement
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
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
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on startup (Mandatory skill check)
export async function testConnection(): Promise<{ connected: boolean; latencyMs?: number; dbId: string }> {
  const startTime = Date.now();
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    const latency = Date.now() - startTime;
    console.log(`[SYS_LOG] Quantum Firestore uplink verified: ONLINE (${latency}ms) [${FIRESTORE_DATABASE_ID}]`);
    return { connected: true, latencyMs: latency, dbId: FIRESTORE_DATABASE_ID };
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('[SYS_ALERT] Firestore uplink offline. Check node network matrix.');
      return { connected: false, dbId: FIRESTORE_DATABASE_ID };
    }
    // Reached Firestore server
    return { connected: true, latencyMs: Date.now() - startTime, dbId: FIRESTORE_DATABASE_ID };
  }
}

// Execute connection test
testConnection();

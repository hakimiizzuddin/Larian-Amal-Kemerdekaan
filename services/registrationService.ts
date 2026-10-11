import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../firebase';
import { Registration, RunCategory, TShirtSize } from '../types';

const REGISTRATIONS_COLLECTION = 'registrations';

/**
 * Generate a deterministic cyber bib sequence
 */
export function generateBibCode(existingCount: number, category: RunCategory): string {
  const prefix = 'LAM';
  const num = (existingCount + 101).toString().padStart(3, '0');
  return `${prefix}-${num}`;
}

/**
 * Real-time subscription to all participant registrations
 */
export function subscribeToRegistrations(
  onUpdate: (registrations: Registration[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(collection(db, REGISTRATIONS_COLLECTION), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const data: Registration[] = snapshot.docs.map((docSnap) => {
        const item = docSnap.data();
        return {
          id: docSnap.id,
          fullName: item.fullName || 'UNKNOWN_RUNNER',
          email: item.email || '',
          category: (item.category as RunCategory) || '10km_open',
          tshirtSize: item.tshirtSize as TShirtSize,
          bibNumber: item.bibNumber || 'LAM-000',
          feePaid: Number(item.feePaid) || 50,
          emergencyContact: item.emergencyContact || '',
          status: item.status === 'cancelled' ? 'cancelled' : 'confirmed',
          userId: item.userId || 'guest',
          createdAt: item.createdAt || new Date().toISOString(),
        };
      });
      onUpdate(data);
    },
    (error) => {
      if (onError) onError(error as Error);
      handleFirestoreError(error, OperationType.LIST, REGISTRATIONS_COLLECTION);
    }
  );
}

/**
 * Save new runner registration to Firestore
 */
export async function registerRunner(params: {
  fullName: string;
  email: string;
  category: RunCategory;
  tshirtSize?: TShirtSize;
  emergencyContact?: string;
  bibNumber: string;
}): Promise<Registration> {
  const docId = `reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const currentUser = auth.currentUser;
  
  const payload: Omit<Registration, 'id'> = {
    fullName: params.fullName.trim(),
    email: params.email.trim().toLowerCase(),
    category: params.category,
    tshirtSize: params.tshirtSize || 'M',
    bibNumber: params.bibNumber,
    feePaid: 50,
    emergencyContact: params.emergencyContact?.trim() || 'N/A',
    status: 'confirmed',
    userId: currentUser ? currentUser.uid : 'guest',
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, REGISTRATIONS_COLLECTION, docId);
    await setDoc(docRef, payload);
    return {
      id: docId,
      ...payload,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${REGISTRATIONS_COLLECTION}/${docId}`);
  }
}

/**
 * Admin action: update status of participant (confirmed / cancelled)
 */
export async function updateRegistrationStatus(id: string, status: 'confirmed' | 'cancelled') {
  const docPath = `${REGISTRATIONS_COLLECTION}/${id}`;
  try {
    const docRef = doc(db, REGISTRATIONS_COLLECTION, id);
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * Admin action: delete registration from Firestore
 */
export async function deleteRegistration(id: string) {
  const docPath = `${REGISTRATIONS_COLLECTION}/${id}`;
  try {
    const docRef = doc(db, REGISTRATIONS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

/**
 * Seed initial sample participants into Firestore if empty
 */
export async function seedInitialRegistrations(): Promise<number> {
  const initialSeeds = [
    {
      fullName: 'Farid "Glitch" Ramli',
      email: 'farid.ramli@cybernet.my',
      category: '10km_open' as RunCategory,
      tshirtSize: 'L' as TShirtSize,
      bibNumber: 'LAM-101',
      feePaid: 50,
      emergencyContact: '+6012-3490211',
      status: 'confirmed' as const,
      userId: 'system_seed_01',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
    {
      fullName: 'Aisyah Synth Nur',
      email: 'aisyah.synth@neokl.io',
      category: '5km_fun' as RunCategory,
      tshirtSize: 'M' as TShirtSize,
      bibNumber: 'LAM-102',
      feePaid: 50,
      emergencyContact: '+6019-8877112',
      status: 'confirmed' as const,
      userId: 'system_seed_02',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      fullName: 'Major Tan Chee Keong (Rtd)',
      email: 'tan.ck.merdeka@stream.my',
      category: '10km_veteran' as RunCategory,
      tshirtSize: 'XL' as TShirtSize,
      bibNumber: 'LAM-103',
      feePaid: 50,
      emergencyContact: '+6017-2234091',
      status: 'confirmed' as const,
      userId: 'system_seed_03',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ];

  let added = 0;
  for (const seed of initialSeeds) {
    const id = `reg_${seed.bibNumber.toLowerCase()}`;
    try {
      await setDoc(doc(db, REGISTRATIONS_COLLECTION, id), seed);
      added++;
    } catch (e) {
      console.warn('Seeding warning:', e);
    }
  }
  return added;
}

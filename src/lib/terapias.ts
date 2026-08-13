// ============================================================================
// CRUD - TERAPIAS
// Baseado na coleção real: terapias/{therapyId}
// ============================================================================

import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  Timestamp,
  DocumentSnapshot,
  startAfter
} from 'firebase/firestore';
import type { Terapia } from '@/types/firestore';

const COLLECTION = 'terapias';

// ---------------------------------------------------------------------------
// GERAR ID SEQUENCIAL (TH-0001, TH-0002...)
// ---------------------------------------------------------------------------
export async function gerarNovoTherapyId(): Promise<string> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  const count = snapshot.size;
  return `TH-${String(count + 1).padStart(4, '0')}`;
}

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------
export async function criarTerapia(
  dados: Omit<Terapia, 'therapyId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const therapyId = await gerarNovoTherapyId();
  const now = Timestamp.now();

  const terapia: Terapia = {
    ...dados,
    therapyId,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, COLLECTION, therapyId), terapia);
  return therapyId;
}

// ---------------------------------------------------------------------------
// READ
// ---------------------------------------------------------------------------
export async function buscarTerapiaPorId(therapyId: string): Promise<Terapia | null> {
  const docRef = doc(db, COLLECTION, therapyId);
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data() as Terapia) : null;
}

export async function buscarTerapiasPorPaciente(
  patientId: string,
  limiteQuantidade: number = 50
): Promise<Terapia[]> {
  const colRef = collection(db, COLLECTION);
  const q = query(
    colRef,
    where('patientId', '==', patientId),
    orderBy('createdAt', 'desc'),
    limit(limiteQuantidade)
  );

  const snapshot = await getDocs(q);
  const terapias: Terapia[] = [];
  snapshot.forEach((docSnap) => {
    terapias.push(docSnap.data() as Terapia);
  });
  return terapias;
}

export async function buscarTerapiasAtivas(patientId: string): Promise<Terapia[]> {
  const colRef = collection(db, COLLECTION);
  const q = query(
    colRef,
    where('patientId', '==', patientId),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  const terapias: Terapia[] = [];
  snapshot.forEach((docSnap) => {
    terapias.push(docSnap.data() as Terapia);
  });
  return terapias;
}

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------
export async function atualizarTerapia(
  therapyId: string,
  dados: Partial<Terapia>
): Promise<void> {
  const docRef = doc(db, COLLECTION, therapyId);
  await updateDoc(docRef, {
    ...dados,
    updatedAt: Timestamp.now(),
  });
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------
export async function excluirTerapia(therapyId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, therapyId));
}

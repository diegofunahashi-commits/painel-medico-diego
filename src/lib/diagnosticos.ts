// ============================================================================
// CRUD - DIAGNÓSTICOS
// Baseado na coleção real: diagnosticos/{diagnosisId}
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
import type { Diagnostico } from '@/types/firestore';

const COLLECTION = 'diagnosticos';

// ---------------------------------------------------------------------------
// GERAR ID SEQUENCIAL (DX-0001, DX-0002...)
// ---------------------------------------------------------------------------
export async function gerarNovoDiagnosisId(): Promise<string> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  const count = snapshot.size;
  return `DX-${String(count + 1).padStart(4, '0')}`;
}

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------
export async function criarDiagnostico(
  dados: Omit<Diagnostico, 'diagnosisId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const diagnosisId = await gerarNovoDiagnosisId();
  const now = Timestamp.now();

  const diagnostico: Diagnostico = {
    ...dados,
    diagnosisId,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, COLLECTION, diagnosisId), diagnostico);
  return diagnosisId;
}

// ---------------------------------------------------------------------------
// READ
// ---------------------------------------------------------------------------
export async function buscarDiagnosticoPorId(diagnosisId: string): Promise<Diagnostico | null> {
  const docRef = doc(db, COLLECTION, diagnosisId);
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data() as Diagnostico) : null;
}

export async function buscarDiagnosticosPorPaciente(
  patientId: string,
  limiteQuantidade: number = 50
): Promise<Diagnostico[]> {
  const colRef = collection(db, COLLECTION);
  const q = query(
    colRef,
    where('patientId', '==', patientId),
    orderBy('createdAt', 'desc'),
    limit(limiteQuantidade)
  );

  const snapshot = await getDocs(q);
  const diagnosticos: Diagnostico[] = [];
  snapshot.forEach((docSnap) => {
    diagnosticos.push(docSnap.data() as Diagnostico);
  });
  return diagnosticos;
}

export async function buscarDiagnosticosAtivos(patientId: string): Promise<Diagnostico[]> {
  const colRef = collection(db, COLLECTION);
  const q = query(
    colRef,
    where('patientId', '==', patientId),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  const diagnosticos: Diagnostico[] = [];
  snapshot.forEach((docSnap) => {
    diagnosticos.push(docSnap.data() as Diagnostico);
  });
  return diagnosticos;
}

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------
export async function atualizarDiagnostico(
  diagnosisId: string,
  dados: Partial<Diagnostico>
): Promise<void> {
  const docRef = doc(db, COLLECTION, diagnosisId);
  await updateDoc(docRef, {
    ...dados,
    updatedAt: Timestamp.now(),
  });
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------
export async function excluirDiagnostico(diagnosisId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, diagnosisId));
}

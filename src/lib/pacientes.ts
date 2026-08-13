// ============================================================================
// CRUD - PACIENTES
// Baseado na coleção real: patients/{patientId}
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
  writeBatch,
  DocumentSnapshot,
  startAfter
} from 'firebase/firestore';
import type { Patient, Endereco } from '@/types/firestore';

const COLLECTION = 'patients';

// ---------------------------------------------------------------------------
// GERAR ID SEQUENCIAL (PAT-0001, PAT-0002...)
// ---------------------------------------------------------------------------
export async function gerarNovoPatientId(): Promise<string> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  const count = snapshot.size;
  return `PAT-${String(count + 1).padStart(4, '0')}`;
}

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------
export async function criarPaciente(
  dados: Omit<Patient, 'patientID' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const patientID = await gerarNovoPatientId();
  const now = Timestamp.now();

  const paciente: Patient = {
    ...dados,
    patientID,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, COLLECTION, patientID), paciente);
  return patientID;
}

// ---------------------------------------------------------------------------
// READ
// ---------------------------------------------------------------------------
export async function buscarPacientePorId(patientID: string): Promise<Patient | null> {
  const docRef = doc(db, COLLECTION, patientID);
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data() as Patient) : null;
}

export async function buscarTodosPacientes(
  limiteQuantidade: number = 100,
  ultimoDoc?: DocumentSnapshot
): Promise<{ pacientes: Patient[]; ultimoDoc?: DocumentSnapshot }> {
  const colRef = collection(db, COLLECTION);
  let q = query(colRef, orderBy('createdAt', 'desc'), limit(limiteQuantidade));

  if (ultimoDoc) {
    q = query(q, startAfter(ultimoDoc));
  }

  const snapshot = await getDocs(q);
  const pacientes: Patient[] = [];
  let lastDoc: DocumentSnapshot | undefined;

  snapshot.forEach((docSnap) => {
    pacientes.push(docSnap.data() as Patient);
    lastDoc = docSnap;
  });

  return { pacientes, ultimoDoc: lastDoc };
}

export async function buscarPacientesPorNome(nome: string): Promise<Patient[]> {
  const colRef = collection(db, COLLECTION);
  // Firestore não suporta busca por substring nativamente
  // Buscamos todos e filtramos no front (para poucos registros funciona bem)
  const snapshot = await getDocs(query(colRef, orderBy('nome completo')));
  const pacientes: Patient[] = [];

  snapshot.forEach((docSnap) => {
    const p = docSnap.data() as Patient;
    if (p['nome completo'].toLowerCase().includes(nome.toLowerCase())) {
      pacientes.push(p);
    }
  });

  return pacientes;
}

export async function buscarPacientesPorStatus(status: string): Promise<Patient[]> {
  const colRef = collection(db, COLLECTION);
  const q = query(colRef, where('status', '==', status), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  const pacientes: Patient[] = [];
  snapshot.forEach((docSnap) => {
    pacientes.push(docSnap.data() as Patient);
  });

  return pacientes;
}

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------
export async function atualizarPaciente(
  patientID: string,
  dados: Partial<Patient>
): Promise<void> {
  const docRef = doc(db, COLLECTION, patientID);
  await updateDoc(docRef, {
    ...dados,
    updatedAt: Timestamp.now(),
  });
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------
export async function excluirPaciente(patientID: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, patientID));
}

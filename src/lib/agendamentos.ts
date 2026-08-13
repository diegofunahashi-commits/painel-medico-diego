// ============================================================================
// CRUD - AGENDAMENTOS
// Baseado na coleção real: agendamentos/{appointmentId}
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
import type { Agendamento } from '@/types/firestore';

const COLLECTION = 'agendamentos';

// ---------------------------------------------------------------------------
// GERAR ID SEQUENCIAL (AG-0001, AG-0002...)
// ---------------------------------------------------------------------------
export async function gerarNovoAppointmentId(): Promise<string> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  const count = snapshot.size;
  return `AG-${String(count + 1).padStart(4, '0')}`;
}

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------
export async function criarAgendamento(
  dados: Omit<Agendamento, 'appointmentId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const appointmentId = await gerarNovoAppointmentId();
  const now = Timestamp.now();

  const agendamento: Agendamento = {
    ...dados,
    appointmentId,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, COLLECTION, appointmentId), agendamento);
  return appointmentId;
}

// ---------------------------------------------------------------------------
// READ
// ---------------------------------------------------------------------------
export async function buscarAgendamentoPorId(appointmentId: string): Promise<Agendamento | null> {
  const docRef = doc(db, COLLECTION, appointmentId);
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data() as Agendamento) : null;
}

export async function buscarAgendamentosPorPaciente(
  patientId: string,
  limiteQuantidade: number = 20
): Promise<Agendamento[]> {
  const colRef = collection(db, COLLECTION);
  const q = query(
    colRef,
    where('patientId', '==', patientId),
    orderBy('dataHora', 'desc'),
    limit(limiteQuantidade)
  );

  const snapshot = await getDocs(q);
  const agendamentos: Agendamento[] = [];
  snapshot.forEach((docSnap) => {
    agendamentos.push(docSnap.data() as Agendamento);
  });
  return agendamentos;
}

export async function buscarAgendamentosPorMedico(
  doctorUid: string,
  dataInicio?: Date,
  dataFim?: Date
): Promise<Agendamento[]> {
  const colRef = collection(db, COLLECTION);
  let constraints = [
    where('doctorUid', '==', doctorUid),
    orderBy('dataHora', 'desc')
  ];

  if (dataInicio) {
    constraints.push(where('dataHora', '>=', Timestamp.fromDate(dataInicio)));
  }
  if (dataFim) {
    constraints.push(where('dataHora', '<=', Timestamp.fromDate(dataFim)));
  }

  const q = query(colRef, ...constraints);
  const snapshot = await getDocs(q);
  const agendamentos: Agendamento[] = [];
  snapshot.forEach((docSnap) => {
    agendamentos.push(docSnap.data() as Agendamento);
  });
  return agendamentos;
}

export async function buscarAgendamentosDoDia(
  doctorUid: string,
  data: Date
): Promise<Agendamento[]> {
  const inicio = new Date(data);
  inicio.setHours(0, 0, 0, 0);
  const fim = new Date(data);
  fim.setHours(23, 59, 59, 999);

  return buscarAgendamentosPorMedico(doctorUid, inicio, fim);
}

export async function buscarUltimoAgendamento(patientId: string): Promise<Agendamento | null> {
  const colRef = collection(db, COLLECTION);
  const q = query(
    colRef,
    where('patientId', '==', patientId),
    orderBy('dataHora', 'desc'),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as Agendamento;
}

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------
export async function atualizarAgendamento(
  appointmentId: string,
  dados: Partial<Agendamento>
): Promise<void> {
  const docRef = doc(db, COLLECTION, appointmentId);
  await updateDoc(docRef, {
    ...dados,
    updatedAt: Timestamp.now(),
  });
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------
export async function excluirAgendamento(appointmentId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, appointmentId));
}

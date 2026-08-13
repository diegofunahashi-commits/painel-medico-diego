// ============================================================================
// CRUD - LAUDOS + CLONAR/REPETIR ÚLTIMO
// Baseado na coleção real: laudos/{reportId}
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
import type { Laudo } from '@/types/firestore';

const COLLECTION = 'laudos';

// ---------------------------------------------------------------------------
// GERAR ID SEQUENCIAL (LA-0001, LA-0002...)
// ---------------------------------------------------------------------------
export async function gerarNovoReportId(): Promise<string> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  const count = snapshot.size;
  return `LA-${String(count + 1).padStart(4, '0')}`;
}

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------
export async function criarLaudo(
  dados: Omit<Laudo, 'reportId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const reportId = await gerarNovoReportId();
  const now = Timestamp.now();

  const laudo: Laudo = {
    ...dados,
    reportId,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, COLLECTION, reportId), laudo);
  return reportId;
}

// ---------------------------------------------------------------------------
// READ
// ---------------------------------------------------------------------------
export async function buscarLaudoPorId(reportId: string): Promise<Laudo | null> {
  const docRef = doc(db, COLLECTION, reportId);
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data() as Laudo) : null;
}

export async function buscarLaudosPorPaciente(
  patientId: string,
  limiteQuantidade: number = 10,
  ultimoDoc?: DocumentSnapshot
): Promise<{ laudos: Laudo[]; ultimoDoc?: DocumentSnapshot }> {
  const colRef = collection(db, COLLECTION);
  let q = query(
    colRef,
    where('patientId', '==', patientId),
    orderBy('createdAt', 'desc'),
    limit(limiteQuantidade)
  );

  if (ultimoDoc) {
    q = query(q, startAfter(ultimoDoc));
  }

  const snapshot = await getDocs(q);
  const laudos: Laudo[] = [];
  let lastDoc: DocumentSnapshot | undefined;

  snapshot.forEach((docSnap) => {
    laudos.push(docSnap.data() as Laudo);
    lastDoc = docSnap;
  });

  return { laudos, ultimoDoc: lastDoc };
}

/**
 * Busca o último laudo do paciente
 */
export async function buscarUltimoLaudo(patientId: string): Promise<Laudo | null> {
  const { laudos } = await buscarLaudosPorPaciente(patientId, 1);
  return laudos.length > 0 ? laudos[0] : null;
}

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------
export async function atualizarLaudo(
  reportId: string,
  dados: Partial<Laudo>
): Promise<void> {
  const docRef = doc(db, COLLECTION, reportId);
  await updateDoc(docRef, {
    ...dados,
    updatedAt: Timestamp.now(),
  });
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------
export async function excluirLaudo(reportId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, reportId));
}

// ============================================================================
// CLONAR / REPETIR ÚLTIMO LAUDO (PREENCHIMENTO AUTOMÁTICO)
// ============================================================================

/**
 * Clona o último laudo do paciente, mantendo o texto mas permitindo edição.
 * Retorna os dados prontos para preencher o formulário (SEM salvar no banco).
 */
export async function clonarUltimoLaudo(
  patientId: string,
  doctorUid: string
): Promise<Omit<Laudo, 'reportId' | 'createdAt' | 'updatedAt'> | null> {
  const ultimo = await buscarUltimoLaudo(patientId);
  if (!ultimo) return null;

  const { reportId, createdAt, updatedAt, ...dadosClonaveis } = ultimo;

  return {
    ...dadosClonaveis,
    doctorUid,
    status: 'draft', // Sempre começa como rascunho
  };
}

/**
 * Clona um laudo específico pelo ID
 */
export async function clonarLaudoPorId(
  reportId: string,
  doctorUid: string
): Promise<Omit<Laudo, 'reportId' | 'createdAt' | 'updatedAt'> | null> {
  const laudo = await buscarLaudoPorId(reportId);
  if (!laudo) return null;

  const { reportId: _, createdAt, updatedAt, ...dadosClonaveis } = laudo;

  return {
    ...dadosClonaveis,
    doctorUid,
    status: 'draft',
  };
}

/**
 * Prepara dados de laudo a partir do paciente atual
 * Usado quando NÃO há histórico para clonar
 */
export function prepararLaudoDoPaciente(
  patient: { 
    patientID: string; 
    idade: string; 
    'data de nascimento': Timestamp; 
  },
  doctorUid: string,
  appointmentId: string = ''
): Omit<Laudo, 'reportId' | 'createdAt' | 'updatedAt'> {
  return {
    patientId: patient.patientID,
    idade: patient.idade,
    'data de nascimento': patient['data de nascimento'],
    appointmentId,
    doctorUid,
    cidCodes: [],
    diagnosisIds: [],
    textoLaudo: '',
    status: 'draft',
    'informacoes adiconais': '',
  };
}

// ============================================================================
// CRUD - RECEITAS + CLONAR/REPETIR ÚLTIMA
// Baseado na coleção real: receitas/{prescriptionId}
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
import type { Receita, MedicacaoReceita, Endereco } from '@/types/firestore';

const COLLECTION = 'receitas';

// ---------------------------------------------------------------------------
// GERAR ID SEQUENCIAL (RX-0001, RX-0002...)
// ---------------------------------------------------------------------------
export async function gerarNovoPrescriptionId(): Promise<string> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  const count = snapshot.size;
  return `RX-${String(count + 1).padStart(4, '0')}`;
}

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------
export async function criarReceita(
  dados: Omit<Receita, 'prescriptionId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const prescriptionId = await gerarNovoPrescriptionId();
  const now = Timestamp.now();

  const receita: Receita = {
    ...dados,
    prescriptionId,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, COLLECTION, prescriptionId), receita);
  return prescriptionId;
}

// ---------------------------------------------------------------------------
// READ
// ---------------------------------------------------------------------------
export async function buscarReceitaPorId(prescriptionId: string): Promise<Receita | null> {
  const docRef = doc(db, COLLECTION, prescriptionId);
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data() as Receita) : null;
}

export async function buscarReceitasPorPaciente(
  patientId: string,
  limiteQuantidade: number = 10,
  ultimoDoc?: DocumentSnapshot
): Promise<{ receitas: Receita[]; ultimoDoc?: DocumentSnapshot }> {
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
  const receitas: Receita[] = [];
  let lastDoc: DocumentSnapshot | undefined;

  snapshot.forEach((docSnap) => {
    receitas.push(docSnap.data() as Receita);
    lastDoc = docSnap;
  });

  return { receitas, ultimoDoc: lastDoc };
}

/**
 * Busca a última receita do paciente (mais recente)
 */
export async function buscarUltimaReceita(patientId: string): Promise<Receita | null> {
  const { receitas } = await buscarReceitasPorPaciente(patientId, 1);
  return receitas.length > 0 ? receitas[0] : null;
}

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------
export async function atualizarReceita(
  prescriptionId: string,
  dados: Partial<Receita>
): Promise<void> {
  const docRef = doc(db, COLLECTION, prescriptionId);
  await updateDoc(docRef, {
    ...dados,
    updatedAt: Timestamp.now(),
  });
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------
export async function excluirReceita(prescriptionId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, prescriptionId));
}

// ============================================================================
// CLONAR / REPETIR ÚLTIMA RECEITA (PREENCHIMENTO AUTOMÁTICO)
// ============================================================================

/**
 * Clona a última receita do paciente, atualizando a data para hoje.
 * Retorna os dados prontos para preencher o formulário (SEM salvar no banco).
 */
export async function clonarUltimaReceita(
  patientId: string,
  doctorUid: string
): Promise<Omit<Receita, 'prescriptionId' | 'createdAt' | 'updatedAt'> | null> {
  const ultima = await buscarUltimaReceita(patientId);
  if (!ultima) return null;

  // Clona tudo MENOS prescriptionId, createdAt, updatedAt
  const { prescriptionId, createdAt, updatedAt, ...dadosClonaveis } = ultima;

  // Atualiza o doctorUid (pode ser o mesmo médico ou outro)
  return {
    ...dadosClonaveis,
    doctorUid,
    // Mantém os mesmos medicamentos, endereço, cpf, idade, peso
    // O médico pode editar antes de salvar
  };
}

/**
 * Clona uma receita específica pelo ID
 */
export async function clonarReceitaPorId(
  prescriptionId: string,
  doctorUid: string
): Promise<Omit<Receita, 'prescriptionId' | 'createdAt' | 'updatedAt'> | null> {
  const receita = await buscarReceitaPorId(prescriptionId);
  if (!receita) return null;

  const { prescriptionId: _, createdAt, updatedAt, ...dadosClonaveis } = receita;

  return {
    ...dadosClonaveis,
    doctorUid,
  };
}

/**
 * Prepara dados de receita a partir do paciente atual
 * Usado quando NÃO há histórico para clonar
 */
export function prepararReceitaDoPaciente(
  patient: { patientID: string; 'nome completo': string; cpf: string; idade: string; peso: string; endereco: Endereco },
  doctorUid: string
): Omit<Receita, 'prescriptionId' | 'createdAt' | 'updatedAt'> {
  return {
    patientId: patient.patientID,
    doctorUid,
    endereco: patient.endereco,
    cpf: patient.cpf,
    idade: patient.idade,
    peso: patient.peso,
    medicacoes: [],
  };
}

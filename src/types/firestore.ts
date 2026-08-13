// ============================================================================
// TIPOS FIRESTORE — FIEL AO BANCO REAL DO DR. DIEGO FUNAHASHI
// Mantém NOMES EXATOS dos campos (com espaços, erros de digitação, etc.)
// Coleção: agenda-5dee5
// Compatível com Next.js + Vercel
// ============================================================================

import type { Timestamp } from 'firebase/firestore';

// ---------------------------------------------------------------------------
// TIMESTAMP UNIFICADO
// ---------------------------------------------------------------------------
export type FirestoreTimestamp = Timestamp | {
  _seconds: number;
  _nanoseconds: number;
};

// ---------------------------------------------------------------------------
// SERIALIZAÇÃO PARA API ROUTES / SERVERLESS (VERCEL)
// ---------------------------------------------------------------------------
export interface SerializedTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

export type Serialized<T> = {
  [K in keyof T]: T[K] extends FirestoreTimestamp
    ? SerializedTimestamp
    : T[K] extends FirestoreTimestamp | null
    ? SerializedTimestamp | null
    : T[K] extends Array<infer U>
    ? Array<Serialized<U>>
    : T[K] extends object
    ? Serialized<T[K]>
    : T[K];
};

// ---------------------------------------------------------------------------
// ENDEREÇO
// ---------------------------------------------------------------------------
export interface Endereco {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
}

// ---------------------------------------------------------------------------
// PATIENTS — nomes EXATOS do banco (com espaços e aspas simples)
// ---------------------------------------------------------------------------
export interface Patient {
  patientID: string;                    // nome exato do banco (ID maiúsculo)
  'nome completo': string;              // ✅ com espaço — acessar via ['nome completo']
  'nome do responsável': string;        // ✅ com espaço e acento
  sexo: 'menino' | 'menina';
  'data de nascimento': FirestoreTimestamp;  // ✅ com espaço
  idade: string;
  peso: string;
  cpf: string;
  email: string;
  telefone: number;                    // conforme banco original
  endereco: Endereco;
  localizacao: 'Araxá' | 'ABC' | 'São Paulo - Capital' | string;
  source: 'agenda' | 'laudo' | 'receita' | 'portal' | 'whatsapp' | 'site';
  status: 'active' | 'inactive' | 'pending_review';
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// ---------------------------------------------------------------------------
// RECEITAS
// ---------------------------------------------------------------------------
export interface MedicacaoReceita {
  ordem: number;
  nome: string;
  dose: string;
  via: string;
  frequencia: string;
  posologia: string;
  pesoReferencia: number;
  apresentacao: string;
  observacoes: string;
}

export interface Receita {
  prescriptionId: string;
  patientId: string;
  doctorUid: string;
  endereco: Endereco;
  cpf: string;
  idade: string;
  peso: string;
  medicacoes: MedicacaoReceita[];
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// ---------------------------------------------------------------------------
// LAUDOS
// ---------------------------------------------------------------------------
export interface Laudo {
  reportId: string;
  patientId: string;
  idade: string;
  'data de nascimento': FirestoreTimestamp;  // ✅ com espaço
  appointmentId: string;
  doctorUid: string;
  cidCodes: string[];
  diagnosisIds: string[];
  textoLaudo: string;
  status: 'draft' | 'signed' | 'amended';
  'informacoes adiconais': string;      // ✅ mantido com erro de digitação original
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// ---------------------------------------------------------------------------
// DIAGNÓSTICOS
// ---------------------------------------------------------------------------
export interface Diagnostico {
  diagnosisId: string;
  patientId: string;
  cidCode: string;
  nomeDiagnostico: string;
  descricao: string;
  dataInicio: FirestoreTimestamp;
  status: 'active' | 'resolved' | 'suspected';
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// ---------------------------------------------------------------------------
// TERAPIAS
// ---------------------------------------------------------------------------
export interface Terapia {
  therapyId: string;
  patientId: string;
  nomeTerapia: string;
  tipo: string;
  status: 'active' | 'past' | 'planned';
  descricao: string;
  'frequencia por semana': number;      // ✅ com espaço
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// ---------------------------------------------------------------------------
// AGENDAMENTOS
// ---------------------------------------------------------------------------
export interface Agendamento {
  appointmentId: string;
  patientId: string;
  dataHora: FirestoreTimestamp;
  tipoConsulta: 'primeira' | 'retorno' | 'encaixe' | 'avaliacao' | 'teleconsulta';
  status: 'pendente' | 'confirmada' | 'cancelada' | 'no-show' | 'retorno';
  source: 'whatsapp' | 'site' | 'portal';
  doctorUid: string;
  createdByUid: string;
  slotId: string;
  inicioEm: FirestoreTimestamp;
  unidadeId: 'sp_capital' | 'abc' | 'araxa';
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// ---------------------------------------------------------------------------
// USERS
// ---------------------------------------------------------------------------
export interface UserPermissions {
  createReports: boolean;
  createPrescriptions: boolean;
  approveAppointments: boolean;
  manageStaff: boolean;
}

export interface User {
  uid: string;
  email: string;
  role: 'doctor' | 'patient' | 'staff';
  isApproved: boolean;
  guardianName: string;
  childName: string;
  childAge: string;
  patientId: string;
  active: boolean;
  permissions: UserPermissions;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// ---------------------------------------------------------------------------
// CONSENTIMENTOS
// ---------------------------------------------------------------------------
export interface Consentimento {
  'CONS-0001': string;                  // ✅ nome exato do banco
  patientId: string;
  userUid: string;
  versaoTermo: FirestoreTimestamp;
  aceito: boolean;
  aceitoEm: FirestoreTimestamp;
  tipo: 'portal' | 'comunicacao_whatsapp' | 'compartilhamento_documentos' | 'telemedicina' | 'marketing' | 'curso_personalizado';
}

// ---------------------------------------------------------------------------
// ARQUIVOS
// ---------------------------------------------------------------------------
export interface Arquivo {
  'ARQ-0001': string;                   // ✅ nome exato do banco
  patientId: string;
  nomeOriginal: string;
  storagePath: string;
  createdAt: FirestoreTimestamp;
  categoria: 'exame' | 'relatorio_escolar' | 'relatorio_terapeutico' | 'laudo';
}

// ---------------------------------------------------------------------------
// CONFIGURAÇÕES AGENDA
// ---------------------------------------------------------------------------
export interface ConfiguracaoAgenda {
  configId: string;
  doctorUid: string;
  unidadeId: 'sp_capital' | 'abc' | 'araxa';
  diaSemana: string[];
  inicioAtendimento: string;
  fimAtendimento: string;
  duracaoMinutos: number;
  modalidade: 'presencial' | 'teleconsulta';
  tiposConsultaPermitidos: string[];
  maximoAgendamentosDia: string;        // conforme banco (string)
  antecedenciaMinimaHoras: number;
  ativo: string;                        // conforme banco (string)
  intervaloMinutos: number;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// ---------------------------------------------------------------------------
// SETTINGS
// ---------------------------------------------------------------------------
export interface LocationDays {
  Araxá: number[];
  'São Paulo': number[];
  'Santo André': number[];
  Teleconsulta: number[];
}

export interface ClinicConfig {
  locationDays: LocationDays;
  blockedSlots: string[];
  araxaWeek: string;
}

export interface Settings {
  clinic_config: ClinicConfig;          // conforme banco (snake_case)
}

// ---------------------------------------------------------------------------
// NOTIFICAÇÕES
// ---------------------------------------------------------------------------
export interface Notificacao {
  'NOT-0001': string;                   // ✅ nome exato do banco
  userUid: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  recursoId: string;
  lida: boolean;
  createdAt: FirestoreTimestamp;
}

// ---------------------------------------------------------------------------
// ARTICLES
// ---------------------------------------------------------------------------
export interface Article {
  id: string;
  title_pt: string;                     // conforme banco
  title_en: string;
  category_pt: string;
  category_en: string;
  readTime_pt: string;
  readTime_en: string;
  summary_pt: string;
  summary_en: string;
  content_pt: string;
  content_en: string;
}

// ---------------------------------------------------------------------------
// CHATS
// ---------------------------------------------------------------------------
export interface ChatMessage {
  id: string;
  userUid: string;
  sender: 'doctor' | 'patient' | 'staff';
  text_pt: string;                      // conforme banco
  text_en: string;
  text: string;
  timestamp: string;
  date: string;
}

// ---------------------------------------------------------------------------
// TIPOS AUXILIARES
// ---------------------------------------------------------------------------
export interface PatientResumo {
  totalReceitas: number;
  totalLaudos: number;
  totalDiagnosticos: number;
  totalTerapias: number;
  ultimaConsulta: Agendamento | null;
  ultimaReceita: Receita | null;
  ultimoLaudo: Laudo | null;
}

export interface ReceitaClonada {
  patientId: string;
  doctorUid: string;
  endereco: Endereco;
  cpf: string;
  idade: string;
  peso: string;
  medicacoes: MedicacaoReceita[];
}

export interface LaudoClonado {
  patientId: string;
  idade: string;
  'data de nascimento': FirestoreTimestamp;
  doctorUid: string;
  cidCodes: string[];
  diagnosisIds: string[];
  textoLaudo: string;
  'informacoes adiconais': string;      // ✅ mantido conforme banco
}

// ---------------------------------------------------------------------------
// HELPERS DE SERIALIZAÇÃO (PARA API ROUTES / VERCEL)
// ---------------------------------------------------------------------------
export function serializeTimestamp(ts: Timestamp | SerializedTimestamp): SerializedTimestamp {
  if ('toMillis' in ts) {
    return {
      _seconds: Math.floor(ts.toMillis() / 1000),
      _nanoseconds: (ts.toMillis() % 1000) * 1000000,
    };
  }
  return ts;
}

export function serializeDocument<T extends Record<string, any>>(doc: T): Serialized<T> {
  const serialized: any = {};
  for (const key in doc) {
    if (doc[key] && typeof doc[key] === 'object') {
      if ('toMillis' in doc[key] && typeof doc[key].toMillis === 'function') {
        serialized[key] = serializeTimestamp(doc[key]);
      } else if (Array.isArray(doc[key])) {
        serialized[key] = doc[key].map((item: any) =>
          item && typeof item === 'object' && 'toMillis' in item
            ? serializeTimestamp(item)
            : item
        );
      } else {
        serialized[key] = doc[key];
      }
    } else {
      serialized[key] = doc[key];
    }
  }
  return serialized as Serialized<T>;
}

// ---------------------------------------------------------------------------
// RESPOSTA PADRONIZADA DE API
// ---------------------------------------------------------------------------
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
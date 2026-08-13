// ============================================================================
// TIPOS FIRESTORE - BASEADOS NO BANCO REAL DO DR. DIEGO FUNAHASHI
// Coleção: agenda-5dee5
// ============================================================================

import { Timestamp } from 'firebase/firestore';

// ---------------------------------------------------------------------------
// TIMESTAMPS (formato Firestore)
// ---------------------------------------------------------------------------
export interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

// ---------------------------------------------------------------------------
// PATIENTS
// ---------------------------------------------------------------------------
export interface Endereco {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
}

export interface Patient {
  patientID: string;
  'nome completo': string;
  'nome do responsável': string;
  sexo: 'menino' | 'menina';
  'data de nascimento': Timestamp | FirestoreTimestamp;
  idade: string;
  peso: string;
  cpf: string;
  email: string;
  telefone: number;
  endereco: Endereco;
  localizacao: 'Araxá' | 'ABC' | 'São Paulo - Capital' | string;
  source: 'agenda' | 'laudo' | 'receita' | 'portal' | 'whatsapp' | 'site';
  status: 'active' | 'inactive' | 'pending_review';
  createdAt: Timestamp | FirestoreTimestamp;
  updatedAt: Timestamp | FirestoreTimestamp;
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
  createdAt: Timestamp | FirestoreTimestamp;
  updatedAt: Timestamp | FirestoreTimestamp;
}

// ---------------------------------------------------------------------------
// LAUDOS
// ---------------------------------------------------------------------------
export interface Laudo {
  reportId: string;
  patientId: string;
  idade: string;
  'data de nascimento': Timestamp | FirestoreTimestamp;
  appointmentId: string;
  doctorUid: string;
  cidCodes: string[];
  diagnosisIds: string[];
  textoLaudo: string;
  status: 'draft' | 'signed' | 'amended';
  'informacoes adiconais': string;
  createdAt: Timestamp | FirestoreTimestamp;
  updatedAt: Timestamp | FirestoreTimestamp;
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
  dataInicio: Timestamp | FirestoreTimestamp;
  status: 'active' | 'resolved' | 'suspected';
  createdAt: Timestamp | FirestoreTimestamp;
  updatedAt: Timestamp | FirestoreTimestamp;
}

// ---------------------------------------------------------------------------
// TERAPIAS
// ---------------------------------------------------------------------------
export interface Terapia {
  therapyId: string;
  patientId: string;
  nomeTerapia: string;
  tipo: string; // "psicologia", "fono", "TO", etc.
  status: 'active' | 'past' | 'planned';
  descricao: string;
  'frequencia por semana': number;
  createdAt: Timestamp | FirestoreTimestamp;
  updatedAt: Timestamp | FirestoreTimestamp;
}

// ---------------------------------------------------------------------------
// AGENDAMENTOS
// ---------------------------------------------------------------------------
export interface Agendamento {
  appointmentId: string;
  patientId: string;
  dataHora: Timestamp | FirestoreTimestamp;
  tipoConsulta: 'primeira' | 'retorno' | 'encaixe' | 'avaliacao' | 'teleconsulta';
  status: 'pendente' | 'confirmada' | 'cancelada' | 'no-show' | 'retorno';
  source: 'whatsapp' | 'site' | 'portal';
  doctorUid: string;
  createdByUid: string;
  slotId: string;
  inicioEm: Timestamp | FirestoreTimestamp;
  unidadeId: 'sp_capital' | 'abc' | 'araxa';
  createdAt: Timestamp | FirestoreTimestamp;
  updatedAt: Timestamp | FirestoreTimestamp;
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
  createdAt: Timestamp | FirestoreTimestamp;
  updatedAt: Timestamp | FirestoreTimestamp;
}

// ---------------------------------------------------------------------------
// CONSENTIMENTOS
// ---------------------------------------------------------------------------
export interface Consentimento {
  'CONS-0001': string;
  patientId: string;
  userUid: string;
  versaoTermo: Timestamp | FirestoreTimestamp;
  aceito: boolean;
  aceitoEm: Timestamp | FirestoreTimestamp;
  tipo: 'portal' | 'comunicacao_whatsapp' | 'compartilhamento_documentos' | 'telemedicina' | 'marketing' | 'curso_personalizado';
}

// ---------------------------------------------------------------------------
// ARQUIVOS
// ---------------------------------------------------------------------------
export interface Arquivo {
  'ARQ-0001': string;
  patientId: string;
  nomeOriginal: string;
  storagePath: string;
  createdAt: Timestamp | FirestoreTimestamp;
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
  maximoAgendamentosDia: string;
  antecedenciaMinimaHoras: number;
  ativo: string;
  intervaloMinutos: number;
  createdAt: Timestamp | FirestoreTimestamp;
  updatedAt: Timestamp | FirestoreTimestamp;
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
  clinic_config: ClinicConfig;
}

// ---------------------------------------------------------------------------
// NOTIFICAÇÕES
// ---------------------------------------------------------------------------
export interface Notificacao {
  'NOT-0001': string;
  userUid: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  recursoId: string;
  lida: boolean;
  createdAt: Timestamp | FirestoreTimestamp;
}

// ---------------------------------------------------------------------------
// ARTICLES (Biblioteca Educativa)
// ---------------------------------------------------------------------------
export interface Article {
  id: string;
  title_pt: string;
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
  text_pt: string;
  text_en: string;
  text: string;
  timestamp: string;
  date: string;
}

// ---------------------------------------------------------------------------
// TIPOS AUXILIARES PARA O PAINEL
// ---------------------------------------------------------------------------

// Resumo rápido do paciente (calculado no front)
export interface PatientResumo {
  totalReceitas: number;
  totalLaudos: number;
  totalDiagnosticos: number;
  totalTerapias: number;
  ultimaConsulta: Agendamento | null;
  ultimaReceita: Receita | null;
  ultimoLaudo: Laudo | null;
}

// Dados para clonar receita
export interface ReceitaClonada {
  patientId: string;
  doctorUid: string;
  endereco: Endereco;
  cpf: string;
  idade: string;
  peso: string;
  medicacoes: MedicacaoReceita[];
}

// Dados para clonar laudo
export interface LaudoClonado {
  patientId: string;
  idade: string;
  'data de nascimento': Timestamp | FirestoreTimestamp;
  doctorUid: string;
  cidCodes: string[];
  diagnosisIds: string[];
  textoLaudo: string;
  'informacoes adiconais': string;
}

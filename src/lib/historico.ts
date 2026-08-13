// ============================================================================
// HISTÓRICO COMBINADO - CLONAR/REPETIR RECEITAS E LAUDOS
// Dr. Diego Funahashi Alves - Neurologia Pediátrica
// ============================================================================
import { Timestamp } from 'firebase/firestore';
import type { Receita, Laudo, Patient, Agendamento } from '@/types/firestore';
import { buscarUltimaReceita, clonarUltimaReceita, prepararReceitaDoPaciente } from './receitas';
import { buscarUltimoLaudo, clonarUltimoLaudo, prepararLaudoDoPaciente } from './laudos';
import { buscarUltimoAgendamento } from './agendamentos';

// ---------------------------------------------------------------------------
// TIPOS DE RESPOSTA
// ---------------------------------------------------------------------------
export interface ResumoHistorico {
  temReceita: boolean;
  temLaudo: boolean;
  temAgendamento: boolean;
  ultimaReceita: Receita | null;
  ultimoLaudo: Laudo | null;
  ultimoAgendamento: Agendamento | null;
  totalReceitas: number;
  totalLaudos: number;
}

export interface DadosClonados {
  tipo: 'receita' | 'laudo';
  dados: Omit<Receita, 'prescriptionId' | 'createdAt' | 'updatedAt'> | 
         Omit<Laudo, 'reportId' | 'createdAt' | 'updatedAt'>;
  mensagem: string;
}

// ---------------------------------------------------------------------------
// BUSCAR RESUMO COMPLETO DO PACIENTE
// ---------------------------------------------------------------------------

/**
 * Busca o resumo completo do histórico do paciente
 * Útil para exibir na ficha do paciente (dashboard)
 */
export async function buscarResumoHistorico(patientId: string): Promise<ResumoHistorico> {
  const [ultimaReceita, ultimoLaudo, ultimoAgendamento] = await Promise.all([
    buscarUltimaReceita(patientId),
    buscarUltimoLaudo(patientId),
    buscarUltimoAgendamento(patientId),
  ]);

  return {
    temReceita: !!ultimaReceita,
    temLaudo: !!ultimoLaudo,
    temAgendamento: !!ultimoAgendamento,
    ultimaReceita,
    ultimoLaudo,
    ultimoAgendamento,
    totalReceitas: 0, // TODO: contar total se necessário
    totalLaudos: 0,
  };
}

// ---------------------------------------------------------------------------
// CLONAR ÚLTIMA RECEITA (BOTÃO "REPETIR ÚLTIMA RECEITA")
// ---------------------------------------------------------------------------

/**
 * Botão: "Repetir última receita"
 * 
 * Fluxo:
 * 1. Busca a última receita do paciente
 * 2. Se encontrar: clona os dados, atualiza o doctorUid, mantém medicamentos
 * 3. Se NÃO encontrar: prepara uma receita em branco com dados do paciente
 * 4. Retorna os dados para preencher o formulário (NÃO salva no banco ainda)
 * 
 * O médico pode editar os medicamentos antes de salvar.
 */
export async function repetirUltimaReceita(
  patient: Patient,
  doctorUid: string
): Promise<DadosClonados> {
  const clonada = await clonarUltimaReceita(patient.patientID, doctorUid);

  if (clonada) {
    return {
      tipo: 'receita',
      dados: clonada,
      mensagem: `Última receita de ${clonada.medicacoes.length} medicamento(s) carregada. Verifique as doses antes de salvar.`,
    };
  }

  // Sem histórico: prepara do zero
  const nova = prepararReceitaDoPaciente(patient, doctorUid);
  return {
    tipo: 'receita',
    dados: nova,
    mensagem: 'Nenhuma receita anterior encontrada. Formulário iniciado com dados do paciente.',
  };
}

// ---------------------------------------------------------------------------
// CLONAR ÚLTIMO LAUDO (BOTÃO "REPETIR ÚLTIMO LAUDO")
// ---------------------------------------------------------------------------

/**
 * Botão: "Repetir último laudo"
 * 
 * Fluxo:
 * 1. Busca o último laudo do paciente
 * 2. Se encontrar: clona os dados (texto, diagnósticos, CID), status = draft
 * 3. Se NÃO encontrar: prepara um laudo em branco
 * 4. Retorna os dados para preencher o formulário (NÃO salva no banco ainda)
 * 
 * O médico pode editar o texto do laudo antes de salvar.
 */
export async function repetirUltimoLaudo(
  patient: Patient,
  doctorUid: string,
  appointmentId: string = ''
): Promise<DadosClonados> {
  const clonado = await clonarUltimoLaudo(patient.patientID, doctorUid);

  if (clonado) {
  return {
    tipo: 'laudo',
    dados: clonado,
    mensagem: `Último laudo carregado com ${clonado.cidCodes.length} diagnóstico(s). Revise o texto antes de salvar.`,
  };
}

// Sem histórico: prepara do zero
const novo = prepararLaudoDoPaciente({
  patientID: patient.patientID,
  idade: patient.idade,

  'data de nascimento':
    patient['data de nascimento'] instanceof Timestamp
      ? patient['data de nascimento']
      : Timestamp.fromDate(
          new Date(patient['data de nascimento']._seconds * 1000)
        ),

}, doctorUid, appointmentId);

return {
  tipo: 'laudo',
  dados: novo,
  mensagem: 'Nenhum laudo anterior encontrado. Formulário iniciado com dados do paciente.',
};
// ---------------------------------------------------------------------------
// CLONAR POR ID ESPECÍFICO (MODAL DE HISTÓRICO)
// ---------------------------------------------------------------------------

/**
 * Usado no modal de histórico: o médico escolhe uma receita/laudo específico
 * e clica em "Usar como modelo"
 */
export async function usarReceitaComoModelo(
  prescriptionId: string,
  doctorUid: string
): Promise<DadosClonados | null> {
  const { clonarReceitaPorId } = await import('./receitas');
  const clonada = await clonarReceitaPorId(prescriptionId, doctorUid);

  if (!clonada) return null;

  return {
    tipo: 'receita',
    dados: clonada,
    mensagem: `Receita clonada com ${clonada.medicacoes.length} medicamento(s).`,
  };
}

export async function usarLaudoComoModelo(
  reportId: string,
  doctorUid: string
): Promise<DadosClonados | null> {
  const { clonarLaudoPorId } = await import('./laudos');
  const clonado = await clonarLaudoPorId(reportId, doctorUid);

  if (!clonado) return null;

  return {
    tipo: 'laudo',
    dados: clonado,
    mensagem: `Laudo clonado com ${clonado.cidCodes.length} diagnóstico(s).`,
  };
}

// ---------------------------------------------------------------------------
// ATUALIZAR DADOS DO PACIENTE NA RECEITA/LAUDO
// ---------------------------------------------------------------------------

/**
 * Atualiza idade, peso e endereço do paciente nos dados clonados
 * Útil quando o paciente veio para consulta e os dados mudaram
 */
export function sincronizarDadosPacienteNaReceita(
  dadosReceita: Omit<Receita, 'prescriptionId' | 'createdAt' | 'updatedAt'>,
  patient: Patient
): Omit<Receita, 'prescriptionId' | 'createdAt' | 'updatedAt'> {
  return {
    ...dadosReceita,
    endereco: patient.endereco,
    cpf: patient.cpf,
    idade: patient.idade,
    peso: patient.peso,
  };
}

export function sincronizarDadosPacienteNoLaudo(
  dadosLaudo: Omit<Laudo, 'reportId' | 'createdAt' | 'updatedAt'>,
  patient: Patient
): Omit<Laudo, 'reportId' | 'createdAt' | 'updatedAt'> {
  return {
    ...dadosLaudo,
    idade: patient.idade,
    'data de nascimento': patient['data de nascimento'],
  };
}

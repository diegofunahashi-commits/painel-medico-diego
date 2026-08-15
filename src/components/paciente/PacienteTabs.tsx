"use client";

import { useState } from 'react';
import type { Patient } from '@/types/firestore';

/* ─── Utilitários de data (proteção contra Invalid time value) ─── */
const toDate = (val: unknown): Date | null => {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === 'object' && 'toDate' in val && typeof (val as { toDate: () => Date }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate();
  }
  if (typeof val === 'string' || typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

const formatarData = (val: unknown, fmt = 'dd/MM/yyyy'): string => {
  const d = toDate(val);
  if (!d) return '-';
  return d.toLocaleDateString('pt-BR');
};

const calcularIdade = (dataNascimento: unknown): number | null => {
  const nasc = toDate(dataNascimento);
  if (!nasc) return null;
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
};
/* ─────────────────────────────────────────────────────────────── */

type Tab = 'dados' | 'consultas' | 'receitas' | 'laudos' | 'evolucao';

interface PacienteTabsProps {
  patient: Patient;
  children?: {
    dados?: React.ReactNode;
    consultas?: React.ReactNode;
    receitas?: React.ReactNode;
    laudos?: React.ReactNode;
    evolucao?: React.ReactNode;
  };
}

export default function PacienteTabs({ patient, children }: PacienteTabsProps) {
  const [abaAtiva, setAbaAtiva] = useState<Tab>('dados');

  const nome = patient?.['nome completo'] ?? 'Paciente';
  const idade = patient?.idade ?? calcularIdade(patient?.['data de nascimento']) ?? '-';
  const dataNascFmt = formatarData(patient?.['data de nascimento']);
  const tabs: { id: Tab; label: string }[] = [
    { id: 'dados', label: 'Dados' },
    { id: 'consultas', label: 'Consultas' },
    { id: 'receitas', label: 'Receitas' },
    { id: 'laudos', label: 'Laudos' },
    { id: 'evolucao', label: 'Evolução' },
  ];

  return (
    <div className="w-full">
      {/* Cabeçalho do paciente */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
        <h2 className="text-xl font-bold text-slate-900">{nome}</h2>
        <div className="flex flex-wrap gap-3 text-sm text-slate-500 mt-1">
          <span>{typeof idade === 'number' ? `${idade} anos` : idade}</span>
          {dataNascFmt !== '-' && <span>• Nascimento: {dataNascFmt}</span>}
          {patient?.cpf && <span>• CPF: {patient.cpf}</span>}
        </div>
      </div>

      {/* Navegação por abas */}
      <div className="border-b border-slate-200 mb-4">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAbaAtiva(tab.id)}
              className={`
                px-4 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap
                ${abaAtiva === tab.id
                  ? 'border-medical-600 text-medical-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo da aba ativa */}
      <div className="min-h-[200px]">
        {abaAtiva === 'dados' && (children?.dados ?? <DadosPaciente patient={patient} />)}
        {abaAtiva === 'consultas' && (children?.consultas ?? <div className="text-slate-400 text-sm">Sem consultas registradas.</div>)}
        {abaAtiva === 'receitas' && (children?.receitas ?? <div className="text-slate-400 text-sm">Sem receitas registradas.</div>)}
        {abaAtiva === 'laudos' && (children?.laudos ?? <div className="text-slate-400 text-sm">Sem laudos registrados.</div>)}
        {abaAtiva === 'evolucao' && (children?.evolucao ?? <div className="text-slate-400 text-sm">Sem evolução registrada.</div>)}
      </div>
    </div>
  );
}

/* Sub-componente de dados — exibe informações do paciente com datas protegidas */
function DadosPaciente({ patient }: { patient: Patient }) {
  const campos = [
    { label: 'Nome completo', valor: patient?.['nome completo'] },
    { label: 'Data de nascimento', valor: formatarData(patient?.['data de nascimento']) },
    { label: 'Idade', valor: patient?.idade ? `${patient.idade} anos` : `${calcularIdade(patient?.['data de nascimento']) ?? '-'} anos` },
    { label: 'CPF', valor: patient?.cpf ?? '-' },
    { label: 'Peso', valor: patient?.peso ? `${patient.peso} kg` : '-' },
    { label: 'Endereço', valor: patient?.endereco ? `${patient.endereco.logradouro ?? ''}, ${patient.endereco.numero ?? ''} - ${patient.endereco.cidade ?? ''}` : '-' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Dados do Paciente</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campos.map((campo) => (
          <div key={campo.label}>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{campo.label}</p>
            <p className="text-sm text-slate-900 mt-0.5">{campo.valor ?? '-'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
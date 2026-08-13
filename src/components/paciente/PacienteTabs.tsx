"use client";

import { useState } from 'react';
import type { Patient, Receita, Laudo } from '@/types/firestore';
import { FileText, FileCheck, Pill, Activity, Stethoscope, Calendar, ClipboardList } from 'lucide-react';
import HistoricoReceitas from '@/components/receitas/HistoricoReceitas';
import ReceitaForm from '@/components/receitas/ReceitaForm';
import ReceitaPreview from '@/components/receitas/ReceitaPreview';
import HistoricoLaudos from '@/components/laudos/HistoricoLaudos';
import LaudoForm from '@/components/laudos/LaudoForm';
import LaudoPreview from '@/components/laudos/LaudoPreview';

interface PacienteTabsProps {
  paciente: Patient;
}

type Tab = 'prontuario' | 'receitas' | 'laudos' | 'diagnosticos' | 'terapias' | 'agendamentos';
type ModoReceita = 'lista' | 'form' | 'preview';
type ModoLaudo = 'lista' | 'form' | 'preview';

export default function PacienteTabs({ paciente }: PacienteTabsProps) {
  const [abaAtiva, setAbaAtiva] = useState<Tab>('prontuario');

  // Estados das receitas
  const [modoReceita, setModoReceita] = useState<ModoReceita>('lista');
  const [receitaEditando, setReceitaEditando] = useState<Omit<Receita, 'prescriptionId' | 'createdAt' | 'updatedAt'> | null>(null);
  const [receitaPreview, setReceitaPreview] = useState<Receita | null>(null);

  // Estados dos laudos
  const [modoLaudo, setModoLaudo] = useState<ModoLaudo>('lista');
  const [laudoEditando, setLaudoEditando] = useState<Omit<Laudo, 'reportId' | 'createdAt' | 'updatedAt'> | null>(null);
  const [laudoPreview, setLaudoPreview] = useState<Laudo | null>(null);

  const tabs = [
    { id: 'prontuario' as Tab, label: 'Prontuário', icon: ClipboardList },
    { id: 'receitas' as Tab, label: 'Receitas', icon: Pill },
    { id: 'laudos' as Tab, label: 'Laudos', icon: FileCheck },
    { id: 'diagnosticos' as Tab, label: 'Diagnósticos', icon: Stethoscope },
    { id: 'terapias' as Tab, label: 'Terapias', icon: Activity },
    { id: 'agendamentos' as Tab, label: 'Consultas', icon: Calendar },
  ];

  // Handlers de Receitas
  const handleClonarReceita = (receita: Receita) => {
    const { prescriptionId, createdAt, updatedAt, ...dadosClonaveis } = receita;
    setReceitaEditando(dadosClonaveis);
    setModoReceita('form');
    setAbaAtiva('receitas');
  };

  const handleNovaReceita = () => {
    setReceitaEditando(null);
    setModoReceita('form');
  };

  const handleSalvarReceita = () => {
    setModoReceita('lista');
    setReceitaEditando(null);
  };

  const handleCancelarReceita = () => {
    setModoReceita('lista');
    setReceitaEditando(null);
  };

  // Handlers de Laudos
  const handleClonarLaudo = (laudo: Laudo) => {
    const { reportId, createdAt, updatedAt, ...dadosClonaveis } = laudo;
    setLaudoEditando(dadosClonaveis);
    setModoLaudo('form');
    setAbaAtiva('laudos');
  };

  const handleNovoLaudo = () => {
    setLaudoEditando(null);
    setModoLaudo('form');
  };

  const handleSalvarLaudo = () => {
    setModoLaudo('lista');
    setLaudoEditando(null);
  };

  const handleCancelarLaudo = () => {
    setModoLaudo('lista');
    setLaudoEditando(null);
  };

  return (
    <div>
      {/* Abas */}
      <div className="bg-white border border-slate-200 rounded-xl mb-6">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setAbaAtiva(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  abaAtiva === tab.id
                    ? 'border-medical-600 text-medical-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="min-h-[400px]">
        {abaAtiva === 'prontuario' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Prontuário do Paciente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase mb-2">Dados Pessoais</p>
                <div className="space-y-2 text-sm text-slate-700">
                  <p><span className="font-medium">Nome:</span> {paciente['nome completo']}</p>
                  <p><span className="font-medium">Responsável:</span> {paciente['nome do responsável']}</p>
                  <p><span className="font-medium">Sexo:</span> {paciente.sexo}</p>
                  <p><span className="font-medium">Idade:</span> {paciente.idade} anos</p>
                  <p><span className="font-medium">Peso:</span> {paciente.peso} kg</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase mb-2">Contato</p>
                <div className="space-y-2 text-sm text-slate-700">
                  <p><span className="font-medium">CPF:</span> {paciente.cpf}</p>
                  <p><span className="font-medium">Telefone:</span> {paciente.telefone}</p>
                  <p><span className="font-medium">Email:</span> {paciente.email}</p>
                  <p><span className="font-medium">Endereço:</span> {paciente.endereco?.rua}, {paciente.endereco?.numero} — {paciente.endereco?.bairro}, {paciente.endereco?.cidade}</p>
                  <p><span className="font-medium">Localização:</span> {paciente.localizacao}</p>
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-medium text-slate-500 uppercase mb-2">Anotações Gerais</p>
                <textarea
                  rows={4}
                  placeholder="Anotações livres sobre o paciente (evolução, observações clínicas, etc.)..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none text-sm resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'receitas' && (
          <div>
            {modoReceita === 'lista' && (
              <HistoricoReceitas
                patientId={paciente.patientID}
                onClonarReceita={handleClonarReceita}
                onNovaReceita={handleNovaReceita}
              />
            )}
            {modoReceita === 'form' && (
              <ReceitaForm
                patient={paciente}
                receitaInicial={receitaEditando}
                onSalvo={handleSalvarReceita}
                onCancelar={handleCancelarReceita}
              />
            )}
            {modoReceita === 'preview' && receitaPreview && (
              <ReceitaPreview receita={receitaPreview} patient={paciente} />
            )}
          </div>
        )}

        {abaAtiva === 'laudos' && (
          <div>
            {modoLaudo === 'lista' && (
              <HistoricoLaudos
                patientId={paciente.patientID}
                onClonarLaudo={handleClonarLaudo}
                onNovoLaudo={handleNovoLaudo}
              />
            )}
            {modoLaudo === 'form' && (
              <LaudoForm
                patient={paciente}
                laudoInicial={laudoEditando}
                onSalvo={handleSalvarLaudo}
                onCancelar={handleCancelarLaudo}
              />
            )}
            {modoLaudo === 'preview' && laudoPreview && (
              <LaudoPreview laudo={laudoPreview} patient={paciente} />
            )}
          </div>
        )}

        {abaAtiva === 'diagnosticos' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center py-12">
            <Stethoscope size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Lista de diagnósticos do paciente</p>
            <p className="text-sm text-slate-400 mt-2">Integração com coleção diagnosticos em desenvolvimento</p>
          </div>
        )}

        {abaAtiva === 'terapias' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center py-12">
            <Activity size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Terapias em andamento</p>
            <p className="text-sm text-slate-400 mt-2">Integração com coleção terapias em desenvolvimento</p>
          </div>
        )}

        {abaAtiva === 'agendamentos' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center py-12">
            <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Histórico de consultas</p>
            <p className="text-sm text-slate-400 mt-2">Integração com coleção agendamentos em desenvolvimento</p>
          </div>
        )}
      </div>
    </div>
  );
}

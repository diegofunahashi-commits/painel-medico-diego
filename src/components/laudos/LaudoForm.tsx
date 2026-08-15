"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/components/AuthProvider';
import { criarLaudo } from '@/lib/laudos';
import type { Laudo, Patient } from '@/types/firestore';
import { Plus, Trash2, Save, X, FileText, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';

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
  // Importa date-fns sob demanda ou use Intl.DateTimeFormat se preferir evitar import
  return d.toLocaleDateString('pt-BR');
};
/* ─────────────────────────────────────────────────────────────── */

const DIAGNOSTICOS_DB = [
  { id: 'tea', nome: 'Transtorno do Espectro Autista (TEA)', cid10: 'F84.0 / F84.5', cid11: '6A02', temGravidade: true, gravidades: ['Leve - suporte mínimo', 'Moderado - suporte substancial', 'Grave - suporte muito substancial'], template: 'Paciente apresenta padrão de comportamento compatível com Transtorno do Espectro Autista (TEA)...' },
  { id: 'tdah_combinada', nome: 'TDAH - Apresentação combinada', cid10: 'F90.0', cid11: '6A05.2', temGravidade: false, gravidades: [], template: 'Paciente apresenta critérios diagnósticos para Transtorno do Déficit de Atenção com Hiperatividade (TDAH)...' },
  { id: 'tdah_desatencao', nome: 'TDAH - Predominantemente desatento', cid10: 'F90.0', cid11: '6A05.0', temGravidade: false, gravidades: [], template: 'Paciente apresenta critérios diagnósticos para TDAH, apresentação predominantemente desatenta...' },
  { id: 'epilepsia_focal', nome: 'Epilepsia com Crises Focais', cid10: 'G40.1 / G40.2', cid11: '8A60.0', temGravidade: false, gravidades: [], template: 'Paciente apresenta padrão eletroclínico compatível com epilepsia com crises focais...' },
  { id: 'epilepsia_generalizada', nome: 'Epilepsia Generalizada Idiopática', cid10: 'G40.3', cid11: '8A60.2', temGravidade: false, gravidades: [], template: 'Paciente apresenta padrão eletroclínico compatível com epilepsia generalizada idiopática...' },
  { id: 'di_leve', nome: 'Deficiência Intelectual - Leve', cid10: 'F70', cid11: '6A00.0', temGravidade: false, gravidades: [], template: 'Paciente apresenta funcionamento intelectual significativamente abaixo da média, com QI estimado na faixa de 50-70...' },
  { id: 'di_moderada', nome: 'Deficiência Intelectual - Moderada', cid10: 'F71', cid11: '6A00.1', temGravidade: false, gravidades: [], template: 'Paciente apresenta funcionamento intelectual significativamente abaixo da média, com QI estimado na faixa de 35-49...' },
  { id: 'sindrome_tourette', nome: 'Síndrome de Tourette', cid10: 'F95.2', cid11: '8A05.00', temGravidade: false, gravidades: [], template: 'Paciente apresenta padrão de tiques motores múltiplos e pelo menos um tique vocal...' },
  { id: 'mutismo_seletivo', nome: 'Mutismo Seletivo', cid10: 'F94.0', cid11: '6A06', temGravidade: false, gravidades: [], template: 'Paciente apresenta incapacidade consistente de falar em contextos sociais específicos...' },
  { id: 'dislexia', nome: 'Transtorno de Aprendizagem - Dislexia', cid10: 'F81.0', cid11: '6A03.0', temGravidade: false, gravidades: [], template: 'Paciente apresenta dificuldades específicas e persistentes na aprendizagem de habilidades acadêmicas relacionadas à leitura...' },
  { id: 'disturbio_comunicacao', nome: 'Atraso na Linguagem', cid10: 'F80.1 / F80.2', cid11: '6A01.0', temGravidade: false, gravidades: [], template: 'Paciente apresenta atraso significativo no desenvolvimento da linguagem...' },
  { id: 'sindrome_rett', nome: 'Síndrome de Rett', cid10: 'F84.2', cid11: '6A02.1', temGravidade: false, gravidades: [], template: 'Paciente apresenta história de desenvolvimento aparentemente normal nos primeiros 6-18 meses...' },
  { id: 'sindrome_asperger', nome: 'Síndrome de Asperger', cid10: 'F84.5', cid11: '6A02.0', temGravidade: false, gravidades: [], template: 'Paciente apresenta padrão de comportamento compatível com TEA, com desenvolvimento da linguagem preservado...' },
  { id: 'transtorno_desintegrativo', nome: 'Transtorno Desintegrativo', cid10: 'F84.3', cid11: '6A02.2', temGravidade: false, gravidades: [], template: 'Paciente apresenta história de desenvolvimento aparentemente normal por pelo menos 2 anos...' },
  { id: 'epilepsia_benigna', nome: 'Epilepsia Benigna Centrotemporal', cid10: 'G40.0', cid11: '8A60.0', temGravidade: false, gravidades: [], template: 'Paciente apresenta padrão eletroclínico compatível com Epilepsia Benigna da Infância com Crises Centrotemporais...' },
];

const TERAPIAS_DB = [
  'Terapia Ocupacional (integração sensorial)',
  'Terapia Ocupacional (regulação sensorial)',
  'Fonoaudiologia (comunicação alternativa)',
  'Fonoaudiologia (desenvolvimento da linguagem)',
  'Psicologia (ABA / análise do comportamento)',
  'Psicologia (intervenção comportamental)',
  'Psicologia (intervenções sociais)',
  'Psicopedagogia',
  'Psicopedagogia especializada',
  'Neuropsicologia',
  'Fisioterapia',
  'Grupos de habilidades sociais',
  'Acompanhamento neuropediátrico regular',
  'Acompanhamento escolar',
];

interface DiagnosticoSelecionado {
  id: string;
  nome: string;
  cid10: string;
  cid11: string;
  gravidade?: string;
  textoEditado: string;
  foiEditado: boolean;
}

interface TerapiaSelecionada {
  nome: string;
  horasSemanais: number;
}

interface LaudoFormProps {
  patient: Patient;
  laudoInicial?: Omit<Laudo, 'reportId' | 'createdAt' | 'updatedAt'> | null;
  onSalvo: () => void;
  onCancelar: () => void;
}

export default function LaudoForm({ patient, laudoInicial, onSalvo, onCancelar }: LaudoFormProps) {
  const { user } = useAuthContext();
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoSelecionado[]>([]);
  const [terapias, setTerapias] = useState<TerapiaSelecionada[]>([]);
  const [textoLaudo, setTextoLaudo] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [diagnosticoAtual, setDiagnosticoAtual] = useState('');
  const [gravidadeAtual, setGravidadeAtual] = useState('');

  const atualizarTextoLaudo = useCallback((diags: DiagnosticoSelecionado[]) => {
    const textos = diags.map(d => {
      let texto = d.textoEditado;
      if (d.gravidade) texto = texto.replace(/\[GRAVIDADE\]/g, d.gravidade);
      return texto;
    });
    setTextoLaudo(textos.join('\n\n'));
  }, []);

  useEffect(() => {
    if (laudoInicial) {
      const cids = laudoInicial.cidCodes ?? [];
      const diagIds = laudoInicial.diagnosisIds ?? [];
      const diags: DiagnosticoSelecionado[] = cids.map((cid, idx) => {
        const dbDiag = DIAGNOSTICOS_DB.find(d => d.cid10.includes(cid)) || DIAGNOSTICOS_DB[0];
        return {
          id: dbDiag.id,
          nome: dbDiag.nome,
          cid10: cid,
          cid11: diagIds[idx] || dbDiag.cid11,
          textoEditado: laudoInicial.textoLaudo || dbDiag.template,
          foiEditado: true,
        };
      });
      setDiagnosticos(diags);
      setTextoLaudo(laudoInicial.textoLaudo ?? '');
      setObservacoes(
        (laudoInicial as Record<string, string>)?.['informacoes adicionais'] ??
        (laudoInicial as Record<string, string>)?.['informacoes adiconais'] ??
        ''
      );
      const terapiasIniciais = (laudoInicial as Record<string, unknown>)?.terapias as TerapiaSelecionada[] | undefined;
      setTerapias(terapiasIniciais ?? []);
    }
  }, [laudoInicial]);

  const adicionarDiagnostico = () => {
    const dbDiag = DIAGNOSTICOS_DB.find(d => d.id === diagnosticoAtual);
    if (!dbDiag) return;
    const novo: DiagnosticoSelecionado = {
      id: dbDiag.id,
      nome: dbDiag.nome,
      cid10: dbDiag.cid10,
      cid11: dbDiag.cid11,
      gravidade: dbDiag.temGravidade ? gravidadeAtual : undefined,
      textoEditado: dbDiag.template,
      foiEditado: false,
    };
    const novosDiagnosticos = [...diagnosticos, novo];
    setDiagnosticos(novosDiagnosticos);
    setDiagnosticoAtual('');
    setGravidadeAtual('');
    atualizarTextoLaudo(novosDiagnosticos);
  };

  const removerDiagnostico = (index: number) => {
    const novos = diagnosticos.filter((_, i) => i !== index);
    setDiagnosticos(novos);
    atualizarTextoLaudo(novos);
  };

  const atualizarTextoDiagnostico = (index: number, texto: string) => {
    const novos = [...diagnosticos];
    novos[index].textoEditado = texto;
    novos[index].foiEditado = true;
    setDiagnosticos(novos);
    atualizarTextoLaudo(novos);
  };

  const adicionarTerapia = () => setTerapias(prev => [...prev, { nome: '', horasSemanais: 1 }]);
  const removerTerapia = (index: number) => setTerapias(terapias.filter((_, i) => i !== index));
  const atualizarTerapia = (index: number, campo: keyof TerapiaSelecionada, valor: string | number) => {
    const novas = [...terapias];
    novas[index] = { ...novas[index], [campo]: valor };
    setTerapias(novas);
  };

  const handleSalvar = async () => {
    if (diagnosticos.length === 0) { toast.error('Adicione pelo menos um diagnóstico'); return; }
    setSalvando(true);
    try {
      const dadosLaudo: Omit<Laudo, 'reportId' | 'createdAt' | 'updatedAt'> = {
        patientId: patient?.patientID ?? '',
        idade: patient?.idade ?? 0,
        'data de nascimento': patient?.['data de nascimento'] ?? '',
        appointmentId: '',
        doctorUid: user?.uid || '',
        cidCodes: diagnosticos.map(d => d.cid10),
        diagnosisIds: diagnosticos.map(d => d.cid11),
        textoLaudo: textoLaudo,
        status: 'draft',
        'informacoes adiconais': observacoes,
        terapias: terapias.filter(t => t.nome.trim() !== ''),
      };
      await criarLaudo(dadosLaudo);
      toast.success('Laudo salvo com sucesso!');
      onSalvo();
    } catch (error) {
      console.error('Erro ao salvar laudo:', error);
      toast.error('Erro ao salvar laudo');
    } finally {
      setSalvando(false);
    }
  };

  const diagnosticoSelecionado = DIAGNOSTICOS_DB.find(d => d.id === diagnosticoAtual);
  const nomePaciente = patient?.['nome completo'] ?? 'Paciente';
  const idadePaciente = patient?.idade ?? '-';
  const dataNascimentoFmt = formatarData(patient?.['data de nascimento']);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {laudoInicial ? 'Novo Laudo (baseado em modelo)' : 'Novo Laudo Médico'}
          </h3>
          <p className="text-sm text-slate-500">
            {nomePaciente} — {idadePaciente} anos {dataNascimentoFmt !== '-' && `• Nasc. ${dataNascimentoFmt}`}
          </p>
        </div>
        <button onClick={onCancelar} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
          <X size={20} />
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
          <Stethoscope size={16} className="text-medical-600" />
          Diagnósticos CID-10/11
        </label>
        <div className="flex gap-2 mb-3">
          <select
            value={diagnosticoAtual}
            onChange={(e) => { setDiagnosticoAtual(e.target.value); setGravidadeAtual(''); }}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none text-sm"
          >
            <option value="">Selecione o diagnóstico...</option>
            {DIAGNOSTICOS_DB.map((d) => (
              <option key={d.id} value={d.id}>{d.nome} ({d.cid10})</option>
            ))}
          </select>
          {diagnosticoSelecionado?.temGravidade && (
            <select
              value={gravidadeAtual}
              onChange={(e) => setGravidadeAtual(e.target.value)}
              className="w-48 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none text-sm"
            >
              <option value="">Gravidade...</option>
              {diagnosticoSelecionado.gravidades.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          )}
          <button
            onClick={adicionarDiagnostico}
            disabled={!diagnosticoAtual}
            className="px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition disabled:opacity-50"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="space-y-3">
          {diagnosticos.map((diag, index) => (
            <div key={`${diag.id}-${index}`} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-slate-900">{diag.nome}</p>
                  <p className="text-xs text-slate-500">CID-10: {diag.cid10} | CID-11: {diag.cid11}</p>
                  {diag.gravidade && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium">{diag.gravidade}</span>
                  )}
                </div>
                <button onClick={() => removerDiagnostico(index)} className="p-1 text-slate-400 hover:text-red-500 transition" aria-label="Remover diagnóstico">
                  <Trash2 size={14} />
                </button>
              </div>
              <textarea
                value={diag.textoEditado}
                onChange={(e) => atualizarTextoDiagnostico(index, e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none text-sm resize-none"
                placeholder="Texto do laudo para este diagnóstico..."
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Terapias Recomendadas</label>
        <div className="space-y-2 mb-3">
          {terapias.map((terapia, index) => (
            <div key={index} className="flex gap-2">
              <select
                value={terapia.nome}
                onChange={(e) => atualizarTerapia(index, 'nome', e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none text-sm"
              >
                <option value="">Selecione...</option>
                {TERAPIAS_DB.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
              <input
                type="number" min={1} max={40}
                value={terapia.horasSemanais}
                onChange={(e) => atualizarTerapia(index, 'horasSemanais', Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none text-sm"
                placeholder="h/semana"
              />
              <button onClick={() => removerTerapia(index)} className="p-2 text-slate-400 hover:text-red-500 transition" aria-label="Remover terapia">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={adicionarTerapia} className="flex items-center gap-2 px-3 py-1.5 text-sm text-medical-600 hover:text-medical-700 font-medium">
          <Plus size={14} /> Adicionar terapia
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
          <FileText size={16} className="text-medical-600" /> Texto Completo do Laudo
        </label>
        <textarea
          value={textoLaudo}
          onChange={(e) => setTextoLaudo(e.target.value)}
          rows={10}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none text-sm resize-y font-mono leading-relaxed"
          placeholder="O texto será montado automaticamente conforme os diagnósticos selecionados, mas você pode editar livremente..."
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Observações / Informações Adicionais</label>
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none text-sm resize-none"
          placeholder="Retorno em 30 dias. Orientações de segurança reforçadas..."
        />
      </div>

      <div className="flex gap-3">
        <button onClick={handleSalvar} disabled={salvando} className="flex items-center gap-2 px-6 py-2.5 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition font-medium disabled:opacity-50">
          <Save size={18} /> {salvando ? 'Salvando...' : 'Salvar Laudo'}
        </button>
        <button onClick={onCancelar} className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium">
          Cancelar
        </button>
      </div>
    </div>
  );
}
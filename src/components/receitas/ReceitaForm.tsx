"use client";

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/AuthProvider';
import { criarReceita, atualizarReceita } from '@/lib/receitas';
import type { Receita, MedicacaoReceita, Patient } from '@/types/firestore';
import { Plus, Trash2, Calculator, Save, X, Pill } from 'lucide-react';
import toast from 'react-hot-toast';

// Banco de medicamentos (depois vem do Firestore)
const MEDICAMENTOS_DB = [
  { nome: 'Levetiracetam', categoria: 'Anticonvulsivante', dosePadrao: 30, unidade: 'mg/kg/dia', frequencia: 'De 12 em 12 horas', apresentacoes: ['Solução Oral 100 mg/mL', 'Comprimido 250 mg', 'Comprimido 500 mg'] },
  { nome: 'Ácido Valpróico', categoria: 'Anticonvulsivante', dosePadrao: 30, unidade: 'mg/kg/dia', frequencia: 'De 12 em 12 horas', apresentacoes: ['Solução Oral 250 mg/5mL', 'Comprimido 200 mg', 'Comprimido 500 mg'] },
  { nome: 'Carbamazepina', categoria: 'Anticonvulsivante', dosePadrao: 20, unidade: 'mg/kg/dia', frequencia: 'De 12 em 12 horas', apresentacoes: ['Suspensão 100 mg/5mL', 'Comprimido 200 mg'] },
  { nome: 'Risperidona', categoria: 'Neurodesenvolvimento', dosePadrao: 0.02, unidade: 'mg/kg/dia', frequencia: '1x ao dia (à noite)', apresentacoes: ['Solução Oral 1 mg/mL', 'Comprimido 0,5 mg', 'Comprimido 1 mg'] },
  { nome: 'Aripiprazol', categoria: 'Neurodesenvolvimento', dosePadrao: 0.1, unidade: 'mg/kg/dia', frequencia: '1x ao dia', apresentacoes: ['Solução Oral 1 mg/mL', 'Comprimido 2 mg', 'Comprimido 5 mg'] },
  { nome: 'Metilfenidato', categoria: 'TDAH', dosePadrao: 0.5, unidade: 'mg/kg/dia', frequencia: 'De manhã e ao meio-dia', apresentacoes: ['Comprimido 5 mg', 'Comprimido 10 mg', 'Comprimido LP 18 mg'] },
  { nome: 'Melatonina', categoria: 'Sono', dosePadrao: 3, unidade: 'mg/dia', frequencia: '30 min antes de dormir', apresentacoes: ['Comprimido 0,5 mg', 'Comprimido 1 mg', 'Comprimido 3 mg', 'Comprimido 5 mg'] },
  { nome: 'Clonazepam', categoria: 'Ansiolítico/Anticonvulsivante', dosePadrao: 0.05, unidade: 'mg/kg/dia', frequencia: 'De 12 em 12 horas', apresentacoes: ['Gotas 2,5 mg/mL', 'Comprimido 0,5 mg'] },
  { nome: 'Topiramato', categoria: 'Anticonvulsivante', dosePadrao: 2, unidade: 'mg/kg/dia', frequencia: 'De 12 em 12 horas', apresentacoes: ['Comprimido 25 mg', 'Comprimido 50 mg', 'Comprimido 100 mg'] },
  { nome: 'Lamotrigina', categoria: 'Anticonvulsivante', dosePadrao: 2, unidade: 'mg/kg/dia', frequencia: '1x ao dia (início) → 2x ao dia', apresentacoes: ['Comprimido 25 mg', 'Comprimido 50 mg', 'Comprimido 100 mg'] },
  { nome: 'Sertralina', categoria: 'Antidepressivo', dosePadrao: 1, unidade: 'mg/kg/dia', frequencia: '1x ao dia', apresentacoes: ['Comprimido 25 mg', 'Comprimido 50 mg'] },
  { nome: 'Fluoxetina', categoria: 'Antidepressivo', dosePadrao: 0.5, unidade: 'mg/kg/dia', frequencia: '1x ao dia', apresentacoes: ['Solução Oral 20 mg/5mL', 'Comprimido 10 mg', 'Comprimido 20 mg'] },
  { nome: 'Olanzapina', categoria: 'Neurodesenvolvimento', dosePadrao: 0.1, unidade: 'mg/kg/dia', frequencia: '1x ao dia', apresentacoes: ['Comprimido 2,5 mg', 'Comprimido 5 mg'] },
  { nome: 'Guanfacina', categoria: 'TDAH', dosePadrao: 0.05, unidade: 'mg/kg/dia', frequencia: '1x ao dia', apresentacoes: ['Comprimido 1 mg', 'Comprimido 2 mg'] },
  { nome: 'Atomoxetina', categoria: 'TDAH', dosePadrao: 0.5, unidade: 'mg/kg/dia', frequencia: '1x ao dia', apresentacoes: ['Cápsula 10 mg', 'Cápsula 25 mg', 'Cápsula 40 mg'] },
  { nome: 'Piracetam', categoria: 'Nootrópico', dosePadrao: 50, unidade: 'mg/kg/dia', frequencia: 'De 12 em 12 horas', apresentacoes: ['Solução Oral 333 mg/mL', 'Comprimido 400 mg', 'Comprimido 800 mg'] },
  { nome: 'CBD (Canabidiol)', categoria: 'Epilepsia refratária', dosePadrao: 2, unidade: 'mg/kg/dia', frequencia: 'De 12 em 12 horas', apresentacoes: ['Solução Oral 100 mg/mL', 'Solução Oral 200 mg/mL'] },
];

interface ReceitaFormProps {
  patient: Patient;
  receitaInicial?: Omit<Receita, 'prescriptionId' | 'createdAt' | 'updatedAt'> | null;
  onSalvo: () => void;
  onCancelar: () => void;
}

export default function ReceitaForm({ patient, receitaInicial, onSalvo, onCancelar }: ReceitaFormProps) {
  const { user } = useAuthContext();
  const [medicamentos, setMedicamentos] = useState<MedicacaoReceita[]>([]);
  const [cidade, setCidade] = useState('São Paulo - SP');
  const [salvando, setSalvando] = useState(false);
  const [pesoAtual, setPesoAtual] = useState(parseFloat(patient.peso) || 0);

  // Inicializa com dados clonados ou do paciente
  useEffect(() => {
    if (receitaInicial) {
      setMedicamentos(receitaInicial.medicacoes);
      setCidade(patient.endereco?.cidade ? `${patient.endereco.cidade} - SP` : 'São Paulo - SP');
      setPesoAtual(parseFloat(receitaInicial.peso) || parseFloat(patient.peso) || 0);
    } else {
      // Nova receita: inicia vazia
      setMedicamentos([]);
      setCidade(patient.endereco?.cidade ? `${patient.endereco.cidade} - SP` : 'São Paulo - SP');
      setPesoAtual(parseFloat(patient.peso) || 0);
    }
  }, [receitaInicial, patient]);

  const adicionarMedicamento = () => {
    setMedicamentos([...medicamentos, {
      ordem: medicamentos.length + 1,
      nome: '',
      dose: '',
      via: 'oral',
      frequencia: '',
      posologia: '',      
      pesoReferencia: 0,
      apresentacao: '',
      observacoes: '',
    }]);
  };

  const removerMedicamento = (index: number) => {
    const novos = medicamentos.filter((_, i) => i !== index);
    setMedicamentos(novos.map((m, i) => ({ ...m, ordem: i + 1 })));
  };

  const atualizarMedicamento = (index: number, campo: keyof MedicacaoReceita, valor: string) => {
    const novos = [...medicamentos];
    novos[index] = { ...novos[index], [campo]: valor };
    setMedicamentos(novos);
  };

  const calcularDose = (index: number) => {
    const med = medicamentos[index];
    const dbMed = MEDICAMENTOS_DB.find(m => m.nome === med.nome);
    if (!dbMed || pesoAtual <= 0) {
      toast.error('Selecione um medicamento e informe o peso');
      return;
    }

    const doseTotal = dbMed.dosePadrao * pesoAtual;
    let doseCalculada = '';
    let posologia = '';

    if (dbMed.nome === 'Levetiracetam') {
      // Solução 100 mg/mL
      const mlTotal = doseTotal / 100;
      const mlPorDose = mlTotal / 2;
      doseCalculada = `${mlPorDose.toFixed(1)} mL por tomada (${mlTotal.toFixed(1)} mL/dia)`;
      posologia = `Dar ${mlPorDose.toFixed(1)} mL via oral de 12 em 12 horas.`;
    } else if (dbMed.nome === 'Risperidona') {
      // Solução 1 mg/mL
      const mlTotal = doseTotal; // já é em mg, e 1mg/mL
      doseCalculada = `${mlTotal.toFixed(2)} mL por dia`;
      posologia = `Dar ${mlTotal.toFixed(2)} mL via oral à noite.`;
    } else if (dbMed.nome === 'Melatonina') {
      doseCalculada = `${doseTotal.toFixed(1)} mg por dia`;
      posologia = `Dar ${doseTotal.toFixed(1)} mg via oral 30 minutos antes de dormir.`;
    } else {
      doseCalculada = `${doseTotal.toFixed(1)} mg/dia`;
      posologia = `Dar ${(doseTotal / 2).toFixed(1)} mg via oral ${dbMed.frequencia.toLowerCase()}.`;
    }

    const novos = [...medicamentos];
    novos[index] = {
      ...novos[index],
      dose: `${dbMed.dosePadrao} ${dbMed.unidade} → ${doseCalculada}`,
      posologia: posologia,
      pesoReferencia: pesoAtual,
      frequencia: dbMed.frequencia.includes('12') ? "2" : "1",
    };
    setMedicamentos(novos);
    toast.success(`Dose calculada: ${doseCalculada}`);
  };

  const handleSalvar = async () => {
    if (medicamentos.length === 0) {
      toast.error('Adicione pelo menos um medicamento');
      return;
    }
    if (medicamentos.some(m => !m.nome || !m.dose)) {
      toast.error('Preencha todos os medicamentos');
      return;
    }

    setSalvando(true);
    try {
      const dadosReceita: Omit<Receita, 'prescriptionId' | 'createdAt' | 'updatedAt'> = {
        patientId: patient.patientID,
        doctorUid: user?.uid || '',
        endereco: patient.endereco,
        cpf: patient.cpf,
        idade: patient.idade,
        peso: String(pesoAtual),
        medicacoes: medicamentos,
      };

      await criarReceita(dadosReceita);
      toast.success('Receita salva com sucesso!');
      onSalvo();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar receita');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {receitaInicial ? 'Nova Receita (baseada em modelo)' : 'Nova Receita'}
          </h3>
          <p className="text-sm text-slate-500">{patient['nome completo']} — {pesoAtual} kg</p>
        </div>
        <button onClick={onCancelar} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
          <X size={20} />
        </button>
      </div>

      {/* Peso atual (pode ter mudado desde a última consulta) */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Peso atual (kg)</label>
        <input
          type="number"
          step="0.1"
          value={pesoAtual}
          onChange={(e) => setPesoAtual(parseFloat(e.target.value) || 0)}
          className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none"
        />
      </div>

      {/* Lista de medicamentos */}
      <div className="space-y-4 mb-6">
        {medicamentos.map((med, index) => (
          <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">Medicamento {index + 1}</span>
              <button
                onClick={() => removerMedicamento(index)}
                className="p-1 text-slate-400 hover:text-red-500 transition"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Medicamento</label>
                <select
                  value={med.nome}
                  onChange={(e) => atualizarMedicamento(index, 'nome', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none text-sm"
                >
                  <option value="">Selecione...</option>
                  {MEDICAMENTOS_DB.map((m) => (
                    <option key={m.nome} value={m.nome}>{m.nome} ({m.categoria})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Apresentação</label>
                <select
                  value={med.apresentacao || ''}
                  onChange={(e) => atualizarMedicamento(index, 'apresentacao', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none text-sm"
                >
                  <option value="">Selecione...</option>
                  {MEDICAMENTOS_DB.find(m => m.nome === med.nome)?.apresentacoes.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1 flex-1">Dose / Posologia</label>
                  <button
                    onClick={() => calcularDose(index)}
                    className="flex items-center gap-1 text-xs text-medical-600 hover:text-medical-700 font-medium"
                  >
                    <Calculator size={12} />
                    Calcular dose
                  </button>
                </div>
                <input
                  type="text"
                  value={med.dose}
                  onChange={(e) => atualizarMedicamento(index, 'dose', e.target.value)}
                  placeholder="Ex: 30 mg/kg/dia → 4,5 mL por tomada"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Instruções completas</label>
                <textarea
                  value={med.posologia || ''}
                  onChange={(e) => atualizarMedicamento(index, 'posologia', e.target.value)}
                  placeholder="Ex: Dar 4,5 mL via oral de 12 em 12 horas."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Via</label>
                <select
                  value={med.via}
                  onChange={(e) => atualizarMedicamento(index, 'via', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none text-sm"
                >
                  <option value="oral">Oral</option>
                  <option value="sublingual">Sublingual</option>
                  <option value="retal">Retal</option>
                  <option value="nasal">Nasal</option>
                  <option value="topica">Tópica</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Frequência</label>
                <input
                  type="text"
                  value={med.frequencia}
                  onChange={(e) => atualizarMedicamento(index, 'frequencia', e.target.value)}
                  placeholder="Ex: De 12 em 12 horas"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Observações</label>
                <input
                  type="text"
                  value={med.observacoes || ''}
                  onChange={(e) => atualizarMedicamento(index, 'observacoes', e.target.value)}
                  placeholder="Monitorar possíveis alterações comportamentais..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={adicionarMedicamento}
        className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 text-slate-600 rounded-lg hover:border-medical-500 hover:text-medical-600 transition w-full justify-center mb-6"
      >
        <Plus size={16} />
        <span className="text-sm font-medium">Adicionar Medicamento</span>
      </button>

      {/* Cidade */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Cidade / Data</label>
        <input
          type="text"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none"
        />
      </div>

      {/* Ações */}
      <div className="flex gap-3">
        <button
          onClick={handleSalvar}
          disabled={salvando}
          className="flex items-center gap-2 px-6 py-2.5 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition font-medium disabled:opacity-50"
        >
          <Save size={18} />
          {salvando ? 'Salvando...' : 'Salvar Receita'}
        </button>
        <button
          onClick={onCancelar}
          className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

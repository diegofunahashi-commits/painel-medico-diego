"use client";

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/AuthProvider';
import { buscarReceitasPorPaciente, excluirReceita } from '@/lib/receitas';
import type { Receita } from '@/types/firestore';
import { FileText, Clock, Repeat, Trash2, Printer, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HistoricoReceitasProps {
  patientId: string;
  onClonarReceita: (receita: Receita) => void;
  onNovaReceita: () => void;
}

export default function HistoricoReceitas({ patientId, onClonarReceita, onNovaReceita }: HistoricoReceitasProps) {
  const { user } = useAuthContext();
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [receitaSelecionada, setReceitaSelecionada] = useState<Receita | null>(null);

  useEffect(() => {
    if (!patientId) return;
    carregarReceitas();
  }, [patientId]);

  const carregarReceitas = async () => {
    setCarregando(true);
    try {
      const { receitas: lista } = await buscarReceitasPorPaciente(patientId, 20);
      setReceitas(lista);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar receitas');
    } finally {
      setCarregando(false);
    }
  };

  const handleClonar = (receita: Receita) => {
    onClonarReceita(receita);
    toast.success('Receita carregada como modelo!');
  };

  const handleExcluir = async (prescriptionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta receita?')) return;
    try {
      await excluirReceita(prescriptionId);
      toast.success('Receita excluída');
      carregarReceitas();
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Receitas Médicas</h3>
          <p className="text-sm text-slate-500">{receitas.length} receita(s) no histórico</p>
        </div>
        <div className="flex gap-2">
          {receitas.length > 0 && (
            <button
              onClick={() => handleClonar(receitas[0])}
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition border border-amber-200"
            >
              <Repeat size={16} />
              <span className="text-sm font-medium">Repetir última</span>
            </button>
          )}
          <button
            onClick={onNovaReceita}
            className="flex items-center gap-2 px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition"
          >
            <FileText size={16} />
            <span className="text-sm font-medium">Nova Receita</span>
          </button>
        </div>
      </div>

      {/* Lista de receitas */}
      {receitas.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">Nenhuma receita encontrada</p>
          <button
            onClick={onNovaReceita}
            className="mt-4 text-medical-600 hover:text-medical-700 font-medium text-sm"
          >
            Criar primeira receita →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {receitas.map((receita) => (
            <div
              key={receita.prescriptionId}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition cursor-pointer group"
              onClick={() => setReceitaSelecionada(receitaSelecionada?.prescriptionId === receita.prescriptionId ? null : receita)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-medical-100 flex items-center justify-center text-medical-600">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        Receita {receita.prescriptionId}
                      </p>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <Clock size={12} />
                        {format(receita.createdAt as any, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {receita.medicacoes.map((med, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md font-medium"
                      >
                        {med.nome}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleClonar(receita); }}
                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                    title="Usar como modelo"
                  >
                    <Repeat size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); /* TODO: imprimir */ }}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
                    title="Imprimir"
                  >
                    <Printer size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleExcluir(receita.prescriptionId); }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight
                    size={16}
                    className={`text-slate-400 transition-transform ${receitaSelecionada?.prescriptionId === receita.prescriptionId ? 'rotate-90' : ''}`}
                  />
                </div>
              </div>

              {/* Detalhes expandidos */}
              {receitaSelecionada?.prescriptionId === receita.prescriptionId && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase mb-2">Medicamentos</p>
                      <div className="space-y-2">
                        {receita.medicacoes.map((med, idx) => (
                          <div key={idx} className="bg-slate-50 p-3 rounded-lg">
                            <p className="font-medium text-slate-800">{med.nome}</p>
                            <p className="text-sm text-slate-600">{med.dose}</p>
                            <p className="text-sm text-slate-500">{med.via} — {med.frequencia}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase mb-2">Dados do Paciente na Época</p>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p><span className="font-medium">Idade:</span> {receita.idade}</p>
                        <p><span className="font-medium">Peso:</span> {receita.peso} kg</p>
                        <p><span className="font-medium">CPF:</span> {receita.cpf}</p>
                        <p><span className="font-medium">Endereço:</span> {receita.endereco.rua}, {receita.endereco.numero} — {receita.endereco.cidade}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

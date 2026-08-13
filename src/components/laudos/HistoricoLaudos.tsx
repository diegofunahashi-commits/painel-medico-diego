"use client";

import { useState, useEffect } from 'react';
import { buscarLaudosPorPaciente, excluirLaudo } from '@/lib/laudos';
import type { Laudo } from '@/types/firestore';
import { FileCheck, Clock, Repeat, Trash2, Printer, ChevronRight, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HistoricoLaudosProps {
  patientId: string;
  onClonarLaudo: (laudo: Laudo) => void;
  onNovoLaudo: () => void;
}

export default function HistoricoLaudos({ patientId, onClonarLaudo, onNovoLaudo }: HistoricoLaudosProps) {
  const [laudos, setLaudos] = useState<Laudo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [laudoSelecionado, setLaudoSelecionado] = useState<Laudo | null>(null);

  useEffect(() => {
    if (!patientId) return;
    carregarLaudos();
  }, [patientId]);

  const carregarLaudos = async () => {
    setCarregando(true);
    try {
      const { laudos: lista } = await buscarLaudosPorPaciente(patientId, 20);
      setLaudos(lista);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar laudos');
    } finally {
      setCarregando(false);
    }
  };

  const handleClonar = (laudo: Laudo) => {
    onClonarLaudo(laudo);
    toast.success('Laudo carregado como modelo!');
  };

  const handleExcluir = async (reportId: string) => {
    if (!confirm('Tem certeza que deseja excluir este laudo?')) return;
    try {
      await excluirLaudo(reportId);
      toast.success('Laudo excluído');
      carregarLaudos();
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { text: string; class: string }> = {
      draft: { text: 'Rascunho', class: 'bg-amber-100 text-amber-700' },
      signed: { text: 'Assinado', class: 'bg-green-100 text-green-700' },
      amended: { text: 'Retificado', class: 'bg-blue-100 text-blue-700' },
    };
    const s = map[status] || { text: status, class: 'bg-slate-100 text-slate-700' };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.class}`}>{s.text}</span>;
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Laudos Médicos</h3>
          <p className="text-sm text-slate-500">{laudos.length} laudo(s) no histórico</p>
        </div>
        <div className="flex gap-2">
          {laudos.length > 0 && (
            <button
              onClick={() => handleClonar(laudos[0])}
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition border border-amber-200"
            >
              <Repeat size={16} />
              <span className="text-sm font-medium">Repetir último</span>
            </button>
          )}
          <button
            onClick={onNovoLaudo}
            className="flex items-center gap-2 px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition"
          >
            <FileCheck size={16} />
            <span className="text-sm font-medium">Novo Laudo</span>
          </button>
        </div>
      </div>

      {/* Lista */}
      {laudos.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <FileCheck size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">Nenhum laudo encontrado</p>
          <button
            onClick={onNovoLaudo}
            className="mt-4 text-medical-600 hover:text-medical-700 font-medium text-sm"
          >
            Criar primeiro laudo →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {laudos.map((laudo) => (
            <div
              key={laudo.reportId}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition cursor-pointer group"
              onClick={() => setLaudoSelecionado(laudoSelecionado?.reportId === laudo.reportId ? null : laudo)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-medical-100 flex items-center justify-center text-medical-600">
                      <FileCheck size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">Laudo {laudo.reportId}</p>
                        {getStatusBadge(laudo.status)}
                      </div>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <Clock size={12} />
                        {format(laudo.createdAt as any, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {laudo.cidCodes.map((cid, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md font-medium">
                        CID: {cid}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleClonar(laudo); }}
                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                    title="Usar como modelo"
                  >
                    <Repeat size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); /* TODO: editar */ }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Editar"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); /* TODO: imprimir */ }}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
                    title="Imprimir"
                  >
                    <Printer size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleExcluir(laudo.reportId); }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight
                    size={16}
                    className={`text-slate-400 transition-transform ${laudoSelecionado?.reportId === laudo.reportId ? 'rotate-90' : ''}`}
                  />
                </div>
              </div>

              {/* Detalhes expandidos */}
              {laudoSelecionado?.reportId === laudo.reportId && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase mb-2">Diagnósticos</p>
                      <div className="space-y-1">
                        {laudo.cidCodes.map((cid, idx) => (
                          <p key={idx} className="text-sm text-slate-700 font-medium">{cid}</p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase mb-2">Dados da Consulta</p>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p><span className="font-medium">Idade:</span> {laudo.idade}</p>
                        <p><span className="font-medium">Agendamento:</span> {laudo.appointmentId}</p>
                        <p><span className="font-medium">Status:</span> {laudo.status}</p>
                      </div>
                    </div>
                  </div>
                  {laudo.textoLaudo && (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-slate-500 uppercase mb-2">Texto do Laudo</p>
                      <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {laudo.textoLaudo}
                      </div>
                    </div>
                  )}
                  {laudo['informacoes adiconais'] && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                      <p className="text-xs font-medium text-amber-700 uppercase">Observações</p>
                      <p className="text-sm text-amber-800">{laudo['informacoes adiconais']}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

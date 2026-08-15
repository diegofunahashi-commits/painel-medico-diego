"use client";

import { useState, useEffect, useRef } from 'react';
import { buscarLaudosPorPaciente, excluirLaudo } from '@/lib/laudos';
import type { Laudo } from '@/types/firestore';
import { FileCheck, Clock, Repeat, Trash2, Printer, ChevronRight, Edit3, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função segura para converter Timestamp do Firestore em Date
function toDate(valor: any): Date | null {
  if (!valor) return null;
  if (valor.toDate && typeof valor.toDate === 'function') return valor.toDate();
  if (valor instanceof Date) return valor;
  if (typeof valor === 'string' || typeof valor === 'number') {
    const d = new Date(valor);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

// Função segura para formatar data
function formatarData(valor: any, formato: string): string {
  const data = toDate(valor);
  if (!data) return 'Data não disponível';
  try {
    return format(data, formato, { locale: ptBR });
  } catch {
    return 'Data inválida';
  }
}

interface HistoricoLaudosProps {
  patientId: string;
  onClonarLaudo: (laudo: Laudo) => void;
  onNovoLaudo: () => void;
}

export default function HistoricoLaudos({ patientId, onClonarLaudo, onNovoLaudo }: HistoricoLaudosProps) {
  const [laudos, setLaudos] = useState<Laudo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [laudoSelecionado, setLaudoSelecionado] = useState<Laudo | null>(null);
  const [gerandoPdf, setGerandoPdf] = useState<string | null>(null);
  const pdfRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  const handleGerarPDF = async (laudo: Laudo) => {
    if (typeof window === 'undefined') return;
    const html2pdf = (await import('html2pdf.js')).default;
    const el = pdfRefs.current[laudo.reportId];
    if (!el) {
      toast.error('Erro ao gerar PDF');
      return;
    }
    setGerandoPdf(laudo.reportId);
    try {
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Laudo_${laudo.reportId}_${formatarData(laudo.createdAt, 'dd-MM-yyyy')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };
      await html2pdf().set(opt).from(el).save();
      toast.success('PDF baixado!');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao gerar PDF');
    } finally {
      setGerandoPdf(null);
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
            <div key={laudo.reportId}>
              {/* Card visível na tela */}
              <div
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
                          {formatarData(laudo.createdAt, "dd/MM/yyyy 'às' HH:mm")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {laudo.cidCodes?.map((cid, idx) => (
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
                      onClick={(e) => { e.stopPropagation(); }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Editar"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleGerarPDF(laudo); }}
                      disabled={gerandoPdf === laudo.reportId}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                      title="Baixar PDF"
                    >
                      {gerandoPdf === laudo.reportId ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600" />
                      ) : (
                        <Download size={16} />
                      )}
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

                {laudoSelecionado?.reportId === laudo.reportId && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase mb-2">Diagnósticos</p>
                        <div className="space-y-1">
                          {laudo.cidCodes?.map((cid, idx) => (
                            <p key={idx} className="text-sm text-slate-700 font-medium">{cid}</p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase mb-2">Dados da Consulta</p>
                        <div className="space-y-1 text-sm text-slate-600">
                          <p><span className="font-medium">Idade:</span> {laudo.idade || '-'}</p>
                          <p><span className="font-medium">Agendamento:</span> {laudo.appointmentId || '-'}</p>
                          <p><span className="font-medium">Status:</span> {laudo.status || '-'}</p>
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

              {/* Template oculto para PDF */}
              <div
                ref={(el) => { pdfRefs.current[laudo.reportId] = el; }}
                style={{ position: 'absolute', left: '-9999px', top: 0 }}
              >
                <div style={{ width: '210mm', minHeight: '297mm', padding: '20mm', fontFamily: 'Arial, sans-serif', background: '#fff', color: '#000' }}>
                  {/* Cabeçalho */}
                  <div style={{ textAlign: 'center', borderBottom: '2px solid #0ea5e9', paddingBottom: '16px', marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0c4a6e', margin: 0 }}>DR. DIEGO FUNAHASHI</h1>
                    <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 0 0' }}>Médico — CRM: [Número]</p>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>Neurodesenvolvimento Infantil</p>
                  </div>

                  {/* Título */}
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>Laudo Médico</h2>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      {formatarData(laudo.createdAt, "dd 'de' MMMM 'de' yyyy")}
                    </p>
                  </div>

                  {/* Dados do paciente */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#0c4a6e', marginBottom: '12px', textTransform: 'uppercase' }}>Dados do Paciente</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                      <p><strong>ID Paciente:</strong> {laudo.patientId || '-'}</p>
                      <p><strong>Idade:</strong> {laudo.idade || '-'} anos</p>
                      <p style={{ gridColumn: '1 / -1' }}><strong>Agendamento:</strong> {laudo.appointmentId || '-'}</p>
                    </div>
                  </div>

                  {/* CID */}
                  {laudo.cidCodes && laudo.cidCodes.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#0c4a6e', marginBottom: '12px', textTransform: 'uppercase' }}>Códigos CID</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {laudo.cidCodes.map((cid, idx) => (
                          <span key={idx} style={{ background: '#f3e8ff', color: '#7e22ce', padding: '4px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>
                            {cid}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Texto do laudo */}
                  {laudo.textoLaudo && (
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#0c4a6e', marginBottom: '12px', textTransform: 'uppercase' }}>Texto do Laudo</h3>
                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', fontSize: '13px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                        {laudo.textoLaudo}
                      </div>
                    </div>
                  )}

                  {/* Observações */}
                  {laudo['informacoes adiconais'] && (
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#0c4a6e', marginBottom: '12px', textTransform: 'uppercase' }}>Observações</h3>
                      <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#92400e' }}>
                        {laudo['informacoes adiconais']}
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div style={{ marginBottom: '32px' }}>
                    <p style={{ fontSize: '13px' }}>
                      <strong>Status:</strong>{' '}
                      {laudo.status === 'draft' && 'Rascunho'}
                      {laudo.status === 'signed' && 'Assinado'}
                      {laudo.status === 'amended' && 'Retificado'}
                      {!laudo.status && 'Não informado'}
                    </p>
                  </div>

                  {/* Assinatura */}
                  <div style={{ marginTop: '48px', textAlign: 'center' }}>
                    <div style={{ borderTop: '1px solid #000', width: '250px', margin: '0 auto', paddingTop: '8px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>Dr. Diego Funahashi</p>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>CRM: [Número] — Médico</p>
                    </div>
                  </div>

                  {/* Rodapé */}
                  <div style={{ position: 'absolute', bottom: '20mm', left: '20mm', right: '20mm', textAlign: 'center', fontSize: '10px', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                    <p>Documento gerado eletronicamente — {formatarData(laudo.createdAt, "dd/MM/yyyy 'às' HH:mm")}</p>
                    <p>ID: {laudo.reportId}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
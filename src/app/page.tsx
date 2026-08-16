"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthContext } from '@/components/AuthProvider';
import { buscarReceitasPorPaciente, excluirReceita } from '@/lib/receitas';
import type { Receita } from '@/types/firestore';
import { FileText, Clock, Repeat, Trash2, Download, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HistoricoReceitasProps {
  patientId: string;
  onClonarReceita: (receita: Receita) => void;
  onNovaReceita: () => void;
}

/* ============================================================
   HELPERS DEFENSIVOS — cobrem TODOS os formatos do Firestore
   ============================================================ */

function toDate(valor: unknown): Date | null {
  if (!valor) return null;
  if (valor instanceof Date) return isNaN(valor.getTime()) ? null : valor;
  if (typeof valor === 'string' || typeof valor === 'number') {
    const d = new Date(valor);
    return isNaN(d.getTime()) ? null : d;
  }
  // Firestore Timestamp com .toDate()
  const possivelTimestamp = valor as { toDate?: () => Date };
  if (typeof possivelTimestamp.toDate === 'function') {
    try {
      const d = possivelTimestamp.toDate();
      return d instanceof Date && !isNaN(d.getTime()) ? d : null;
    } catch {
      return null;
    }
  }
  // Firestore plain object { seconds, nanoseconds }
  const possivelObj = valor as { seconds?: number; nanoseconds?: number };
  if (typeof possivelObj.seconds === 'number') {
    const d = new Date(possivelObj.seconds * 1000);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function formatarData(valor: unknown, formato: string): string {
  const data = toDate(valor);
  if (!data) return 'Data não disponível';
  try {
    return format(data, formato, { locale: ptBR });
  } catch {
    return 'Data inválida';
  }
}

function safeArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val;
  return [];
}

/* ============================================================
   COMPONENTE
   ============================================================ */

export default function HistoricoReceitas({
  patientId,
  onClonarReceita,
  onNovaReceita,
}: HistoricoReceitasProps) {
  const { user } = useAuthContext();
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [receitaSelecionada, setReceitaSelecionada] = useState<Receita | null>(null);
  const [gerandoPdf, setGerandoPdf] = useState<string | null>(null);
  const pdfRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!patientId) return;
    carregarReceitas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const carregarReceitas = async () => {
    setCarregando(true);
    try {
      const { receitas: lista } = await buscarReceitasPorPaciente(patientId, 20);
      setReceitas(Array.isArray(lista) ? lista : []);
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

  const handleGerarPDF = async (receita: Receita) => {
    if (typeof window === 'undefined') return;
    const el = pdfRefs.current[receita.prescriptionId];
    if (!el) {
      toast.error('Erro ao gerar PDF');
      return;
    }
    setGerandoPdf(receita.prescriptionId);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Receita_${receita.prescriptionId}_${formatarData(receita.createdAt, 'dd-MM-yyyy')}.pdf`,
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

  /* CORREÇÃO CRÍTICA: ref callback memoizado para evitar re-render loop */
  const setPdfRef = useCallback(
    (prescriptionId: string) => (el: HTMLDivElement | null) => {
      pdfRefs.current[prescriptionId] = el;
    },
    []
  );

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
          {receitas.map((receita) => {
            const medicacoes = safeArray(receita.medicacoes);
            return (
              <div key={receita.prescriptionId}>
                {/* Card visível */}
                <div
                  className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition cursor-pointer group"
                  onClick={() =>
                    setReceitaSelecionada(
                      receitaSelecionada?.prescriptionId === receita.prescriptionId
                        ? null
                        : receita
                    )
                  }
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
                            {formatarData(receita.createdAt, "dd/MM/yyyy 'às' HH:mm")}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {medicacoes.map((med, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md font-medium"
                          >
                            {med.nome ?? 'Medicamento'}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClonar(receita);
                        }}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        title="Usar como modelo"
                      >
                        <Repeat size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGerarPDF(receita);
                        }}
                        disabled={gerandoPdf === receita.prescriptionId}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                        title="Baixar PDF"
                      >
                        {gerandoPdf === receita.prescriptionId ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600" />
                        ) : (
                          <Download size={16} />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExcluir(receita.prescriptionId);
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                      <ChevronRight
                        size={16}
                        className={`text-slate-400 transition-transform ${
                          receitaSelecionada?.prescriptionId === receita.prescriptionId
                            ? 'rotate-90'
                            : ''
                        }`}
                      />
                    </div>
                  </div>

                  {receitaSelecionada?.prescriptionId === receita.prescriptionId && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase mb-2">
                            Medicamentos
                          </p>
                          <div className="space-y-2">
                            {medicacoes.map((med, idx) => (
                              <div key={idx} className="bg-slate-50 p-3 rounded-lg">
                                <p className="font-medium text-slate-800">
                                  {med.nome ?? 'Medicamento'}
                                </p>
                                <p className="text-sm text-slate-600">{med.dose ?? '-'}</p>
                                <p className="text-sm text-slate-500">
                                  {med.via ?? '-'} — {med.frequencia ?? '-'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase mb-2">
                            Dados do Paciente na Época
                          </p>
                          <div className="space-y-1 text-sm text-slate-600">
                            <p>
                              <span className="font-medium">Idade:</span> {receita.idade ?? '-'}
                            </p>
                            <p>
                              <span className="font-medium">Peso:</span>{' '}
                              {receita.peso ? `${receita.peso} kg` : '-'}
                            </p>
                            <p>
                              <span className="font-medium">CPF:</span> {receita.cpf ?? '-'}
                            </p>
                            <p>
                              <span className="font-medium">Endereço:</span>{' '}
                              {receita.endereco
                                ? `${receita.endereco.rua ?? ''}, ${receita.endereco.numero ?? ''} — ${
                                    receita.endereco.cidade ?? ''
                                  }`
                                : '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Template oculto para PDF */}
                <div
                  ref={setPdfRef(receita.prescriptionId)}
                  style={{ position: 'absolute', left: '-9999px', top: 0 }}
                >
                  <div
                    style={{
                      width: '210mm',
                      minHeight: '297mm',
                      padding: '20mm',
                      fontFamily: 'Arial, sans-serif',
                      background: '#fff',
                      color: '#000',
                    }}
                  >
                    {/* Cabeçalho */}
                    <div
                      style={{
                        textAlign: 'center',
                        borderBottom: '2px solid #0ea5e9',
                        paddingBottom: '16px',
                        marginBottom: '24px',
                      }}
                    >
                      <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0c4a6e', margin: 0 }}>
                        DR. DIEGO FUNAHASHI
                      </h1>
                      <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 0 0' }}>
                        Médico — CRM: [Número]
                      </p>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                        Neurodesenvolvimento Infantil
                      </p>
                    </div>

                    {/* Título */}
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <h2
                        style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          letterSpacing: '2px',
                          margin: 0,
                        }}
                      >
                        Receituário Médico
                      </h2>
                      <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                        {formatarData(receita.createdAt, "dd 'de' MMMM 'de' yyyy")}
                      </p>
                    </div>

                    {/* Dados do paciente */}
                    <div
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '24px',
                      }}
                    >
                      <h3
                        style={{
                          fontSize: '13px',
                          fontWeight: 'bold',
                          color: '#0c4a6e',
                          marginBottom: '12px',
                          textTransform: 'uppercase',
                        }}
                      >
                        Dados do Paciente
                      </h3>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '8px',
                          fontSize: '13px',
                        }}
                      >
                        <p>
                          <strong>Nome:</strong> {receita.patientId ?? 'Paciente'}
                        </p>
                        <p>
                          <strong>CPF:</strong> {receita.cpf ?? '-'}
                        </p>
                        <p>
                          <strong>Idade:</strong> {receita.idade ?? '-'} anos
                        </p>
                        <p>
                          <strong>Peso:</strong>{' '}
                          {receita.peso ? `${receita.peso} kg` : '-'}
                        </p>
                        <p style={{ gridColumn: '1 / -1' }}>
                          <strong>Endereço:</strong>{' '}
                          {receita.endereco
                            ? `${receita.endereco.rua ?? ''}, ${receita.endereco.numero ?? ''}, ${
                                receita.endereco.bairro ?? ''
                              }, ${receita.endereco.cidade ?? ''}`
                            : '-'}
                        </p>
                      </div>
                    </div>

                    {/* Medicamentos */}
                    <div style={{ marginBottom: '32px' }}>
                      <h3
                        style={{
                          fontSize: '13px',
                          fontWeight: 'bold',
                          color: '#0c4a6e',
                          marginBottom: '16px',
                          textTransform: 'uppercase',
                        }}
                      >
                        Prescrição
                      </h3>
                      {medicacoes.map((med, idx) => (
                        <div
                          key={idx}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '16px',
                            marginBottom: '12px',
                          }}
                        >
                          <p style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                            {idx + 1}. {med.nome ?? 'Medicamento'}
                          </p>
                          <p style={{ fontSize: '13px', margin: '4px 0', color: '#334155' }}>
                            <strong>Dose:</strong> {med.dose ?? '-'}
                          </p>
                          <p style={{ fontSize: '13px', margin: '4px 0', color: '#334155' }}>
                            <strong>Via:</strong> {med.via ?? '-'}
                          </p>
                          <p style={{ fontSize: '13px', margin: '4px 0', color: '#334155' }}>
                            <strong>Frequência:</strong> {med.frequencia ?? '-'}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Assinatura */}
                    <div style={{ marginTop: '48px', textAlign: 'center' }}>
                      <div
                        style={{
                          borderTop: '1px solid #000',
                          width: '250px',
                          margin: '0 auto',
                          paddingTop: '8px',
                        }}
                      >
                        <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>
                          Dr. Diego Funahashi
                        </p>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                          CRM: [Número] — Médico
                        </p>
                      </div>
                    </div>

                    {/* Rodapé */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '20mm',
                        left: '20mm',
                        right: '20mm',
                        textAlign: 'center',
                        fontSize: '10px',
                        color: '#94a3b8',
                        borderTop: '1px solid #e2e8f0',
                        paddingTop: '8px',
                      }}
                    >
                      <p>
                        Documento gerado eletronicamente —{' '}
                        {formatarData(receita.createdAt, "dd/MM/yyyy 'às' HH:mm")}
                      </p>
                      <p>ID: {receita.prescriptionId}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
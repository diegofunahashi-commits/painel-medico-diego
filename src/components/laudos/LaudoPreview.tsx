"use client";

import { useRef } from 'react';
import type { Laudo, Patient } from '@/types/firestore';
import { Printer } from 'lucide-react';

interface LaudoPreviewProps {
  laudo: Laudo;
  patient: Patient;
}

export default function LaudoPreview({ laudo, patient }: LaudoPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Laudo Médico - ${patient['nome completo']}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; line-height: 1.6; }
            .laudo-a4 { width: 210mm; min-height: 297mm; padding: 20mm; box-sizing: border-box; }
            .header { text-align: center; border-bottom: 3px double #0284c7; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #0284c7; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 3px; }
            .header h2 { color: #1e293b; font-size: 24px; margin: 8px 0; font-weight: 700; }
            .header p { color: #64748b; font-size: 11px; margin: 3px 0; }
            .section-title { color: #0284c7; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 20px 0 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; margin-bottom: 20px; }
            .info-grid p { margin: 0; color: #334155; }
            .info-grid strong { color: #1e293b; }
            .diagnostico-box { border-left: 4px solid #0284c7; padding-left: 12px; margin: 12px 0; }
            .diagnostico-box h4 { color: #0284c7; font-size: 13px; margin: 0 0 4px; }
            .diagnostico-box p { color: #475569; font-size: 12px; margin: 0; }
            .terapia-item { display: inline-block; background: #f1f5f9; padding: 4px 10px; border-radius: 4px; margin: 2px; font-size: 11px; color: #475569; }
            .laudo-texto { text-align: justify; font-size: 12px; color: #334155; white-space: pre-wrap; }
            .assinatura { margin-top: 50px; text-align: center; }
            .assinatura-linha { border-top: 1px solid #334155; width: 300px; margin: 0 auto 10px; padding-top: 10px; }
            .footer { margin-top: 40px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="laudo-a4">${printContent}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const dataFormatada = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div>
      <button
        onClick={handlePrint}
        className="no-print flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition mb-4"
      >
        <Printer size={16} />
        <span className="text-sm font-medium">Imprimir / Salvar PDF</span>
      </button>

      <div ref={printRef} className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        {/* Cabeçalho */}
        <div className="text-center border-b-2 border-medical-500 pb-6 mb-6">
          <p className="text-xs text-medical-600 uppercase tracking-widest font-semibold">Laudo Médico</p>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Dr. Diego Funahashi Alves</h2>
          <p className="text-sm text-slate-600">Neurologia Pediátrica</p>
          <p className="text-xs text-slate-500 mt-1">CRMSP 154087 • CRMMG 31546</p>
          <p className="text-xs text-slate-400">Pós-graduado em Neurologia Pediátrica • Avaliação do Neurodesenvolvimento</p>
          <p className="text-xs text-slate-400">www.drdiegofunahashi.com.br</p>
        </div>

        {/* Dados do paciente */}
        <div className="mb-6">
          <p className="text-xs font-bold text-medical-600 uppercase tracking-wider mb-3">Dados do Paciente</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <p><span className="font-semibold text-slate-800">Nome:</span> {patient['nome completo']}</p>
            <p><span className="font-semibold text-slate-800">Idade:</span> {laudo.idade}</p>
            <p><span className="font-semibold text-slate-800">Responsável:</span> {patient['nome do responsável']}</p>
            <p><span className="font-semibold text-slate-800">Sexo:</span> {patient.sexo}</p>
            <p><span className="font-semibold text-slate-800">Localização:</span> {patient.localizacao}</p>
            <p><span className="font-semibold text-slate-800">Data:</span> {dataFormatada}</p>
          </div>
        </div>

        {/* Diagnósticos */}
        <div className="mb-6">
          <p className="text-xs font-bold text-medical-600 uppercase tracking-wider mb-3">Diagnósticos</p>
          <div className="space-y-3">
            {laudo.cidCodes.map((cid, idx) => (
              <div key={idx} className="border-l-4 border-medical-500 pl-4 py-2 bg-slate-50 rounded-r-lg">
                <p className="font-bold text-medical-700 text-sm">{cid}</p>
                <p className="text-xs text-slate-500">{laudo.diagnosisIds[idx]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Texto do laudo */}
        <div className="mb-6">
          <p className="text-xs font-bold text-medical-600 uppercase tracking-wider mb-3">Relato / Parecer</p>
          <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed text-justify">
            {laudo.textoLaudo}
          </div>
        </div>

        {/* Observações */}
        {laudo['informacoes adiconais'] && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Observações</p>
            <p className="text-sm text-amber-800">{laudo['informacoes adiconais']}</p>
          </div>
        )}

        {/* Assinatura */}
        <div className="mt-12 text-center">
          <div className="border-t border-slate-800 w-72 mx-auto pt-4">
            <p className="font-bold text-slate-900 text-lg">Dr. Diego Funahashi Alves</p>
            <p className="text-sm text-slate-600">Neurologia Pediátrica</p>
            <p className="text-xs text-slate-500">CRMSP 154087 • CRMMG 31546</p>
          </div>
          <p className="text-sm text-slate-500 mt-4">{patient.endereco?.cidade || 'São Paulo'}, {dataFormatada}</p>
        </div>

        {/* Rodapé */}
        <div className="mt-10 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
          <p>Este laudo é um documento médico confidencial. Seu conteúdo é de responsabilidade do médico signatário.</p>
          <p>www.drdiegofunahashi.com.br</p>
        </div>
      </div>
    </div>
  );
}

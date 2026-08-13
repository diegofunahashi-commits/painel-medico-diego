"use client";

import { useRef } from 'react';
import type { Receita, Patient } from '@/types/firestore';
import { Printer } from 'lucide-react';

interface ReceitaPreviewProps {
  receita: Receita;
  patient: Patient;
}

export default function ReceitaPreview({ receita, patient }: ReceitaPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receita Médica - ${patient['nome completo']}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; }
            .receita-a4 { width: 210mm; min-height: 297mm; padding: 20mm; box-sizing: border-box; }
            .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { color: #0284c7; font-size: 14px; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
            .header h2 { color: #1e293b; font-size: 22px; margin: 5px 0; font-weight: 700; }
            .header p { color: #64748b; font-size: 11px; margin: 2px 0; }
            .paciente-info { background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; }
            .paciente-info p { margin: 3px 0; color: #334155; }
            .medicamento { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
            .medicamento-nome { font-weight: 700; color: #0284c7; font-size: 14px; margin-bottom: 4px; }
            .medicamento-dose { font-size: 13px; color: #1e293b; margin-bottom: 4px; }
            .medicamento-posologia { font-size: 12px; color: #475569; font-style: italic; }
            .assinatura { margin-top: 40px; text-align: center; }
            .assinatura-linha { border-top: 1px solid #334155; width: 250px; margin: 0 auto 8px; padding-top: 8px; }
            .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="receita-a4">${printContent}</div>
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
        {/* Cabeçalho timbrado */}
        <div className="text-center border-b-2 border-medical-500 pb-4 mb-6">
          <p className="text-xs text-medical-600 uppercase tracking-widest font-semibold">Receita Médica</p>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Dr. Diego Funahashi Alves</h2>
          <p className="text-sm text-slate-600">Neurologia Pediátrica</p>
          <p className="text-xs text-slate-500 mt-1">CRMSP 154087 • CRMMG 31546</p>
          <p className="text-xs text-slate-400">Pós-graduado em Neurologia Pediátrica</p>
          <p className="text-xs text-slate-400">www.drdiegofunahashi.com.br</p>
        </div>

        {/* Dados do paciente */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <p><span className="font-medium text-slate-700">Paciente:</span> {patient['nome completo']}</p>
            <p><span className="font-medium text-slate-700">Idade:</span> {receita.idade}</p>
            <p><span className="font-medium text-slate-700">Peso:</span> {receita.peso} kg</p>
            <p><span className="font-medium text-slate-700">CPF:</span> {receita.cpf}</p>
          </div>
          <p className="mt-1 text-slate-600">{receita.endereco.rua}, {receita.endereco.numero} — {receita.endereco.cidade}</p>
        </div>

        {/* Medicamentos */}
        <div className="space-y-4 mb-8">
          {receita.medicacoes.map((med, idx) => (
            <div key={idx} className="border border-slate-200 rounded-lg p-4">
              <p className="font-bold text-medical-700 text-base">{med.ordem}. {med.nome}</p>
              <p className="text-sm text-slate-800 mt-1">{med.dose}</p>
              <p className="text-sm text-slate-600 italic mt-1">{med.posologia}</p>
              {med.observacoes && (
                <p className="text-xs text-slate-500 mt-2 bg-amber-50 p-2 rounded">⚠️ {med.observacoes}</p>
              )}
            </div>
          ))}
        </div>

        {/* Assinatura */}
        <div className="mt-12 text-center">
          <div className="border-t border-slate-800 w-64 mx-auto pt-3">
            <p className="font-bold text-slate-900">Dr. Diego Funahashi Alves</p>
            <p className="text-sm text-slate-600">Neurologia Pediátrica</p>
            <p className="text-xs text-slate-500">CRMSP 154087 • CRMMG 31546</p>
          </div>
          <p className="text-sm text-slate-500 mt-4">{receita.endereco.cidade}, {dataFormatada}</p>
        </div>

        {/* Rodapé */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
          <p>Receituário válido por 30 dias. Controle especial — Lei 5.991/73</p>
          <p>www.drdiegofunahashi.com.br</p>
        </div>
      </div>
    </div>
  );
}

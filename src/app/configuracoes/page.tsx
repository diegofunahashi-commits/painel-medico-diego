"use client";

import { useState } from "react";
import { Settings, Pill, Stethoscope } from "lucide-react";

const medicamentosPre = [
  "Levetiracetam", "Ácido Valpróico", "Carbamazepina", "Risperidona", "Aripiprazol",
  "Metilfenidato", "Melatonina", "Clonazepam", "Topiramato", "Lamotrigina",
  "Sertralina", "Fluoxetina", "Olanzapina", "Guanfacina", "Atomoxetina", "Piracetam", "CBD"
];

const diagnosticosPre = [
  "TEA", "TDAH Combinado", "TDAH Desatento", "Epilepsia Focal", "Epilepsia Generalizada",
  "DI Leve", "DI Moderada", "Síndrome de Tourette", "Mutismo Seletivo", "Dislexia",
  "Atraso na Linguagem", "Síndrome de Rett", "Síndrome de Asperger", "Transtorno Desintegrativo", "Epilepsia Benigna"
];

export default function ConfiguracoesPage() {
  const [aba, setAba] = useState<"medicamentos" | "diagnosticos">("medicamentos");

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
          <Settings size={20} className="text-slate-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
          <p className="text-slate-500 text-sm">Gerencie medicamentos e diagnósticos disponíveis</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="border-b border-slate-100 flex">
          <button onClick={() => setAba("medicamentos")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition ${
              aba === "medicamentos" ? "border-medical-600 text-medical-600" : "border-transparent text-slate-500"
            }`}>
            <Pill size={16} /> Medicamentos ({medicamentosPre.length})
          </button>
          <button onClick={() => setAba("diagnosticos")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition ${
              aba === "diagnosticos" ? "border-medical-600 text-medical-600" : "border-transparent text-slate-500"
            }`}>
            <Stethoscope size={16} /> Diagnósticos ({diagnosticosPre.length})
          </button>
        </div>

        <div className="p-6">
          {aba === "medicamentos" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {medicamentosPre.map((med) => (
                <div key={med} className="p-3 bg-slate-50 rounded-lg text-sm font-medium text-slate-700">
                  {med}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {diagnosticosPre.map((diag) => (
                <div key={diag} className="p-3 bg-slate-50 rounded-lg text-sm font-medium text-slate-700">
                  {diag}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

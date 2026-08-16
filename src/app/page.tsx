"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { buscarReceitasPorPaciente } from "@/lib/receitas"; // ajuste conforme sua lib
import type { Receita } from "@/types/firestore";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mesmo helper seguro do HistoricoReceitas
function toDate(valor: unknown): Date | null {
  if (!valor) return null;
  if (valor instanceof Date) return isNaN(valor.getTime()) ? null : valor;
  if (typeof valor === "string" || typeof valor === "number") {
    const d = new Date(valor);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof (valor as { toDate?: () => Date }).toDate === "function") {
    try {
      const d = (valor as { toDate: () => Date }).toDate();
      return d instanceof Date && !isNaN(d.getTime()) ? d : null;
    } catch {
      return null;
    }
  }
  if (
    typeof valor === "object" &&
    valor !== null &&
    "seconds" in valor &&
    typeof (valor as { seconds: unknown }).seconds === "number"
  ) {
    const d = new Date((valor as { seconds: number }).seconds * 1000);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function formatarData(valor: unknown, formato: string): string {
  const data = toDate(valor);
  if (!data) return "—";
  try {
    return format(data, formato, { locale: ptBR });
  } catch {
    return "Data inválida";
  }
}

export default function ReceitasPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        // Ajuste conforme sua API — exemplo:
        const { receitas: lista } = await buscarReceitasPorPaciente("todos", 50);
        setReceitas(lista || []);
      } catch (e) {
        console.error(e);
      } finally {
        setCarregando(false);
      }
    };
    load();
  }, [user]);

  if (loading || carregando) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Histórico de Receitas</h1>

      {receitas.length === 0 ? (
        <p className="text-slate-500">Nenhuma receita encontrada.</p>
      ) : (
        <div className="space-y-3">
          {receitas.map((receita) => (
            <div
              key={receita.prescriptionId}
              className="bg-white border border-slate-200 rounded-xl p-4"
            >
              <p className="font-medium text-slate-900">
                Receita {receita.prescriptionId}
              </p>
              <p className="text-sm text-slate-500">
                {/* AQUI ESTÁ A CORREÇÃO: usa formatarData em vez de format direto */}
                {formatarData(receita.createdAt, "dd/MM/yyyy 'às' HH:mm")}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {receita.medicacoes?.map((med, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md"
                  >
                    {med.nome}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
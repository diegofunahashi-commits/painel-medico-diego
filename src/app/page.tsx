"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { buscarTodosPacientes } from "@/lib/pacientes";
import { buscarAgendamentosDoDia } from "@/lib/agendamentos";
import type { Patient, Agendamento } from "@/types/firestore";
import Link from "next/link";
import { Users, Calendar, FileText, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DashboardPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [stats, setStats] = useState({ pacientes: 0, consultasHoje: 0, receitasMes: 0, laudosMes: 0 });
  const [consultasHoje, setConsultasHoje] = useState<Agendamento[]>([]);
  const [pacientesRecentes, setPacientesRecentes] = useState<Patient[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const { pacientes } = await buscarTodosPacientes(5);
        setPacientesRecentes(pacientes);
        // TODO: buscar consultas do dia e stats reais
        setStats({ pacientes: pacientes.length, consultasHoje: 0, receitasMes: 0, laudosMes: 0 });
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

  if (!user) return null;

  const hoje = new Date();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">{format(hoje, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
      </div>

      {/* Cards de stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Pacientes</p>
              <p className="text-2xl font-bold text-slate-900">{stats.pacientes}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-medical-100 flex items-center justify-center text-medical-600">
              <Users size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Consultas Hoje</p>
              <p className="text-2xl font-bold text-slate-900">{stats.consultasHoje}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
              <Calendar size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Receitas (mês)</p>
              <p className="text-2xl font-bold text-slate-900">{stats.receitasMes}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
              <FileText size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Laudos (mês)</p>
              <p className="text-2xl font-bold text-slate-900">{stats.laudosMes}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pacientes recentes */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Pacientes Recentes</h2>
            <Link href="/pacientes" className="text-sm text-medical-600 hover:text-medical-700 font-medium flex items-center gap-1">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {pacientesRecentes.map((p) => (
              <Link
                key={p.patientID}
                href={`/pacientes/${p.patientID}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition"
              >
                <div className="w-9 h-9 rounded-full bg-medical-100 flex items-center justify-center text-medical-600 text-sm font-bold">
                  {p['nome completo'].charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{p['nome completo']}</p>
                  <p className="text-xs text-slate-500">{p.idade} anos • {p.localizacao}</p>
                </div>
              </Link>
            ))}
            {pacientesRecentes.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">Nenhum paciente cadastrado</p>
            )}
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/pacientes/novo" className="p-4 bg-medical-50 border border-medical-100 rounded-xl hover:bg-medical-100 transition text-center">
              <Users size={24} className="mx-auto text-medical-600 mb-2" />
              <p className="text-sm font-medium text-medical-700">Novo Paciente</p>
            </Link>
            <Link href="/pacientes" className="p-4 bg-green-50 border border-green-100 rounded-xl hover:bg-green-100 transition text-center">
              <Calendar size={24} className="mx-auto text-green-600 mb-2" />
              <p className="text-sm font-medium text-green-700">Ver Agenda</p>
            </Link>
            <Link href="/configuracoes" className="p-4 bg-amber-50 border border-amber-100 rounded-xl hover:bg-amber-100 transition text-center">
              <FileText size={24} className="mx-auto text-amber-600 mb-2" />
              <p className="text-sm font-medium text-amber-700">Configurar</p>
            </Link>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center opacity-60">
              <Clock size={24} className="mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-500">Relatórios</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

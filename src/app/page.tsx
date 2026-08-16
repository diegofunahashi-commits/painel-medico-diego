"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { buscarTodosPacientes } from "@/lib/pacientes";
import { buscarAgendamentosDoDia } from "@/lib/agendamentos";
import { buscarReceitasPorPeriodo } from "@/lib/receitas";
import { buscarLaudosPorPeriodo } from "@/lib/laudos";
import type { Patient, Agendamento } from "@/types/firestore";
import Link from "next/link";
import {
  Users,
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  AlertCircle,
  Stethoscope,
} from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

/* ============================================================
   DASHBOARD OTIMIZADO — Busca global por período (sem N+1)
   Dr. Diego Funahashi — Neurodesenvolvimento Infantil
   ============================================================ */

interface Stats {
  pacientes: number;
  consultasHoje: number;
  receitasMes: number;
  laudosMes: number;
}

interface ConsultaHoje {
  appointmentId: string;
  pacienteNome: string;
  horario: string;
  tipo: string;
  status: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();

  const [stats, setStats] = useState<Stats>({
    pacientes: 0,
    consultasHoje: 0,
    receitasMes: 0,
    laudosMes: 0,
  });
  const [pacientesRecentes, setPacientesRecentes] = useState<Patient[]>([]);
  const [consultasHoje, setConsultasHoje] = useState<ConsultaHoje[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erros, setErros] = useState<string[]>([]);

  /* ── Redireciona se não estiver logado ── */
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  /* ── Busca todos os dados em paralelo ── */
  useEffect(() => {
    if (!user || authLoading) return;

    let cancelado = false;

    const carregarDados = async () => {
      setCarregando(true);
      setErros([]);
      const novosErros: string[] = [];

      try {
        const hoje = new Date();
        const inicioMes = startOfMonth(hoje);
        const fimMes = endOfMonth(hoje);

        /* 1. Pacientes recentes + Agendamentos de hoje (paralelo) */
        const [pacientesResult, agendamentos] = await Promise.allSettled([
          buscarTodosPacientes(5),
          buscarAgendamentosDoDia(user.uid, hoje),
        ]);

        let pacientes: Patient[] = [];
        if (pacientesResult.status === "fulfilled") {
          pacientes = pacientesResult.value.pacientes;
          if (!cancelado) setPacientesRecentes(pacientes);
        } else {
          console.error("[Dashboard] Erro pacientes:", pacientesResult.reason);
          novosErros.push("Erro ao carregar pacientes.");
        }

        /* 2. Monta lista de consultas de hoje */
        if (agendamentos.status === "fulfilled") {
          const pacientesMap = new Map<string, Patient>();
          pacientes.forEach((p) => {
            if (p.patientID) pacientesMap.set(p.patientID, p);
          });

          const consultasFormatadas: ConsultaHoje[] = agendamentos.value.map((a) => {
            const paciente = pacientesMap.get(a.patientId);
            const nome = paciente?.["nome completo"] || paciente?.nome || "Paciente";

            let horario = "--:--";
            try {
              const dh = a.dataHora;
              if (dh && typeof dh === "object" && "toDate" in dh) {
                horario = format(dh.toDate(), "HH:mm");
              } else if (dh) {
                horario = format(new Date(dh as any), "HH:mm");
              }
            } catch {
              horario = "--:--";
            }

            return {
              appointmentId: a.appointmentId || String(Math.random()),
              pacienteNome: nome,
              horario,
              tipo: a.tipo || a.tipoConsulta || "Consulta",
              status: a.status || "agendada",
            };
          });

          consultasFormatadas.sort((a, b) => a.horario.localeCompare(b.horario));
          if (!cancelado) setConsultasHoje(consultasFormatadas);
        } else {
          console.error("[Dashboard] Erro agendamentos:", agendamentos.reason);
          novosErros.push("Erro ao carregar agendamentos de hoje.");
        }

        /* 3. Receitas e Laudos do mês (paralelo, busca global) */
        const [receitasResult, laudosResult] = await Promise.allSettled([
          buscarReceitasPorPeriodo(inicioMes, fimMes),
          buscarLaudosPorPeriodo(inicioMes, fimMes),
        ]);

        let totalReceitasMes = 0;
        if (receitasResult.status === "fulfilled") {
          totalReceitasMes = receitasResult.value.length;
        } else {
          console.error("[Dashboard] Erro receitas:", receitasResult.reason);
          novosErros.push("Erro ao contar receitas do mês.");
        }

        let totalLaudosMes = 0;
        if (laudosResult.status === "fulfilled") {
          totalLaudosMes = laudosResult.value.length;
        } else {
          console.error("[Dashboard] Erro laudos:", laudosResult.reason);
          novosErros.push("Erro ao contar laudos do mês.");
        }

        if (!cancelado) {
          setStats({
            pacientes: pacientes.length,
            consultasHoje: agendamentos.status === "fulfilled" ? agendamentos.value.length : 0,
            receitasMes: totalReceitasMes,
            laudosMes: totalLaudosMes,
          });
          if (novosErros.length > 0) setErros(novosErros);
        }
      } catch (e) {
        console.error("[Dashboard] Erro geral:", e);
        if (!cancelado) {
          setErros(["Erro ao carregar dados do dashboard. Tente recarregar a página."]);
        }
      } finally {
        if (!cancelado) setCarregando(false);
      }
    };

    carregarDados();

    return () => {
      cancelado = true;
    };
  }, [user, authLoading]);

  /* ── Loading ── */
  if (authLoading || carregando) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600" />
          <p className="text-sm text-slate-500">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const hoje = new Date();

  const statusConfig: Record<string, { label: string; className: string }> = {
    agendada: { label: "Agendada", className: "bg-blue-50 text-blue-700 border-blue-200" },
    confirmada: { label: "Confirmada", className: "bg-green-50 text-green-700 border-green-200" },
    em_andamento: { label: "Em andamento", className: "bg-amber-50 text-amber-700 border-amber-200" },
    concluida: { label: "Concluída", className: "bg-green-50 text-green-700 border-green-200" },
    cancelada: { label: "Cancelada", className: "bg-red-50 text-red-700 border-red-200" },
    default: { label: "Agendada", className: "bg-slate-50 text-slate-600 border-slate-200" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">
            {format(hoje, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <Link
          href="/pacientes/novo"
          className="flex items-center gap-2 px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition text-sm font-medium"
        >
          <Plus size={16} />
          Novo Paciente
        </Link>
      </div>

      {/* Alertas de erro */}
      {erros.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Alguns dados não puderam ser carregados:
              </p>
              <ul className="mt-1 space-y-1">
                {erros.map((err, i) => (
                  <li key={i} className="text-xs text-amber-700">
                    • {err}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Cards de stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pacientes"
          value={stats.pacientes}
          icon={<Users size={20} />}
          color="medical"
        />
        <StatCard
          label="Consultas Hoje"
          value={stats.consultasHoje}
          icon={<Calendar size={20} />}
          color="green"
        />
        <StatCard
          label="Receitas (mês)"
          value={stats.receitasMes}
          icon={<FileText size={20} />}
          color="amber"
        />
        <StatCard
          label="Laudos (mês)"
          value={stats.laudosMes}
          icon={<TrendingUp size={20} />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pacientes recentes */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Pacientes Recentes</h2>
            <Link
              href="/pacientes"
              className="text-sm text-medical-600 hover:text-medical-700 font-medium flex items-center gap-1"
            >
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-2">
            {pacientesRecentes.map((p) => {
              const nome = p["nome completo"] || p.nome || "Sem nome";
              const idade = p.idade || "-";
              const localizacao = p.localizacao || p.cidade || "-";
              return (
                <Link
                  key={p.patientID || p.id || Math.random()}
                  href={`/pacientes/${p.patientID || p.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition"
                >
                  <div className="w-9 h-9 rounded-full bg-medical-100 flex items-center justify-center text-medical-600 text-sm font-bold shrink-0">
                    {nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{nome}</p>
                    <p className="text-xs text-slate-500">
                      {idade} {typeof idade === "number" ? "anos" : ""} • {localizacao}
                    </p>
                  </div>
                </Link>
              );
            })}
            {pacientesRecentes.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">
                Nenhum paciente cadastrado
              </p>
            )}
          </div>
        </div>

        {/* Consultas de hoje */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Consultas de Hoje</h2>
            <span className="text-xs font-medium px-2 py-1 bg-medical-50 text-medical-700 rounded-full">
              {consultasHoje.length} agendada{consultasHoje.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-2">
            {consultasHoje.length > 0 ? (
              consultasHoje.map((c) => {
                const status = statusConfig[c.status] || statusConfig.default;
                return (
                  <div
                    key={c.appointmentId}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-medical-100 flex items-center justify-center text-medical-600 text-xs font-bold shrink-0">
                      {c.horario}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {c.pacienteNome}
                      </p>
                      <p className="text-xs text-slate-500">{c.tipo}</p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Calendar size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-400">
                  Nenhuma consulta agendada para hoje
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction
            href="/pacientes/novo"
            icon={<Users size={22} />}
            label="Novo Paciente"
            color="medical"
          />
          <QuickAction
            href="/pacientes"
            icon={<Stethoscope size={22} />}
            label="Ver Pacientes"
            color="green"
          />
          <QuickAction
            href="/configuracoes"
            icon={<FileText size={22} />}
            label="Configurar"
            color="amber"
          />
          <QuickAction
            href="/configuracoes"
            icon={<Clock size={22} />}
            label="Relatórios"
            color="slate"
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SUBCOMPONENTES
   ============================================================ */

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "medical" | "green" | "amber" | "purple" | "slate";
}) {
  const colorMap = {
    medical: { bg: "bg-medical-100", text: "text-medical-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
    amber: { bg: "bg-amber-100", text: "text-amber-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
    slate: { bg: "bg-slate-100", text: "text-slate-600" },
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div
          className={`w-10 h-10 rounded-lg ${colorMap[color].bg} flex items-center justify-center ${colorMap[color].text}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  color: "medical" | "green" | "amber" | "slate";
}) {
  const colorMap = {
    medical:
      "bg-medical-50 border-medical-100 text-medical-700 hover:bg-medical-100",
    green:
      "bg-green-50 border-green-100 text-green-700 hover:bg-green-100",
    amber:
      "bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100",
    slate:
      "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100",
  };

  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition ${colorMap[color]}`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import { buscarTodosPacientes } from "@/lib/pacientes";
import type { Patient } from "@/types/firestore";
import Link from "next/link";
import { Search, Plus, User, Phone, MapPin, ArrowRight } from "lucide-react";

export default function PacientesPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Patient[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const { pacientes: lista } = await buscarTodosPacientes(100);
        setPacientes(lista);
      } catch (e) {
        console.error(e);
      } finally {
        setCarregando(false);
      }
    };
    load();
  }, [user]);

  const filtrados = pacientes.filter((p) => {
    const nome = p['nome completo'] || "";
    const cpf = p.cpf || "";
    return nome.toLowerCase().includes(busca.toLowerCase()) || cpf.includes(busca);
  });

  if (loading || carregando) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pacientes</h1>
          <p className="text-slate-500 text-sm">{pacientes.length} paciente(s) cadastrado(s)</p>
        </div>
        <Link
          href="/pacientes/novo"
          className="flex items-center gap-2 px-4 py-2.5 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition font-medium text-sm"
        >
          <Plus size={16} />
          Novo Paciente
        </Link>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nome ou CPF..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {filtrados.length === 0 ? (
          <div className="text-center py-12">
            <User size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">Nenhum paciente encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtrados.map((p) => {
              const nome = p['nome completo'] || "Sem nome";
              const telefone = p.telefone || "-";
              const localizacao = p.localizacao || "-";
              return (
                <Link
                  key={p.patientID || Math.random()}
                  href={`/pacientes/${p.patientID}`}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-medical-100 flex items-center justify-center text-medical-600 font-bold text-sm">
                    {nome.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{nome}</p>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1"><Phone size={12} /> {telefone}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} /> {localizacao}</span>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-300" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
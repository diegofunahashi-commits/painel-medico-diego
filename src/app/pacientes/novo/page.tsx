"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { criarPaciente } from "@/lib/pacientes";
import { Timestamp } from "firebase/firestore";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function NovoPacientePage() {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    nomeCompleto: "",
    nomeResponsavel: "",
    sexo: "menino" as "menino" | "menina",
    dataNascimento: "",
    cpf: "",
    telefone: "",
    email: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    localizacao: "São Paulo - Capital",
    peso: "",
  });

  const handleChange = (campo: string, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await criarPaciente({
        "nome completo": form.nomeCompleto,
        "nome do responsável": form.nomeResponsavel,
        sexo: form.sexo,
        "data de nascimento": Timestamp.fromDate(new Date(form.dataNascimento)),
        idade: String(new Date().getFullYear() - new Date(form.dataNascimento).getFullYear()),
        peso: form.peso || "0",
        cpf: form.cpf,
        telefone: Number(form.telefone.replace(/\D/g, "")) || 0,
        email: form.email,
        endereco: {
          rua: form.rua,
          numero: form.numero,
          bairro: form.bairro,
          cidade: form.cidade,
        },
        localizacao: form.localizacao,
        source: "agenda",
        status: "active",
      });
      toast.success("Paciente cadastrado com sucesso!");
      router.push("/pacientes");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao cadastrar paciente");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/pacientes" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Novo Paciente</h1>
          <p className="text-slate-500 text-sm">Cadastro de nova criança no sistema</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome completo da criança *</label>
            <input required value={form.nomeCompleto} onChange={(e) => handleChange("nomeCompleto", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome do responsável *</label>
            <input required value={form.nomeResponsavel} onChange={(e) => handleChange("nomeResponsavel", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sexo *</label>
            <select value={form.sexo} onChange={(e) => handleChange("sexo", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none">
              <option value="menino">Menino</option>
              <option value="menina">Menina</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data de nascimento *</label>
            <input type="date" required value={form.dataNascimento} onChange={(e) => handleChange("dataNascimento", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
            <input value={form.cpf} onChange={(e) => handleChange("cpf", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none" placeholder="000.000.000-00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Telefone *</label>
            <input required value={form.telefone} onChange={(e) => handleChange("telefone", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none" placeholder="(11) 99999-9999" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Peso (kg)</label>
            <input type="number" step="0.1" value={form.peso} onChange={(e) => handleChange("peso", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Localização</label>
            <select value={form.localizacao} onChange={(e) => handleChange("localizacao", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none">
              <option>São Paulo - Capital</option>
              <option>ABC</option>
              <option>Araxá</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Rua" value={form.rua} onChange={(e) => handleChange("rua", e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none" />
              <input placeholder="Número" value={form.numero} onChange={(e) => handleChange("numero", e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none" />
              <input placeholder="Bairro" value={form.bairro} onChange={(e) => handleChange("bairro", e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none" />
              <input placeholder="Cidade" value={form.cidade} onChange={(e) => handleChange("cidade", e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={salvando}
            className="flex items-center gap-2 px-6 py-2.5 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition font-medium disabled:opacity-50">
            <Save size={18} />
            {salvando ? "Salvando..." : "Cadastrar Paciente"}
          </button>
          <Link href="/pacientes"
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

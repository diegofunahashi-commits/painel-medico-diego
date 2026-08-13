"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthContext } from '@/components/AuthProvider';
import { buscarPacientePorId } from '@/lib/pacientes';
import type { Patient } from '@/types/firestore';
import PacienteTabs from '@/components/paciente/PacienteTabs';
import Link from 'next/link';
import { ArrowLeft, User, Phone, Calendar, MapPin, Weight, Ruler } from 'lucide-react';

export default function PacienteDetailPage() {
  const { id } = useParams();
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [paciente, setPaciente] = useState<Patient | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !id) return;

    const fetchPaciente = async () => {
      try {
        const p = await buscarPacientePorId(id as string);
        if (p) {
          setPaciente(p);
        } else {
          router.push('/pacientes');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setCarregando(false);
      }
    };

    fetchPaciente();
  }, [user, id, router]);

  if (loading || carregando) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600" />
      </div>
    );
  }

  if (!user || !paciente) return null;

  const calcularIdade = (dataNasc: any) => {
    if (!dataNasc) return 0;
    const hoje = new Date();
    const nasc = dataNasc.toDate ? dataNasc.toDate() : new Date(dataNasc);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
  };

  const formatarData = (data: any) => {
    if (!data) return '—';
    const d = data.toDate ? data.toDate() : new Date(data);
    return d.toLocaleDateString('pt-BR');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/pacientes"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{paciente['nome completo']}</h1>
          <p className="text-slate-500 text-sm">Ficha completa — ID: {paciente.patientID}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {paciente['data de nascimento'] && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-medical-100 flex items-center justify-center text-medical-600">
                <Calendar size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Idade</p>
                <p className="text-sm font-medium text-slate-800">
                  {calcularIdade(paciente['data de nascimento'])} anos
                  <span className="text-slate-400 ml-1">
                    ({formatarData(paciente['data de nascimento'])})
                  </span>
                </p>
              </div>
            </div>
          )}

          {paciente.telefone && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                <Phone size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Telefone</p>
                <p className="text-sm font-medium text-slate-800">{paciente.telefone}</p>
              </div>
            </div>
          )}

          {paciente.cpf && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                <User size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-500">CPF</p>
                <p className="text-sm font-medium text-slate-800">{paciente.cpf}</p>
              </div>
            </div>
          )}

          {paciente.localizacao && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Localização</p>
                <p className="text-sm font-medium text-slate-800">{paciente.localizacao}</p>
              </div>
            </div>
          )}

          {paciente.peso && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <Weight size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Peso</p>
                <p className="text-sm font-medium text-slate-800">{paciente.peso} kg</p>
              </div>
            </div>
          )}

          {paciente.sexo && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600">
                <Ruler size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Sexo</p>
                <p className="text-sm font-medium text-slate-800 capitalize">{paciente.sexo}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <PacienteTabs paciente={paciente} />
    </div>
  );
}

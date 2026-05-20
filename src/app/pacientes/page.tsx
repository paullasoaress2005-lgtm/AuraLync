import Image from "next/image";
import Link from "next/link";
import {
  Bot,
  CalendarCheck,
  FileText,
  Inbox,
  LineChart,
  Link2,
  LockKeyhole,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { getCalendarAppointments, type CalendarAppointment } from "@/lib/appointments";
import { getCurrentClient } from "@/lib/current-client";

const navigation = [
  { label: "Dashboard", icon: LineChart, href: "/dashboard" },
  { label: "Conversas", icon: Inbox, href: "/conversas" },
  { label: "Agendamentos", icon: CalendarCheck, href: "/agenda" },
  { label: "Pacientes", icon: UsersRound, active: true, href: "/pacientes" },
  { label: "IA", icon: Bot, href: "/ia" },
  { label: "Segurança", icon: ShieldCheck, href: "/seguranca" },
  { label: "Ajustes", icon: Settings, href: "/ajustes" },
];

const quickNav = [
  ["Dashboard", "/dashboard"],
  ["Conversas", "/conversas"],
  ["Agendamentos", "/agenda"],
  ["Pacientes", "/pacientes"],
  ["IA", "/ia"],
  ["Segurança", "/seguranca"],
  ["Ajustes", "/ajustes"],
];

type PatientSummary = {
  key: string;
  name: string;
  phone: string;
  total: number;
  nextAppointment: CalendarAppointment | null;
  lastAppointment: CalendarAppointment | null;
  status: string;
  notes: string;
  requestedExam: string;
  prescribedMedication: string;
  returnPlan: string;
};

function patientSummaries(appointments: CalendarAppointment[]): PatientSummary[] {
  const map = new Map<string, CalendarAppointment[]>();

  for (const appointment of appointments) {
    if (appointment.statusKey === "blocked") continue;
    const key = appointment.phoneRaw || appointment.patient;
    map.set(key, [...(map.get(key) ?? []), appointment]);
  }

  return Array.from(map.entries())
    .map(([key, rows]) => {
      const sorted = rows.sort(
        (a, b) =>
          new Date(a.appointmentAtIso).getTime() -
          new Date(b.appointmentAtIso).getTime(),
      );
      const now = Date.now();
      const nextAppointment =
        sorted.find((item) => new Date(item.appointmentAtIso).getTime() >= now) ??
        sorted[sorted.length - 1] ??
        null;
      const lastAppointment =
        [...sorted]
          .reverse()
          .find((item) => new Date(item.appointmentAtIso).getTime() < now) ??
        sorted[0] ??
        null;
      const first = sorted[0];
      const status = sorted.length <= 1 ? "Primeira consulta" : "Paciente recorrente";

      return {
        key,
        name: first.patient,
        phone: first.phone,
        total: sorted.length,
        nextAppointment,
        lastAppointment,
        status,
        notes: first.notes || "Sem observacoes registradas.",
        requestedExam:
          first.patient === "Pamela dos Santos"
            ? "Ultrassonografia transvaginal e exames hormonais de rotina."
            : first.patient === "Beatriz Saraiva"
              ? "Preventivo e exames laboratoriais de acompanhamento."
              : "Aguardando registro da última consulta.",
        prescribedMedication:
          first.patient === "Pamela dos Santos"
            ? "Orientação registrada pelo médico após avaliação presencial."
            : first.patient === "Beatriz Saraiva"
              ? "Sem medicação registrada nesta consulta."
              : "Sem registro de prescricao.",
        returnPlan:
          first.patient === "Pamela dos Santos"
            ? "Sugerir retorno em 30 dias com resultados dos exames."
            : first.patient === "Beatriz Saraiva"
              ? "Lembrar retorno preventivo conforme orientação médica."
              : "Retorno ainda não definido.",
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const dynamic = "force-dynamic";

export default async function PacientesPage() {
  const [{ appointments, client }, currentClient] = await Promise.all([
    getCalendarAppointments(),
    getCurrentClient(),
  ]);
  const patients = patientSummaries(appointments);
  const recurring = patients.filter((patient) => patient.total > 1).length;
  const firstConsultations = patients.filter((patient) => patient.total <= 1).length;
  const canSeeClinicalData = ["admin", "medico"].includes(
    currentClient?.role ?? "admin",
  );

  return (
    <main className="min-h-screen bg-[#f8fbfb] text-[#102f36]">
      <div className="page-enter flex min-h-screen">
        <aside className="hidden w-[276px] shrink-0 border-r border-[#dfe8e7] bg-white/88 px-5 py-6 lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#dce8e7] bg-[#f8fbfb]">
              <Image
                src="/auralync-logo.jpeg"
                alt="AuraLync"
                width={34}
                height={34}
                className="h-8 w-8 rounded-lg object-cover"
                priority
              />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-[#0a5e6e]">
                AURALYNC
              </p>
              <p className="text-xs text-[#6f8588]">CRM Intelligence</p>
            </div>
          </div>

          <nav className="mt-10 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`group flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm transition ${
                  item.active
                    ? "bg-[#0b5d6b] text-white shadow-[0_14px_34px_rgba(11,93,107,0.14)]"
                    : "text-[#60777a] hover:bg-[#eef5f4] hover:text-[#123940]"
                }`}
                title={item.label}
              >
                <item.icon className="h-4 w-4" strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-10 rounded-xl border border-[#dfe8e7] bg-[#fbfdfd] p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-[#143d44]">
              <Link2 className="h-4 w-4 text-[#0a5e6e]" />
              Mapeamento clinico
            </div>
            <p className="mt-2 text-xs leading-5 text-[#6f8588]">
              Relacao entre paciente, historico de consultas e origem do atendimento.
            </p>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-20 items-center justify-between border-b border-[#dfe8e7] bg-white/78 px-5 backdrop-blur md:px-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#6f8588]">
                Mapeamento de pacientes
              </p>
              <h1 className="mt-1 text-xl font-semibold text-[#102f36] md:text-2xl">
                {client.name}
              </h1>
            </div>
            <Link
              href="/agenda"
              className="premium-action flex h-10 items-center gap-2 rounded-lg bg-[#0b5d6b] px-4 text-sm font-medium text-white transition hover:bg-[#084d59]"
            >
              <CalendarCheck className="h-4 w-4" />
              Ver agenda
            </Link>
          </header>

          <nav className="flex gap-2 overflow-x-auto border-b border-[#dfe8e7] bg-white/82 px-5 py-3 backdrop-blur lg:hidden">
            {quickNav.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  href === "/pacientes"
                    ? "bg-[#0b5d6b] text-white"
                    : "border border-[#dfe8e7] bg-white text-[#60777a] hover:bg-[#edf6f5]"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="mx-auto w-full max-w-[1280px] flex-1 px-5 py-6 md:px-8">
            <section className="grid gap-4 md:grid-cols-3">
              {[
                [String(patients.length), "Pacientes mapeados"],
                [String(firstConsultations), "Primeiras consultas"],
                [String(recurring), "Pacientes recorrentes"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-5 shadow-[0_18px_45px_rgba(15,60,67,0.05)]"
                >
                  <p className="text-2xl font-semibold text-[#102f36]">{value}</p>
                  <p className="mt-2 text-sm text-[#6f8588]">{label}</p>
                </div>
              ))}
            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-2">
              {patients.map((patient) => (
                <article
                  key={patient.key}
                  className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-5 shadow-[0_18px_45px_rgba(15,60,67,0.05)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf6f5] text-[#0b5d6b]">
                        <UserRound className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-[#102f36]">
                          {patient.name}
                        </h2>
                        <p className="mt-1 text-sm text-[#789093]">{patient.phone}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#edf6f5] px-3 py-1 text-xs font-medium text-[#0b5d6b]">
                      {patient.status}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg bg-[#f5f8f7] p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#789093]">
                        Total
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#102f36]">
                        {patient.total} consulta{patient.total === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#f5f8f7] p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#789093]">
                        Proximo registro
                      </p>
                      <p className="mt-1 truncate text-sm font-semibold text-[#102f36]">
                        {patient.nextAppointment?.title ?? "Sem agenda"}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-[#60777a]">
                    {patient.notes}
                  </p>
                  <div className="mt-4 rounded-xl border border-[#dfe8e7] bg-[#fbfdfd] p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#0b5d6b]">
                      {canSeeClinicalData ? (
                        <FileText className="h-4 w-4" />
                      ) : (
                        <LockKeyhole className="h-4 w-4" />
                      )}
                      Informações da última consulta
                    </div>
                    {canSeeClinicalData ? (
                      <div className="mt-3 grid gap-3">
                        <div className="rounded-lg bg-white p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#789093]">
                            Exame solicitado
                          </p>
                          <p className="mt-1 text-sm leading-6 text-[#31575d]">
                            {patient.requestedExam}
                          </p>
                        </div>
                        <div className="rounded-lg bg-white p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#789093]">
                            Medicação / orientação
                          </p>
                          <p className="mt-1 text-sm leading-6 text-[#31575d]">
                            {patient.prescribedMedication}
                          </p>
                        </div>
                        <div className="rounded-lg bg-white p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#789093]">
                            Retorno
                          </p>
                          <p className="mt-1 text-sm leading-6 text-[#31575d]">
                            {patient.returnPlan}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-[#60777a]">
                        Acesso clínico restrito ao médico ou administrador da
                        clínica. Perfil operacional visualiza agenda, conversa
                        e follow-up sem prontuario.
                      </p>
                    )}
                  </div>
                  <Link
                    href="/agenda"
                    className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-[#dfe8e7] bg-white px-3 text-sm font-medium text-[#0b5d6b] transition hover:bg-[#edf6f5]"
                  >
                    <CalendarCheck className="h-4 w-4" />
                    Abrir agenda
                  </Link>
                </article>
              ))}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CalendarCheck,
  Clock3,
  Columns3,
  Eye,
  EyeOff,
  HeartPulse,
  LockKeyhole,
  Maximize2,
  Minimize2,
  Plus,
  UserRound,
  UsersRound,
} from "lucide-react";
import { AppointmentForm } from "@/components/appointment-form";
import { AppointmentOperations } from "@/components/appointment-operations";
import type { CalendarAppointment } from "@/lib/appointments";

type Props = {
  appointments: CalendarAppointment[];
  source: "supabase" | "demo";
  client: {
    name: string;
    specialty: string;
  };
  googleSyncLabel: string;
};

type CalendarView = "week" | "day";

const weekDays = [
  { label: "Seg", day: "18", dateValue: "2026-05-18" },
  { label: "Ter", day: "19", dateValue: "2026-05-19" },
  { label: "Qua", day: "20", dateValue: "2026-05-20" },
  { label: "Qui", day: "21", dateValue: "2026-05-21" },
  { label: "Sex", day: "22", dateValue: "2026-05-22" },
  { label: "Sab", day: "23", dateValue: "2026-05-23" },
];

const hours = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

const monthDays = Array.from({ length: 31 }, (_, index) => index + 1);

function dayValue(day: number) {
  return `2026-05-${String(day).padStart(2, "0")}`;
}

function patientStatus(
  appointment: CalendarAppointment | null,
  appointments: CalendarAppointment[],
) {
  if (!appointment) {
    return {
      label: "Sem evento selecionado",
      description: "Clique em um horario da agenda para abrir os detalhes.",
      historyCount: 0,
    };
  }

  if (appointment.statusKey === "blocked") {
    return {
      label: "Bloqueio interno",
      description: "Horario reservado pela equipe, sem paciente vinculado.",
      historyCount: 0,
    };
  }

  const samePatient = appointments
    .filter(
      (item) =>
        item.statusKey !== "blocked" &&
        item.phoneRaw &&
        item.phoneRaw === appointment.phoneRaw,
    )
    .sort(
      (a, b) =>
        new Date(a.appointmentAtIso).getTime() -
        new Date(b.appointmentAtIso).getTime(),
    );
  const previous = samePatient.filter(
    (item) =>
      new Date(item.appointmentAtIso).getTime() <
      new Date(appointment.appointmentAtIso).getTime(),
  );

  if (previous.length === 0) {
    return {
      label: "Primeira consulta",
      description: "Ainda nao ha consulta anterior registrada para este telefone.",
      historyCount: samePatient.length,
    };
  }

  return {
    label: "Paciente recorrente",
    description: `${previous.length} consulta${previous.length > 1 ? "s" : ""} anterior${previous.length > 1 ? "es" : ""} registrada${previous.length > 1 ? "s" : ""}.`,
    historyCount: samePatient.length,
  };
}

function dayAppointments(
  appointments: CalendarAppointment[],
  selectedDate: string,
  view: CalendarView,
) {
  if (view === "day") {
    return appointments.filter((appointment) => appointment.dateValue === selectedDate);
  }

  return appointments;
}

export function AgendaWorkspace({
  appointments,
  source,
  client,
  googleSyncLabel,
}: Props) {
  const visibleAppointments = appointments.filter(
    (appointment) => appointment.statusKey !== "cancelled",
  );
  const [selectedDate, setSelectedDate] = useState("2026-05-19");
  const [view, setView] = useState<CalendarView>("week");
  const [focusMode, setFocusMode] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(
    visibleAppointments.find((appointment) => appointment.statusKey !== "blocked")?.id ??
      visibleAppointments[0]?.id ??
      "",
  );

  const selectedAppointment =
    visibleAppointments.find((appointment) => appointment.id === selectedAppointmentId) ??
    visibleAppointments.find((appointment) => appointment.statusKey !== "blocked") ??
    visibleAppointments[0] ??
    null;

  const visibleDays = view === "day"
    ? weekDays.filter((day) => day.dateValue === selectedDate)
    : weekDays;
  const gridAppointments = dayAppointments(visibleAppointments, selectedDate, view);
  const patientMap = patientStatus(selectedAppointment, appointments);

  const appointmentsByDate = (() => {
    const map = new Map<string, number>();
    for (const appointment of visibleAppointments) {
      map.set(appointment.dateValue, (map.get(appointment.dateValue) ?? 0) + 1);
    }
    return map;
  })();

  const consultationCount = visibleAppointments.filter(
    (appointment) => appointment.statusKey !== "blocked",
  ).length;
  const confirmedCount = visibleAppointments.filter(
    (appointment) => appointment.statusKey === "confirmed",
  ).length;
  const blockedCount = visibleAppointments.filter(
    (appointment) => appointment.statusKey === "blocked",
  ).length;
  const pendingCount = visibleAppointments.filter(
    (appointment) => appointment.statusKey === "scheduled",
  ).length;

  const showLeft = leftOpen && !focusMode;
  const showRight = rightOpen && !focusMode;
  const calendarColumns = view === "day"
    ? "grid-cols-[72px_minmax(360px,1fr)]"
    : "grid-cols-[72px_repeat(6,1fr)]";

  return (
    <div
      className={`mx-auto grid w-full max-w-[1480px] flex-1 gap-6 px-5 py-6 md:px-8 ${
        showLeft && showRight
          ? "xl:grid-cols-[292px_1fr_340px]"
          : showLeft
            ? "xl:grid-cols-[292px_1fr]"
            : showRight
              ? "xl:grid-cols-[1fr_340px]"
              : "xl:grid-cols-1"
      }`}
    >
      {showLeft ? (
        <aside className="space-y-6">
          <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-5 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#102f36]">Maio 2026</h2>
              <button
                type="button"
                onClick={() => setLeftOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#789093] transition hover:bg-[#edf6f5] hover:text-[#0b5d6b]"
                title="Minimizar calendario"
              >
                <EyeOff className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[11px] text-[#789093]">
              {["D", "S", "T", "Q", "Q", "S", "S"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs">
              {monthDays.map((day) => {
                const value = dayValue(day);
                const hasItems = appointmentsByDate.has(value);
                const selected = selectedDate === value;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setSelectedDate(value);
                      setView("day");
                    }}
                    className={`relative flex h-8 items-center justify-center rounded-lg transition ${
                      selected
                        ? "bg-[#0b5d6b] font-medium text-white"
                        : hasItems
                          ? "bg-[#edf6f5] text-[#0b5d6b] hover:bg-[#dcefed]"
                          : "text-[#60777a] hover:bg-[#f5f8f7]"
                    }`}
                    title={`Abrir dia ${day}`}
                  >
                    {day}
                    {hasItems ? (
                      <span
                        className={`absolute bottom-1 h-1 w-1 rounded-full ${
                          selected ? "bg-white" : "bg-[#0b5d6b]"
                        }`}
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-5 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
                <HeartPulse className="h-4 w-4" />
                Resumo da semana
              </div>
              <button
                type="button"
                onClick={() => setLeftOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#789093] transition hover:bg-[#edf6f5] hover:text-[#0b5d6b]"
                title="Minimizar resumo"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                [String(consultationCount), "Consultas"],
                [String(blockedCount), "Bloqueio"],
                [String(confirmedCount), "Confirmadas"],
                [String(pendingCount), "Pendente"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg bg-[#f5f8f7] p-3">
                  <p className="text-xl font-semibold text-[#102f36]">{value}</p>
                  <p className="mt-1 text-xs text-[#789093]">{label}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      ) : null}

      <section className="interactive-card min-w-0 rounded-xl border border-[#dfe8e7] bg-white shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
        <div className="flex flex-col gap-4 border-b border-[#e8f0ef] px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#0b5d6b]">
              {view === "day" ? "Dia selecionado" : "Semana de atendimento"}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#102f36]">
              {view === "day"
                ? `${visibleDays[0]?.day ?? "19"} de maio`
                : "18 a 23 de maio"}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!leftOpen || focusMode ? (
              <button
                type="button"
                onClick={() => {
                  setLeftOpen(true);
                  setFocusMode(false);
                }}
                className="flex h-9 items-center gap-2 rounded-lg border border-[#dfe8e7] bg-white px-3 text-xs font-medium text-[#4d676b] transition hover:bg-[#edf6f5] hover:text-[#0b5d6b]"
              >
                <Eye className="h-3.5 w-3.5" />
                Painel esquerdo
              </button>
            ) : null}
            {!rightOpen || focusMode ? (
              <button
                type="button"
                onClick={() => {
                  setRightOpen(true);
                  setFocusMode(false);
                }}
                className="flex h-9 items-center gap-2 rounded-lg border border-[#dfe8e7] bg-white px-3 text-xs font-medium text-[#4d676b] transition hover:bg-[#edf6f5] hover:text-[#0b5d6b]"
              >
                <Columns3 className="h-3.5 w-3.5" />
                Detalhes
              </button>
            ) : null}
            <span className="rounded-full bg-[#edf6f5] px-3 py-1 text-xs font-medium text-[#0b5d6b]">
              {source === "supabase" ? "Sincronizado" : "Ambiente vitrine"}
            </span>
            <span className="rounded-full border border-[#dfe8e7] bg-white px-3 py-1 text-xs font-medium text-[#4d676b]">
              {googleSyncLabel}
            </span>
            <div className="flex w-fit rounded-lg border border-[#dfe8e7] bg-[#f8fbfb] p-1 text-sm">
              {(["week", "day"] as CalendarView[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setView(item)}
                  className={`rounded-md px-3 py-1.5 font-medium transition ${
                    view === item
                      ? "bg-white text-[#0b5d6b] shadow-[0_8px_20px_rgba(15,60,67,0.06)]"
                      : "text-[#60777a] hover:text-[#0b5d6b]"
                  }`}
                >
                  {item === "week" ? "Semana" : "Dia"}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setFocusMode((current) => !current)}
              className="flex h-9 items-center gap-2 rounded-lg bg-[#0d3640] px-3 text-xs font-medium text-white transition hover:bg-[#082b33]"
              title="Focar agenda"
            >
              {focusMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              {focusMode ? "Sair do foco" : "Focar agenda"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className={view === "day" ? "min-w-[560px]" : "min-w-[760px]"}>
            <div className={`grid ${calendarColumns} border-b border-[#e8f0ef]`}>
              <div className="px-4 py-4 text-xs text-[#789093]">GMT-3</div>
              {visibleDays.map((day) => (
                <button
                  type="button"
                  key={day.day}
                  onClick={() => {
                    setSelectedDate(day.dateValue);
                    setView("day");
                  }}
                  className="px-3 py-4 text-center transition hover:bg-[#f5f8f7]"
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-[#789093]">
                    {day.label}
                  </p>
                  <p
                    className={`mx-auto mt-1 flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                      selectedDate === day.dateValue
                        ? "bg-[#0b5d6b] text-white"
                        : "text-[#102f36]"
                    }`}
                  >
                    {day.day}
                  </p>
                </button>
              ))}
            </div>

            <div className={`relative grid ${calendarColumns}`}>
              <div className="border-r border-[#e8f0ef]">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-20 border-b border-[#edf2f1] px-3 pt-2 text-xs text-[#789093]"
                  >
                    {hour}
                  </div>
                ))}
              </div>
              {visibleDays.map((day) => (
                <button
                  type="button"
                  key={day.day}
                  onClick={() => {
                    setSelectedDate(day.dateValue);
                    setView("day");
                  }}
                  className="relative border-r border-[#edf2f1] text-left"
                  title={`Abrir ${day.day} de maio`}
                >
                  {hours.map((hour) => (
                    <span
                      key={hour}
                      className="block h-20 border-b border-[#edf2f1] transition hover:bg-[#f9fcfc]"
                    />
                  ))}
                </button>
              ))}

              {gridAppointments.map((appointment) => {
                const dayPosition =
                  view === "day"
                    ? 0
                    : visibleDays.findIndex((day) => day.dateValue === appointment.dateValue);
                if (dayPosition < 0) return null;

                return (
                  <button
                    type="button"
                    key={appointment.id}
                    onClick={() => {
                      setSelectedAppointmentId(appointment.id);
                      setRightOpen(true);
                    }}
                    className={`absolute rounded-lg px-3 py-2 text-left text-white shadow-[0_16px_32px_rgba(13,54,64,0.18)] ring-offset-2 transition hover:-translate-y-0.5 hover:shadow-[0_20px_38px_rgba(13,54,64,0.24)] focus:outline-none focus:ring-2 focus:ring-[#0b5d6b] ${appointment.color} ${
                      selectedAppointment?.id === appointment.id ? "ring-2 ring-[#0b5d6b]" : ""
                    }`}
                    style={{
                      left:
                        view === "day"
                          ? "calc(72px + 8px)"
                          : `calc(72px + ((100% - 72px) / 6) * ${appointment.dayIndex} + 8px)`,
                      top: appointment.top,
                      width:
                        view === "day"
                          ? "calc(100% - 88px)"
                          : "calc((100% - 72px) / 6 - 16px)",
                      height: appointment.height,
                    }}
                    title={`Abrir ${appointment.title}`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] opacity-90">
                      <Clock3 className="h-3 w-3" />
                      {appointment.time}
                    </div>
                    <p className="mt-1 truncate text-sm font-semibold">
                      {appointment.title}
                    </p>
                    <p className="mt-1 truncate text-xs opacity-90">
                      {appointment.patient}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {showRight ? (
        <aside className="space-y-6">
          <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-5 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
                <UserRound className="h-4 w-4" />
                Evento aberto
              </div>
              <button
                type="button"
                onClick={() => setRightOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#789093] transition hover:bg-[#edf6f5] hover:text-[#0b5d6b]"
                title="Minimizar detalhes"
              >
                <EyeOff className="h-4 w-4" />
              </button>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#102f36]">
              {selectedAppointment?.patient ?? "Selecione um horario"}
            </h2>
            <p className="mt-1 text-sm text-[#789093]">
              {selectedAppointment?.phone ?? "Clique em um evento da agenda"}
            </p>
            <div className="mt-5 rounded-lg bg-[#edf6f5] p-4">
              <p className="text-sm font-medium text-[#0b5d6b]">
                {selectedAppointment?.title ?? "Nenhum evento aberto"}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#4d676b]">
                {selectedAppointment?.notes ||
                  `Atendimento vinculado a ${client.name}, ${client.specialty}.`}
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-[#f5f8f7] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#789093]">
                  Perfil
                </p>
                <p className="mt-1 text-sm font-semibold text-[#102f36]">
                  {patientMap.label}
                </p>
              </div>
              <div className="rounded-lg bg-[#f5f8f7] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#789093]">
                  Historico
                </p>
                <p className="mt-1 text-sm font-semibold text-[#102f36]">
                  {patientMap.historyCount} registro{patientMap.historyCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#60777a]">
              {patientMap.description}
            </p>
            <Link
              href="/pacientes"
              className="mt-4 flex h-10 items-center justify-center gap-2 rounded-lg border border-[#dfe8e7] bg-white text-sm font-medium text-[#0b5d6b] transition hover:bg-[#edf6f5]"
            >
              <UsersRound className="h-4 w-4" />
              Abrir mapeamento
            </Link>
          </section>

          <section
            id="novo-horario"
            className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-5 shadow-[0_18px_45px_rgba(15,60,67,0.05)]"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
              <Plus className="h-4 w-4" />
              Adicionar manualmente
            </div>
            <AppointmentForm />
          </section>

          <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-5 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
            <div className="flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
              <CalendarCheck className="h-4 w-4" />
              Operar agenda
            </div>
            <AppointmentOperations appointments={appointments} />
          </section>

          <section className="rounded-xl border border-[#dfe8e7] bg-[#0d3640] p-5 text-white shadow-[0_22px_55px_rgba(13,54,64,0.16)]">
            <div className="flex items-center gap-2 text-sm font-medium">
              <LockKeyhole className="h-4 w-4" />
              Segurança
            </div>
            <p className="mt-3 text-sm leading-6 text-[#c7d8d9]">
              A agenda grava dados por clínica, com origem da ação e sincronização
              controlada com Google Calendar.
            </p>
          </section>
        </aside>
      ) : null}
    </div>
  );
}

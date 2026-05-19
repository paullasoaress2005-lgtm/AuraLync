"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  CalendarClock,
  Check,
  CheckCircle2,
  ExternalLink,
  Filter,
  Pencil,
  RotateCcw,
  Save,
  X,
  XCircle,
} from "lucide-react";
import type { CalendarAppointment } from "@/lib/appointments";

type Props = {
  appointments: CalendarAppointment[];
};

type ApiPayload = {
  ok: boolean;
  error?: string;
};

type FilterKey = "active" | "google" | "blocked" | "cancelled";

const statusActions = [
  { status: "confirmed", label: "Confirmar", icon: Check, danger: false },
  { status: "completed", label: "Concluir", icon: CheckCircle2, danger: false },
  { status: "no_show", label: "Faltou", icon: Ban, danger: false },
  { status: "cancelled", label: "Cancelar", icon: XCircle, danger: true },
] as const;

const filterLabels: Record<FilterKey, string> = {
  active: "Ativos",
  google: "Google",
  blocked: "Bloqueios",
  cancelled: "Cancelados",
};

function isGoogleRelevant(appointment: CalendarAppointment) {
  return (
    appointment.syncStatus === "synced" ||
    appointment.syncStatus === "pending" ||
    appointment.syncStatus === "failed" ||
    Boolean(appointment.googleEventLink)
  );
}

function matchesFilter(appointment: CalendarAppointment, filter: FilterKey) {
  if (filter === "active") {
    return (
      appointment.statusKey !== "cancelled" &&
      appointment.statusKey !== "blocked"
    );
  }

  if (filter === "google") return isGoogleRelevant(appointment);
  if (filter === "blocked") return appointment.statusKey === "blocked";
  return appointment.statusKey === "cancelled";
}

function filteredAppointments(
  appointments: CalendarAppointment[],
  filter: FilterKey,
) {
  return appointments
    .filter((appointment) => matchesFilter(appointment, filter))
    .slice(0, 10);
}

function countByFilter(appointments: CalendarAppointment[], filter: FilterKey) {
  return appointments.filter((appointment) => matchesFilter(appointment, filter))
    .length;
}

function statusTone(status: string) {
  if (status === "confirmed") return "bg-[#edf6f5] text-[#0b5d6b]";
  if (status === "completed") return "bg-[#edf5ef] text-[#456f63]";
  if (status === "cancelled") return "bg-[#fff1f0] text-[#b42318]";
  if (status === "no_show" || status === "blocked") {
    return "bg-[#f7f1e8] text-[#8a6118]";
  }

  return "bg-[#f5f8f7] text-[#60777a]";
}

function syncTone(status: string) {
  if (status === "synced") return "border-[#d4e7e5] bg-[#edf6f5] text-[#0b5d6b]";
  if (status === "pending") return "border-[#f2dfb8] bg-[#fff8e8] text-[#8a6118]";
  if (status === "failed") return "border-[#ffd4cf] bg-[#fff1f0] text-[#b42318]";
  return "border-[#dfe8e7] bg-white text-[#60777a]";
}

function sourceLabel(source: string) {
  const labels: Record<string, string> = {
    ai: "IA",
    manual: "Manual",
    import: "Importado",
  };

  return labels[source] ?? source;
}

export function AppointmentOperations({ appointments }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("active");
  const [editingAppointment, setEditingAppointment] =
    useState<CalendarAppointment | null>(null);
  const [confirmingAppointment, setConfirmingAppointment] =
    useState<CalendarAppointment | null>(null);
  const [isPending, startTransition] = useTransition();

  const rows = useMemo(
    () => filteredAppointments(appointments, activeFilter),
    [appointments, activeFilter],
  );

  function submitForm(
    method: "POST" | "PATCH",
    formData: FormData,
    success: string,
    onSuccess?: () => void,
  ) {
    setMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/appointments", {
        method,
        body: formData,
      });
      const payload = (await response.json()) as ApiPayload;

      if (!payload.ok) {
        setMessage(payload.error ?? "Nao foi possivel atualizar a agenda.");
        return;
      }

      setMessage(success);
      onSuccess?.();
      router.refresh();
    });
  }

  function submitStatus(
    appointmentId: string,
    status: string,
    onSuccess?: () => void,
  ) {
    const formData = new FormData();
    formData.set("action", "status");
    formData.set("appointmentId", appointmentId);
    formData.set("status", status);
    submitForm("PATCH", formData, "Status atualizado. Google Calendar sera sincronizado.", onSuccess);
  }

  function requestStatusChange(
    appointment: CalendarAppointment,
    status: string,
  ) {
    if (status === "cancelled") {
      setConfirmingAppointment(appointment);
      return;
    }

    submitStatus(appointment.id, status);
  }

  function submitUpdate(formData: FormData) {
    formData.set("action", "update");
    submitForm(
      "PATCH",
      formData,
      "Horario atualizado. Google Calendar sera sincronizado.",
      () => setEditingAppointment(null),
    );
  }

  function submitBlock(formData: FormData) {
    formData.set("action", "block");
    submitForm("POST", formData, "Bloqueio salvo na agenda.");
  }

  return (
    <div className="mt-5 space-y-4">
      {message ? (
        <p className="rounded-lg bg-[#edf6f5] px-3 py-2 text-sm leading-6 text-[#0b5d6b]">
          {message}
        </p>
      ) : null}

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#dfe8e7] bg-white text-[#0b5d6b]">
          <Filter className="h-3.5 w-3.5" />
        </div>
        {(Object.keys(filterLabels) as FilterKey[]).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`flex h-8 shrink-0 items-center gap-2 rounded-lg px-3 text-xs font-medium transition ${
              activeFilter === filter
                ? "bg-[#0b5d6b] text-white shadow-[0_10px_24px_rgba(11,93,107,0.14)]"
                : "border border-[#dfe8e7] bg-white text-[#60777a] hover:bg-[#edf6f5] hover:text-[#0b5d6b]"
            }`}
          >
            {filterLabels[filter]}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                activeFilter === filter
                  ? "bg-white/18 text-white"
                  : "bg-[#f5f8f7] text-[#789093]"
              }`}
            >
              {countByFilter(appointments, filter)}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#d8e5e4] bg-[#fbfdfd] px-3 py-4 text-sm leading-6 text-[#60777a]">
            Nada nesta fila por enquanto.
          </div>
        ) : null}

        {rows.map((appointment) => (
          <article
            key={appointment.id}
            className="rounded-lg border border-[#e3eceb] bg-[#fbfdfd] p-3 transition hover:border-[#cfe0de] hover:bg-white"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-sm font-semibold text-[#102f36]">
                    {appointment.title}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusTone(
                      appointment.statusKey,
                    )}`}
                  >
                    {appointment.status}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-[#789093]">
                  {appointment.time} - {appointment.patient}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${syncTone(
                      appointment.syncStatus,
                    )}`}
                  >
                    {appointment.syncLabel}
                  </span>
                  <span className="rounded-full border border-[#dfe8e7] bg-white px-2 py-0.5 text-[10px] font-medium text-[#60777a]">
                    {sourceLabel(appointment.source)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAppointment(appointment)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#dfe8e7] bg-white text-[#0b5d6b] transition hover:bg-[#edf6f5]"
                title="Editar horario"
                aria-label="Editar horario"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {statusActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.status}
                    type="button"
                    disabled={isPending || appointment.statusKey === action.status}
                    onClick={() => requestStatusChange(appointment, action.status)}
                    className={`flex h-9 items-center justify-center gap-2 rounded-lg border px-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-45 ${
                      action.danger
                        ? "border-[#f0d7d3] bg-white text-[#a64035] hover:bg-[#fff1f0]"
                        : "border-[#dfe8e7] bg-white text-[#4d676b] hover:bg-[#edf6f5] hover:text-[#0b5d6b]"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </div>

      <form action={submitBlock} className="rounded-lg border border-[#dfe8e7] bg-white p-3">
        <div className="flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
          <CalendarClock className="h-4 w-4" />
          Bloquear horario
        </div>
        <input type="hidden" name="title" value="Bloqueio manual" />
        <input type="hidden" name="specialty" value="agenda" />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <input
            name="appointmentDate"
            type="date"
            defaultValue="2026-05-22"
            className="h-9 rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-2 text-sm outline-[#0b5d6b]"
            required
          />
          <input
            name="appointmentTime"
            type="time"
            defaultValue="12:00"
            className="h-9 rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-2 text-sm outline-[#0b5d6b]"
            required
          />
        </div>
        <div className="mt-2 grid grid-cols-[1fr_96px] gap-2">
          <input
            name="notes"
            placeholder="Motivo"
            className="h-9 rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-2 text-sm outline-[#0b5d6b]"
          />
          <input
            name="durationMinutes"
            type="number"
            min="5"
            max="480"
            defaultValue="50"
            className="h-9 rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-2 text-sm outline-[#0b5d6b]"
          />
        </div>
        <button
          disabled={isPending}
          className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#102f36] text-xs font-medium text-white transition hover:bg-[#0b5d6b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Ban className="h-3.5 w-3.5" />
          Criar bloqueio
        </button>
      </form>

      {editingAppointment ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#102f36]/20 backdrop-blur-sm">
          <button
            type="button"
            className="hidden flex-1 cursor-default md:block"
            onClick={() => setEditingAppointment(null)}
            aria-label="Fechar painel"
          />
          <aside className="h-full w-full max-w-[440px] overflow-y-auto border-l border-[#dfe8e7] bg-white shadow-[0_30px_90px_rgba(13,54,64,0.2)]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e8f0ef] bg-white/92 px-5 py-4 backdrop-blur">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#789093]">
                  Agenda
                </p>
                <h3 className="mt-1 text-lg font-semibold text-[#102f36]">
                  Editar horario
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingAppointment(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dfe8e7] bg-white text-[#60777a] transition hover:bg-[#edf6f5]"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 px-5 py-5">
              <div className="rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] p-4">
                <p className="text-sm font-semibold text-[#102f36]">
                  {editingAppointment.title}
                </p>
                <p className="mt-1 text-sm text-[#60777a]">
                  {editingAppointment.time} - {editingAppointment.patient}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone(
                      editingAppointment.statusKey,
                    )}`}
                  >
                    {editingAppointment.status}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${syncTone(
                      editingAppointment.syncStatus,
                    )}`}
                  >
                    {editingAppointment.syncLabel}
                  </span>
                </div>
                {editingAppointment.googleEventLink ? (
                  <a
                    href={editingAppointment.googleEventLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#0b5d6b] hover:text-[#084d59]"
                  >
                    Abrir evento no Google
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>

              <form
                key={editingAppointment.id}
                action={submitUpdate}
                className="space-y-4"
              >
                <input
                  type="hidden"
                  name="appointmentId"
                  value={editingAppointment.id}
                />
                <label className="block">
                  <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#789093]">
                    Paciente
                  </span>
                  <input
                    name="patientName"
                    defaultValue={editingAppointment.patient}
                    className="mt-1 h-10 w-full rounded-lg border border-[#dfe8e7] bg-white px-3 text-sm outline-[#0b5d6b]"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#789093]">
                    Titulo
                  </span>
                  <input
                    name="title"
                    defaultValue={editingAppointment.title}
                    className="mt-1 h-10 w-full rounded-lg border border-[#dfe8e7] bg-white px-3 text-sm outline-[#0b5d6b]"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#789093]">
                      Data
                    </span>
                    <input
                      name="appointmentDate"
                      type="date"
                      defaultValue={editingAppointment.dateValue}
                      className="mt-1 h-10 w-full rounded-lg border border-[#dfe8e7] bg-white px-2 text-sm outline-[#0b5d6b]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#789093]">
                      Hora
                    </span>
                    <input
                      name="appointmentTime"
                      type="time"
                      defaultValue={editingAppointment.timeValue}
                      className="mt-1 h-10 w-full rounded-lg border border-[#dfe8e7] bg-white px-2 text-sm outline-[#0b5d6b]"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#789093]">
                      Duracao
                    </span>
                    <input
                      name="durationMinutes"
                      type="number"
                      min="5"
                      max="480"
                      defaultValue={editingAppointment.durationMinutes}
                      className="mt-1 h-10 w-full rounded-lg border border-[#dfe8e7] bg-white px-2 text-sm outline-[#0b5d6b]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#789093]">
                      WhatsApp
                    </span>
                    <input
                      name="patientPhone"
                      defaultValue={editingAppointment.phoneRaw}
                      className="mt-1 h-10 w-full rounded-lg border border-[#dfe8e7] bg-white px-2 text-sm outline-[#0b5d6b]"
                    />
                  </label>
                </div>
                <input
                  type="hidden"
                  name="specialty"
                  value={editingAppointment.specialty || "ginecologia"}
                />
                <label className="block">
                  <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#789093]">
                    Observacoes
                  </span>
                  <textarea
                    name="notes"
                    defaultValue={editingAppointment.notes}
                    rows={4}
                    className="mt-1 w-full resize-none rounded-lg border border-[#dfe8e7] bg-white px-3 py-2 text-sm outline-[#0b5d6b]"
                    placeholder="Observacoes internas"
                  />
                </label>
                <button
                  disabled={isPending}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#0b5d6b] text-sm font-medium text-white transition hover:bg-[#084d59] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  Salvar alteracoes
                </button>
              </form>

              <div className="grid grid-cols-2 gap-2 border-t border-[#e8f0ef] pt-4">
                {statusActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.status}
                      type="button"
                      disabled={
                        isPending ||
                        editingAppointment.statusKey === action.status
                      }
                      onClick={() =>
                        requestStatusChange(editingAppointment, action.status)
                      }
                      className={`flex h-10 items-center justify-center gap-2 rounded-lg border px-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-45 ${
                        action.danger
                          ? "border-[#f0d7d3] bg-white text-[#a64035] hover:bg-[#fff1f0]"
                          : "border-[#dfe8e7] bg-white text-[#4d676b] hover:bg-[#edf6f5] hover:text-[#0b5d6b]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      {confirmingAppointment ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#102f36]/24 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-xl border border-[#f0d7d3] bg-white p-5 shadow-[0_30px_90px_rgba(13,54,64,0.2)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fff1f0] text-[#b42318]">
              <XCircle className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-[#102f36]">
              Cancelar este horario?
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#60777a]">
              {confirmingAppointment.title} de {confirmingAppointment.patient}.
              Se houver evento no Google Calendar, ele sera removido pelo
              workflow de sincronizacao.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmingAppointment(null)}
                className="h-10 rounded-lg border border-[#dfe8e7] bg-white text-sm font-medium text-[#4d676b] transition hover:bg-[#edf6f5]"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  submitStatus(confirmingAppointment.id, "cancelled", () => {
                    setConfirmingAppointment(null);
                    setEditingAppointment(null);
                  })
                }
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#b42318] text-sm font-medium text-white transition hover:bg-[#961e15] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RotateCcw className="h-4 w-4" />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export function AppointmentForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submitAppointment(formData: FormData) {
    setMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/appointments", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
      };

      if (!payload.ok) {
        setMessage(payload.error ?? "Não foi possível salvar o horário.");
        return;
      }

      setMessage("Horário salvo. A agenda foi atualizada.");
      router.refresh();
    });
  }

  return (
    <form action={submitAppointment}>
      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#789093]">
            Paciente
          </span>
          <input
            name="patientName"
            className="mt-2 h-10 w-full rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 text-sm text-[#102f36] outline-[#0b5d6b]"
            defaultValue="AuraLync"
            required
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#789093]">
            WhatsApp
          </span>
          <input
            name="patientPhone"
            className="mt-2 h-10 w-full rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 text-sm text-[#102f36] outline-[#0b5d6b]"
            defaultValue="5598984668340"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#789093]">
            Título
          </span>
          <input
            name="title"
            className="mt-2 h-10 w-full rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 text-sm text-[#102f36] outline-[#0b5d6b]"
            defaultValue="Primeira consulta"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#789093]">
            Especialidade
          </span>
          <input
            name="specialty"
            className="mt-2 h-10 w-full rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 text-sm text-[#102f36] outline-[#0b5d6b]"
            defaultValue="ginecologia"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#789093]">
            Data
          </span>
          <input
            name="appointmentDate"
            type="date"
            className="mt-2 h-10 w-full rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 text-sm text-[#102f36] outline-[#0b5d6b]"
            defaultValue="2026-05-19"
            required
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#789093]">
            Horário
          </span>
          <input
            name="appointmentTime"
            type="time"
            className="mt-2 h-10 w-full rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 text-sm text-[#102f36] outline-[#0b5d6b]"
            defaultValue="09:00"
            required
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#789093]">
            Duração
          </span>
          <input
            name="durationMinutes"
            type="number"
            min="5"
            max="480"
            className="mt-2 h-10 w-full rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 text-sm text-[#102f36] outline-[#0b5d6b]"
            defaultValue="50"
          />
        </label>
      </div>
      <button
        disabled={isPending}
        className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#0b5d6b] text-sm font-medium text-white transition hover:bg-[#084d59] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Plus className="h-4 w-4" />
        {isPending ? "Salvando..." : "Salvar horário"}
      </button>
      {message ? (
        <p className="mt-3 rounded-lg bg-[#edf6f5] px-3 py-2 text-sm leading-6 text-[#0b5d6b]">
          {message}
        </p>
      ) : null}
    </form>
  );
}

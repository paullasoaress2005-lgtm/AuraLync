"use client";

import { useState, useTransition } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Clock3,
  Database,
  Palette,
  LogOut,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import type { SettingsPayload } from "@/lib/settings";

type ApiPayload = {
  ok: boolean;
  error?: string;
};

type Props = {
  payload: SettingsPayload;
};

function formatUpdatedAt(value: string | null) {
  if (!value) return "Ainda não salvo";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Fortaleza",
  }).format(new Date(value));
}

function ToggleField({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg bg-[#f5f8f7] px-4 py-3">
      <span>
        <span className="block text-sm font-medium text-[#102f36]">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-[#789093]">
          {description}
        </span>
      </span>
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-5 w-5 rounded border-[#cfe0de] text-[#0b5d6b] accent-[#0b5d6b]"
      />
    </label>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#789093]">
      {children}
    </span>
  );
}

export function SettingsPanel({ payload }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { client, settings, schemaReady, source } = payload;

  function submitSettings(formData: FormData) {
    setMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        body: formData,
      });
      const data = (await response.json()) as ApiPayload;

      if (!data.ok) {
        setMessage(
          data.error ??
            "Não foi possível salvar os ajustes. Tente novamente ou acione o suporte AuraLync.",
        );
        return;
      }

      setMessage("Ajustes salvos para este cliente.");
      router.refresh();
    });
  }

  function logout() {
    startTransition(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    });
  }

  return (
    <form action={submitSettings} className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="space-y-6">
        {!schemaReady ? (
          <section className="rounded-xl border border-[#dfe8e7] bg-[#fbfdfd] p-5 text-[#60777a]">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Database className="h-4 w-4" />
              Preferências em ativação assistida
            </div>
            <p className="mt-2 text-sm leading-6">
              As preferências principais estão disponíveis. A equipe AuraLync
              finaliza a camada avançada durante a ativação do cliente.
            </p>
          </section>
        ) : null}

        {message ? (
          <p className="rounded-lg bg-[#edf6f5] px-4 py-3 text-sm leading-6 text-[#0b5d6b]">
            {message}
          </p>
        ) : null}

        <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-6 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
          <div className="flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
            <Palette className="h-4 w-4" />
            Aparência
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_260px] md:items-center">
            <div>
              <h2 className="text-lg font-semibold text-[#102f36]">
                Tema visual do CRM
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#60777a]">
                O modo noturno fica local neste navegador e só vale dentro do
                CRM. As preferências abaixo são salvas por clínica.
              </p>
            </div>
            <ThemeToggle />
          </div>
        </section>

        <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-6 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
          <div className="flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
            <SlidersHorizontal className="h-4 w-4" />
            Dados da clínica
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <FieldLabel>Nome de exibicao</FieldLabel>
              <input
                name="displayName"
                defaultValue={settings.displayName}
                className="mt-2 h-10 w-full rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 text-sm text-[#102f36] outline-[#0b5d6b]"
                required
              />
            </label>
            <label className="block">
              <FieldLabel>Especialidade</FieldLabel>
              <input
                name="specialty"
                defaultValue={settings.specialty}
                className="mt-2 h-10 w-full rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 text-sm text-[#102f36] outline-[#0b5d6b]"
                required
              />
            </label>
            <label className="block">
              <FieldLabel>E-mail de contato</FieldLabel>
              <input
                name="contactEmail"
                type="email"
                defaultValue={settings.contactEmail}
                className="mt-2 h-10 w-full rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 text-sm text-[#102f36] outline-[#0b5d6b]"
                required
              />
            </label>
            <label className="block">
              <FieldLabel>Fuso horário</FieldLabel>
              <select
                name="timezone"
                defaultValue={settings.timezone}
                className="mt-2 h-10 w-full rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 text-sm text-[#102f36] outline-[#0b5d6b]"
              >
                <option value="America/Fortaleza">America/Fortaleza</option>
                <option value="America/Sao_Paulo">America/Sao_Paulo</option>
                <option value="America/Manaus">America/Manaus</option>
              </select>
            </label>
          </div>
        </section>

        <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-6 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
          <div className="flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
            <Clock3 className="h-4 w-4" />
            Horarios de atendimento
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <FieldLabel>Inicio segunda a sexta</FieldLabel>
              <input
                name="weekdayStart"
                type="time"
                defaultValue={settings.weekdayStart}
                className="mt-2 h-10 w-full rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 text-sm text-[#102f36] outline-[#0b5d6b]"
              />
            </label>
            <label className="block">
              <FieldLabel>Fim segunda a sexta</FieldLabel>
              <input
                name="weekdayEnd"
                type="time"
                defaultValue={settings.weekdayEnd}
                className="mt-2 h-10 w-full rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 text-sm text-[#102f36] outline-[#0b5d6b]"
              />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-lg bg-[#f5f8f7] px-4 py-3 md:col-span-2">
              <span>
                <span className="block text-sm font-medium text-[#102f36]">
                  Atender aos sabados
                </span>
                <span className="mt-1 block text-xs leading-5 text-[#789093]">
                  Controla disponibilidade padrão no calendário.
                </span>
              </span>
              <input
                name="saturdayEnabled"
                type="checkbox"
                defaultChecked={settings.saturdayEnabled}
                className="h-5 w-5 rounded border-[#cfe0de] text-[#0b5d6b] accent-[#0b5d6b]"
              />
            </label>
            <label className="block">
              <FieldLabel>Inicio sabado</FieldLabel>
              <input
                name="saturdayStart"
                type="time"
                defaultValue={settings.saturdayStart}
                className="mt-2 h-10 w-full rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 text-sm text-[#102f36] outline-[#0b5d6b]"
              />
            </label>
            <label className="block">
              <FieldLabel>Fim sabado</FieldLabel>
              <input
                name="saturdayEnd"
                type="time"
                defaultValue={settings.saturdayEnd}
                className="mt-2 h-10 w-full rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 text-sm text-[#102f36] outline-[#0b5d6b]"
              />
            </label>
            <label className="block">
              <FieldLabel>Duração padrão</FieldLabel>
              <input
                name="defaultAppointmentDuration"
                type="number"
                min="5"
                max="480"
                defaultValue={settings.defaultAppointmentDuration}
                className="mt-2 h-10 w-full rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 text-sm text-[#102f36] outline-[#0b5d6b]"
              />
            </label>
            <label className="block">
              <FieldLabel>Intervalo entre consultas</FieldLabel>
              <input
                name="appointmentBufferMinutes"
                type="number"
                min="0"
                max="180"
                defaultValue={settings.appointmentBufferMinutes}
                className="mt-2 h-10 w-full rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 text-sm text-[#102f36] outline-[#0b5d6b]"
              />
            </label>
          </div>
        </section>
      </section>

      <aside className="space-y-6">
        <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-[#0d3640] p-6 text-white shadow-[0_22px_55px_rgba(13,54,64,0.16)]">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Smartphone className="h-4 w-4" />
            WhatsApp e automações
          </div>
          <p className="mt-5 text-2xl font-semibold">
            Integração protegida
          </p>
          <p className="mt-3 text-sm leading-6 text-[#c7d8d9]">
            WhatsApp, Chatwoot, n8n e agenda ficam conectados no servidor. A
            troca de número ou instância passa por validação para não quebrar
            os workflows.
          </p>
        </section>

        <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-6 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
          <div className="flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
            <Bell className="h-4 w-4" />
            Notificações
          </div>
          <div className="mt-5 space-y-3">
            <ToggleField
              name="notifyNewAppointment"
              label="Novo agendamento"
              description="Avisar quando IA ou recepção criarem consulta."
              defaultChecked={settings.notifyNewAppointment}
            />
            <ToggleField
              name="notifyNoResponse"
              label="Lead sem resposta"
              description="Avisar quando o paciente parar de responder."
              defaultChecked={settings.notifyNoResponse}
            />
            <ToggleField
              name="notifyHumanHandoff"
              label="Transbordo humano"
              description="Avisar quando a IA pedir apoio da equipe."
              defaultChecked={settings.notifyHumanHandoff}
            />
            <ToggleField
              name="notifyIntegrationFailure"
              label="Falha de integração"
              description="Avisar quando WhatsApp, Chatwoot ou calendário falharem."
              defaultChecked={settings.notifyIntegrationFailure}
            />
          </div>
        </section>

        <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-6 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
          <div className="flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
            <ShieldCheck className="h-4 w-4" />
            Automação segura
          </div>
          <div className="mt-5 space-y-4">
            <label className="block">
              <FieldLabel>Confiança mínima da IA</FieldLabel>
              <input
                name="aiHandoffThreshold"
                type="number"
                min="0"
                max="1"
                step="0.05"
                defaultValue={settings.aiHandoffThreshold}
                className="mt-2 h-10 w-full rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 text-sm text-[#102f36] outline-[#0b5d6b]"
              />
            </label>
            <ToggleField
              name="autoSyncGoogleCalendar"
              label="Sincronizar Google Calendar"
              description="Manter eventos do Google alinhados com a agenda AuraLync."
              defaultChecked={settings.autoSyncGoogleCalendar}
            />
          </div>
        </section>

        <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-6 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
          <div className="flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
            <Database className="h-4 w-4" />
            Estado
          </div>
          <div className="mt-5 space-y-3 text-sm leading-6 text-[#60777a]">
            <p>Cliente: {client.name}</p>
            <p>Fonte: {source === "supabase" ? "Supabase" : "Padrao seguro"}</p>
            <p>Atualizado: {formatUpdatedAt(settings.updatedAt)}</p>
          </div>
          <button
            disabled={isPending}
            className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#0b5d6b] text-sm font-medium text-white transition hover:bg-[#084d59] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {isPending ? "Salvando..." : "Salvar ajustes"}
          </button>
        </section>

        <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-6 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
          <div className="flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
            <LogOut className="h-4 w-4" />
            Sessão
          </div>
          <p className="mt-3 text-sm leading-6 text-[#60777a]">
            Encerre o acesso deste navegador antes de alternar conta ou
            entregar o dispositivo.
          </p>
          <button
            type="button"
            onClick={logout}
            className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#dfe8e7] bg-white text-sm font-medium text-[#0b5d6b] transition hover:bg-[#edf6f5]"
          >
            <LogOut className="h-4 w-4" />
            Sair do CRM
          </button>
        </section>
      </aside>
    </form>
  );
}

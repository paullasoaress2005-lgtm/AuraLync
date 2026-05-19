"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Mail,
  Phone,
  Stethoscope,
  UserRound,
} from "lucide-react";

const AURALYNC_WHATSAPP = "5598984668340";

type LeadForm = {
  name: string;
  phone: string;
  email: string;
  area: string;
  clinic: string;
  message: string;
};

const initialForm: LeadForm = {
  name: "",
  phone: "",
  email: "",
  area: "",
  clinic: "",
  message: "",
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function DemoLeadForm() {
  const [form, setForm] = useState<LeadForm>(initialForm);

  const whatsappText = useMemo(() => {
    return [
      "*Nova solicitação de demonstração AuraLync*",
      "",
      `Nome: ${form.name || "não informado"}`,
      `WhatsApp: ${form.phone || "não informado"}`,
      `E-mail: ${form.email || "não informado"}`,
      `Área médica: ${form.area || "não informado"}`,
      `Clínica/empresa: ${form.clinic || "não informado"}`,
      `Mensagem: ${form.message || "Quero entender como a AuraLync pode melhorar o atendimento da minha clínica."}`,
      "",
      "Origem: Landing AuraLync",
      "Ação esperada: cadastrar lead, responder com proposta de reunião e manter contexto para o CRM.",
    ].join("\n");
  }, [form]);

  function updateField(field: keyof LeadForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submitDemo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const phone = onlyDigits(AURALYNC_WHATSAPP);
    const target = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappText)}`;
    window.location.href = target;
  }

  return (
    <form onSubmit={submitDemo} className="rounded-2xl border border-[#dfe8e7] bg-[#f8fbfb] p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#0b5d6b]">
        <CalendarCheck className="h-4 w-4" />
        Agendar demonstração
      </div>
      <p className="mt-2 text-sm leading-6 text-[#60777a]">
        Preencha os dados principais e o WhatsApp abrirá com uma mensagem pronta
        para o atendimento da AuraLync.
      </p>

      <div className="mt-5 grid gap-3">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#789093]">
            Nome
          </span>
          <div className="mt-2 flex h-11 items-center gap-3 rounded-lg border border-[#dfe8e7] bg-white px-3">
            <UserRound className="h-4 w-4 text-[#0b5d6b]" />
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9aaeb0]"
              placeholder="Seu nome"
            />
          </div>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#789093]">
              WhatsApp
            </span>
            <div className="mt-2 flex h-11 items-center gap-3 rounded-lg border border-[#dfe8e7] bg-white px-3">
              <Phone className="h-4 w-4 text-[#0b5d6b]" />
              <input
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                required
                className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9aaeb0]"
                placeholder="DDD + número"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#789093]">
              E-mail
            </span>
            <div className="mt-2 flex h-11 items-center gap-3 rounded-lg border border-[#dfe8e7] bg-white px-3">
              <Mail className="h-4 w-4 text-[#0b5d6b]" />
              <input
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                type="email"
                required
                className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9aaeb0]"
                placeholder="email@clinica.com"
              />
            </div>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#789093]">
              Área médica
            </span>
            <div className="mt-2 flex h-11 items-center gap-3 rounded-lg border border-[#dfe8e7] bg-white px-3">
              <Stethoscope className="h-4 w-4 text-[#0b5d6b]" />
              <input
                value={form.area}
                onChange={(event) => updateField("area", event.target.value)}
                required
                className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9aaeb0]"
                placeholder="Ex: ginecologia"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#789093]">
              Clínica
            </span>
            <div className="mt-2 flex h-11 items-center gap-3 rounded-lg border border-[#dfe8e7] bg-white px-3">
              <Building2 className="h-4 w-4 text-[#0b5d6b]" />
              <input
                value={form.clinic}
                onChange={(event) => updateField("clinic", event.target.value)}
                className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9aaeb0]"
                placeholder="Nome da clínica"
              />
            </div>
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#789093]">
            O que você quer melhorar?
          </span>
          <textarea
            value={form.message}
            onChange={(event) => updateField("message", event.target.value)}
            rows={3}
            className="mt-2 w-full resize-none rounded-lg border border-[#dfe8e7] bg-white px-3 py-3 text-sm leading-6 outline-none placeholder:text-[#9aaeb0]"
            placeholder="Ex: organizar WhatsApp, confirmar consultas e acompanhar retornos."
          />
        </label>
      </div>

      <button className="premium-action mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0b5d6b] text-sm font-semibold text-white transition hover:bg-[#084d59]">
        Enviar pelo WhatsApp
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}

import {
  AlertCircle,
  CalendarCheck,
  Clock3,
  MessageSquareText,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { getCurrentClient } from "@/lib/current-client";

type Snapshot = {
  new_contacts: number;
  new_leads: number;
  curiosos: number;
  agendamentos: number;
  retornos: number;
  outros: number;
};

type ConversationStateRow = {
  current_stage: string | null;
  lead_temperature: string | null;
  lifecycle_status: string | null;
  needs_human_attention: boolean | null;
  last_ai_summary: string | null;
  next_recommended_action: string | null;
  reason: string | null;
  updated_at: string | null;
  conversations?: {
    chatwoot_conversation_id: string | null;
    contacts?: {
      phone: string | null;
      name: string | null;
    } | null;
  } | null;
};

export type DashboardMetric = {
  label: string;
  value: string;
  delta: string;
  detail: string;
  icon: LucideIcon;
};

export type StageMetric = {
  label: string;
  value: number;
  color: string;
};

export type ConversationPreview = {
  name: string;
  phone: string;
  stage: string;
  temperature: string;
  summary: string;
  action: string;
  time: string;
};

export type PriorityItem = {
  label: string;
  count: number;
  description: string;
  action: string;
  href: string;
  tone: "critical" | "warm" | "calm";
};

export type DashboardData = {
  clientName: string;
  periodLabel: string;
  metrics: DashboardMetric[];
  stages: StageMetric[];
  conversations: ConversationPreview[];
  priorities: PriorityItem[];
  attentionCount: number;
  source: "supabase" | "demo";
};

const STAGE_LABELS: Record<string, string> = {
  em_atendimento: "Em atendimento",
  aguardando_resposta: "Aguardando resposta",
  lead_interessado: "Lead interessado",
  agendamento_em_andamento: "Agendamento em andamento",
  agendado: "Agendado",
  sem_resposta: "Sem resposta",
  precisa_humano: "Precisa humano",
  cliente_fiel_mensal: "Cliente fiel mensal",
  outros: "Outros",
};

const STAGE_COLORS: Record<string, string> = {
  lead_interessado: "bg-[#0e7490]",
  aguardando_resposta: "bg-[#b7791f]",
  agendamento_em_andamento: "bg-[#0f766e]",
  agendado: "bg-[#0f766e]",
  sem_resposta: "bg-[#b7791f]",
  precisa_humano: "bg-[#b42318]",
  em_atendimento: "bg-[#0b5d6b]",
  cliente_fiel_mensal: "bg-[#5b7f74]",
  outros: "bg-[#789093]",
};

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "America/Fortaleza",
});

const relativeFormatter = new Intl.RelativeTimeFormat("pt-BR", {
  numeric: "auto",
});

const PRESENTATION_PATIENTS = [
  {
    name: "Pamela dos Santos",
    phone: "5598....8340",
    summary:
      "Pamela pediu uma consulta ginecológica com a Dra. Camila e recebeu sugestão de chegada para sexta-feira às 15:30.",
    action: "Confirmar se o horário sugerido pode ser reservado.",
  },
  {
    name: "Beatriz Saraiva",
    phone: "5598....3478",
    summary:
      "Beatriz confirmou consulta com a Dra. Camila e recebeu orientações de chegada.",
    action: "Conferir se a consulta aparece corretamente na agenda.",
  },
  {
    name: "Renata Almeida",
    phone: "5598....4321",
    summary:
      "Renata perguntou sobre disponibilidade para retorno e recebeu opções de horário para a semana.",
    action: "Aguardar confirmação do melhor horário para retorno.",
  },
];

function fallbackData(): DashboardData {
  return {
    clientName: "AuraLync",
    periodLabel: "Maio de 2026",
    source: "demo",
    attentionCount: 7,
    metrics: [
      {
        label: "Conversas ativas",
        value: "18",
        delta: "+12%",
        detail: "5 precisam de atenção nas próximas horas",
        icon: MessageSquareText,
      },
      {
        label: "Leads novos",
        value: "42",
        delta: "+8%",
        detail: "Comparado ao mês anterior",
        icon: UsersRound,
      },
      {
        label: "Agendamentos",
        value: "16",
        delta: "+21%",
        detail: "Consultas e avaliações confirmadas",
        icon: CalendarCheck,
      },
      {
        label: "Sem resposta",
        value: "7",
        delta: "2h+",
        detail: "Oportunidades aguardando retorno",
        icon: Clock3,
      },
    ],
    priorities: [
      {
        label: "Leads quentes sem retorno",
        count: 3,
        description:
          "Pacientes demonstraram interesse, mas a conversa esfriou depois da resposta da clínica.",
        action: "Abrir follow-up sugerido",
        href: "/conversas?filter=sem_resposta",
        tone: "critical",
      },
      {
        label: "Agendamentos em andamento",
        count: 5,
        description:
          "Conversas com intenção clara de consulta ainda sem horário fechado.",
        action: "Ver oportunidades de agenda",
        href: "/conversas?filter=agendamentos",
        tone: "warm",
      },
      {
        label: "Paciente precisa de humano",
        count: 1,
        description:
          "A IA encontrou uma conversa que exige revisão da equipe antes de responder.",
        action: "Revisar com cuidado",
        href: "/conversas?filter=attention",
        tone: "critical",
      },
    ],
    stages: [
      { label: "Lead interessado", value: 12, color: "bg-[#0e7490]" },
      { label: "Aguardando resposta", value: 7, color: "bg-[#b7791f]" },
      { label: "Agendamento em andamento", value: 5, color: "bg-[#0f766e]" },
      { label: "Precisa humano", value: 3, color: "bg-[#b42318]" },
    ],
    conversations: [
      {
        name: "Paulla",
        phone: "5598920010966",
        stage: "Lead interessado",
        temperature: "Quente",
        summary:
          "Quer entender se a automação de ponta a ponta faz sentido para a operação.",
        action: "Responder com explicação curta e sugerir conversa de diagnóstico.",
        time: "Agora",
      },
      {
        name: "Paciente sem retorno",
        phone: "5598••••9401",
        stage: "Sem resposta",
        temperature: "Quente",
        summary:
          "A clínica respondeu e o paciente não retornou dentro do prazo configurado.",
        action: "Revisar ou enviar follow-up com contexto.",
        time: "2h+",
      },
      {
        name: "Clínica AuraLync",
        phone: "tenant",
        stage: "CRM processado",
        temperature: "Vitrine",
        summary: "Tenant inicial usado como vitrine operacional do produto.",
        action: "Validar visual e métricas antes do multi-cliente.",
        time: "Hoje",
      },
    ],
  };
}

function buildPriorities(
  states: ConversationStateRow[],
  snapshot: Snapshot,
): PriorityItem[] {
  const hotNoResponse = states.filter(
    (state) =>
      state.current_stage === "sem_resposta" &&
      ["quente", "morno", "hot", "warm"].includes(
        (state.lead_temperature ?? "").toLowerCase(),
      ),
  ).length;
  const scheduling = states.filter(
    (state) => state.current_stage === "agendamento_em_andamento",
  ).length;
  const needsHuman = states.filter(
    (state) =>
      state.needs_human_attention || state.current_stage === "precisa_humano",
  ).length;
  const newLeadGap = Math.max(snapshot.new_leads - snapshot.agendamentos, 0);

  const priorities: PriorityItem[] = [
    {
      label: "Leads quentes sem retorno",
      count: hotNoResponse,
      description:
        "Conversas com sinal de compra ou consulta que ficaram sem próximo passo claro.",
      action: "Abrir follow-up sugerido",
      href: "/conversas?filter=sem_resposta",
      tone: hotNoResponse > 0 ? "critical" : "calm",
    },
    {
      label: "Agendamentos em andamento",
      count: scheduling,
      description:
        "Pacientes ou leads tentando encontrar horário, valor ou disponibilidade.",
      action: "Ver oportunidades de agenda",
      href: "/conversas?filter=agendamentos",
      tone: scheduling > 0 ? "warm" : "calm",
    },
    {
      label: "Precisa de humano",
      count: needsHuman,
      description:
        "Conversas em que a IA recomenda revisão da equipe antes de qualquer ação.",
      action: "Revisar com cuidado",
      href: "/conversas?filter=attention",
      tone: needsHuman > 0 ? "critical" : "calm",
    },
    {
      label: "Leads ainda não convertidos",
      count: newLeadGap,
      description:
        "Diferença entre leads novos e agendamentos do mês, útil para recuperar oportunidade.",
      action: "Analisar conversas",
      href: "/conversas?filter=leads",
      tone: newLeadGap > 0 ? "warm" : "calm",
    },
  ];

  return priorities.sort((a, b) => b.count - a.count).slice(0, 3);
}

async function supabaseFetch<T>(path: string): Promise<T> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase server environment is not configured.");
  }

  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function normalizeStage(stage: string | null) {
  if (!stage) return "outros";
  return stage;
}

function formatStage(stage: string | null) {
  const normalized = normalizeStage(stage);
  return STAGE_LABELS[normalized] ?? normalized.replaceAll("_", " ");
}

function formatTemperature(value: string | null) {
  if (!value) return "Não definida";
  return value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " ");
}

function formatPhone(phone: string | null) {
  if (!phone) return "sem telefone";
  if (phone.length <= 8) return phone;
  return `${phone.slice(0, 4)}••••${phone.slice(-4)}`;
}

function cleanText(value: string | null | undefined, fallback: string) {
  if (!value || value.includes("�")) return fallback;
  return value;
}

function hasPresentationLeak(value: string | null | undefined) {
  return /auralync|demonstrativo|demonstra|teste controlado|teste crm|ia atualizada/i.test(
    String(value || ""),
  );
}

function presentationProfileFor(state: ConversationStateRow, index: number) {
  const contact = state.conversations?.contacts;
  const shouldMask =
    hasPresentationLeak(contact?.name) ||
    hasPresentationLeak(state.last_ai_summary) ||
    hasPresentationLeak(state.next_recommended_action) ||
    hasPresentationLeak(state.reason) ||
    contact?.phone === "5598984668340";

  if (!shouldMask) return null;
  if (state.current_stage === "agendamento_em_andamento") {
    return PRESENTATION_PATIENTS[0];
  }
  if (state.current_stage === "agendado") {
    return PRESENTATION_PATIENTS[1];
  }
  return PRESENTATION_PATIENTS[index % PRESENTATION_PATIENTS.length];
}

function formatRelativeTime(value: string | null) {
  if (!value) return "Agora";

  const updatedAt = new Date(value).getTime();
  const diffMinutes = Math.round((updatedAt - Date.now()) / 60000);

  if (Math.abs(diffMinutes) < 1) return "Agora";
  if (Math.abs(diffMinutes) < 60) {
    return relativeFormatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return relativeFormatter.format(diffHours, "hour");
  }

  return relativeFormatter.format(Math.round(diffHours / 24), "day");
}

function buildStageMetrics(states: ConversationStateRow[]): StageMetric[] {
  const counts = states.reduce<Record<string, number>>((acc, state) => {
    const stage = normalizeStage(state.current_stage);
    acc[stage] = (acc[stage] ?? 0) + 1;
    return acc;
  }, {});

  const preferredOrder = [
    "lead_interessado",
    "aguardando_resposta",
    "agendamento_em_andamento",
    "agendado",
    "sem_resposta",
    "precisa_humano",
    "em_atendimento",
    "cliente_fiel_mensal",
    "outros",
  ];

  return preferredOrder
    .filter((stage) => counts[stage])
    .map((stage) => ({
      label: formatStage(stage),
      value: counts[stage],
      color: STAGE_COLORS[stage] ?? STAGE_COLORS.outros,
    }));
}

function buildConversations(states: ConversationStateRow[]): ConversationPreview[] {
  return states.slice(0, 8).map((state, index) => {
    const contact = state.conversations?.contacts;
    const stage = normalizeStage(state.current_stage);
    const presentation = presentationProfileFor(state, index);

    return {
      name:
        presentation?.name ||
        cleanText(contact?.name, `Contato ${formatPhone(contact?.phone ?? null)}`),
      phone: presentation?.phone || formatPhone(contact?.phone ?? null),
      stage: formatStage(stage),
      temperature: formatTemperature(state.lead_temperature),
      summary:
        presentation?.summary ||
        cleanText(
          state.last_ai_summary || state.reason,
          "A IA ainda está reunindo contexto suficiente para resumir esta conversa.",
        ) ||
        "A IA ainda está reunindo contexto suficiente para resumir esta conversa.",
      action:
        presentation?.action ||
        cleanText(
          state.next_recommended_action,
          "Acompanhar a próxima mensagem antes de tomar uma ação manual.",
        ),
      time: formatRelativeTime(state.updated_at),
    };
  });
}

export async function getDashboardData(options?: {
  view?: "auralync" | "camila";
}): Promise<DashboardData> {
  if (options?.view === "auralync") {
    return fallbackData();
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return fallbackData();
  }

  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const periodLabel = monthFormatter.format(now);

    const client = await getCurrentClient();
    if (!client) return fallbackData();

    const encodedClientId = encodeURIComponent(client.id);
    const [snapshots, states] = await Promise.all([
      supabaseFetch<Snapshot[]>(
        `monthly_snapshots?select=new_contacts,new_leads,curiosos,agendamentos,retornos,outros&client_id=eq.${encodedClientId}&year=eq.${year}&month=eq.${month}&limit=1`,
      ),
      supabaseFetch<ConversationStateRow[]>(
        `conversation_states?select=current_stage,lead_temperature,lifecycle_status,needs_human_attention,last_ai_summary,next_recommended_action,reason,updated_at,conversations(chatwoot_conversation_id,contacts(phone,name))&client_id=eq.${encodedClientId}&order=updated_at.desc&limit=20`,
      ),
    ]);

    const snapshot = snapshots[0] ?? {
      new_contacts: 0,
      new_leads: 0,
      curiosos: 0,
      agendamentos: 0,
      retornos: 0,
      outros: 0,
    };

    const attentionCount = states.filter(
      (state) =>
        state.needs_human_attention ||
        state.current_stage === "sem_resposta" ||
        state.current_stage === "precisa_humano",
    ).length;
    const noResponseCount = states.filter(
      (state) => state.current_stage === "sem_resposta",
    ).length;
    const stageMetrics = buildStageMetrics(states);

    return {
      clientName: client.name,
      periodLabel,
      source: "supabase",
      attentionCount,
      metrics: [
        {
          label: "Conversas ativas",
          value: String(states.length),
          delta: "ao vivo",
          detail: `${attentionCount} precisam de atenção nas próximas horas`,
          icon: MessageSquareText,
        },
        {
          label: "Leads novos",
          value: String(snapshot.new_leads),
          delta: `${snapshot.new_contacts} contatos`,
          detail: "Contatos e leads registrados no mês atual",
          icon: UsersRound,
        },
        {
          label: "Agendamentos",
          value: String(snapshot.agendamentos),
          delta: `${snapshot.retornos} retornos`,
          detail: "Consultas, avaliações ou retornos classificados pela IA",
          icon: CalendarCheck,
        },
        {
          label: "Sem resposta",
          value: String(noResponseCount),
          delta: "2h+",
          detail: "Oportunidades aguardando retorno do paciente ou lead",
          icon: Clock3,
        },
      ],
      stages:
        stageMetrics.length > 0
          ? stageMetrics
          : [{ label: "Sem estados vivos", value: 0, color: "bg-[#789093]" }],
      conversations: buildConversations(states),
      priorities: buildPriorities(states, snapshot),
    };
  } catch (error) {
    console.error(error);
    return fallbackData();
  }
}

export const AttentionIcon = AlertCircle;

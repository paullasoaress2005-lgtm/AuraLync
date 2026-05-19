import { getCurrentClient } from "@/lib/current-client";

export type InboxFilter =
  | "all"
  | "attention"
  | "agendamentos"
  | "sem_resposta"
  | "leads";

export type InboxConversation = {
  id: string;
  chatwootId: string;
  name: string;
  phone: string;
  maskedPhone: string;
  status: string;
  stageKey: string;
  stage: string;
  temperature: string;
  lifecycle: string;
  summary: string;
  action: string;
  reason: string;
  time: string;
  updatedAt: string;
  needsHumanAttention: boolean;
  classificationLabel: string;
  classificationConfidence: string;
  specialty: string;
  appointmentTitle: string | null;
  appointmentAt: string | null;
  appointmentStatus: string | null;
};

export type InboxTimelineItem = {
  id: string;
  title: string;
  body: string;
  meta: string;
  tone: "info" | "success" | "warning" | "danger";
};

export type InboxMessage = {
  id: string;
  author: "patient" | "clinic" | "ai" | "system";
  authorLabel: string;
  body: string;
  time: string;
};

export type InboxData = {
  clientName: string;
  source: "supabase" | "demo";
  conversations: InboxConversation[];
  selected: InboxConversation | null;
  timeline: InboxTimelineItem[];
  messages: InboxMessage[];
  counts: {
    all: number;
    attention: number;
    agendamentos: number;
    semResposta: number;
    leads: number;
  };
};

type ConversationRow = {
  id: string;
  chatwoot_conversation_id: string;
  status: string;
  started_at: string | null;
  resolved_at: string | null;
  created_at: string;
  contacts: {
    phone: string | null;
    name: string | null;
  } | null;
};

type StateRow = {
  conversation_id: string;
  current_stage: string | null;
  lead_temperature: string | null;
  lifecycle_status: string | null;
  needs_human_attention: boolean | null;
  last_ai_summary: string | null;
  next_recommended_action: string | null;
  reason: string | null;
  last_message_at: string | null;
  updated_at: string | null;
};

type ClassificationRow = {
  conversation_id: string;
  label: string;
  specialty: string | null;
  ai_summary: string | null;
  confidence: number | null;
  classified_at: string;
};

type AppointmentRow = {
  conversation_id: string | null;
  title: string;
  specialty: string | null;
  appointment_at: string;
  status: string;
  source: string;
  notes: string | null;
};

type EventRow = {
  id: string;
  conversation_id: string | null;
  event_type: string;
  source: string;
  title: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
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

const CLASSIFICATION_LABELS: Record<string, string> = {
  agendamento: "Agendamento",
  lead: "Lead",
  curioso: "Curioso",
  retorno: "Retorno",
  outros: "Outros",
};

const EVENT_LABELS: Record<string, string> = {
  message_created: "Mensagem recebida",
  state_changed: "Estado atualizado",
  classification_final: "Classificacao final",
  no_response_detected: "Sem resposta detectado",
  human_attention: "Atencao humana",
  label_synced: "Etiqueta sincronizada",
  manual_note: "Nota manual",
  error: "Erro operacional",
};

const PRESENTATION_PATIENTS = [
  {
    name: "Pamela dos Santos",
    phone: "5598984668340",
    stageKey: "agendamento_em_andamento",
    stage: "Agendamento em andamento",
    summary:
      "Pamela pediu uma consulta ginecologica com a Dra. Camila e recebeu sugestao de chegada para sexta-feira as 15:30.",
    action: "Confirmar os dados pessoais de Pamela para finalizar o agendamento.",
    reason: "Paciente interessada em consulta ginecologica nesta semana.",
    appointmentTitle: "Consulta ginecologica",
    appointmentAt: null,
    appointmentStatus: null,
  },
  {
    name: "Beatriz Saraiva",
    phone: "5598985123478",
    stageKey: "agendado",
    stage: "Agendado",
    summary:
      "Beatriz confirmou consulta com a Dra. Camila para sexta-feira e recebeu as orientacoes de chegada.",
    action: "Conferir se a consulta aparece corretamente na agenda.",
    reason: "Paciente confirmou disponibilidade e aceitou o horario sugerido.",
    appointmentTitle: "Consulta ginecologica",
    appointmentAt: "22/05/2026, 15:30",
    appointmentStatus: "scheduled",
  },
  {
    name: "Renata Almeida",
    phone: "5598987654321",
    stageKey: "aguardando_resposta",
    stage: "Aguardando resposta",
    summary:
      "Renata perguntou sobre disponibilidade para retorno e recebeu opcoes de horario para a semana.",
    action: "Aguardar confirmacao do melhor horario para retorno.",
    reason: "Paciente avaliando horario antes de confirmar.",
    appointmentTitle: "Retorno ginecologico",
    appointmentAt: null,
    appointmentStatus: null,
  },
];

const relativeFormatter = new Intl.RelativeTimeFormat("pt-BR", {
  numeric: "auto",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Fortaleza",
});

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment is not configured.");
  }

  return { url, key };
}

async function supabaseFetch<T>(path: string): Promise<T> {
  const { url, key } = supabaseConfig();
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

function inList(ids: string[]) {
  return ids.map((id) => encodeURIComponent(id)).join(",");
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function cleanText(value: string | null | undefined, fallback: string) {
  const text = String(value || "").trim();
  if (!text || text.includes("ï¿½")) return fallback;
  return text;
}

function hasPresentationLeak(value: string | null | undefined) {
  return /auralync|demonstrativo|demonstra|teste controlado|ia atualizada/i.test(
    String(value || ""),
  );
}

function presentationProfile(index: number) {
  return PRESENTATION_PATIENTS[index % PRESENTATION_PATIENTS.length];
}

function profileFromConversation(
  row: ConversationRow,
  state: StateRow | undefined,
  appointment: AppointmentRow | undefined,
) {
  const rawName = row.contacts?.name || "";
  const rawPhone = row.contacts?.phone || "";
  const shouldMask =
    hasPresentationLeak(rawName) ||
    hasPresentationLeak(state?.last_ai_summary) ||
    hasPresentationLeak(state?.next_recommended_action) ||
    hasPresentationLeak(state?.reason) ||
    hasPresentationLeak(appointment?.title) ||
    hasPresentationLeak(appointment?.notes) ||
    rawPhone === "5598984668340";

  if (!shouldMask) return null;
  if (state?.current_stage === "agendamento_em_andamento") return presentationProfile(0);
  if (appointment || state?.current_stage === "agendado") return presentationProfile(1);
  return presentationProfile(2);
}

function presentationText(
  value: string | null | undefined,
  fallback: string,
  profile?: (typeof PRESENTATION_PATIENTS)[number] | null,
) {
  const text = cleanText(value, fallback);
  if (!hasPresentationLeak(text)) return text;

  if (profile?.name === "Pamela dos Santos") return profile.summary;
  if (profile?.name === "Beatriz Saraiva") return profile.summary;
  if (profile?.name === "Renata Almeida") return profile.summary;

  return fallback;
}

function presentationTitle(value: string | null | undefined, fallback: string) {
  const text = cleanText(value, fallback);
  if (hasPresentationLeak(text)) return fallback;
  return text.replace(/\s+-\s+IA$/i, "").replace(/\s+IA$/i, "").trim() || fallback;
}

function maskPhone(phone: string | null) {
  if (!phone) return "sem telefone";
  if (phone.length <= 8) return phone;
  return `${phone.slice(0, 4)}....${phone.slice(-4)}`;
}

function formatStage(stage: string | null) {
  const key = stage || "outros";
  return STAGE_LABELS[key] ?? key.replaceAll("_", " ");
}

function formatTemperature(value: string | null) {
  if (!value) return "Nao definida";
  return value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " ");
}

function formatRelativeTime(value: string | null) {
  if (!value) return "Agora";
  const diffMinutes = Math.round((new Date(value).getTime() - Date.now()) / 60000);

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

function formatDateTime(value: string | null) {
  if (!value) return "sem data";
  return dateTimeFormatter.format(new Date(value));
}

function confidenceLabel(value: number | null) {
  if (!Number.isFinite(value)) return "0%";
  return `${Math.round(Number(value) * 100)}%`;
}

function eventTone(eventType: string): InboxTimelineItem["tone"] {
  if (eventType === "human_attention" || eventType === "error") return "danger";
  if (eventType === "no_response_detected") return "warning";
  if (eventType === "classification_final" || eventType === "label_synced") {
    return "success";
  }
  return "info";
}

function payloadText(payload: Record<string, unknown> | null) {
  if (!payload) return "";
  const suggestion = payload.appointment_suggestion;
  if (suggestion && typeof suggestion === "object") {
    const item = suggestion as {
      title?: unknown;
      start_at?: unknown;
      status?: unknown;
      reason?: unknown;
    };
    const title = typeof item.title === "string" ? item.title : "Consulta";
    const startAt =
      typeof item.start_at === "string" && item.start_at
        ? formatDateTime(item.start_at)
        : "horario ainda indefinido";
    const status =
      typeof item.status === "string" && item.status === "needs_date_or_time"
        ? "precisa de data ou horario"
        : "sugestao detectada";
    const reason = typeof item.reason === "string" ? item.reason : "";
    return `Sugestao de agenda: ${title} em ${startAt} (${status}). ${reason}`.trim();
  }

  const reason = payload.reason;
  const action = payload.next_recommended_action;
  const stage = payload.current_stage;

  return [reason, action, stage]
    .filter((value) => typeof value === "string" && value.trim())
    .join(" | ");
}

function payloadMessageText(payload: Record<string, unknown> | null) {
  if (!payload) return "";

  for (const key of ["content", "message", "text", "body"]) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  const nested = payload.message;
  if (nested && typeof nested === "object") {
    const item = nested as Record<string, unknown>;
    for (const key of ["content", "text", "body"]) {
      const value = item[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }

  return "";
}

function payloadAuthor(payload: Record<string, unknown> | null): InboxMessage["author"] {
  if (!payload) return "system";

  const messageType = payload.message_type ?? payload.sender_type ?? payload.author;
  if (messageType === 0 || messageType === "incoming" || messageType === "contact") {
    return "patient";
  }
  if (messageType === 1 || messageType === "outgoing" || messageType === "agent") {
    return "clinic";
  }
  if (messageType === "ai" || messageType === "bot") return "ai";

  return "system";
}

function authorLabel(author: InboxMessage["author"]) {
  const labels: Record<InboxMessage["author"], string> = {
    patient: "Paciente",
    clinic: "Clinica",
    ai: "Assistente IA",
    system: "Sistema",
  };

  return labels[author];
}

function fallbackData(options?: {
  filter?: string;
  selectedId?: string;
  search?: string;
}): InboxData {
  const now = new Date().toISOString();
  const conversations: InboxConversation[] = PRESENTATION_PATIENTS.map(
    (profile, index) => ({
      id: `conversation-${index + 1}`,
      chatwootId: `chat-${index + 1}`,
      name: profile.name,
      phone: profile.phone,
      maskedPhone: maskPhone(profile.phone),
      status: index === 1 ? "resolved" : "open",
      stageKey: profile.stageKey,
      stage: profile.stage,
      temperature: index === 2 ? "Morno" : "Quente",
      lifecycle: index === 1 ? "Ganho" : "Em andamento",
      summary: profile.summary,
      action: profile.action,
      reason: profile.reason,
      time: index === 0 ? "ha 8 min" : index === 1 ? "ha 36 min" : "ha 1 h",
      updatedAt: now,
      needsHumanAttention: false,
      classificationLabel: index === 2 ? "Retorno" : "Agendamento",
      classificationConfidence: index === 2 ? "88%" : index === 1 ? "96%" : "91%",
      specialty: "ginecologia",
      appointmentTitle: profile.appointmentTitle,
      appointmentAt: profile.appointmentAt,
      appointmentStatus: profile.appointmentStatus,
    }),
  );
  const filter = (options?.filter || "all") as InboxFilter;
  const filtered = applySearch(applyFilter(conversations, filter), options?.search || "");
  const selected =
    filtered.find((conversation) => conversation.id === options?.selectedId) ??
    filtered[0] ??
    conversations.find((conversation) => conversation.id === options?.selectedId) ??
    conversations[0];

  return {
    clientName: "Dra. Camila Guimaraes Espindola",
    source: "demo",
    conversations: filtered,
    selected,
    messages: buildMessages(selected, undefined, []),
    timeline: [
      {
        id: "fallback-state",
        title: selected.stage,
        body: selected.summary,
        meta: "Estado vivo | hoje, 14:09",
        tone: "info",
      },
      {
        id: "fallback-action",
        title: "Proxima acao",
        body: selected.action,
        meta: "Assistente IA | hoje, 14:09",
        tone: "success",
      },
    ],
    counts: {
      all: conversations.length,
      attention: 0,
      agendamentos: 2,
      semResposta: 0,
      leads: 1,
    },
  };
}

function buildConversation(
  row: ConversationRow,
  state: StateRow | undefined,
  classification: ClassificationRow | undefined,
  appointment: AppointmentRow | undefined,
): InboxConversation {
  const profile = profileFromConversation(row, state, appointment);
  const stageKey =
    profile?.stageKey ||
    state?.current_stage ||
    (classification?.label === "agendamento" ? "agendado" : null) ||
    "outros";
  const summary = presentationText(
    state?.last_ai_summary || classification?.ai_summary,
    profile?.summary || "A IA ainda nao registrou um resumo para esta conversa.",
    profile,
  );
  const action = presentationText(
    state?.next_recommended_action,
    profile?.action ||
      (appointment
      ? "Conferir detalhes da consulta na agenda."
        : "Acompanhar a proxima interacao antes de agir."),
    profile,
  );
  const updatedAt =
    state?.updated_at ||
    classification?.classified_at ||
    appointment?.appointment_at ||
    row.resolved_at ||
    row.started_at ||
    row.created_at;
  const phone = row.contacts?.phone || "";

  return {
    id: row.id,
    chatwootId: row.chatwoot_conversation_id,
    name: profile?.name || cleanText(row.contacts?.name, `Contato ${maskPhone(phone)}`),
    phone,
    maskedPhone: maskPhone(phone),
    status: row.status,
    stageKey,
    stage: profile?.stage || formatStage(stageKey),
    temperature: formatTemperature(state?.lead_temperature ?? null),
    lifecycle: formatTemperature(state?.lifecycle_status ?? null),
    summary,
    action,
    reason: presentationText(
      state?.reason,
      profile?.reason || "Sem justificativa registrada.",
      profile,
    ),
    time: formatRelativeTime(updatedAt),
    updatedAt,
    needsHumanAttention:
      Boolean(state?.needs_human_attention) ||
      stageKey === "precisa_humano" ||
      stageKey === "sem_resposta",
    classificationLabel: classification?.label
      ? CLASSIFICATION_LABELS[classification.label] ?? classification.label
      : "Nao classificada",
    classificationConfidence: confidenceLabel(classification?.confidence ?? null),
    specialty: classification?.specialty || appointment?.specialty || "ginecologia",
    appointmentTitle: appointment
      ? presentationTitle(appointment.title, profile?.appointmentTitle || "Consulta ginecologica")
      : profile?.appointmentTitle ?? null,
    appointmentAt: appointment
      ? formatDateTime(appointment.appointment_at)
      : profile?.appointmentAt ?? null,
    appointmentStatus: appointment?.status ?? profile?.appointmentStatus ?? null,
  };
}

function buildTimeline(
  selected: InboxConversation | null,
  state: StateRow | undefined,
  classification: ClassificationRow | undefined,
  appointment: AppointmentRow | undefined,
  events: EventRow[],
): InboxTimelineItem[] {
  if (!selected) return [];

  const timeline: InboxTimelineItem[] = events.map((event) => ({
    id: event.id,
    title: event.payload?.appointment_suggestion
      ? "Sugestao de agenda detectada"
      : hasPresentationLeak(event.title)
        ? EVENT_LABELS[event.event_type] || event.event_type
        : event.title || EVENT_LABELS[event.event_type] || event.event_type,
    body: presentationText(
      payloadText(event.payload),
      "Evento registrado no atendimento.",
      PRESENTATION_PATIENTS.find((profile) => profile.name === selected.name),
    ),
    meta: `${event.source} | ${formatDateTime(event.created_at)}`,
    tone: event.payload?.appointment_suggestion ? "success" : eventTone(event.event_type),
  }));

  if (state) {
    timeline.push({
      id: `state-${selected.id}`,
      title: selected.stage,
      body: selected.summary,
      meta: `Estado vivo | ${formatDateTime(state.updated_at)}`,
      tone: selected.needsHumanAttention ? "warning" : "info",
    });
  }

  if (classification) {
    timeline.push({
      id: `classification-${selected.id}`,
      title: `Classificacao: ${selected.classificationLabel}`,
      body: presentationText(
        classification.ai_summary,
        selected.summary,
        PRESENTATION_PATIENTS.find((profile) => profile.name === selected.name),
      ),
      meta: `IA | ${confidenceLabel(classification.confidence)} | ${formatDateTime(classification.classified_at)}`,
      tone: classification.label === "agendamento" ? "success" : "info",
    });
  }

  if (appointment) {
    timeline.push({
      id: `appointment-${selected.id}`,
      title: presentationTitle(appointment.title, "Consulta ginecologica"),
      body: presentationText(
        appointment.notes,
        "Consulta vinculada a esta conversa.",
        PRESENTATION_PATIENTS.find((profile) => profile.name === selected.name),
      ),
      meta: `Agenda ${appointment.source} | ${formatDateTime(appointment.appointment_at)}`,
      tone: "success",
    });
  }

  return timeline.sort((a, b) => b.meta.localeCompare(a.meta)).slice(0, 12);
}

function scriptedMessages(selected: InboxConversation): InboxMessage[] {
  if (selected.name === "Beatriz Saraiva") {
    return [
      {
        id: `script-${selected.id}-1`,
        author: "patient",
        authorLabel: "Paciente",
        body: "Tem horario disponivel com a Dra. Camila essa semana?",
        time: "10:14",
      },
      {
        id: `script-${selected.id}-2`,
        author: "ai",
        authorLabel: "Assistente IA",
        body: "Bom dia, Beatriz. Temos disponibilidade na sexta-feira por ordem de chegada das 13:00 as 17:00. O melhor horario de chegada para menor espera e 15:30. Deseja agendar?",
        time: "10:15",
      },
      {
        id: `script-${selected.id}-3`,
        author: "patient",
        authorLabel: "Paciente",
        body: "Sim, pode marcar para mim.",
        time: "10:17",
      },
      {
        id: `script-${selected.id}-4`,
        author: "ai",
        authorLabel: "Assistente IA",
        body: "Agendamento confirmado para sexta-feira, chegada as 15:30. Por favor, leve documento com foto e chegue alguns minutos antes para o cadastro.",
        time: "10:18",
      },
    ];
  }

  if (selected.name === "Renata Almeida") {
    return [
      {
        id: `script-${selected.id}-1`,
        author: "patient",
        authorLabel: "Paciente",
        body: "Oi, eu queria saber se consigo fazer um retorno com a Dra. Camila ainda essa semana.",
        time: "16:02",
      },
      {
        id: `script-${selected.id}-2`,
        author: "ai",
        authorLabel: "Assistente IA",
        body: "Boa tarde, Renata. Consigo verificar para voce. Para retorno, temos encaixe na quinta-feira as 14:20 ou sexta-feira por ordem de chegada entre 13:00 e 17:00. Qual fica melhor?",
        time: "16:03",
      },
      {
        id: `script-${selected.id}-3`,
        author: "patient",
        authorLabel: "Paciente",
        body: "Vou confirmar com meu trabalho e ja respondo.",
        time: "16:05",
      },
    ];
  }

  return [
    {
      id: `script-${selected.id}-1`,
      author: "patient",
      authorLabel: "Paciente",
      body: "Ola, gostaria de marcar uma consulta ginecologica com a Dra. Camila.",
      time: "14:08",
    },
    {
      id: `script-${selected.id}-2`,
      author: "ai",
      authorLabel: "Assistente IA",
      body: "Boa tarde, Pamela. Temos horarios disponiveis na sexta-feira por ordem de chegada das 13:00 as 17:00. Seu horario de chegada com menos tempo de espera e as 15:30. Deseja agendar?",
      time: "14:09",
    },
    {
      id: `script-${selected.id}-3`,
      author: "patient",
      authorLabel: "Paciente",
      body: "Pode ser as 15:30.",
      time: "14:11",
    },
    {
      id: `script-${selected.id}-4`,
      author: "ai",
      authorLabel: "Assistente IA",
      body: "Perfeito. Vou deixar pre-agendado para sexta-feira, chegada as 15:30. Pode me confirmar seu nome completo e data de nascimento?",
      time: "14:12",
    },
  ];
}

function buildMessages(
  selected: InboxConversation | null,
  appointment: AppointmentRow | undefined,
  events: EventRow[],
): InboxMessage[] {
  if (!selected) return [];
  const shouldUseScript =
    PRESENTATION_PATIENTS.some((profile) => profile.name === selected.name) ||
    hasPresentationLeak(selected.name) ||
    hasPresentationLeak(selected.summary) ||
    events.some(
      (event) =>
        hasPresentationLeak(event.title) ||
        hasPresentationLeak(payloadText(event.payload)) ||
        hasPresentationLeak(payloadMessageText(event.payload)),
    );

  if (shouldUseScript) return scriptedMessages(selected);

  const eventMessages = events
    .filter((event) => event.event_type === "message_created")
    .map((event) => {
      const author = payloadAuthor(event.payload);
      const body = payloadMessageText(event.payload);

      if (!body) return null;

      return {
        id: `message-${event.id}`,
        author,
        authorLabel: authorLabel(author),
        body,
        time: formatDateTime(event.created_at),
      } satisfies InboxMessage;
    })
    .filter((message): message is InboxMessage => Boolean(message))
    .reverse();

  if (eventMessages.length > 0) return eventMessages;

  if (appointment || selected.classificationLabel === "Agendamento") {
    return [
      {
        id: `synthetic-${selected.id}-1`,
        author: "patient",
        authorLabel: "Paciente",
        body: "Gostaria de marcar uma consulta.",
        time: "Inicio",
      },
      {
        id: `synthetic-${selected.id}-2`,
        author: "ai",
        authorLabel: "Assistente IA",
        body: selected.summary,
        time: "Leitura da IA",
      },
      {
        id: `synthetic-${selected.id}-3`,
        author: "system",
        authorLabel: "Agenda",
        body: appointment
          ? `${appointment.title} em ${formatDateTime(appointment.appointment_at)}.`
          : "Consulta identificada pela IA.",
        time: "CRM",
      },
    ];
  }

  return [
    {
      id: `synthetic-${selected.id}-summary`,
      author: "system",
      authorLabel: "Resumo operacional",
      body: selected.summary,
      time: "CRM",
    },
  ];
}

function applyFilter(conversations: InboxConversation[], filter: InboxFilter) {
  if (filter === "attention") {
    return conversations.filter(isPriorityConversation);
  }

  if (filter === "agendamentos") {
    return conversations.filter(
      (conversation) =>
        conversation.classificationLabel === "Agendamento" ||
        Boolean(conversation.appointmentTitle),
    );
  }

  if (filter === "sem_resposta") {
    return conversations.filter((conversation) => conversation.stageKey === "sem_resposta");
  }

  if (filter === "leads") {
    return conversations.filter(
      (conversation) =>
        conversation.classificationLabel === "Lead" ||
        conversation.stageKey === "lead_interessado",
    );
  }

  return conversations;
}

function isPriorityConversation(conversation: InboxConversation) {
  return (
    conversation.needsHumanAttention ||
    conversation.stageKey === "sem_resposta" ||
    conversation.stageKey === "precisa_humano" ||
    conversation.stageKey === "agendamento_em_andamento" ||
    conversation.stageKey === "aguardando_resposta"
  );
}

function applySearch(conversations: InboxConversation[], search: string) {
  const normalized = normalizeSearch(search);
  if (!normalized) return conversations;

  return conversations.filter((conversation) =>
    normalizeSearch(
      [
        conversation.name,
        conversation.phone,
        conversation.stage,
        conversation.classificationLabel,
        conversation.summary,
      ].join(" "),
    ).includes(normalized),
  );
}

export async function getInboxData(options: {
  filter?: string;
  selectedId?: string;
  search?: string;
  view?: "auralync" | "camila";
}): Promise<InboxData> {
  if (options.view === "auralync") {
    return fallbackData(options);
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return fallbackData(options);
  }

  try {
    const client = await getCurrentClient();
    if (!client) return fallbackData(options);

    const clientId = encodeURIComponent(client.id);
    const conversations = await supabaseFetch<ConversationRow[]>(
      `conversations?select=id,chatwoot_conversation_id,status,started_at,resolved_at,created_at,contacts(phone,name)&client_id=eq.${clientId}&order=created_at.desc&limit=80`,
    );
    const conversationIds = conversations.map((conversation) => conversation.id);

    if (!conversationIds.length) {
      return {
        clientName: client.name,
        source: "supabase",
        conversations: [],
        selected: null,
        timeline: [],
        counts: {
          all: 0,
          attention: 0,
          agendamentos: 0,
          semResposta: 0,
          leads: 0,
        },
        messages: [],
      };
    }

    const ids = inList(conversationIds);
    const [states, classifications, appointments, events] = await Promise.all([
      supabaseFetch<StateRow[]>(
        `conversation_states?select=conversation_id,current_stage,lead_temperature,lifecycle_status,needs_human_attention,last_ai_summary,next_recommended_action,reason,last_message_at,updated_at&client_id=eq.${clientId}&conversation_id=in.(${ids})&order=updated_at.desc`,
      ),
      supabaseFetch<ClassificationRow[]>(
        `conversation_classifications?select=conversation_id,label,specialty,ai_summary,confidence,classified_at&client_id=eq.${clientId}&conversation_id=in.(${ids})&order=classified_at.desc`,
      ),
      supabaseFetch<AppointmentRow[]>(
        `appointments?select=conversation_id,title,specialty,appointment_at,status,source,notes&client_id=eq.${clientId}&conversation_id=in.(${ids})&order=appointment_at.desc`,
      ),
      supabaseFetch<EventRow[]>(
        `conversation_events?select=id,conversation_id,event_type,source,title,payload,created_at&client_id=eq.${clientId}&conversation_id=in.(${ids})&order=created_at.desc&limit=150`,
      ),
    ]);

    const stateByConversation = new Map(states.map((state) => [state.conversation_id, state]));
    const classificationByConversation = new Map(
      classifications.map((classification) => [
        classification.conversation_id,
        classification,
      ]),
    );
    const appointmentByConversation = new Map(
      appointments
        .filter((appointment) => appointment.conversation_id)
        .map((appointment) => [appointment.conversation_id as string, appointment]),
    );
    const eventsByConversation = new Map<string, EventRow[]>();

    for (const event of events) {
      if (!event.conversation_id) continue;
      const current = eventsByConversation.get(event.conversation_id) ?? [];
      current.push(event);
      eventsByConversation.set(event.conversation_id, current);
    }

    const mappedConversations = conversations
      .map((conversation) =>
        buildConversation(
          conversation,
          stateByConversation.get(conversation.id),
          classificationByConversation.get(conversation.id),
          appointmentByConversation.get(conversation.id),
        ),
      )
      .sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );

    const filter = (options.filter || "all") as InboxFilter;
    const filtered = applySearch(applyFilter(mappedConversations, filter), options.search || "");
    const selected =
      filtered.find((conversation) => conversation.id === options.selectedId) ??
      filtered[0] ??
      mappedConversations.find((conversation) => conversation.id === options.selectedId) ??
      mappedConversations[0] ??
      null;

    const selectedState = selected ? stateByConversation.get(selected.id) : undefined;
    const selectedClassification = selected
      ? classificationByConversation.get(selected.id)
      : undefined;
    const selectedAppointment = selected
      ? appointmentByConversation.get(selected.id)
      : undefined;

    return {
      clientName: client.name,
      source: "supabase",
      conversations: filtered,
      selected,
      timeline: buildTimeline(
        selected,
        selectedState,
        selectedClassification,
        selectedAppointment,
        selected ? eventsByConversation.get(selected.id) ?? [] : [],
      ),
      messages: buildMessages(
        selected,
        selectedAppointment,
        selected ? eventsByConversation.get(selected.id) ?? [] : [],
      ),
      counts: {
        all: mappedConversations.length,
        attention: mappedConversations.filter(isPriorityConversation).length,
        agendamentos: mappedConversations.filter(
          (conversation) =>
            conversation.classificationLabel === "Agendamento" ||
            Boolean(conversation.appointmentTitle),
        ).length,
        semResposta: mappedConversations.filter(
          (conversation) => conversation.stageKey === "sem_resposta",
        ).length,
        leads: mappedConversations.filter(
          (conversation) =>
            conversation.classificationLabel === "Lead" ||
            conversation.stageKey === "lead_interessado",
        ).length,
      },
    };
  } catch (error) {
    console.error(error);
    return fallbackData(options);
  }
}

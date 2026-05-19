import { getCurrentClient, type CurrentClient } from "@/lib/current-client";

export type CalendarAppointment = {
  id: string;
  patient: string;
  phone: string;
  phoneRaw: string;
  title: string;
  specialty: string;
  notes: string;
  dayIndex: number;
  top: number;
  height: number;
  time: string;
  dateValue: string;
  timeValue: string;
  appointmentAtIso: string;
  durationMinutes: number;
  status: string;
  statusKey: string;
  source: string;
  color: string;
  syncStatus: string;
  syncLabel: string;
  googleEventLink: string | null;
};

type ClientRow = {
  id: string;
  name: string;
  email: string;
  evolution_instance: string;
  specialty: string;
};

type AppointmentRow = {
  id: string;
  client_id: string;
  patient_name: string;
  patient_phone: string | null;
  title: string;
  specialty: string | null;
  appointment_at: string;
  duration_minutes: number;
  status: string;
  source: string;
  notes: string | null;
  google_sync_status?: string | null;
  google_event_id?: string | null;
  google_event_link?: string | null;
  google_synced_at?: string | null;
};

const DEMO_CLIENT = {
  name: "Dra. Camila Guimarães Espindola",
  email: "demonstrativo@auralync.com",
  evolution_instance: "testes",
  specialty: "ginecologista",
  active: true,
};

const DEMO_CURRENT_CLIENT: CurrentClient = {
  id: "",
  name: DEMO_CLIENT.name,
  email: DEMO_CLIENT.email,
  evolutionInstance: DEMO_CLIENT.evolution_instance,
  specialty: DEMO_CLIENT.specialty,
  profileName: DEMO_CLIENT.name,
  role: "admin",
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-[#0b5d6b]",
  confirmed: "bg-[#0b5d6b]",
  cancelled: "bg-[#b42318]",
  completed: "bg-[#5b7f74]",
  no_show: "bg-[#b7791f]",
  blocked: "bg-[#b7791f]",
};

const fallbackAppointments: CalendarAppointment[] = [
  {
    id: "demo-1",
    patient: "Pamela dos Santos",
    phone: "5598••••8340",
    phoneRaw: "5598984668340",
    title: "Consulta ginecologica",
    specialty: "ginecologia",
    notes: "Solicitou consulta com a Dra. Camila e confirmou o horario sugerido pela recepcao.",
    dayIndex: 1,
    top: 88,
    height: 88,
    time: "09:00",
    dateValue: "2026-05-19",
    timeValue: "09:00",
    appointmentAtIso: "2026-05-19T12:00:00.000Z",
    durationMinutes: 50,
    status: "Confirmada",
    statusKey: "confirmed",
    source: "manual",
    color: "bg-[#0b5d6b]",
    syncStatus: "not_configured",
    syncLabel: "Google nao conectado",
    googleEventLink: null,
  },
  {
    id: "demo-2",
    patient: "Beatriz Saraiva",
    phone: "5598••••9401",
    phoneRaw: "5598985989401",
    title: "Retorno ginecologico",
    specialty: "ginecologia",
    notes: "Paciente ja atendida anteriormente, em acompanhamento de retorno.",
    dayIndex: 2,
    top: 244,
    height: 86,
    time: "11:30",
    dateValue: "2026-05-20",
    timeValue: "11:30",
    appointmentAtIso: "2026-05-20T14:30:00.000Z",
    durationMinutes: 50,
    status: "Aguardando confirmação",
    statusKey: "scheduled",
    source: "manual",
    color: "bg-[#5b7f74]",
    syncStatus: "not_configured",
    syncLabel: "Google nao conectado",
    googleEventLink: null,
  },
  {
    id: "demo-3",
    patient: "Bloqueio manual",
    phone: "agenda",
    phoneRaw: "",
    title: "Horário reservado",
    specialty: "agenda",
    notes: "Horario reservado internamente pela equipe.",
    dayIndex: 4,
    top: 404,
    height: 72,
    time: "14:00",
    dateValue: "2026-05-22",
    timeValue: "14:00",
    appointmentAtIso: "2026-05-22T17:00:00.000Z",
    durationMinutes: 45,
    status: "Interno",
    statusKey: "blocked",
    source: "manual",
    color: "bg-[#b7791f]",
    syncStatus: "not_configured",
    syncLabel: "Google nao conectado",
    googleEventLink: null,
  },
];

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment is not configured.");
  }

  return { url, key };
}

async function supabaseFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `Supabase request failed: ${response.status}`);
  }

  return (text ? JSON.parse(text) : null) as T;
}

export async function ensureDemoClinicClient() {
  const clients = await supabaseFetch<ClientRow[]>(
    "clients?select=id,name,email,evolution_instance,specialty&evolution_instance=eq.testes&limit=1",
  );

  if (clients[0]) return clients[0];

  const [client] = await supabaseFetch<ClientRow[]>(
    "clients?on_conflict=evolution_instance",
    {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(DEMO_CLIENT),
    },
  );

  return client;
}

function maskPhone(phone: string | null) {
  if (!phone) return "sem telefone";
  if (phone.length <= 8) return phone;
  return `${phone.slice(0, 4)}••••${phone.slice(-4)}`;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Fortaleza",
  }).format(new Date(value));
}

function dateValue(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Fortaleza",
  }).format(new Date(value));
}

function dayIndexForWeek(value: string) {
  const date = new Date(value);
  const jsDay = Number(
    new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      timeZone: "America/Fortaleza",
    })
      .format(date)
      .replace("Mon", "1")
      .replace("Tue", "2")
      .replace("Wed", "3")
      .replace("Thu", "4")
      .replace("Fri", "5")
      .replace("Sat", "6")
      .replace("Sun", "0"),
  );

  return Math.max(jsDay - 1, 0);
}

function topForTime(value: string) {
  const parts = formatTime(value).split(":");
  const hour = Number(parts[0]);
  const minute = Number(parts[1]);
  return Math.max((hour - 8) * 80 + (minute / 60) * 80 + 8, 8);
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    scheduled: "Agendada",
    confirmed: "Confirmada",
    cancelled: "Cancelada",
    completed: "Concluída",
    no_show: "Não compareceu",
    blocked: "Bloqueio",
  };

  return labels[status] ?? status;
}

function syncStatusLabel(row: AppointmentRow) {
  if (row.google_event_id && row.google_sync_status === "synced") {
    return "Google sincronizado";
  }

  const labels: Record<string, string> = {
    not_configured: "Google nao conectado",
    pending: "Google pendente",
    synced: "Google sincronizado",
    failed: "Google falhou",
    disabled: "Google desligado",
  };

  return labels[row.google_sync_status || "not_configured"] ?? "Google nao conectado";
}

function hasPresentationLeak(value: string | null | undefined) {
  return /auralync|demonstrativo|demonstra|teste crm|teste controlado|ia atualizada/i.test(
    String(value || ""),
  );
}

function presentationPatient(row: AppointmentRow) {
  if (
    hasPresentationLeak(row.patient_name) ||
    hasPresentationLeak(row.title) ||
    hasPresentationLeak(row.notes) ||
    row.patient_phone === "5598984668340"
  ) {
    return row.status === "confirmed" || row.title.toLowerCase().includes("primeira")
      ? "Pamela dos Santos"
      : "Beatriz Saraiva";
  }

  return row.patient_name;
}

function presentationTitle(row: AppointmentRow) {
  if (hasPresentationLeak(row.title)) return "Consulta ginecologica";
  return row.title.replace(/\s+-\s+IA$/i, "").replace(/\s+IA$/i, "").trim() || "Consulta";
}

function presentationNotes(row: AppointmentRow) {
  if (hasPresentationLeak(row.notes) || hasPresentationLeak(row.title)) {
    return row.status === "confirmed"
      ? "Paciente solicitou consulta ginecologica com a Dra. Camila e confirmou o horario sugerido."
      : "Paciente perguntou sobre disponibilidade nesta semana e recebeu orientacao de chegada.";
  }

  return row.notes ?? "";
}

function mapAppointment(row: AppointmentRow): CalendarAppointment {
  return {
    id: row.id,
    patient: presentationPatient(row),
    phone: maskPhone(row.patient_phone),
    phoneRaw: row.patient_phone ?? "",
    title: presentationTitle(row),
    specialty: row.specialty ?? "",
    notes: presentationNotes(row),
    dayIndex: dayIndexForWeek(row.appointment_at),
    top: topForTime(row.appointment_at),
    height: Math.max((row.duration_minutes / 60) * 80, 48),
    time: formatTime(row.appointment_at),
    dateValue: dateValue(row.appointment_at),
    timeValue: formatTime(row.appointment_at),
    appointmentAtIso: new Date(row.appointment_at).toISOString(),
    durationMinutes: row.duration_minutes,
    status: statusLabel(row.status),
    statusKey: row.status,
    source: row.source,
    color: STATUS_COLORS[row.status] ?? STATUS_COLORS.scheduled,
    syncStatus: row.google_sync_status || "not_configured",
    syncLabel: syncStatusLabel(row),
    googleEventLink: row.google_event_link ?? null,
  };
}

export async function getCalendarAppointments(): Promise<{
  appointments: CalendarAppointment[];
  source: "supabase" | "demo";
  client: Pick<CurrentClient, "name" | "specialty">;
}> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      appointments: fallbackAppointments,
      source: "demo",
      client: DEMO_CURRENT_CLIENT,
    };
  }

  try {
    const client = await getCurrentClient();

    if (!client) {
      return {
        appointments: fallbackAppointments,
        source: "demo",
        client: DEMO_CURRENT_CLIENT,
      };
    }

    const rows = await supabaseFetch<AppointmentRow[]>(
      `appointments?select=*&client_id=eq.${encodeURIComponent(client.id)}&order=appointment_at.asc&limit=30`,
    );

    return {
      appointments: rows.length > 0 ? rows.map(mapAppointment) : fallbackAppointments,
      source: rows.length > 0 ? "supabase" : "demo",
      client,
    };
  } catch (error) {
    console.error(error);
    return {
      appointments: fallbackAppointments,
      source: "demo",
      client: DEMO_CURRENT_CLIENT,
    };
  }
}

export async function createAppointment(input: {
  patientName: string;
  patientPhone: string;
  title: string;
  specialty: string;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  notes?: string;
  status?: "scheduled" | "blocked";
}) {
  const client = await getCurrentClient();
  if (!client) {
    throw new Error("Sessao obrigatoria para criar horario.");
  }

  const appointmentAt = `${input.appointmentDate}T${input.appointmentTime}:00-03:00`;
  const status = input.status ?? "scheduled";

  const [appointment] = await supabaseFetch<AppointmentRow[]>(
    "appointments?select=*",
    {
      method: "POST",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        client_id: client.id,
        patient_name: status === "blocked" ? "Bloqueio manual" : input.patientName,
        patient_phone: input.patientPhone,
        title: input.title || "Consulta",
        specialty: input.specialty || (status === "blocked" ? "agenda" : "ginecologia"),
        appointment_at: appointmentAt,
        duration_minutes: input.durationMinutes,
        status,
        source: "manual",
        notes: input.notes || null,
      }),
    },
  );

  return mapAppointment(appointment);
}

const ACTIVE_GOOGLE_STATUSES = new Set([
  "scheduled",
  "confirmed",
  "blocked",
  "completed",
  "no_show",
]);

function nextGoogleSyncStatus(current: AppointmentRow, nextStatus: string) {
  if (current.google_event_id) return "pending";
  if (ACTIVE_GOOGLE_STATUSES.has(nextStatus)) return "not_configured";
  return "disabled";
}

async function getAppointmentForCurrentClient(appointmentId: string) {
  const client = await getCurrentClient();
  if (!client) {
    throw new Error("Sessao obrigatoria para alterar horario.");
  }

  const rows = await supabaseFetch<AppointmentRow[]>(
    `appointments?select=*&id=eq.${encodeURIComponent(appointmentId)}&client_id=eq.${encodeURIComponent(client.id)}&limit=1`,
  );

  if (!rows[0]) {
    throw new Error("Horario nao encontrado para este cliente.");
  }

  return rows[0];
}

export async function updateAppointment(input: {
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  title: string;
  specialty: string;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  notes?: string;
}) {
  const current = await getAppointmentForCurrentClient(input.appointmentId);
  const appointmentAt = `${input.appointmentDate}T${input.appointmentTime}:00-03:00`;

  const [appointment] = await supabaseFetch<AppointmentRow[]>(
    `appointments?select=*&id=eq.${encodeURIComponent(input.appointmentId)}&client_id=eq.${encodeURIComponent(current.client_id)}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        patient_name:
          current.status === "blocked" ? "Bloqueio manual" : input.patientName,
        patient_phone: input.patientPhone,
        title: input.title || "Consulta",
        specialty: input.specialty || "ginecologia",
        appointment_at: appointmentAt,
        duration_minutes: input.durationMinutes,
        notes: input.notes || null,
        google_sync_status: nextGoogleSyncStatus(current, current.status),
        google_sync_error: null,
      }),
    },
  );

  return mapAppointment(appointment);
}

export async function updateAppointmentStatus(input: {
  appointmentId: string;
  status: "scheduled" | "confirmed" | "cancelled" | "completed" | "no_show" | "blocked";
}) {
  const current = await getAppointmentForCurrentClient(input.appointmentId);

  const [appointment] = await supabaseFetch<AppointmentRow[]>(
    `appointments?select=*&id=eq.${encodeURIComponent(input.appointmentId)}&client_id=eq.${encodeURIComponent(current.client_id)}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        status: input.status,
        google_sync_status: nextGoogleSyncStatus(current, input.status),
        google_sync_error: null,
      }),
    },
  );

  return mapAppointment(appointment);
}

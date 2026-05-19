import { getCurrentClient, type CurrentClient } from "@/lib/current-client";

export type ClinicSettings = {
  displayName: string;
  specialty: string;
  contactEmail: string;
  evolutionInstance: string;
  timezone: string;
  weekdayStart: string;
  weekdayEnd: string;
  saturdayEnabled: boolean;
  saturdayStart: string;
  saturdayEnd: string;
  defaultAppointmentDuration: number;
  appointmentBufferMinutes: number;
  notifyNewAppointment: boolean;
  notifyNoResponse: boolean;
  notifyHumanHandoff: boolean;
  notifyIntegrationFailure: boolean;
  aiHandoffThreshold: number;
  autoSyncGoogleCalendar: boolean;
  updatedAt: string | null;
};

export type SettingsPayload = {
  client: CurrentClient;
  settings: ClinicSettings;
  source: "supabase" | "default";
  schemaReady: boolean;
};

type ClinicSettingsRow = {
  client_id: string;
  display_name: string | null;
  specialty: string | null;
  contact_email: string | null;
  timezone: string | null;
  weekday_start: string | null;
  weekday_end: string | null;
  saturday_enabled: boolean | null;
  saturday_start: string | null;
  saturday_end: string | null;
  default_appointment_duration: number | null;
  appointment_buffer_minutes: number | null;
  notify_new_appointment: boolean | null;
  notify_no_response: boolean | null;
  notify_human_handoff: boolean | null;
  notify_integration_failure: boolean | null;
  ai_handoff_threshold: number | null;
  auto_sync_google_calendar: boolean | null;
  updated_at: string | null;
};

type UpdateClinicSettingsInput = {
  displayName: string;
  specialty: string;
  contactEmail: string;
  timezone: string;
  weekdayStart: string;
  weekdayEnd: string;
  saturdayEnabled: boolean;
  saturdayStart: string;
  saturdayEnd: string;
  defaultAppointmentDuration: number;
  appointmentBufferMinutes: number;
  notifyNewAppointment: boolean;
  notifyNoResponse: boolean;
  notifyHumanHandoff: boolean;
  notifyIntegrationFailure: boolean;
  aiHandoffThreshold: number;
  autoSyncGoogleCalendar: boolean;
};

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

function normalizeTime(value: string | null | undefined, fallback: string) {
  if (!value) return fallback;
  return value.slice(0, 5);
}

function clampNumber(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(Math.max(Math.round(value), min), max);
}

function clampDecimal(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}

function defaultSettings(client: CurrentClient): ClinicSettings {
  return {
    displayName: client.name,
    specialty: client.specialty,
    contactEmail: client.email,
    evolutionInstance: client.evolutionInstance,
    timezone: "America/Fortaleza",
    weekdayStart: "08:00",
    weekdayEnd: "18:00",
    saturdayEnabled: true,
    saturdayStart: "08:00",
    saturdayEnd: "12:00",
    defaultAppointmentDuration: 50,
    appointmentBufferMinutes: 10,
    notifyNewAppointment: true,
    notifyNoResponse: true,
    notifyHumanHandoff: true,
    notifyIntegrationFailure: true,
    aiHandoffThreshold: 0.7,
    autoSyncGoogleCalendar: true,
    updatedAt: null,
  };
}

function mapSettings(row: ClinicSettingsRow, client: CurrentClient): ClinicSettings {
  return {
    displayName: row.display_name || client.name,
    specialty: row.specialty || client.specialty,
    contactEmail: row.contact_email || client.email,
    evolutionInstance: client.evolutionInstance,
    timezone: row.timezone || "America/Fortaleza",
    weekdayStart: normalizeTime(row.weekday_start, "08:00"),
    weekdayEnd: normalizeTime(row.weekday_end, "18:00"),
    saturdayEnabled: row.saturday_enabled ?? true,
    saturdayStart: normalizeTime(row.saturday_start, "08:00"),
    saturdayEnd: normalizeTime(row.saturday_end, "12:00"),
    defaultAppointmentDuration: row.default_appointment_duration ?? 50,
    appointmentBufferMinutes: row.appointment_buffer_minutes ?? 10,
    notifyNewAppointment: row.notify_new_appointment ?? true,
    notifyNoResponse: row.notify_no_response ?? true,
    notifyHumanHandoff: row.notify_human_handoff ?? true,
    notifyIntegrationFailure: row.notify_integration_failure ?? true,
    aiHandoffThreshold: row.ai_handoff_threshold ?? 0.7,
    autoSyncGoogleCalendar: row.auto_sync_google_calendar ?? true,
    updatedAt: row.updated_at,
  };
}

export async function getClinicSettings(): Promise<SettingsPayload | null> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  const client = await getCurrentClient();
  if (!client) return null;

  try {
    const rows = await supabaseFetch<ClinicSettingsRow[]>(
      `clinic_settings?select=*&client_id=eq.${encodeURIComponent(client.id)}&limit=1`,
    );

    if (!rows[0]) {
      return {
        client,
        settings: defaultSettings(client),
        source: "default",
        schemaReady: true,
      };
    }

    return {
      client,
      settings: mapSettings(rows[0], client),
      source: "supabase",
      schemaReady: true,
    };
  } catch (error) {
    console.error(error);
    return {
      client,
      settings: defaultSettings(client),
      source: "default",
      schemaReady: false,
    };
  }
}

export async function updateClinicSettings(input: UpdateClinicSettingsInput) {
  const client = await getCurrentClient();
  if (!client) {
    throw new Error("Sessao obrigatoria para alterar ajustes.");
  }

  const cleanInput = {
    displayName: input.displayName.trim() || client.name,
    specialty: input.specialty.trim() || client.specialty,
    contactEmail: input.contactEmail.trim() || client.email,
    timezone: input.timezone.trim() || "America/Fortaleza",
    weekdayStart: normalizeTime(input.weekdayStart, "08:00"),
    weekdayEnd: normalizeTime(input.weekdayEnd, "18:00"),
    saturdayEnabled: input.saturdayEnabled,
    saturdayStart: normalizeTime(input.saturdayStart, "08:00"),
    saturdayEnd: normalizeTime(input.saturdayEnd, "12:00"),
    defaultAppointmentDuration: clampNumber(
      input.defaultAppointmentDuration,
      5,
      480,
      50,
    ),
    appointmentBufferMinutes: clampNumber(
      input.appointmentBufferMinutes,
      0,
      180,
      10,
    ),
    notifyNewAppointment: input.notifyNewAppointment,
    notifyNoResponse: input.notifyNoResponse,
    notifyHumanHandoff: input.notifyHumanHandoff,
    notifyIntegrationFailure: input.notifyIntegrationFailure,
    aiHandoffThreshold: clampDecimal(input.aiHandoffThreshold, 0, 1, 0.7),
    autoSyncGoogleCalendar: input.autoSyncGoogleCalendar,
  };

  const [settings] = await supabaseFetch<ClinicSettingsRow[]>(
    "clinic_settings?on_conflict=client_id&select=*",
    {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({
        client_id: client.id,
        display_name: cleanInput.displayName,
        specialty: cleanInput.specialty,
        contact_email: cleanInput.contactEmail,
        timezone: cleanInput.timezone,
        weekday_start: cleanInput.weekdayStart,
        weekday_end: cleanInput.weekdayEnd,
        saturday_enabled: cleanInput.saturdayEnabled,
        saturday_start: cleanInput.saturdayStart,
        saturday_end: cleanInput.saturdayEnd,
        default_appointment_duration: cleanInput.defaultAppointmentDuration,
        appointment_buffer_minutes: cleanInput.appointmentBufferMinutes,
        notify_new_appointment: cleanInput.notifyNewAppointment,
        notify_no_response: cleanInput.notifyNoResponse,
        notify_human_handoff: cleanInput.notifyHumanHandoff,
        notify_integration_failure: cleanInput.notifyIntegrationFailure,
        ai_handoff_threshold: cleanInput.aiHandoffThreshold,
        auto_sync_google_calendar: cleanInput.autoSyncGoogleCalendar,
      }),
    },
  );

  await supabaseFetch(
    `clients?id=eq.${encodeURIComponent(client.id)}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        name: cleanInput.displayName,
        specialty: cleanInput.specialty,
      }),
    },
  );

  return mapSettings(settings, {
    ...client,
    name: cleanInput.displayName,
    specialty: cleanInput.specialty,
  });
}

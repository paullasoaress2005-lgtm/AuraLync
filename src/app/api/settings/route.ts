import { NextRequest, NextResponse } from "next/server";
import { getClinicSettings, updateClinicSettings } from "@/lib/settings";
import { isRateLimited, rateLimitResponse, safeEmail, safeText } from "@/lib/security";

function formBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

export async function GET() {
  const data = await getClinicSettings();

  if (!data) {
    return NextResponse.json(
      { ok: false, error: "Sessao obrigatoria." },
      { status: 401 },
    );
  }

  return NextResponse.json({ ok: true, ...data });
}

export async function PATCH(request: NextRequest) {
  try {
    if (isRateLimited(request, "settings:patch", 40, 60 * 1000)) {
      return rateLimitResponse();
    }

    const formData = await request.formData();
    const settings = await updateClinicSettings({
      displayName: safeText(formData.get("displayName"), 120),
      specialty: safeText(formData.get("specialty"), 80),
      contactEmail: safeEmail(formData.get("contactEmail")),
      timezone: safeText(formData.get("timezone") ?? "America/Fortaleza", 80),
      weekdayStart: safeText(formData.get("weekdayStart") ?? "08:00", 10),
      weekdayEnd: safeText(formData.get("weekdayEnd") ?? "18:00", 10),
      saturdayEnabled: formBoolean(formData, "saturdayEnabled"),
      saturdayStart: safeText(formData.get("saturdayStart") ?? "08:00", 10),
      saturdayEnd: safeText(formData.get("saturdayEnd") ?? "12:00", 10),
      defaultAppointmentDuration: Number(
        formData.get("defaultAppointmentDuration") ?? 50,
      ),
      appointmentBufferMinutes: Number(
        formData.get("appointmentBufferMinutes") ?? 10,
      ),
      notifyNewAppointment: formBoolean(formData, "notifyNewAppointment"),
      notifyNoResponse: formBoolean(formData, "notifyNoResponse"),
      notifyHumanHandoff: formBoolean(formData, "notifyHumanHandoff"),
      notifyIntegrationFailure: formBoolean(formData, "notifyIntegrationFailure"),
      aiHandoffThreshold: Number(formData.get("aiHandoffThreshold") ?? 0.7),
      autoSyncGoogleCalendar: formBoolean(formData, "autoSyncGoogleCalendar"),
    });

    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Nao foi possivel salvar os ajustes.";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

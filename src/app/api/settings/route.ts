import { NextRequest, NextResponse } from "next/server";
import { getClinicSettings, updateClinicSettings } from "@/lib/settings";

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
    const formData = await request.formData();
    const settings = await updateClinicSettings({
      displayName: String(formData.get("displayName") ?? "").trim(),
      specialty: String(formData.get("specialty") ?? "").trim(),
      contactEmail: String(formData.get("contactEmail") ?? "").trim(),
      timezone: String(formData.get("timezone") ?? "America/Fortaleza").trim(),
      weekdayStart: String(formData.get("weekdayStart") ?? "08:00").trim(),
      weekdayEnd: String(formData.get("weekdayEnd") ?? "18:00").trim(),
      saturdayEnabled: formBoolean(formData, "saturdayEnabled"),
      saturdayStart: String(formData.get("saturdayStart") ?? "08:00").trim(),
      saturdayEnd: String(formData.get("saturdayEnd") ?? "12:00").trim(),
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

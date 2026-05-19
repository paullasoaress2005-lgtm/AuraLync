import { NextRequest, NextResponse } from "next/server";
import {
  createAppointment,
  getCalendarAppointments,
  updateAppointment,
  updateAppointmentStatus,
} from "@/lib/appointments";
import { isRateLimited, rateLimitResponse, safeText } from "@/lib/security";

export async function GET() {
  const data = await getCalendarAppointments();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(request, "appointments:write", 80, 60 * 1000)) {
      return rateLimitResponse();
    }

    const formData = await request.formData();
    const action = safeText(formData.get("action") ?? "create", 30);
    const patientName = safeText(formData.get("patientName"), 120);
    const patientPhone = safeText(formData.get("patientPhone"), 32).replace(/\D/g, "");
    const title = safeText(formData.get("title") ?? "Consulta", 160);
    const specialty = safeText(formData.get("specialty") ?? "ginecologia", 80);
    const appointmentDate = safeText(formData.get("appointmentDate"), 20);
    const appointmentTime = safeText(formData.get("appointmentTime"), 10);
    const durationMinutes = Number(formData.get("durationMinutes") ?? 50);
    const notes = safeText(formData.get("notes"), 1000);

    if (action === "block") {
      if (!appointmentDate || !appointmentTime) {
        return NextResponse.json(
          { ok: false, error: "Preencha data e horario do bloqueio." },
          { status: 400 },
        );
      }

      const appointment = await createAppointment({
        patientName: "Bloqueio manual",
        patientPhone: "",
        title: title || "Bloqueio manual",
        specialty: specialty || "agenda",
        appointmentDate,
        appointmentTime,
        durationMinutes: Number.isFinite(durationMinutes) ? durationMinutes : 50,
        notes,
        status: "blocked",
      });

      return NextResponse.json({ ok: true, appointment });
    }

    if (!patientName || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { ok: false, error: "Preencha paciente, data e horário." },
        { status: 400 },
      );
    }

    const appointment = await createAppointment({
      patientName,
      patientPhone,
      title,
      specialty,
      appointmentDate,
      appointmentTime,
      durationMinutes: Number.isFinite(durationMinutes) ? durationMinutes : 50,
      notes,
    });

    return NextResponse.json({ ok: true, appointment });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar o horário.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (isRateLimited(request, "appointments:write", 80, 60 * 1000)) {
      return rateLimitResponse();
    }

    const formData = await request.formData();
    const action = safeText(formData.get("action") ?? "update", 30);
    const appointmentId = safeText(formData.get("appointmentId"), 80);

    if (!appointmentId) {
      return NextResponse.json(
        { ok: false, error: "Horario nao informado." },
        { status: 400 },
      );
    }

    if (action === "status") {
      const status = safeText(formData.get("status"), 30);
      const allowed = [
        "scheduled",
        "confirmed",
        "cancelled",
        "completed",
        "no_show",
        "blocked",
      ] as const;

      if (!allowed.includes(status as (typeof allowed)[number])) {
        return NextResponse.json(
          { ok: false, error: "Status invalido." },
          { status: 400 },
        );
      }

      const appointment = await updateAppointmentStatus({
        appointmentId,
        status: status as (typeof allowed)[number],
      });

      return NextResponse.json({ ok: true, appointment });
    }

    const patientName = safeText(formData.get("patientName"), 120);
    const patientPhone = safeText(formData.get("patientPhone"), 32).replace(/\D/g, "");
    const title = safeText(formData.get("title") ?? "Consulta", 160);
    const specialty = safeText(formData.get("specialty") ?? "ginecologia", 80);
    const appointmentDate = safeText(formData.get("appointmentDate"), 20);
    const appointmentTime = safeText(formData.get("appointmentTime"), 10);
    const durationMinutes = Number(formData.get("durationMinutes") ?? 50);
    const notes = safeText(formData.get("notes"), 1000);

    if (!patientName || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { ok: false, error: "Preencha paciente, data e horario." },
        { status: 400 },
      );
    }

    const appointment = await updateAppointment({
      appointmentId,
      patientName,
      patientPhone,
      title,
      specialty,
      appointmentDate,
      appointmentTime,
      durationMinutes: Number.isFinite(durationMinutes) ? durationMinutes : 50,
      notes,
    });

    return NextResponse.json({ ok: true, appointment });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Nao foi possivel alterar o horario.",
      },
      { status: 500 },
    );
  }
}

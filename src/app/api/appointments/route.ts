import { NextRequest, NextResponse } from "next/server";
import {
  createAppointment,
  getCalendarAppointments,
  updateAppointment,
  updateAppointmentStatus,
} from "@/lib/appointments";

export async function GET() {
  const data = await getCalendarAppointments();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const action = String(formData.get("action") ?? "create").trim();
    const patientName = String(formData.get("patientName") ?? "").trim();
    const patientPhone = String(formData.get("patientPhone") ?? "").replace(/\D/g, "");
    const title = String(formData.get("title") ?? "Consulta").trim();
    const specialty = String(formData.get("specialty") ?? "ginecologia").trim();
    const appointmentDate = String(formData.get("appointmentDate") ?? "").trim();
    const appointmentTime = String(formData.get("appointmentTime") ?? "").trim();
    const durationMinutes = Number(formData.get("durationMinutes") ?? 50);
    const notes = String(formData.get("notes") ?? "").trim();

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
    const formData = await request.formData();
    const action = String(formData.get("action") ?? "update").trim();
    const appointmentId = String(formData.get("appointmentId") ?? "").trim();

    if (!appointmentId) {
      return NextResponse.json(
        { ok: false, error: "Horario nao informado." },
        { status: 400 },
      );
    }

    if (action === "status") {
      const status = String(formData.get("status") ?? "").trim();
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

    const patientName = String(formData.get("patientName") ?? "").trim();
    const patientPhone = String(formData.get("patientPhone") ?? "").replace(/\D/g, "");
    const title = String(formData.get("title") ?? "Consulta").trim();
    const specialty = String(formData.get("specialty") ?? "ginecologia").trim();
    const appointmentDate = String(formData.get("appointmentDate") ?? "").trim();
    const appointmentTime = String(formData.get("appointmentTime") ?? "").trim();
    const durationMinutes = Number(formData.get("durationMinutes") ?? 50);
    const notes = String(formData.get("notes") ?? "").trim();

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

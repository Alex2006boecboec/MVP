import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  model: z.string().min(2).max(120),
  serialNumber: z.string().min(2).max(64),
  stationId: z.string().min(1),
  pricePerHour: z.number().min(0).max(10000),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 },
    );
  }

  const station = await prisma.station.findUnique({
    where: { id: parsed.data.stationId },
    include: { _count: { select: { players: true } } },
  });
  if (!station) {
    return NextResponse.json({ error: "Станция не найдена" }, { status: 404 });
  }
  if (station._count.players >= station.capacity) {
    return NextResponse.json({ error: "Станция заполнена" }, { status: 400 });
  }

  const existing = await prisma.player.findUnique({
    where: { serialNumber: parsed.data.serialNumber },
  });
  if (existing) {
    return NextResponse.json({ error: "Плеер с таким серийником уже существует" }, { status: 409 });
  }

  const player = await prisma.player.create({
    data: {
      model: parsed.data.model,
      serialNumber: parsed.data.serialNumber,
      stationId: parsed.data.stationId,
      pricePerHour: parsed.data.pricePerHour,
      batteryLevel: 100,
      status: "AVAILABLE",
    },
  });
  return NextResponse.json({ ok: true, player });
}

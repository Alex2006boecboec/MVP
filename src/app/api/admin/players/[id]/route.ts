import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const patchSchema = z.object({
  status: z.enum(["AVAILABLE", "RENTED", "MAINTENANCE"]).optional(),
  batteryLevel: z.number().int().min(0).max(100).optional(),
  pricePerHour: z.number().min(0).max(10000).optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const player = await prisma.player.findUnique({ where: { id: params.id } });
  if (!player) {
    return NextResponse.json({ error: "Плеер не найден" }, { status: 404 });
  }
  if (player.status === "RENTED") {
    return NextResponse.json(
      { error: "Нельзя менять статус плеера, находящегося в аренде" },
      { status: 400 },
    );
  }

  const updated = await prisma.player.update({
    where: { id: params.id },
    data: parsed.data,
  });
  return NextResponse.json({ ok: true, player: updated });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const activeRental = await prisma.rental.findFirst({
    where: { playerId: params.id, status: "ACTIVE" },
  });
  if (activeRental) {
    return NextResponse.json({ error: "Плеер сейчас в аренде" }, { status: 400 });
  }

  await prisma.rental.deleteMany({ where: { playerId: params.id } });
  await prisma.player.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

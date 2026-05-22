import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { calculateCost, toNumber } from "@/lib/money";

const schema = z.object({
  endStationId: z.string().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Не указана станция возврата" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const rental = await tx.rental.findUnique({
        where: { id: params.id },
        include: { player: true },
      });
      if (!rental) throw new Error("Аренда не найдена");
      if (rental.userId !== user.id) throw new Error("Это не ваша аренда");
      if (rental.status !== "ACTIVE") throw new Error("Аренда уже завершена");

      const endStation = await tx.station.findUnique({
        where: { id: parsed.data.endStationId },
        include: { _count: { select: { players: true } } },
      });
      if (!endStation) throw new Error("Станция возврата не найдена");
      if (endStation._count.players >= endStation.capacity) {
        throw new Error("Станция возврата заполнена. Выберите другую.");
      }

      const endedAt = new Date();
      const cost = calculateCost(rental.startedAt, endedAt, rental.player.pricePerHour);
      const newBalance = Math.max(toNumber(user.balance) - cost, 0);

      await tx.user.update({
        where: { id: user.id },
        data: { balance: newBalance },
      });

      await tx.player.update({
        where: { id: rental.playerId },
        data: {
          status: "AVAILABLE",
          stationId: endStation.id,
          batteryLevel: Math.max(rental.player.batteryLevel - 10, 5),
        },
      });

      const updated = await tx.rental.update({
        where: { id: rental.id },
        data: {
          status: "COMPLETED",
          endedAt,
          endStationId: endStation.id,
          totalCost: cost,
        },
      });

      return { rental: updated, cost, newBalance };
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка возврата";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

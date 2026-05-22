import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { toNumber } from "@/lib/money";

const schema = z.object({
  playerId: z.string().min(1),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  try {
    const rental = await prisma.$transaction(async (tx) => {
      const activeRental = await tx.rental.findFirst({
        where: { userId: user.id, status: "ACTIVE" },
      });
      if (activeRental) {
        throw new Error("У вас уже есть активная аренда");
      }

      const player = await tx.player.findUnique({
        where: { id: parsed.data.playerId },
        include: { station: true },
      });
      if (!player) {
        throw new Error("Плеер не найден");
      }
      if (player.status !== "AVAILABLE") {
        throw new Error("Плеер уже не доступен");
      }
      if (!player.stationId || !player.station) {
        throw new Error("Плеер не привязан к станции");
      }

      const userBalance = toNumber(user.balance);
      const price = toNumber(player.pricePerHour);
      if (userBalance < price) {
        throw new Error(
          `Недостаточно средств. Нужно минимум ${price} ₽ для гарантии оплаты первого часа`,
        );
      }

      const newRental = await tx.rental.create({
        data: {
          userId: user.id,
          playerId: player.id,
          startStationId: player.stationId,
          status: "ACTIVE",
        },
      });

      await tx.player.update({
        where: { id: player.id },
        data: { status: "RENTED", stationId: null },
      });

      return newRental;
    });

    return NextResponse.json({ ok: true, rentalId: rental.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Не удалось взять плеер";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

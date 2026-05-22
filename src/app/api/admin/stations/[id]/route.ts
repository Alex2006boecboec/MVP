import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const players = await tx.player.findMany({ where: { stationId: params.id } });
      const playerIds = players.map((p) => p.id);
      const activeRentals = await tx.rental.count({
        where: { playerId: { in: playerIds }, status: "ACTIVE" },
      });
      if (activeRentals > 0) {
        throw new Error("На станции есть плееры в активной аренде");
      }
      await tx.player.deleteMany({ where: { stationId: params.id } });
      await tx.station.delete({ where: { id: params.id } });
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка удаления";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

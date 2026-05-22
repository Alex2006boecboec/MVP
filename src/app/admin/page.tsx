import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import AdminStations from "./AdminStations";
import AdminPlayers from "./AdminPlayers";
import { toNumber } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  const [stations, players] = await Promise.all([
    prisma.station.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { players: true } } },
    }),
    prisma.player.findMany({
      orderBy: { createdAt: "desc" },
      include: { station: true },
    }),
  ]);

  const playersSerialized = players.map((p) => ({
    id: p.id,
    model: p.model,
    serialNumber: p.serialNumber,
    batteryLevel: p.batteryLevel,
    status: p.status,
    pricePerHour: toNumber(p.pricePerHour),
    stationId: p.stationId,
    stationName: p.station?.name ?? null,
  }));

  const stationsSerialized = stations.map((s) => ({
    id: s.id,
    name: s.name,
    address: s.address,
    lat: s.lat,
    lng: s.lng,
    capacity: s.capacity,
    playersCount: s._count.players,
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Админ-панель</h1>

      <AdminStations stations={stationsSerialized} />
      <AdminPlayers
        players={playersSerialized}
        stations={stationsSerialized.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}

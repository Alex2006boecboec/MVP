import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import RentButton from "./RentButton";
import ReturnButton from "./ReturnButton";
import { formatRub, toNumber } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function StationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [station, user] = await Promise.all([
    prisma.station.findUnique({
      where: { id: params.id },
      include: {
        players: { orderBy: { batteryLevel: "desc" } },
      },
    }),
    getCurrentUser(),
  ]);

  if (!station) {
    notFound();
  }

  const activeRental = user
    ? await prisma.rental.findFirst({
        where: { userId: user.id, status: "ACTIVE" },
        include: { player: true, startStation: true },
      })
    : null;

  const available = station.players.filter((p) => p.status === "AVAILABLE");
  const rented = station.players.filter((p) => p.status === "RENTED");
  const maintenance = station.players.filter((p) => p.status === "MAINTENANCE");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/stations" className="text-sm text-brand-600 hover:underline">
          ← Все станции
        </Link>
        <h1 className="text-2xl font-semibold mt-2">{station.name}</h1>
        <p className="text-slate-600">{station.address}</p>
      </div>

      {activeRental && (
        <div className="card bg-amber-50 border-amber-200">
          <h3 className="font-semibold">У вас активная аренда</h3>
          <p className="text-sm text-slate-700 mt-1">
            {activeRental.player.model} (серийник {activeRental.player.serialNumber}) — взят на{" "}
            <b>{activeRental.startStation.name}</b>.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Начало: {new Date(activeRental.startedAt).toLocaleString("ru-RU")}
          </p>
          <div className="mt-3">
            <ReturnButton
              rentalId={activeRental.id}
              endStationId={station.id}
              canReturnHere
            />
          </div>
        </div>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-3">
          Доступные плееры ({available.length})
        </h2>
        {available.length === 0 ? (
          <div className="card text-slate-500 text-sm">
            На этой станции сейчас нет доступных плееров. Попробуйте другую станцию.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {available.map((player) => (
              <div
                key={player.id}
                className={`card ${
                  player.isFlagship
                    ? "ring-2 ring-brand-500 ring-offset-2 bg-gradient-to-br from-brand-50 to-white"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">{player.model}</h4>
                      {player.isFlagship && (
                        <span className="badge bg-brand-600 text-white">
                          ★ FLAGMAN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">SN: {player.serialNumber}</p>
                  </div>
                  <span
                    className={`badge whitespace-nowrap ${
                      player.batteryLevel >= 60
                        ? "bg-emerald-100 text-emerald-700"
                        : player.batteryLevel >= 30
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    🔋 {player.batteryLevel}%
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    {formatRub(player.pricePerHour)} / час
                  </div>
                  {!user ? (
                    <Link href="/login" className="btn-secondary">
                      Войти, чтобы взять
                    </Link>
                  ) : activeRental ? (
                    <button className="btn-ghost" disabled>
                      У вас активная аренда
                    </button>
                  ) : (
                    <RentButton
                      playerId={player.id}
                      pricePerHour={toNumber(player.pricePerHour)}
                      balance={toNumber(user.balance)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {rented.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 text-slate-600">
            Сейчас на аренде ({rented.length})
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {rented.map((player) => (
              <div key={player.id} className="card opacity-70">
                <h4 className="font-medium">{player.model}</h4>
                <p className="text-xs text-slate-500">SN: {player.serialNumber}</p>
                <span className="badge bg-amber-100 text-amber-700 mt-2">В аренде</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {maintenance.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 text-slate-600">
            На обслуживании ({maintenance.length})
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {maintenance.map((player) => (
              <div key={player.id} className="card opacity-60">
                <h4 className="font-medium">{player.model}</h4>
                <p className="text-xs text-slate-500">SN: {player.serialNumber}</p>
                <span className="badge bg-slate-100 text-slate-600 mt-2">Сервис</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

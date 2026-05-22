import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function StationsPage() {
  const stations = await prisma.station.findMany({
    include: {
      players: { select: { status: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Все станции</h1>
        <p className="text-slate-600 text-sm">
          Выбери станцию, чтобы посмотреть доступные плееры.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stations.map((station) => {
          const available = station.players.filter((p) => p.status === "AVAILABLE").length;
          const total = station.players.length;
          return (
            <Link
              key={station.id}
              href={`/stations/${station.id}`}
              className="card hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <h3 className="font-semibold text-lg">{station.name}</h3>
              <p className="text-sm text-slate-500">{station.address}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  {available} из {total} доступно
                </span>
                <span
                  className={`badge ${
                    available > 0
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {available > 0 ? "Свободно" : "Нет в наличии"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

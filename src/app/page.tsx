import Link from "next/link";
import { prisma } from "@/lib/db";
import StationMapClient from "@/components/StationMapClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const stations = await prisma.station.findMany({
    include: {
      players: { where: { status: "AVAILABLE" }, select: { id: true } },
    },
    orderBy: { name: "asc" },
  });

  const pins = stations.map((s) => ({
    id: s.id,
    name: s.name,
    address: s.address,
    lat: s.lat,
    lng: s.lng,
    availableCount: s.players.length,
  }));

  const totalPlayers = stations.reduce((sum, s) => sum + s.players.length, 0);

  return (
    <div className="space-y-8">
      <section className="grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Возьми плеер. <span className="text-brand-600">Слушай свободно.</span>
          </h1>
          <p className="mt-3 text-slate-600 text-lg">
            Сеть станций с портативными музыкальными проигрывателями по всему городу.
            Подключаешь свои наушники, берёшь плеер на одной станции — возвращаешь на любую другую.
          </p>
          <div className="flex gap-3 mt-6">
            <Link href="/stations" className="btn-primary">
              Найти станцию
            </Link>
            <Link href="/register" className="btn-secondary">
              Создать аккаунт
            </Link>
          </div>
          <div className="mt-6 flex gap-6 text-sm text-slate-600">
            <div>
              <div className="text-2xl font-semibold text-slate-900">{stations.length}</div>
              <div>станций</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900">{totalPlayers}</div>
              <div>плееров в наличии</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900">50 ₽</div>
              <div>за час</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Как это работает</h3>
          <ol className="space-y-3 text-sm text-slate-700">
            <li className="flex gap-3">
              <span className="badge bg-brand-100 text-brand-700">1</span>
              Зарегистрируйся и пополни баланс (в демо начислено 500 ₽).
            </li>
            <li className="flex gap-3">
              <span className="badge bg-brand-100 text-brand-700">2</span>
              Найди ближайшую станцию на карте.
            </li>
            <li className="flex gap-3">
              <span className="badge bg-brand-100 text-brand-700">3</span>
              Бери плеер с зарядом и подключай свои наушники.
            </li>
            <li className="flex gap-3">
              <span className="badge bg-brand-100 text-brand-700">4</span>
              Возвращай на любую станцию — деньги списываются по часам.
            </li>
          </ol>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-xl font-semibold">Карта станций</h2>
          <Link href="/stations" className="text-sm text-brand-600 hover:underline">
            Списком →
          </Link>
        </div>
        <StationMapClient stations={pins} />
      </section>
    </div>
  );
}

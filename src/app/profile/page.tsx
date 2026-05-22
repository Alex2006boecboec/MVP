import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatRub, toNumber } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const rentals = await prisma.rental.findMany({
    where: { userId: user.id },
    include: { player: true, startStation: true, endStation: true },
    orderBy: { startedAt: "desc" },
    take: 30,
  });

  const active = rentals.find((r) => r.status === "ACTIVE");
  const history = rentals.filter((r) => r.status !== "ACTIVE");
  const totalSpent = rentals
    .filter((r) => r.status === "COMPLETED")
    .reduce((sum, r) => sum + toNumber(r.totalCost), 0);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-xs uppercase text-slate-500">Имя</div>
          <div className="text-lg font-semibold">{user.name}</div>
          <div className="text-xs text-slate-500 mt-1">{user.email}</div>
        </div>
        <div className="card">
          <div className="text-xs uppercase text-slate-500">Баланс</div>
          <div className="text-2xl font-semibold text-brand-700">
            {formatRub(user.balance)}
          </div>
        </div>
        <div className="card">
          <div className="text-xs uppercase text-slate-500">Потрачено за всё время</div>
          <div className="text-2xl font-semibold">{formatRub(totalSpent)}</div>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">Активная аренда</h2>
        {active ? (
          <div className="card bg-amber-50 border-amber-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{active.player.model}</h3>
                <p className="text-sm text-slate-600">
                  Взят на станции <b>{active.startStation.name}</b>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  с {new Date(active.startedAt).toLocaleString("ru-RU")}
                </p>
              </div>
              <Link href={`/stations/${active.startStationId}`} className="btn-secondary">
                Найти станцию для возврата
              </Link>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Стоимость: {formatRub(active.player.pricePerHour)} / час. Списание при возврате.
            </p>
          </div>
        ) : (
          <div className="card text-slate-500 text-sm">
            Сейчас у вас нет активной аренды.{" "}
            <Link className="text-brand-600 hover:underline" href="/stations">
              Найти станцию
            </Link>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">История</h2>
        {history.length === 0 ? (
          <div className="card text-slate-500 text-sm">История пуста.</div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Плеер</th>
                  <th className="text-left px-4 py-3">Откуда</th>
                  <th className="text-left px-4 py-3">Куда</th>
                  <th className="text-left px-4 py-3">Длительность</th>
                  <th className="text-right px-4 py-3">Стоимость</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r) => {
                  const durationMs = r.endedAt
                    ? new Date(r.endedAt).getTime() - new Date(r.startedAt).getTime()
                    : 0;
                  const minutes = Math.round(durationMs / 60000);
                  return (
                    <tr key={r.id} className="border-t border-slate-100">
                      <td className="px-4 py-3">{r.player.model}</td>
                      <td className="px-4 py-3">{r.startStation.name}</td>
                      <td className="px-4 py-3">{r.endStation?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        {minutes >= 60 ? `${Math.floor(minutes / 60)} ч ${minutes % 60} мин` : `${minutes} мин`}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatRub(r.totalCost)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

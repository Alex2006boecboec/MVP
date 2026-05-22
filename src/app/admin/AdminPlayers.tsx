"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface Player {
  id: string;
  model: string;
  serialNumber: string;
  batteryLevel: number;
  status: "AVAILABLE" | "RENTED" | "MAINTENANCE";
  pricePerHour: number;
  stationId: string | null;
  stationName: string | null;
}

interface StationOption {
  id: string;
  name: string;
}

const statusLabels: Record<Player["status"], string> = {
  AVAILABLE: "Доступен",
  RENTED: "В аренде",
  MAINTENANCE: "Сервис",
};

const statusColors: Record<Player["status"], string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-700",
  RENTED: "bg-amber-100 text-amber-700",
  MAINTENANCE: "bg-slate-100 text-slate-600",
};

export default function AdminPlayers({
  players,
  stations,
}: {
  players: Player[];
  stations: StationOption[];
}) {
  const router = useRouter();
  const [model, setModel] = useState("Sony Walkman NW-A306");
  const [serial, setSerial] = useState("");
  const [stationId, setStationId] = useState(stations[0]?.id ?? "");
  const [price, setPrice] = useState("50");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function create(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        serialNumber: serial,
        stationId,
        pricePerHour: parseFloat(price),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Не удалось добавить плеер");
      return;
    }
    setSerial("");
    router.refresh();
  }

  async function updateStatus(id: string, status: Player["status"]) {
    const res = await fetch(`/api/admin/players/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Не удалось обновить");
      return;
    }
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Удалить плеер?")) return;
    const res = await fetch(`/api/admin/players/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Не удалось удалить");
      return;
    }
    router.refresh();
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Плееры</h2>

      <div className="grid lg:grid-cols-3 gap-4">
        <form onSubmit={create} className="card space-y-3">
          <h3 className="font-medium">Добавить плеер</h3>
          <div>
            <label className="label">Модель</label>
            <input className="input" value={model} onChange={(e) => setModel(e.target.value)} required />
          </div>
          <div>
            <label className="label">Серийный номер</label>
            <input className="input" value={serial} onChange={(e) => setSerial(e.target.value)} required />
          </div>
          <div>
            <label className="label">Станция</label>
            <select
              className="input"
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
              required
            >
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Цена за час (₽)</label>
            <input
              className="input"
              type="number"
              min={0}
              step={5}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full" disabled={loading || !stations.length}>
            {loading ? "Добавляем..." : "Добавить"}
          </button>
          {!stations.length && (
            <p className="text-xs text-slate-500">Сначала создайте хотя бы одну станцию.</p>
          )}
        </form>

        <div className="card lg:col-span-2 p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">Модель</th>
                <th className="text-left px-4 py-3">SN</th>
                <th className="text-left px-4 py-3">Станция</th>
                <th className="text-left px-4 py-3">Статус</th>
                <th className="text-right px-4 py-3">Заряд</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{p.model}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{p.serialNumber}</td>
                  <td className="px-4 py-3">{p.stationName ?? <i className="text-slate-400">в аренде</i>}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusColors[p.status]}`}>{statusLabels[p.status]}</span>
                  </td>
                  <td className="px-4 py-3 text-right">{p.batteryLevel}%</td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    {p.status === "AVAILABLE" && (
                      <button
                        onClick={() => updateStatus(p.id, "MAINTENANCE")}
                        className="text-amber-600 text-xs hover:underline"
                      >
                        В сервис
                      </button>
                    )}
                    {p.status === "MAINTENANCE" && (
                      <button
                        onClick={() => updateStatus(p.id, "AVAILABLE")}
                        className="text-emerald-600 text-xs hover:underline"
                      >
                        Вернуть в работу
                      </button>
                    )}
                    <button onClick={() => remove(p.id)} className="text-red-600 text-xs hover:underline">
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
              {players.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    Плееров пока нет.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface Station {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  capacity: number;
  playersCount: number;
}

export default function AdminStations({ stations }: { stations: Station[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("55.7558");
  const [lng, setLng] = useState("37.6173");
  const [capacity, setCapacity] = useState("8");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function create(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/stations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        address,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        capacity: parseInt(capacity, 10),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Не удалось добавить станцию");
      return;
    }
    setName("");
    setAddress("");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Удалить станцию?")) return;
    const res = await fetch(`/api/admin/stations/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Не удалось удалить");
      return;
    }
    router.refresh();
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Станции</h2>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <form onSubmit={create} className="card space-y-3 lg:col-span-1">
          <h3 className="font-medium">Добавить станцию</h3>
          <div>
            <label className="label">Название</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Адрес</label>
            <input
              className="input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">Широта</label>
              <input className="input" value={lat} onChange={(e) => setLat(e.target.value)} required />
            </div>
            <div>
              <label className="label">Долгота</label>
              <input className="input" value={lng} onChange={(e) => setLng(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="label">Ёмкость (слотов)</label>
            <input
              className="input"
              type="number"
              min={1}
              max={50}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Создаём..." : "Создать"}
          </button>
        </form>

        <div className="card lg:col-span-2 p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">Название</th>
                <th className="text-left px-4 py-3">Адрес</th>
                <th className="text-left px-4 py-3">Координаты</th>
                <th className="text-right px-4 py-3">Слотов</th>
                <th className="text-right px-4 py-3">Плееров</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {stations.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-slate-600">{s.address}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {s.lat.toFixed(4)}, {s.lng.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-right">{s.capacity}</td>
                  <td className="px-4 py-3 text-right">{s.playersCount}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(s.id)} className="text-red-600 text-xs hover:underline">
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
              {stations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    Станций пока нет.
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

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  playerId: string;
  pricePerHour: number;
  balance: number;
}

export default function RentButton({ playerId, pricePerHour, balance }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notEnough = balance < pricePerHour;

  async function rent() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/rentals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Не удалось взять плеер");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={rent}
        disabled={loading || notEnough}
        className="btn-primary"
        title={notEnough ? "Недостаточно средств на балансе" : undefined}
      >
        {loading ? "..." : notEnough ? "Мало баланса" : "Взять плеер"}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  rentalId: string;
  endStationId: string;
  canReturnHere: boolean;
}

export default function ReturnButton({ rentalId, endStationId, canReturnHere }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ret() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/rentals/${rentalId}/return`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endStationId }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Не удалось завершить аренду");
      return;
    }
    router.refresh();
    router.push("/profile");
  }

  return (
    <div>
      <button onClick={ret} disabled={loading || !canReturnHere} className="btn-secondary">
        {loading ? "..." : "Сдать плеер на этой станции"}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

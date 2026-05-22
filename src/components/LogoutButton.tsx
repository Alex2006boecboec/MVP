"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/");
    setLoading(false);
  }

  return (
    <button onClick={handleLogout} disabled={loading} className="btn-ghost">
      {loading ? "..." : "Выйти"}
    </button>
  );
}

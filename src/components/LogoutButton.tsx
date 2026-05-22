"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/");
  }

  return (
    <button onClick={handleLogout} disabled={loading} className="btn-ghost">
      {loading ? "..." : "Выйти"}
    </button>
  );
}

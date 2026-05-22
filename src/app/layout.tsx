import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/auth";
import { toNumber } from "@/lib/money";

export const metadata: Metadata = {
  title: "MusicRent — аренда музыкальных проигрывателей",
  description:
    "Бери музыкальный плеер на ближайшей станции, слушай любимые треки и сдавай на любой удобной станции города.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <html lang="ru">
      <body>
        <Header
          user={
            user
              ? {
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  balance: toNumber(user.balance),
                }
              : null
          }
        />
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        <footer className="max-w-6xl mx-auto px-4 py-6 text-center text-xs text-slate-400">
          MusicRent MVP · учебный проект · {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}

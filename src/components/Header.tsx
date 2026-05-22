import Link from "next/link";
import LogoutButton from "./LogoutButton";

interface HeaderUser {
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  balance: number;
}

export default function Header({ user }: { user: HeaderUser | null }) {
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-brand-600 text-white font-bold">
            ♪
          </span>
          <span className="font-semibold text-lg">MusicRent</span>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          <Link href="/stations" className="btn-ghost">
            Станции
          </Link>
          {user && (
            <Link href="/profile" className="btn-ghost">
              Профиль
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="btn-ghost">
              Админка
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-3 ml-2">
              <div className="text-right hidden sm:block">
                <div className="font-medium leading-tight">{user.name}</div>
                <div className="text-xs text-slate-500">
                  Баланс: {user.balance.toFixed(2)} ₽
                </div>
              </div>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link href="/login" className="btn-ghost">
                Войти
              </Link>
              <Link href="/register" className="btn-primary">
                Регистрация
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

import LoginForm from "./LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-semibold mb-6">Вход</h1>
      <div className="card">
        <LoginForm />
        <p className="mt-4 text-sm text-slate-600">
          Нет аккаунта?{" "}
          <Link className="text-brand-600 hover:underline" href="/register">
            Зарегистрироваться
          </Link>
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Демо-аккаунт: <code>demo@musicrent.local</code> / <code>demo1234</code>
        </p>
      </div>
    </div>
  );
}

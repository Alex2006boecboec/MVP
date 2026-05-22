import Link from "next/link";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-semibold mb-6">Регистрация</h1>
      <div className="card">
        <RegisterForm />
        <p className="mt-4 text-sm text-slate-600">
          Уже есть аккаунт?{" "}
          <Link className="text-brand-600 hover:underline" href="/login">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}

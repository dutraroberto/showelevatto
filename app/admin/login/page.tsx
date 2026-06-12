import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login · Painel Elevatto",
};

export default function AdminLoginPage() {
  return (
    <main className="bg-elevatto flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
      <div className="text-center">
        <p className="text-primary/80 text-xs font-medium tracking-[0.3em] uppercase">
          Show de 10 anos
        </p>
        <h1 className="text-gold-gradient mt-2 text-3xl font-bold tracking-tight">
          Elevatto
        </h1>
      </div>
      <LoginForm />
    </main>
  );
}

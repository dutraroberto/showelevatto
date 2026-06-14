"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2Icon, LockIcon, MailIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth";

const loginSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
});

type LoginValues = z.infer<typeof loginSchema>;

// Traduz o erro bruto do Supabase Auth para uma mensagem acionável. Sem isso,
// causas distintas (provedor desativado, e-mail não confirmado) ficavam todas
// escondidas atrás de um genérico "Credenciais inválidas".
function describeAuthError(raw: string): {
  title: string;
  description: string;
} {
  const message = raw.toLowerCase();

  if (message.includes("email logins are disabled")) {
    return {
      title: "Login por e-mail desativado",
      description:
        "Habilite o provedor de E-mail em Authentication → Sign In / Providers no painel do Supabase.",
    };
  }
  if (message.includes("email not confirmed")) {
    return {
      title: "E-mail não confirmado",
      description: "Confirme o e-mail da conta antes de acessar o painel.",
    };
  }
  if (message.includes("invalid login credentials")) {
    return {
      title: "Credenciais inválidas",
      description: "Verifique o e-mail e a senha e tente novamente.",
    };
  }
  return {
    title: "Não foi possível entrar",
    description: raw || "Tente novamente em instantes.",
  };
}

export function LoginForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setSubmitting(true);

    const result = await signIn(values.email, values.password);

    if (!result.ok) {
      setSubmitting(false);
      const { title, description } = describeAuthError(result.error);
      toast.error(title, { description });
      return;
    }

    toast.success("Bem-vindo de volta!");
    router.replace("/admin");
  }

  return (
    <Card className="glow-gold w-full max-w-sm border-primary/20 bg-card/80 backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Painel Elevatto</CardTitle>
        <CardDescription>
          Acesse o painel administrativo do evento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <MailIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="voce@elevatto.com"
                className="h-10 pl-8"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <LockIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••"
                className="h-10 pl-8"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-destructive text-xs">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="h-10 w-full font-semibold"
          >
            {submitting && <Loader2Icon className="animate-spin" />}
            {submitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

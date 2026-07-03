import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";

export const metadata: Metadata = { title: "Esqueci minha senha — GlicoTrack" };

export default function EsqueciSenhaPage() {
  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Informe seu e-mail para receber um link de redefinição de senha.
      </p>
      <ForgotPasswordForm />
    </div>
  );
}

import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";

export const metadata: Metadata = { title: "Redefinir senha — GlicoTrack" };

export default function RedefinirSenhaPage() {
  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Escolha uma nova senha para sua conta.
      </p>
      <ResetPasswordForm />
    </div>
  );
}

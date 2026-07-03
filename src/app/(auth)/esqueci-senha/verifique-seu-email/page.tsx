import type { Metadata } from "next";

export const metadata: Metadata = { title: "Verifique seu e-mail — GlicoTrack" };

export default function EsqueciSenhaVerifiqueSeuEmailPage() {
  return (
    <p className="text-center text-sm text-slate-600 dark:text-slate-300">
      Se houver uma conta com este e-mail, enviamos um link para redefinir a senha. Confira sua
      caixa de entrada (e o spam).
    </p>
  );
}

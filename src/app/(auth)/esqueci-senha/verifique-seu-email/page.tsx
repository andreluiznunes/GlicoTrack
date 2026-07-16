import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Verifique seu e-mail — GlicoTrack" };

export default function EsqueciSenhaVerifiqueSeuEmailPage() {
  return (
    <div className="space-y-4 text-center text-sm text-slate-600 dark:text-slate-300">
      <p>
        Se houver uma conta com este e-mail, enviamos um link para redefinir a senha. Confira sua
        caixa de entrada (e o spam).
      </p>
      <p>
        <Link href="/login" className="text-teal-600 hover:underline">
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}

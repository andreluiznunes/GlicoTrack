import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Verifique seu e-mail — GlicoTrack" };

export default function VerifiqueSeuEmailPage() {
  return (
    <div className="space-y-4 text-center text-sm text-slate-600 dark:text-slate-300">
      <p>
        Enviamos um link de confirmação para o e-mail informado. Abra a mensagem e clique no
        link para ativar sua conta.
      </p>
      <p>
        Não recebeu? Verifique a caixa de spam ou{" "}
        <Link href="/cadastro" className="text-teal-600 hover:underline">
          tente se cadastrar novamente
        </Link>
        .
      </p>
    </div>
  );
}

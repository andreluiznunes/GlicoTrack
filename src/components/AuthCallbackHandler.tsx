"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(false);
  // O código/token do link só pode ser trocado por sessão uma vez. Em dev, o
  // Strict Mode do React dispara este efeito duas vezes de propósito — sem
  // essa trava, a segunda chamada falha (código já usado) e sobrescreve o
  // sucesso da primeira com "link inválido".
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const supabase = createClient();
    const next = searchParams.get("next") ?? "/";
    const code = searchParams.get("code");

    async function confirm() {
      // O link padrão de confirmação do Supabase pode chegar de duas formas
      // (depende da configuração do projeto, e não editamos o template):
      // com "?code=" na query (precisa trocar por sessão) ou com
      // "#access_token=..." na fragment da URL (getSession() já detecta e
      // estabelece a sessão sozinho). Tratamos os dois.
      const { data, error: authError } = code
        ? await supabase.auth.exchangeCodeForSession(code)
        : await supabase.auth.getSession();

      if (authError || !data.session) {
        setError(true);
        return;
      }

      router.replace(next);
    }

    confirm();
  }, [router, searchParams]);

  if (error) {
    return (
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Link inválido ou expirado.{" "}
        <a href="/login" className="text-sky-600 hover:underline">
          Voltar para o login
        </a>
        .
      </p>
    );
  }

  return <p className="text-sm text-slate-500 dark:text-slate-400">Confirmando...</p>;
}

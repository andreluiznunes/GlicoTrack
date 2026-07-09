"use client";

import { useRef } from "react";

// "datetime-local" é "naive" — sem timezone. Este hook converte o valor pra
// ISO no navegador (só ele sabe o timezone real do usuário) e escreve num
// campo hidden antes do submit, pra Server Action nunca precisar interpretar
// a string naive (que ela faria errado, rodando em UTC no servidor).
export function useLocalDatetimeSubmit(localFieldName: string) {
  const isoRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const localInput = form.elements.namedItem(localFieldName) as HTMLInputElement | null;
    if (localInput?.value && isoRef.current) {
      isoRef.current.value = new Date(localInput.value).toISOString();
    }
  }

  return { isoRef, handleSubmit };
}

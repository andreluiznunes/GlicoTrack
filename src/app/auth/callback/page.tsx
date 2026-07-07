import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCallbackHandler } from "@/components/AuthCallbackHandler";

export const metadata: Metadata = { title: "Confirmando — GlicoTrack" };

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <Suspense fallback={<p className="text-sm text-slate-500">Confirmando...</p>}>
        <AuthCallbackHandler />
      </Suspense>
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">GlicoTrack</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Acompanhamento de glicemia
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}

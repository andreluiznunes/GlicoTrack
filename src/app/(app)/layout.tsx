import { getUserAndProfile } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";
import { AppNav, type NavLink } from "@/components/AppNav";
import { HomeIcon, DropletIcon, PillIcon, UtensilsIcon, ActivityIcon } from "@/components/icons";

const PATIENT_LINKS: NavLink[] = [
  { href: "/paciente", label: "Início", icon: HomeIcon, exact: true },
  { href: "/paciente/medicoes", label: "Medições", icon: DropletIcon },
  { href: "/paciente/doses", label: "Doses", icon: PillIcon },
  { href: "/paciente/refeicoes", label: "Refeições", icon: UtensilsIcon },
  { href: "/paciente/atividades", label: "Atividades", icon: ActivityIcon },
];

const PROFESSIONAL_LINKS: NavLink[] = [
  { href: "/profissional", label: "Início", icon: HomeIcon, exact: true },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getUserAndProfile();
  const links = profile?.role === "professional" ? PROFESSIONAL_LINKS : PATIENT_LINKS;
  const roleLabel = profile?.role === "professional" ? "Profissional" : "Paciente";
  const roleBadgeClass =
    profile?.role === "professional"
      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
      : "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300";

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <span className="text-lg font-semibold tracking-tight text-teal-700 dark:text-teal-400">
            GlicoTrack
          </span>
          <div className="flex items-center gap-3">
            {profile && (
              <span className="hidden items-center gap-2 sm:flex">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  {profile.full_name}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeClass}`}>
                  {roleLabel}
                </span>
              </span>
            )}
            <LogoutButton />
          </div>
        </div>
      </header>
      <AppNav links={links} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}

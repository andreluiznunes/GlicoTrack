import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/auth";

export default async function ProfissionalLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getUserAndProfile();

  if (!user || !profile) {
    redirect("/login");
  }

  if (profile.role !== "professional" || profile.is_admin) {
    redirect("/");
  }

  return <>{children}</>;
}

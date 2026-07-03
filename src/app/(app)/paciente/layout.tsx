import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/auth";

export default async function PacienteLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getUserAndProfile();

  if (!user || !profile) {
    redirect("/login");
  }

  if (profile.role !== "patient") {
    redirect("/");
  }

  return <>{children}</>;
}

import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/auth";

export default async function HomePage() {
  const { user, profile } = await getUserAndProfile();

  if (!user || !profile) {
    redirect("/login");
  }

  if (profile.is_admin) {
    redirect("/admin");
  }

  redirect(profile.role === "professional" ? "/profissional" : "/paciente");
}

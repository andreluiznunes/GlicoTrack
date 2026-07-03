import type { Metadata } from "next";
import { SignupForm } from "@/components/forms/SignupForm";

export const metadata: Metadata = { title: "Criar conta — GlicoTrack" };

export default function CadastroPage() {
  return <SignupForm />;
}

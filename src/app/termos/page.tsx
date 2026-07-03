import type { Metadata } from "next";

export const metadata: Metadata = { title: "Termos de uso e privacidade — GlicoTrack" };

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-12 text-sm text-slate-600 dark:text-slate-300">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
        Termos de uso e política de privacidade
      </h1>
      <p>
        O GlicoTrack trata dados de saúde (medições de glicemia e informações relacionadas), que
        são dados sensíveis nos termos da Lei Geral de Proteção de Dados (LGPD — Lei nº
        13.709/2018).
      </p>
      <p>
        Ao criar uma conta, você consente com o tratamento desses dados para a finalidade de
        acompanhamento clínico da sua glicemia, incluindo o compartilhamento com o profissional de
        saúde ao qual você se vincular voluntariamente através de um código de convite.
      </p>
      <p>
        Você pode revogar o vínculo com um profissional a qualquer momento e solicitar a exclusão
        da sua conta e de todos os seus dados.
      </p>
      <p className="italic text-slate-400 dark:text-slate-500">
        Texto placeholder desta fase do projeto — substituir por termos revisados antes de ir para
        produção.
      </p>
    </div>
  );
}

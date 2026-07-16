"use client";

import { useActionState } from "react";
import { setPatientTarget } from "@/actions/targets";
import { SubmitButton } from "./SubmitButton";
import { FormError } from "./FormError";

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900";

export function TargetForm({
  patientId,
  defaultValues,
}: {
  patientId: string;
  defaultValues?: { min_mg_dl?: number; max_mg_dl?: number; notes?: string | null };
}) {
  const [state, formAction] = useActionState(setPatientTarget, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state?.error} />

      <input type="hidden" name="patientId" defaultValue={patientId} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="min_mg_dl" className="block text-sm font-medium">
            Mínimo (mg/dL)
          </label>
          <input
            id="min_mg_dl"
            name="min_mg_dl"
            type="number"
            min={1}
            required
            defaultValue={defaultValues?.min_mg_dl}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="max_mg_dl" className="block text-sm font-medium">
            Máximo (mg/dL)
          </label>
          <input
            id="max_mg_dl"
            name="max_mg_dl"
            type="number"
            min={1}
            required
            defaultValue={defaultValues?.max_mg_dl}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium">
          Observações (opcional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={defaultValues?.notes ?? ""}
          className={inputClass}
        />
      </div>

      <SubmitButton>Salvar meta</SubmitButton>
    </form>
  );
}

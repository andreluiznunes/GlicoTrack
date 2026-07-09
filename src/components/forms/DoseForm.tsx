"use client";

import { useActionState } from "react";
import { SubmitButton } from "./SubmitButton";
import { FormError } from "./FormError";
import { useLocalDatetimeSubmit } from "./useLocalDatetimeSubmit";
import type { ActionState } from "@/actions/doses";

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900";

type DoseFormValues = {
  id?: string;
  medication_name?: string;
  dose_amount?: number;
  dose_unit?: string;
  taken_at_local?: string;
};

export function DoseForm({
  action,
  submitLabel,
  defaultValues,
  maxTakenAtLocal,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  defaultValues?: DoseFormValues;
  maxTakenAtLocal: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const { isoRef, handleSubmit } = useLocalDatetimeSubmit("taken_at_local");

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
      <FormError message={state?.error} />

      {defaultValues?.id && <input type="hidden" name="id" defaultValue={defaultValues.id} />}
      <input type="hidden" name="taken_at" ref={isoRef} />

      <div>
        <label htmlFor="medication_name" className="block text-sm font-medium">
          Medicação
        </label>
        <input
          id="medication_name"
          name="medication_name"
          type="text"
          required
          placeholder="Ex.: Insulina NPH"
          defaultValue={defaultValues?.medication_name}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="dose_amount" className="block text-sm font-medium">
            Quantidade
          </label>
          <input
            id="dose_amount"
            name="dose_amount"
            type="number"
            step="0.1"
            min={0.1}
            required
            defaultValue={defaultValues?.dose_amount}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="dose_unit" className="block text-sm font-medium">
            Unidade
          </label>
          <input
            id="dose_unit"
            name="dose_unit"
            type="text"
            required
            placeholder="UI"
            defaultValue={defaultValues?.dose_unit ?? "UI"}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="taken_at_local" className="block text-sm font-medium">
          Data e hora
        </label>
        <input
          id="taken_at_local"
          name="taken_at_local"
          type="datetime-local"
          required
          max={maxTakenAtLocal}
          defaultValue={defaultValues?.taken_at_local}
          className={inputClass}
        />
      </div>

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}

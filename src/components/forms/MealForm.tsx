"use client";

import { useActionState } from "react";
import { SubmitButton } from "./SubmitButton";
import { FormError } from "./FormError";
import { useLocalDatetimeSubmit } from "./useLocalDatetimeSubmit";
import type { ActionState } from "@/actions/meals";

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900";

type MealFormValues = {
  id?: string;
  description?: string;
  carbs_grams?: number | null;
  consumed_at_local?: string;
};

export function MealForm({
  action,
  submitLabel,
  defaultValues,
  maxConsumedAtLocal,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  defaultValues?: MealFormValues;
  maxConsumedAtLocal: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const { isoRef, handleSubmit } = useLocalDatetimeSubmit("consumed_at_local");

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
      <FormError message={state?.error} />

      {defaultValues?.id && <input type="hidden" name="id" defaultValue={defaultValues.id} />}
      <input type="hidden" name="consumed_at" ref={isoRef} />

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          O que foi consumido
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          required
          placeholder="Ex.: Arroz, feijão e frango grelhado"
          defaultValue={defaultValues?.description}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="carbs_grams" className="block text-sm font-medium">
          Carboidratos (g) — opcional
        </label>
        <input
          id="carbs_grams"
          name="carbs_grams"
          type="number"
          step="0.1"
          min={0}
          defaultValue={defaultValues?.carbs_grams ?? undefined}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="consumed_at_local" className="block text-sm font-medium">
          Data e hora
        </label>
        <input
          id="consumed_at_local"
          name="consumed_at_local"
          type="datetime-local"
          required
          max={maxConsumedAtLocal}
          defaultValue={defaultValues?.consumed_at_local}
          className={inputClass}
        />
      </div>

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}

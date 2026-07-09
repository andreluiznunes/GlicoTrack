"use client";

import { useActionState } from "react";
import { SubmitButton } from "./SubmitButton";
import { FormError } from "./FormError";
import { useLocalDatetimeSubmit } from "./useLocalDatetimeSubmit";
import type { ActionState } from "@/actions/activities";

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900";

type ActivityFormValues = {
  id?: string;
  description?: string;
  duration_minutes?: number | null;
  performed_at_local?: string;
};

export function ActivityForm({
  action,
  submitLabel,
  defaultValues,
  maxPerformedAtLocal,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  defaultValues?: ActivityFormValues;
  maxPerformedAtLocal: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const { isoRef, handleSubmit } = useLocalDatetimeSubmit("performed_at_local");

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
      <FormError message={state?.error} />

      {defaultValues?.id && <input type="hidden" name="id" defaultValue={defaultValues.id} />}
      <input type="hidden" name="performed_at" ref={isoRef} />

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Atividade
        </label>
        <input
          id="description"
          name="description"
          type="text"
          required
          placeholder="Ex.: Caminhada"
          defaultValue={defaultValues?.description}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="duration_minutes" className="block text-sm font-medium">
          Duração (minutos) — opcional
        </label>
        <input
          id="duration_minutes"
          name="duration_minutes"
          type="number"
          min={1}
          step={1}
          defaultValue={defaultValues?.duration_minutes ?? undefined}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="performed_at_local" className="block text-sm font-medium">
          Data e hora
        </label>
        <input
          id="performed_at_local"
          name="performed_at_local"
          type="datetime-local"
          required
          max={maxPerformedAtLocal}
          defaultValue={defaultValues?.performed_at_local}
          className={inputClass}
        />
      </div>

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}

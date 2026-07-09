"use client";

import { useActionState, useRef } from "react";
import { MEASUREMENT_CONTEXTS } from "@/lib/measurementContext";
import { SubmitButton } from "./SubmitButton";
import { FormError } from "./FormError";
import type { ActionState } from "@/actions/measurements";
import type { MeasurementContext } from "@/types/database";

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900";

type MeasurementFormValues = {
  id?: string;
  value_mg_dl?: number;
  measured_at_local?: string;
  context?: MeasurementContext;
  notes?: string | null;
};

export function MeasurementForm({
  action,
  submitLabel,
  defaultValues,
  maxMeasuredAtLocal,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  defaultValues?: MeasurementFormValues;
  // Limite do seletor de data/hora — só UX (evita escolher data futura no
  // picker). A validação que realmente importa é o refine em measured_at na
  // Server Action (src/actions/measurements.ts), que não confia no client.
  maxMeasuredAtLocal: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const isoRef = useRef<HTMLInputElement>(null);

  // "measured_at_local" (datetime-local) é "naive" — sem timezone. Convertemos
  // pra ISO aqui, no navegador, antes do submit, porque só o navegador sabe o
  // timezone real do usuário (a Server Action roda no servidor, provavelmente
  // em UTC, e interpretaria a string errado).
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const localInput = form.elements.namedItem("measured_at_local") as HTMLInputElement | null;
    if (localInput?.value && isoRef.current) {
      isoRef.current.value = new Date(localInput.value).toISOString();
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
      <FormError message={state?.error} />

      {defaultValues?.id && <input type="hidden" name="id" defaultValue={defaultValues.id} />}
      <input type="hidden" name="measured_at" ref={isoRef} />

      <div>
        <label htmlFor="value_mg_dl" className="block text-sm font-medium">
          Valor (mg/dL)
        </label>
        <input
          id="value_mg_dl"
          name="value_mg_dl"
          type="number"
          min={1}
          max={3000}
          required
          defaultValue={defaultValues?.value_mg_dl}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="measured_at_local" className="block text-sm font-medium">
          Data e hora
        </label>
        <input
          id="measured_at_local"
          name="measured_at_local"
          type="datetime-local"
          required
          max={maxMeasuredAtLocal}
          defaultValue={defaultValues?.measured_at_local}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="context" className="block text-sm font-medium">
          Momento da medição
        </label>
        <select
          id="context"
          name="context"
          required
          defaultValue={defaultValues?.context ?? ""}
          className={inputClass}
        >
          <option value="" disabled>
            Selecione...
          </option>
          {MEASUREMENT_CONTEXTS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium">
          Notas/sintomas (opcional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={defaultValues?.notes ?? ""}
          className={inputClass}
        />
      </div>

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}

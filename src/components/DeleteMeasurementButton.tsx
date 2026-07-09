"use client";

import { deleteMeasurement } from "@/actions/measurements";

export function DeleteMeasurementButton({ id }: { id: string }) {
  return (
    <form
      action={deleteMeasurement}
      onSubmit={(event) => {
        if (!window.confirm("Excluir esta medição? Essa ação não pode ser desfeita.")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-sm text-red-600 hover:underline dark:text-red-400">
        Excluir
      </button>
    </form>
  );
}

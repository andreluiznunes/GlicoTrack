"use client";

export function DeleteButton({
  action,
  id,
  confirmMessage = "Excluir este registro? Essa ação não pode ser desfeita.",
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  confirmMessage?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
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

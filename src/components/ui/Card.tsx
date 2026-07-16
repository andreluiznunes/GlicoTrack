type CardProps = {
  children: React.ReactNode;
  className?: string;
  // false pras listas (divide-y com padding próprio em cada item), que não
  // podem ter o p-6 padrão do card sem entrar em conflito com ele.
  padded?: boolean;
  // "ul" quando os filhos são <li> (listas) — <li> não pode ficar direto
  // dentro de <section>.
  as?: "section" | "ul";
};

export function Card({ children, className = "", padded = true, as = "section" }: CardProps) {
  const Tag = as;

  return (
    <Tag
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${padded ? "p-6" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}

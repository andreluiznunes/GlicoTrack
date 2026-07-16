"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

export type NavLink = {
  href: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  // true pro link de "Início" — só ativo em match exato, senão ficaria ativo
  // junto com qualquer sub-página (toda página do paciente começa com /paciente).
  exact?: boolean;
};

export function AppNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();

  if (links.length <= 1) return null;

  return (
    <nav className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-4">
        {links.map((link) => {
          const isActive = link.exact
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition ${
                isActive
                  ? "border-teal-600 text-teal-700 dark:text-teal-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

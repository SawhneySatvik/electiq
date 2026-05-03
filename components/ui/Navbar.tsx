"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/translation-runtime";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { AuthMenu } from "./AuthMenu";

export function Navbar() {
  const pathname = usePathname();
  const links = [
    { href: "/explore", label: useT("nav.explore") },
    { href: "/candidates", label: useT("nav.candidates") },
    { href: "/chat", label: useT("nav.chat") },
    { href: "/voices", label: useT("nav.voices") },
    { href: "/exit-poll", label: useT("nav.exitPoll") },
  ];
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group min-w-0">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center font-display font-bold text-bg shrink-0">
            E
          </div>
          <span className="font-display font-bold text-lg tracking-tight group-hover:text-accent transition-colors truncate">
            ElectoIQ
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "text-text bg-surface2"
                    : "text-muted hover:text-text hover:bg-surface"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <div className="ml-2 flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
            <AuthMenu />
          </div>
        </nav>
      </div>
    </header>
  );
}

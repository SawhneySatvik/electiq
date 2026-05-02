"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/explore", label: "Explore" },
  { href: "/candidates", label: "Candidates" },
  { href: "/chat", label: "Chat" },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center font-display font-bold text-bg">
            E
          </div>
          <span className="font-display font-bold text-lg tracking-tight group-hover:text-accent transition-colors">
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
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "text-text bg-surface2"
                    : "text-muted hover:text-text hover:bg-surface"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

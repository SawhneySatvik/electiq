import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";

export const metadata: Metadata = {
  title: "ElectoIQ — India's Election Intelligence Platform",
  description:
    "Explore Indian election data, candidate-declared assets, and ask grounded questions about Lok Sabha and Vidhan Sabha races.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-text font-body">
        <Navbar />
        <main className="pt-16">{children}</main>
        <footer className="border-t border-border mt-24 py-8 px-6 text-xs text-muted">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <span>
              ElectoIQ · Demo data modeled on patterns from MyNeta, ADR and the
              Election Commission of India. Not an official source.
            </span>
            <span>Built for election literacy.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}

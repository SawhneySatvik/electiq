import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";
import { LocaleProvider } from "@/lib/translation-runtime";
import { AuthProvider } from "@/lib/auth";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "ElectoIQ — India's Election Intelligence Platform",
  description:
    "Explore Indian election data, candidate-declared assets, and ask grounded questions about Lok Sabha and Vidhan Sabha races.",
};

const themeBootScript = `
(function () {
  try {
    var stored = localStorage.getItem('electoiq-theme');
    var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (prefersLight ? 'light' : 'dark');
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = 'dark';
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-screen bg-bg text-text font-body">
        <LocaleProvider>
          <AuthProvider>
            <Navbar />
            <main className="pt-16">{children}</main>
            <Footer />
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}

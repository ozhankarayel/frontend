import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "FaceGate",
  description: "Yüz tanımalı erişim ve yoklama sistemi",
};

const links = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/enroll", label: "Kayıt" },
  { href: "/recognize", label: "Tanıma" },
  { href: "/admin", label: "Yönetim" },
    { href: "/verify", label: "Doğrulama" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-neutral-950 text-neutral-100">
        <nav className="flex items-center gap-6 border-b border-neutral-800 px-6 py-4">
          <span className="text-lg font-bold text-emerald-400">FaceGate</span>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-neutral-300 hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
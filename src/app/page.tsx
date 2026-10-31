import Link from "next/link";

const cards = [
  { href: "/enroll", title: "Kişi Kaydı", text: "Rıza onayıyla yüz kaydı oluştur." },
  { href: "/recognize", title: "Canlı Tanıma", text: "Kamerayla gerçek zamanlı tanıma." },
  { href: "/admin", title: "Yönetim", text: "Kişileri ve giriş kayıtlarını yönet." },
];

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Yüz Tanımalı Erişim ve Yoklama Sistemi</h1>
      <p className="mt-2 text-neutral-400">
        ArcFace embedding + pgvector kosinüs araması ile çalışır.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-lg border border-neutral-800 p-5 hover:border-emerald-500"
          >
            <h2 className="font-semibold">{c.title}</h2>
            <p className="mt-1 text-sm text-neutral-400">{c.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
"use client";
import { useState } from "react";
import { useCamera } from "@/hooks/useCamera";
import { enrollPerson } from "@/lib/api";

type Shot = { blob: Blob; url: string };

export default function EnrollPage() {
  const { videoRef, capture, ready, error: camError } = useCamera();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [shots, setShots] = useState<Shot[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function takeShot() {
    const blob = await capture(0.9);
    if (blob) setShots((s) => [...s, { blob, url: URL.createObjectURL(blob) }]);
  }

  function removeShot(i: number) {
    setShots((s) => s.filter((_, idx) => idx !== i));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setBusy(true);
    try {
      const form = new FormData();
      form.append("name", name);
      form.append("email", email);
      form.append("consent", String(consent));
      shots.forEach((s, i) => form.append("images", s.blob, `photo-${i}.jpg`));
      const person = await enrollPerson(form);
      setMessage({ ok: true, text: `${person.name} kaydedildi (${person.template_count} şablon).` });
      setName("");
      setEmail("");
      setConsent(false);
      setShots([]);
    } catch (err) {
      setMessage({ ok: false, text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  const canSubmit = name && email && consent && shots.length >= 1 && !busy;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section>
        <h1 className="mb-4 text-2xl font-bold">Kişi Kaydı</h1>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full -scale-x-100 rounded-lg bg-black"
        />
        {camError && <p className="mt-2 text-sm text-red-400">{camError}</p>}
        <button
          type="button"
          onClick={takeShot}
          disabled={!ready || shots.length >= 5}
          className="mt-3 rounded bg-emerald-600 px-4 py-2 text-sm font-medium disabled:opacity-40"
        >
          Fotoğraf çek ({shots.length}/5)
        </button>
        <p className="mt-2 text-xs text-neutral-400">
          Daha iyi sonuç için 3-5 fotoğraf çek: düz bakış, hafif sağa ve sola dönük. Aynı karede tek yüz olmalı.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {shots.map((s, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={s.url}
              src={s.url}
              alt={`çekim ${i + 1}`}
              onClick={() => removeShot(i)}
              title="Silmek için tıkla"
              className="h-16 w-16 cursor-pointer rounded object-cover"
            />
          ))}
        </div>
      </section>

      <form onSubmit={submit} className="space-y-4">
        <h2 className="text-xl font-semibold">Bilgiler</h2>
        <input
          required
          placeholder="Ad Soyad"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
        />
        <input
          required
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
        />
        <label className="flex items-start gap-2 text-sm text-neutral-300">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1"
          />
          <span>
            Yüz verimin biyometrik şablon (sayısal vektör) olarak işlenmesine açık rıza veriyorum.
            Ham fotoğraflarım saklanmaz, verilerimin silinmesini istediğim an kaldırılır.
          </span>
        </label>
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded bg-emerald-600 px-5 py-2 font-medium disabled:opacity-40"
        >
          {busy ? "Kaydediliyor..." : "Kaydet"}
        </button>
        {message && (
          <p className={message.ok ? "text-emerald-400" : "text-red-400"}>{message.text}</p>
        )}
      </form>
    </div>
  );
}
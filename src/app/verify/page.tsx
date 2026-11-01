"use client";
import { useState } from "react";
import { useCamera } from "@/hooks/useCamera";
import { verify, type VerifyResult } from "@/lib/api";

const FRAMES = 15;
const INTERVAL_MS = 100;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function VerifyPage() {
  const { videoRef, capture, ready, error: camError } = useCamera();
  const [phase, setPhase] = useState<"idle" | "capturing" | "sending">("idle");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ms, setMs] = useState<number | null>(null);

  async function start() {
    setError(null);
    setResult(null);
    setPhase("capturing");
    const t0 = performance.now();
    try {
      const blobs: Blob[] = [];
      for (let i = 0; i < FRAMES; i++) {
        const t = performance.now();
        const b = await capture(0.7);
        if (b) blobs.push(b);
        await sleep(Math.max(0, INTERVAL_MS - (performance.now() - t)));
      }
      setPhase("sending");
      const r = await verify(blobs);
      setResult(r);
      setMs(Math.round(performance.now() - t0));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPhase("idle");
    }
  }

  const status = result?.status;
  return (
    <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
      <section>
        <h1 className="mb-4 text-2xl font-bold">Canlılık Doğrulamalı Giriş</h1>
        <video ref={videoRef} autoPlay playsInline muted className="w-full -scale-x-100 rounded-lg bg-black" />
        {camError && <p className="mt-2 text-sm text-red-400">{camError}</p>}
        <button
          onClick={start}
          disabled={!ready || phase !== "idle"}
          className="mt-3 rounded bg-emerald-600 px-5 py-2 font-medium disabled:opacity-40"
        >
          {phase === "capturing" ? "Kameraya bak ve göz kırp..." : phase === "sending" ? "Doğrulanıyor..." : "Doğrula"}
        </button>
        <p className="mt-2 text-xs text-neutral-400">
          Butona bas, kameraya bak ve bir kez doğal şekilde göz kırp. Kareler yaklaşık 1.5 saniyede yakalanır.
        </p>
      </section>

      <aside className="space-y-3 rounded-lg border border-neutral-800 p-4">
        <h2 className="text-sm text-neutral-400">Sonuç</h2>
        {!result && !error && <p className="text-neutral-500">Henüz sonuç yok</p>}
        {error && <p className="text-red-400">{error}</p>}
        {status === "accepted" && <p className="text-xl font-semibold text-emerald-400">Hoş geldin, {result?.person?.name}</p>}
        {status === "rejected" && <p className="text-xl font-semibold text-red-400">Tanınmadı</p>}
        {status === "spoof" && <p className="text-xl font-semibold text-amber-400">Canlılık doğrulanamadı (göz kırpma yok)</p>}
        {status === "no_face" && <p className="text-neutral-400">Yüz bulunamadı</p>}
        {status === "empty_gallery" && <p className="text-neutral-400">Kayıtlı kişi yok</p>}
        {result?.score !== undefined && <p className="text-sm text-neutral-400">Benzerlik: {result.score}</p>}
        {result?.liveness && (
          <p className="text-sm text-neutral-400">
            Kırpma: {result.liveness.blink ? "evet" : "hayır"} | EAR taban: {result.liveness.ear_baseline ?? "-"} | EAR min: {result.liveness.ear_min ?? "-"}
          </p>
        )}
        {ms !== null && <p className="text-sm text-neutral-400">Toplam süre: {ms} ms</p>}
      </aside>
    </div>
  );
}
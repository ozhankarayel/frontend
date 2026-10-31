"use client";
import { useEffect, useState } from "react";
import { useCamera } from "@/hooks/useCamera";
import { recognize, type RecognizeResult } from "@/lib/api";

export default function RecognizePage() {
  const { videoRef, capture, ready, error: camError } = useCamera();
  const [running, setRunning] = useState(false);
  const [fps, setFps] = useState(3);
  const [quality, setQuality] = useState(0.7);
  const [result, setResult] = useState<RecognizeResult | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [netError, setNetError] = useState<string | null>(null);
  const [size, setSize] = useState({ w: 640, h: 480 });

  useEffect(() => {
    if (!running || !ready) return;
    let stop = false;

    (async () => {
      while (!stop) {
        const t0 = performance.now();
        const blob = await capture(quality);
        if (blob) {
          try {
            const r = await recognize(blob);
            if (!stop) {
              setResult(r);
              setLatency(Math.round(performance.now() - t0));
              setNetError(null);
              const v = videoRef.current;
              if (v) setSize({ w: v.videoWidth, h: v.videoHeight });
            }
          } catch {
            if (!stop) setNetError("Sunucuya ulaşılamıyor.");
          }
        }
        const wait = Math.max(0, 1000 / fps - (performance.now() - t0));
        await new Promise((r) => setTimeout(r, wait));
      }
    })();

    return () => {
      stop = true;
    };
  }, [running, ready, fps, quality, capture, videoRef]);

  const accepted = result?.status === "accepted";
  const box = result?.bbox;

  return (
    <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
      <section>
        <h1 className="mb-4 text-2xl font-bold">Canlı Tanıma</h1>
        <div className="relative overflow-hidden rounded-lg bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="w-full -scale-x-100" />
          {running && box && (
            <div
              className={`absolute border-2 ${accepted ? "border-emerald-400" : "border-red-500"}`}
              style={{
                // video aynalandığı için x ekseni ters çevrilir
                left: `${(1 - box[2] / size.w) * 100}%`,
                top: `${(box[1] / size.h) * 100}%`,
                width: `${((box[2] - box[0]) / size.w) * 100}%`,
                height: `${((box[3] - box[1]) / size.h) * 100}%`,
              }}
            />
          )}
        </div>
        {camError && <p className="mt-2 text-sm text-red-400">{camError}</p>}
        <button
          onClick={() => setRunning((r) => !r)}
          disabled={!ready}
          className={`mt-3 rounded px-5 py-2 font-medium disabled:opacity-40 ${
            running ? "bg-red-600" : "bg-emerald-600"
          }`}
        >
          {running ? "Durdur" : "Tanımayı başlat"}
        </button>
      </section>

      <aside className="space-y-5">
        <div className="rounded-lg border border-neutral-800 p-4">
          <h2 className="text-sm text-neutral-400">Sonuç</h2>
          {!result && <p className="mt-1 text-neutral-500">Henüz sonuç yok</p>}
          {result?.status === "accepted" && (
            <p className="mt-1 text-xl font-semibold text-emerald-400">{result.person?.name}</p>
          )}
          {result?.status === "rejected" && (
            <p className="mt-1 text-xl font-semibold text-red-400">Tanınmadı</p>
          )}
          {result?.status === "no_face" && <p className="mt-1 text-neutral-400">Yüz yok</p>}
          {result?.status === "empty_gallery" && (
            <p className="mt-1 text-neutral-400">Kayıtlı kişi yok</p>
          )}
          {result?.score !== undefined && (
            <p className="text-sm text-neutral-400">Benzerlik: {result.score}</p>
          )}
          {latency !== null && <p className="text-sm text-neutral-400">Gecikme: {latency} ms</p>}
          {netError && <p className="text-sm text-red-400">{netError}</p>}
        </div>

        <div className="space-y-3 rounded-lg border border-neutral-800 p-4 text-sm">
          <label className="block">
            Saniyede kare: {fps}
            <input
              type="range" min={1} max={10} value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label className="block">
            JPEG kalitesi: {quality.toFixed(2)}
            <input
              type="range" min={0.3} max={1} step={0.05} value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
      </aside>
    </div>
  );
}
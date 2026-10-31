"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { width: 640, height: 480, facingMode: "user" }, audio: false })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          setReady(true);
        }
      })
      .catch(() => setError("Kamera erişimi reddedildi veya kamera bulunamadı."));

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Videodan bir kare alıp JPEG blob olarak döndürür (quality: 0-1)
  const capture = useCallback(
    (quality = 0.8) =>
      new Promise<Blob | null>((resolve) => {
        const v = videoRef.current;
        if (!v || !v.videoWidth) return resolve(null);
        const c = document.createElement("canvas");
        c.width = v.videoWidth;
        c.height = v.videoHeight;
        c.getContext("2d")!.drawImage(v, 0, 0);
        c.toBlob(resolve, "image/jpeg", quality);
      }),
    []
  );

  return { videoRef, capture, ready, error };
}
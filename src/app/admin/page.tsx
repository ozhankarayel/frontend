"use client";
import { useCallback, useEffect, useState } from "react";
import { deletePerson, listLogs, listPeople, type AccessLog, type Person } from "@/lib/api";

const resultLabel = { accepted: "Kabul", rejected: "Red", spoof: "Sahte şüphesi" } as const;
const resultColor = {
  accepted: "text-emerald-400",
  rejected: "text-red-400",
  spoof: "text-amber-400",
} as const;

export default function AdminPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [p, l] = await Promise.all([listPeople(), listLogs()]);
      setPeople(p);
      setLogs(l);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [refresh]);

  async function remove(p: Person) {
    if (!confirm(`${p.name} ve tüm yüz verisi kalıcı olarak silinsin mi?`)) return;
    await deletePerson(p.id);
    refresh();
  }

  return (
    <div className="space-y-10">
      {error && <p className="text-red-400">{error}</p>}

      <section>
        <h1 className="mb-3 text-2xl font-bold">Kayıtlı Kişiler ({people.length})</h1>
        <table className="w-full text-left text-sm">
          <thead className="text-neutral-400">
            <tr>
              <th className="py-2">Ad</th><th>E-posta</th><th>Şablon</th><th>Rıza tarihi</th><th />
            </tr>
          </thead>
          <tbody>
            {people.map((p) => (
              <tr key={p.id} className="border-t border-neutral-800">
                <td className="py-2">{p.name}</td>
                <td>{p.email}</td>
                <td>{p.template_count}</td>
                <td>{new Date(p.consent_at).toLocaleString("tr-TR")}</td>
                <td className="text-right">
                  <button onClick={() => remove(p)} className="text-red-400 hover:underline">
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="mb-3 text-2xl font-bold">Son Giriş Kayıtları</h2>
        <table className="w-full text-left text-sm">
          <thead className="text-neutral-400">
            <tr><th className="py-2">Zaman</th><th>Kişi</th><th>Skor</th><th>Sonuç</th></tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-neutral-800">
                <td className="py-2">{new Date(l.timestamp).toLocaleString("tr-TR")}</td>
                <td>{l.person_name ?? "—"}</td>
                <td>{l.score.toFixed(3)}</td>
                <td className={resultColor[l.result]}>{resultLabel[l.result]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
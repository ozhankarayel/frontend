const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export type Person = {
  id: number;
  name: string;
  email: string;
  role: string;
  consent_at: string;
  created_at: string;
  template_count: number;
};

export type AccessLog = {
  id: number;
  person: number | null;
  person_name: string | null;
  timestamp: string;
  score: number;
  result: "accepted" | "rejected" | "spoof";
};

export type RecognizeResult = {
  status: "accepted" | "rejected" | "no_face" | "empty_gallery";
  person?: { id: number; name: string } | null;
  score?: number;
  bbox?: [number, number, number, number];
};

async function parse(res: Response) {
  if (res.ok) return res.status === 204 ? null : res.json();
  let msg = `Hata ${res.status}`;
  try {
    const body = await res.json();
    msg = body.detail ?? Object.values(body).flat().join(" ");
  } catch {}
  throw new Error(msg);
}

export async function enrollPerson(form: FormData): Promise<Person> {
  return parse(await fetch(`${API}/people/`, { method: "POST", body: form }));
}

export async function listPeople(): Promise<Person[]> {
  return parse(await fetch(`${API}/people/`, { cache: "no-store" }));
}

export async function deletePerson(id: number): Promise<void> {
  await parse(await fetch(`${API}/people/${id}/`, { method: "DELETE" }));
}

export async function listLogs(): Promise<AccessLog[]> {
  return parse(await fetch(`${API}/logs/`, { cache: "no-store" }));
}

export async function recognize(blob: Blob): Promise<RecognizeResult> {
  const form = new FormData();
  form.append("image", blob, "frame.jpg");
  return parse(await fetch(`${API}/recognize/`, { method: "POST", body: form }));
}

export type VerifyResult = {
  status: "accepted" | "rejected" | "spoof" | "no_face" | "empty_gallery";
  person?: { id: number; name: string } | null;
  score?: number;
  liveness?: {
    blink: boolean;
    ear_baseline: number | null;
    ear_min: number | null;
    frames_used: number;
  };
};

export async function verify(blobs: Blob[]): Promise<VerifyResult> {
  const form = new FormData();
  blobs.forEach((b, i) => form.append("images", b, `f${i}.jpg`));
  return parse(await fetch(`${API}/verify/`, { method: "POST", body: form }));
}
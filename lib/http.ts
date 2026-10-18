import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getSession, type Session } from "./session";
import { store } from "./store";
import type { Project } from "./types";

export const jsonError = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

export const newId = () => crypto.randomUUID();
export const randomToken = (bytes = 32) => randomBytes(bytes).toString("base64url");
export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/** Code court facile à taper dans Studio, sans caractères ambigus (0/O, 1/I). */
export function pairingCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  const chars = [...bytes].map((b) => alphabet[b % alphabet.length]);
  return `${chars.slice(0, 3).join("")}-${chars.slice(3).join("")}`;
}

type Guard<T> = { ok: true; value: T } | { ok: false; response: NextResponse };

export async function requireSession(): Promise<Guard<Session>> {
  const session = await getSession();
  if (!session) return { ok: false, response: jsonError("Connecte-toi d'abord.", 401) };
  return { ok: true, value: session };
}

export async function requireProject(id: string): Promise<Guard<{ session: Session; project: Project }>> {
  const s = await requireSession();
  if (!s.ok) return s;
  const project = await store.getProject(id);
  if (!project || project.owner !== s.value.uid) return { ok: false, response: jsonError("Projet introuvable.", 404) };
  return { ok: true, value: { session: s.value, project } };
}

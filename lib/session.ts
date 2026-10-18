// Session = petit cookie signé (HMAC). Il contient l'identifiant du créateur, rien de secret.
import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { config } from "./config";

export const SESSION_COOKIE = "if_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

export type Session = { uid: string; name: string; avatar: string | null; demo: boolean };

function secret(): string {
  if (config.sessionSecret) return config.sessionSecret;
  if (process.env.NODE_ENV !== "production") return "dev-only-secret-change-me";
  throw new Error("SESSION_SECRET manquant : ajoute-le dans les variables d'environnement.");
}

/** false en production tant que SESSION_SECRET n'est pas défini : la connexion est alors refusée proprement. */
export const sessionReady = () => Boolean(config.sessionSecret) || process.env.NODE_ENV !== "production";

const b64 = (s: string) => Buffer.from(s).toString("base64url");
const sign = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");

export function encodeSession(s: Session): string {
  const data = b64(JSON.stringify({ ...s, exp: Date.now() + MAX_AGE * 1000 }));
  return `${data}.${sign(data)}`;
}

export function decodeSession(token: string | undefined): Session | null {
  if (!token || !sessionReady()) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = Buffer.from(sign(data));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(data, "base64url").toString());
    if (typeof parsed.exp !== "number" || parsed.exp < Date.now()) return null;
    return { uid: parsed.uid, name: parsed.name, avatar: parsed.avatar ?? null, demo: Boolean(parsed.demo) };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  return decodeSession(jar.get(SESSION_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true, // inaccessible au JavaScript de la page
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};

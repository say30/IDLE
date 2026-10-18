import { NextResponse } from "next/server";
import { features, originFrom } from "@/lib/config";
import { jsonError, randomToken } from "@/lib/http";
import { encodeSession, SESSION_COOKIE, sessionCookieOptions, sessionReady } from "@/lib/session";

// Connexion de test, sans compte Roblox. Désactivée quand la connexion Roblox est configurée (sauf ALLOW_DEMO=true).
export async function POST(req: Request) {
  if (!features.demoLogin) return jsonError("Le mode démo est désactivé.", 403);
  if (!sessionReady()) return NextResponse.redirect(`${originFrom(req)}/connexion?erreur=secret-manquant`, 303);
  const res = NextResponse.redirect(`${originFrom(req)}/tableau-de-bord`, 303);
  const session = { uid: `demo:${randomToken(9)}`, name: "Créateur démo", avatar: null, demo: true };
  res.cookies.set(SESSION_COOKIE, encodeSession(session), sessionCookieOptions);
  return res;
}

import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { config, features, originFrom } from "@/lib/config";
import { randomToken } from "@/lib/http";
import { sessionReady } from "@/lib/session";

// Étape 1 : on envoie le créateur sur le site officiel de Roblox pour qu'il autorise la connexion.
// On ne voit JAMAIS son mot de passe : Roblox nous renvoie seulement son identifiant, son pseudo et son avatar.
export async function GET(req: Request) {
  const origin = originFrom(req);
  if (!features.roblox) return NextResponse.redirect(`${origin}/connexion?erreur=roblox-non-configure`);
  if (!sessionReady()) return NextResponse.redirect(`${origin}/connexion?erreur=secret-manquant`);

  const state = randomToken(16);
  const verifier = randomToken(48);
  const challenge = createHash("sha256").update(verifier).digest("base64url");

  const url = new URL("https://apis.roblox.com/oauth/v1/authorize");
  url.searchParams.set("client_id", config.roblox.clientId);
  url.searchParams.set("redirect_uri", `${origin}/api/auth/roblox/callback`);
  url.searchParams.set("scope", "openid profile");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");

  const res = NextResponse.redirect(url.toString());
  const opts = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 600 };
  res.cookies.set("rbx_state", state, opts);
  res.cookies.set("rbx_verifier", verifier, opts);
  return res;
}

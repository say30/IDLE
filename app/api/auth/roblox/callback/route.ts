import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { config, features, originFrom } from "@/lib/config";
import { encodeSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

// Étape 2 : Roblox nous renvoie ici avec un code temporaire qu'on échange contre l'identité du créateur.
export async function GET(req: Request) {
  const origin = originFrom(req);
  const fail = (reason: string) => NextResponse.redirect(`${origin}/connexion?erreur=${reason}`);
  if (!features.roblox) return fail("roblox-non-configure");

  const params = new URL(req.url).searchParams;
  const jar = await cookies();
  const state = jar.get("rbx_state")?.value;
  const verifier = jar.get("rbx_verifier")?.value;
  const code = params.get("code");
  if (!code || !state || !verifier || params.get("state") !== state) return fail("session-expiree");

  const tokenRes = await fetch("https://apis.roblox.com/oauth/v1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      code_verifier: verifier,
      redirect_uri: `${origin}/api/auth/roblox/callback`,
      client_id: config.roblox.clientId,
      client_secret: config.roblox.clientSecret,
    }),
  });
  if (!tokenRes.ok) return fail("roblox-refus");
  const { access_token } = await tokenRes.json();

  const userRes = await fetch("https://apis.roblox.com/oauth/v1/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!userRes.ok) return fail("roblox-refus");
  const user = await userRes.json();

  const res = NextResponse.redirect(`${origin}/tableau-de-bord`);
  const session = {
    uid: `roblox:${user.sub}`,
    name: user.nickname || user.preferred_username || user.name || "Créateur",
    avatar: typeof user.picture === "string" ? user.picture : null,
    demo: false,
  };
  res.cookies.set(SESSION_COOKIE, encodeSession(session), sessionCookieOptions);
  res.cookies.delete("rbx_state");
  res.cookies.delete("rbx_verifier");
  return res;
}

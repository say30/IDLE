// Lit la configuration côté serveur uniquement. Ces valeurs ne sont jamais envoyées au navigateur.
import "server-only";

const env = (name: string) => (process.env[name] ?? "").trim();

export const config = {
  siteUrl: env("SITE_URL").replace(/\/$/, ""),
  sessionSecret: env("SESSION_SECRET"),
  gemini: { apiKey: env("GEMINI_API_KEY"), model: env("GEMINI_MODEL") || "gemini-2.5-flash" },
  roblox: { clientId: env("ROBLOX_CLIENT_ID"), clientSecret: env("ROBLOX_CLIENT_SECRET") },
  supabase: { url: env("SUPABASE_URL").replace(/\/$/, ""), serviceKey: env("SUPABASE_SERVICE_ROLE_KEY") },
  freeDailyCoins: Number(env("FREE_DAILY_COINS")) || 25,
};

export const features = {
  ai: Boolean(config.gemini.apiKey),
  roblox: Boolean(config.roblox.clientId && config.roblox.clientSecret),
  database: Boolean(config.supabase.url && config.supabase.serviceKey),
  get demoLogin() {
    return !this.roblox || env("ALLOW_DEMO") === "true";
  },
};

/** Adresse du site : SITE_URL si défini, sinon celle de la requête. */
export function originFrom(req: Request): string {
  if (config.siteUrl) return config.siteUrl;
  const url = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
  return `${proto}://${host}`;
}

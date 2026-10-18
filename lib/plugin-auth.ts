import "server-only";
import { sha256 } from "./http";
import { store } from "./store";

/** Le plugin s'identifie avec "Authorization: Bearer <jeton>". On compare l'empreinte, jamais le jeton en clair. */
export async function linkFromRequest(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!token || token.length < 20) return null;
  return store.findLink("token_hash", sha256(token));
}

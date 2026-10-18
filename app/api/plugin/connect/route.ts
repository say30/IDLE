import { NextResponse } from "next/server";
import { jsonError, randomToken, sha256 } from "@/lib/http";
import { store } from "@/lib/store";

// Le plugin envoie le code affiché sur le site et reçoit un jeton personnel en échange.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const code = String(body.code ?? "").trim().toUpperCase().replace(/\s/g, "");
  const normalized = code.includes("-") ? code : `${code.slice(0, 3)}-${code.slice(3)}`;
  if (!/^[A-Z0-9]{3}-[A-Z0-9]{3}$/.test(normalized)) return jsonError("Code invalide.");

  const link = await store.findLink("code", normalized);
  if (!link || !link.code_expires_at || Date.parse(link.code_expires_at) < Date.now()) {
    return jsonError("Code inconnu ou expiré. Génère un nouveau code sur le site.", 404);
  }
  const project = await store.getProject(link.project_id);
  if (!project) return jsonError("Projet introuvable.", 404);

  const token = randomToken();
  await store.saveLink({
    ...link,
    code: null,
    code_expires_at: null,
    token_hash: sha256(token),
    last_seen: new Date().toISOString(),
  });
  return NextResponse.json({ token, projectName: project.name });
}

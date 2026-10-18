import { NextResponse } from "next/server";
import { newId, pairingCode, requireProject } from "@/lib/http";
import { store } from "@/lib/store";

// Crée un code à usage unique (valable 10 min) que le créateur tape dans le plugin Studio.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireProject((await params).id);
  if (!g.ok) return g.response;
  const { project, session } = g.value;

  await store.deleteLinksForProject(project.id); // un seul Studio relié par projet
  const code = pairingCode();
  const expires = new Date(Date.now() + 10 * 60_000).toISOString();
  await store.saveLink({
    id: newId(),
    project_id: project.id,
    owner: session.uid,
    code,
    code_expires_at: expires,
    token_hash: null,
    delivered_version: 0,
    last_seen: null,
    created_at: new Date().toISOString(),
  });
  return NextResponse.json({ code, expiresAt: expires });
}

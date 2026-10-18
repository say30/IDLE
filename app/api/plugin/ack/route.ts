import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { linkFromRequest } from "@/lib/plugin-auth";
import { store } from "@/lib/store";

// Le plugin confirme qu'il a bien appliqué une version dans Studio.
export async function POST(req: Request) {
  const link = await linkFromRequest(req);
  if (!link) return jsonError("Plugin non relié.", 401);
  const body = await req.json().catch(() => ({}));
  const version = Number(body.version);
  if (!Number.isInteger(version) || version < 0) return jsonError("Version invalide.");
  await store.saveLink({ ...link, delivered_version: Math.max(link.delivered_version, version), last_seen: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}

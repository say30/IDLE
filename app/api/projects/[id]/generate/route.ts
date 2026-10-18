import { NextResponse } from "next/server";
import { AiError, generate, mergeFiles } from "@/lib/ai";
import { ensureProfile, levelFromXp, spendCoin } from "@/lib/coins";
import { jsonError, requireProject } from "@/lib/http";
import { store } from "@/lib/store";

export const maxDuration = 60; // secondes (limite de l'offre gratuite Vercel)

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireProject((await params).id);
  if (!g.ok) return g.response;
  const { session, project } = g.value;

  const body = await req.json().catch(() => ({}));
  const message = String(body.message ?? "").trim().slice(0, 4000);
  if (!message) return jsonError("Écris ce que tu veux construire.");

  const profile = await ensureProfile(session);
  if (profile.coins <= 0) return jsonError("Plus de pièces pour aujourd'hui ! Elles reviennent demain. 🪙", 402);

  let result;
  try {
    result = await generate({ template: project.template, files: project.files, history: project.messages, message });
  } catch (e) {
    return jsonError(e instanceof AiError ? e.message : "Erreur inattendue, réessaie.", 502);
  }

  const now = new Date().toISOString();
  const changed = result.files.length > 0 || result.deleted.length > 0;
  const saved = await store.saveProject({
    ...project,
    files: mergeFiles(project.files, result),
    messages: [
      ...project.messages,
      { role: "user" as const, content: message, at: now },
      { role: "assistant" as const, content: result.reply, at: now },
    ].slice(-100),
    version: changed ? project.version + 1 : project.version,
    updated_at: now,
  });
  const after = (await spendCoin(profile, changed ? 10 : 2)) ?? profile;

  return NextResponse.json({
    project: saved,
    changedPaths: result.files.map((f) => f.path),
    profile: { coins: after.coins, xp: after.xp, level: levelFromXp(after.xp), leveledUp: levelFromXp(after.xp) > levelFromXp(profile.xp) },
  });
}

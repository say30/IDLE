import { NextResponse } from "next/server";
import { jsonError, newId, requireSession } from "@/lib/http";
import { store } from "@/lib/store";
import { templateById } from "@/lib/templates";

export async function GET() {
  const s = await requireSession();
  if (!s.ok) return s.response;
  const projects = await store.listProjects(s.value.uid);
  return NextResponse.json({ projects: projects.map(({ files, messages, ...p }) => ({ ...p, fileCount: files.length })) });
}

export async function POST(req: Request) {
  const s = await requireSession();
  if (!s.ok) return s.response;
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim().slice(0, 60);
  if (!name) return jsonError("Donne un nom à ton jeu.");
  if ((await store.listProjects(s.value.uid)).length >= 20) return jsonError("Maximum 20 projets pour l'instant.");

  const now = new Date().toISOString();
  const project = await store.saveProject({
    id: newId(),
    owner: s.value.uid,
    name,
    template: templateById(String(body.template ?? "blank")).id,
    files: [],
    messages: [],
    version: 0,
    created_at: now,
    updated_at: now,
  });
  return NextResponse.json({ project });
}

import { NextResponse } from "next/server";
import { requireProject } from "@/lib/http";
import { store } from "@/lib/store";
import { studioStatus } from "@/lib/studio";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const g = await requireProject((await params).id);
  if (!g.ok) return g.response;
  return NextResponse.json({ project: g.value.project, studio: await studioStatus(g.value.project) });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const g = await requireProject((await params).id);
  if (!g.ok) return g.response;
  await store.deleteLinksForProject(g.value.project.id);
  await store.deleteProject(g.value.project.id);
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { linkFromRequest } from "@/lib/plugin-auth";
import { store } from "@/lib/store";

// Appelé toutes les 2 secondes par le plugin : renvoie les scripts si une nouvelle version existe.
export async function GET(req: Request) {
  const link = await linkFromRequest(req);
  if (!link) return jsonError("Plugin non relié. Reconnecte-le avec un nouveau code.", 401);
  const project = await store.getProject(link.project_id);
  if (!project) return jsonError("Projet supprimé.", 404);

  await store.saveLink({ ...link, last_seen: new Date().toISOString() });
  const pending = project.version > link.delivered_version;
  return NextResponse.json({
    projectName: project.name,
    version: project.version,
    files: pending ? project.files : null,
  });
}

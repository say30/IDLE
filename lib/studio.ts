import "server-only";
import { store } from "./store";
import type { Project, StudioStatus } from "./types";

const ONLINE_WINDOW_MS = 15_000;

export async function studioStatus(project: Project): Promise<StudioStatus> {
  const link = await store.findLink("project_id", project.id);
  if (!link?.token_hash) return { linked: false, online: false, synced: false, lastSeen: null };
  const online = Boolean(link.last_seen && Date.now() - Date.parse(link.last_seen) < ONLINE_WINDOW_MS);
  return { linked: true, online, synced: link.delivered_version >= project.version, lastSeen: link.last_seen };
}

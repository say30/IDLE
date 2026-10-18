// Stockage des données : Supabase si configuré, sinon mémoire (mode démo, effacé au redémarrage).
import "server-only";
import { config, features } from "./config";
import type { PluginLink, Profile, Project } from "./types";

export interface Store {
  getProfile(id: string): Promise<Profile | null>;
  saveProfile(p: Profile): Promise<Profile>;
  listProjects(owner: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  saveProject(p: Project): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  findLink(field: "id" | "code" | "token_hash" | "project_id", value: string): Promise<PluginLink | null>;
  saveLink(l: PluginLink): Promise<PluginLink>;
  deleteLinksForProject(projectId: string): Promise<void>;
}

// ---------- Mémoire ----------
type Mem = { profiles: Map<string, Profile>; projects: Map<string, Project>; links: Map<string, PluginLink> };
const g = globalThis as unknown as { __idleforge?: Mem };
const mem: Mem = (g.__idleforge ??= { profiles: new Map(), projects: new Map(), links: new Map() });

const memoryStore: Store = {
  async getProfile(id) {
    return mem.profiles.get(id) ?? null;
  },
  async saveProfile(p) {
    mem.profiles.set(p.id, p);
    return p;
  },
  async listProjects(owner) {
    return [...mem.projects.values()]
      .filter((p) => p.owner === owner)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  },
  async getProject(id) {
    return mem.projects.get(id) ?? null;
  },
  async saveProject(p) {
    mem.projects.set(p.id, p);
    return p;
  },
  async deleteProject(id) {
    mem.projects.delete(id);
  },
  async findLink(field, value) {
    const matches = [...mem.links.values()].filter((l) => l[field] === value);
    return matches.sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null;
  },
  async saveLink(l) {
    mem.links.set(l.id, l);
    return l;
  },
  async deleteLinksForProject(projectId) {
    for (const [id, l] of mem.links) if (l.project_id === projectId) mem.links.delete(id);
  },
};

// ---------- Supabase (API REST, clé service_role côté serveur uniquement) ----------
async function rest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${config.supabase.url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: config.supabase.serviceKey,
      Authorization: `Bearer ${config.supabase.serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation,resolution=merge-duplicates",
      ...init.headers,
    },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

const eq = (v: string) => `eq.${encodeURIComponent(v)}`;
const upsert = <T>(table: string, row: T) =>
  rest<T[]>(`${table}?on_conflict=id`, { method: "POST", body: JSON.stringify(row) }).then((r) => r[0]);

const supabaseStore: Store = {
  async getProfile(id) {
    return (await rest<Profile[]>(`profiles?id=${eq(id)}&limit=1`))[0] ?? null;
  },
  saveProfile: (p) => upsert("profiles", p),
  listProjects: (owner) => rest<Project[]>(`projects?owner=${eq(owner)}&order=updated_at.desc`),
  async getProject(id) {
    return (await rest<Project[]>(`projects?id=${eq(id)}&limit=1`))[0] ?? null;
  },
  saveProject: (p) => upsert("projects", p),
  async deleteProject(id) {
    await rest(`projects?id=${eq(id)}`, { method: "DELETE" });
  },
  async findLink(field, value) {
    return (await rest<PluginLink[]>(`plugin_links?${field}=${eq(value)}&order=created_at.desc&limit=1`))[0] ?? null;
  },
  saveLink: (l) => upsert("plugin_links", l),
  async deleteLinksForProject(projectId) {
    await rest(`plugin_links?project_id=${eq(projectId)}`, { method: "DELETE" });
  },
};

export const store: Store = features.database ? supabaseStore : memoryStore;

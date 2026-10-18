export type ScriptClass = "Script" | "LocalScript" | "ModuleScript";

/** Un script du jeu. path = emplacement dans Studio, ex. "ServerScriptService/Tycoon/Main". */
export type GameFile = { path: string; className: ScriptClass; source: string };

export type ChatMessage = { role: "user" | "assistant"; content: string; at: string };

export type Project = {
  id: string;
  owner: string;
  name: string;
  template: string;
  files: GameFile[];
  messages: ChatMessage[];
  version: number;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  name: string;
  avatar: string | null;
  coins: number;
  coins_day: string;
  xp: number;
  created_at: string;
};

/** Lien entre un projet et un plugin Studio. Le jeton n'est stocké que sous forme d'empreinte. */
export type PluginLink = {
  id: string;
  project_id: string;
  owner: string;
  code: string | null;
  code_expires_at: string | null;
  token_hash: string | null;
  delivered_version: number;
  last_seen: string | null;
  created_at: string;
};

export type StudioStatus = { linked: boolean; online: boolean; synced: boolean; lastSeen: string | null };

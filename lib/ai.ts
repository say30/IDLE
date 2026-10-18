// Appel à l'IA (Google Gemini, offre gratuite). La clé reste sur le serveur : le navigateur ne la voit jamais.
import "server-only";
import { config, features } from "./config";
import { demoFiles } from "./demo-game";
import { templateById } from "./templates";
import type { ChatMessage, GameFile, ScriptClass } from "./types";

export type AiResult = { reply: string; files: GameFile[]; deleted: string[] };

export const ALLOWED_ROOTS = [
  "ServerScriptService",
  "ServerStorage",
  "ReplicatedStorage",
  "ReplicatedFirst",
  "StarterGui",
  "StarterPack",
  "StarterPlayer/StarterPlayerScripts",
  "StarterPlayer/StarterCharacterScripts",
  "Workspace",
];
const CLASSES: ScriptClass[] = ["Script", "LocalScript", "ModuleScript"];
const MAX_FILES = 60;
const MAX_SOURCE = 200_000;

const SYSTEM_PROMPT = `Tu es un développeur Roblox expert qui construit des jeux complets en Luau.
Le créateur décrit ce qu'il veut en français ; tu réponds en JSON uniquement.

Règles :
- Tu renvoies UNIQUEMENT les scripts créés ou modifiés dans "files" (contenu complet du script, jamais de "...").
- "path" = emplacement dans l'Explorer de Studio, avec des "/" : par ex. "ServerScriptService/Tycoon/Main".
  Racines autorisées : ${ALLOWED_ROOTS.join(", ")}.
- "className" : "Script" (serveur), "LocalScript" (client, dans StarterPlayer/StarterPlayerScripts ou StarterGui) ou "ModuleScript".
- Tu ne peux créer QUE des scripts. Les objets 3D (Parts, modèles) et les interfaces (ScreenGui) sont construits PAR CODE
  avec Instance.new au lancement du jeu, avec des couleurs vives et des UICorner : style "tycoon" joyeux.
- Sécurité : toute logique d'argent, d'achat et de dégâts se fait côté serveur ; le client passe par des RemoteEvent
  créés par un Script serveur dans ReplicatedStorage ; vérifie toujours les demandes du client.
- Sauvegarde avec DataStoreService (pcall autour de chaque appel) quand le jeu a une progression.
- Code moderne : task.wait, task.spawn, game:GetService, pas de wait() ni spawn().
- "deleted" : chemins des scripts à supprimer (souvent vide).
- "reply" : 2 à 5 phrases simples en français pour expliquer ce que tu as fait et comment tester (bouton Play dans Studio).`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    reply: { type: "STRING" },
    files: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          path: { type: "STRING" },
          className: { type: "STRING", description: "Script, LocalScript ou ModuleScript" },
          source: { type: "STRING" },
        },
        required: ["path", "className", "source"],
      },
    },
    deleted: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["reply", "files"],
};

/** Nettoie un chemin proposé par l'IA ; renvoie null s'il est hors des zones autorisées. */
export function cleanPath(raw: string): string | null {
  const parts = raw
    .replace(/\\/g, "/")
    .split("/")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts[0]?.toLowerCase() === "game") parts.shift();
  if (parts.length < 2 || parts.some((p) => !/^[\w \-.]{1,60}$/.test(p) || p === "." || p === "..")) return null;
  const path = parts.join("/");
  return ALLOWED_ROOTS.some((root) => path.startsWith(root + "/")) ? path : null;
}

function sanitize(result: Partial<AiResult>): AiResult {
  const files: GameFile[] = [];
  for (const f of result.files ?? []) {
    const path = typeof f?.path === "string" ? cleanPath(f.path) : null;
    if (!path || !CLASSES.includes(f.className) || typeof f.source !== "string") continue;
    files.push({ path, className: f.className, source: f.source.slice(0, MAX_SOURCE) });
  }
  const deleted = (result.deleted ?? []).map((d) => (typeof d === "string" ? cleanPath(d) : null)).filter(Boolean) as string[];
  return {
    reply: typeof result.reply === "string" && result.reply ? result.reply : "C'est fait ! Regarde les scripts mis à jour.",
    files: files.slice(0, MAX_FILES),
    deleted,
  };
}

export async function generate(input: {
  template: string;
  files: GameFile[];
  history: ChatMessage[];
  message: string;
}): Promise<AiResult> {
  if (!features.ai) {
    await new Promise((r) => setTimeout(r, 900));
    return {
      reply:
        "Mode démo : aucune clé IA n'est configurée, alors je t'envoie un petit jeu d'exemple (pièces qui montent toutes les secondes + bouton à cliquer). Ajoute GEMINI_API_KEY pour que l'IA construise vraiment ton idée.",
      files: demoFiles(),
      deleted: [],
    };
  }

  const template = templateById(input.template);
  const context = [
    `Type de jeu choisi : ${template.name}.`,
    input.files.length
      ? `Scripts actuels du jeu :\n${input.files.map((f) => `--- ${f.path} (${f.className})\n${f.source}`).join("\n\n")}`
      : "Le jeu est vide pour l'instant.",
  ].join("\n\n");

  const contents = [
    { role: "user", parts: [{ text: context }] },
    { role: "model", parts: [{ text: '{"reply":"Bien reçu, j\'ai le contexte du jeu.","files":[]}' }] },
    ...input.history.slice(-10).map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: input.message }] },
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.gemini.model)}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": config.gemini.apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.6,
          maxOutputTokens: 32768,
        },
      }),
    },
  );

  if (res.status === 429) throw new AiError("L'IA gratuite est très demandée en ce moment. Réessaie dans une minute.");
  if (!res.ok) {
    console.error("Gemini error", res.status, await res.text());
    throw new AiError("L'IA n'a pas pu répondre. Réessaie dans un instant.");
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("");
  if (!text) throw new AiError("L'IA a renvoyé une réponse vide. Reformule ta demande.");
  try {
    return sanitize(JSON.parse(text));
  } catch {
    throw new AiError("La réponse de l'IA était trop longue ou incomplète. Demande une modification plus petite.");
  }
}

export class AiError extends Error {}

/** Fusionne les scripts renvoyés par l'IA dans ceux du projet. */
export function mergeFiles(current: GameFile[], result: AiResult): GameFile[] {
  const byPath = new Map(current.map((f) => [f.path, f]));
  for (const d of result.deleted) byPath.delete(d);
  for (const f of result.files) byPath.set(f.path, f);
  return [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path));
}

import { readFile } from "node:fs/promises";
import path from "node:path";
import { originFrom } from "@/lib/config";
import { BRAND } from "@/lib/brand";

// Sert le plugin Studio avec l'adresse du site déjà remplie.
export async function GET(req: Request) {
  const source = await readFile(path.join(process.cwd(), "plugin", "IdleForge.server.lua"), "utf8");
  const filled = source.replaceAll("__SITE_URL__", originFrom(req)).replaceAll("__BRAND__", BRAND.name);
  return new Response(filled, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${BRAND.name}.server.lua"`,
    },
  });
}

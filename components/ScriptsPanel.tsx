"use client";

import { useEffect, useState } from "react";
import type { GameFile } from "@/lib/types";

const ICONS: Record<GameFile["className"], string> = { Script: "📗", LocalScript: "📘", ModuleScript: "📙" };

export function ScriptsPanel({ files, highlighted }: { files: GameFile[]; highlighted: string[] }) {
  const [selected, setSelected] = useState<string | null>(files[0]?.path ?? null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (highlighted[0]) setSelected(highlighted[0]);
  }, [highlighted]);

  if (files.length === 0) {
    return (
      <div className="grid h-full place-items-center p-8 text-center">
        <div>
          <div className="text-5xl">📭</div>
          <p className="mt-3 font-display text-lg font-semibold">Aucun script pour l&apos;instant</p>
          <p className="text-ink-soft">Envoie ta première demande à l&apos;IA.</p>
        </div>
      </div>
    );
  }

  const file = files.find((f) => f.path === selected) ?? files[0];

  async function copy() {
    await navigator.clipboard.writeText(file.source);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex h-full flex-col">
      <ul className="max-h-48 shrink-0 overflow-y-auto border-b-3 border-black/5 p-2">
        {files.map((f) => (
          <li key={f.path}>
            <button
              onClick={() => setSelected(f.path)}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-left text-sm ${
                f.path === file.path ? "bg-gold/25 font-semibold" : "hover:bg-cream"
              }`}
            >
              <span>{ICONS[f.className]}</span>
              <span className="truncate font-mono">{f.path}</span>
              {highlighted.includes(f.path) && <span className="chip ml-auto bg-grass px-2 py-0 text-xs text-white">nouveau</span>}
            </button>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between px-4 py-2 text-sm">
        <span className="truncate font-semibold text-ink-soft">
          {file.className} · {file.path.split("/").pop()}
        </span>
        <button onClick={copy} className="btn btn-white btn-sm">{copied ? "✅ Copié" : "📋 Copier"}</button>
      </div>
      <pre className="code min-h-0 flex-1 overflow-auto bg-ink p-4 text-emerald-100">{file.source}</pre>
    </div>
  );
}

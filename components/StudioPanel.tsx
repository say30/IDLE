"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { StudioStatus } from "@/lib/types";

export function StudioPanel({ projectId, status, onChange }: { projectId: string; status: StudioStatus; onChange: () => void }) {
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number>(0);
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!code) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [code]);

  // Le code disparaît dès que le plugin s'est connecté
  useEffect(() => {
    if (status.linked) setCode(null);
  }, [status.linked]);

  async function newCode() {
    setBusy(true);
    const res = await fetch(`/api/projects/${projectId}/pair`, { method: "POST" });
    const data = await res.json();
    setBusy(false);
    if (res.ok) {
      setCode(data.code);
      setExpiresAt(Date.parse(data.expiresAt));
      setNow(Date.now());
      onChange();
    }
  }

  const remaining = Math.max(0, Math.round((expiresAt - now) / 1000));

  if (status.linked && !code) {
    return (
      <div className="p-6">
        <div className={`rounded-3xl p-6 text-center ${status.online ? "bg-grass/15" : "bg-brick/15"}`}>
          <div className="text-5xl">{status.online ? "🟢" : "🟠"}</div>
          <p className="mt-3 font-display text-2xl font-bold">
            {status.online ? "Studio est connecté" : "Studio est hors ligne"}
          </p>
          <p className="mt-1 text-ink-soft">
            {status.online
              ? status.synced
                ? "Tout est synchronisé. Clique sur Play dans Studio pour tester !"
                : "Envoi des derniers scripts vers Studio…"
              : "Ouvre ton jeu dans Studio : le plugin se reconnecte tout seul."}
          </p>
        </div>
        <button onClick={newCode} disabled={busy} className="btn btn-white btn-sm mt-6">
          🔁 Relier un autre Studio
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-6">
      <h2 className="text-2xl font-bold">Relie ton jeu Studio</h2>
      <ol className="space-y-4">
        <Step n={1} title="Installe le plugin (une seule fois)">
          <Link href="/plugin" className="font-semibold text-ocean-dark underline">Suis le guide d&apos;installation</Link>{" "}
          (1 minute).
        </Step>
        <Step n={2} title="Ouvre ton jeu dans Roblox Studio">
          Un jeu vide (Baseplate) suffit pour commencer.
        </Step>
        <Step n={3} title="Tape ce code dans le plugin">
          {code && remaining > 0 ? (
            <div className="mt-3 rounded-3xl bg-gold/25 p-5 text-center">
              <p className="select-all font-mono text-4xl font-bold tracking-widest">{code}</p>
              <p className="mt-2 text-sm text-ink-soft">
                Expire dans {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")} · en attente du plugin…
              </p>
            </div>
          ) : (
            <button onClick={newCode} disabled={busy} className="btn btn-gold mt-3">
              {busy ? "…" : "🔑 Afficher mon code"}
            </button>
          )}
        </Step>
      </ol>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink font-display font-bold text-white">{n}</span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg font-semibold">{title}</p>
        <div className="text-ink-soft">{children}</div>
      </div>
    </li>
  );
}

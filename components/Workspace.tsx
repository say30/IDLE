"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Template } from "@/lib/templates";
import type { Project, StudioStatus } from "@/lib/types";
import { Coin } from "./Coin";
import { ScriptsPanel } from "./ScriptsPanel";
import { StudioPanel } from "./StudioPanel";

const IDEAS = [
  "Ajoute une boutique avec 3 améliorations",
  "Fais un leaderboard des plus riches",
  "Ajoute la sauvegarde de l'argent",
  "Rends l'interface plus colorée",
];

type Props = {
  initialProject: Project;
  initialStudio: StudioStatus;
  initialCoins: number;
  template: Template;
  aiReady: boolean;
};

export function Workspace({ initialProject, initialStudio, initialCoins, template, aiReady }: Props) {
  const router = useRouter();
  const [project, setProject] = useState(initialProject);
  const [studio, setStudio] = useState(initialStudio);
  const [coins, setCoins] = useState(initialCoins);
  const [tab, setTab] = useState<"studio" | "scripts">(initialProject.files.length ? "scripts" : "studio");
  const [input, setInput] = useState(initialProject.messages.length ? "" : template.prompt);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [changed, setChanged] = useState<string[]>([]);
  const [coinPop, setCoinPop] = useState(0);
  const chatBox = useRef<HTMLDivElement>(null);

  // Fait défiler uniquement la zone du chat (pas toute la page) vers le dernier message
  useEffect(() => {
    const box = chatBox.current;
    if (box) box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
  }, [project.messages.length, busy]);

  // Vérifie l'état du plugin Studio toutes les 3 secondes
  const refresh = useCallback(async () => {
    const res = await fetch(`/api/projects/${project.id}`, { cache: "no-store" });
    if (res.ok) setStudio((await res.json()).studio);
  }, [project.id]);
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, 3000);
    return () => clearInterval(id);
  }, [refresh]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setBusy(true);
    setError("");
    setInput("");
    const optimistic = { ...project, messages: [...project.messages, { role: "user" as const, content: message, at: new Date().toISOString() }] };
    setProject(optimistic);

    const res = await fetch(`/api/projects/${project.id}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await res.json().catch(() => ({ error: "Réponse illisible du serveur." }));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Erreur");
      setProject(project);
      setInput(message);
      return;
    }
    setProject(data.project);
    setCoins(data.profile.coins);
    setChanged(data.changedPaths);
    setCoinPop((n) => n + 1);
    if (data.changedPaths.length) setTab("scripts");
    if (data.profile.leveledUp) showToast(`⭐ Niveau ${data.profile.level} atteint !`);
    refresh();
  }

  function showToast(text: string) {
    setToast(text);
    setTimeout(() => setToast(""), 3500);
  }

  async function remove() {
    if (!confirm(`Supprimer « ${project.name} » ? Les scripts déjà dans Studio restent dans ton jeu.`)) return;
    await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    router.push("/tableau-de-bord");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/tableau-de-bord" className="btn btn-white btn-sm" aria-label="Retour">←</Link>
          <span className="grid size-12 place-items-center rounded-2xl text-3xl" style={{ background: template.color }}>
            {template.emoji}
          </span>
          <div>
            <h1 className="text-2xl font-bold leading-tight">{project.name}</h1>
            <p className="text-sm text-ink-soft">
              {template.name} · version {project.version}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex items-center gap-2 rounded-2xl bg-gold/30 px-4 py-2 font-display text-lg font-bold">
            <Coin size={24} /> {coins}
            {coinPop > 0 && (
              <span key={coinPop} className="animate-rise absolute -top-2 right-2 text-sm text-gold-dark">
                -1
              </span>
            )}
          </div>
          <button onClick={remove} className="btn btn-white btn-sm" title="Supprimer le projet">🗑️</button>
        </div>
      </div>

      {!aiReady && (
        <p className="mt-4 rounded-2xl bg-amber-100 p-3 text-sm font-semibold text-amber-900">
          🧪 Mode démo : aucune clé IA configurée, l&apos;IA renvoie un jeu d&apos;exemple. Ajoute GEMINI_API_KEY pour la vraie génération.
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Chat */}
        <section className="card flex h-[70vh] min-h-[480px] flex-col overflow-hidden">
          <div className="border-b-3 border-black/5 bg-cream px-5 py-3 font-display font-bold">💬 Atelier IA</div>
          <div ref={chatBox} className="flex-1 space-y-4 overflow-y-auto p-5">
            {project.messages.length === 0 && (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <div className="text-6xl">🤖</div>
                  <p className="mt-3 font-display text-xl font-semibold">Dis-moi quel jeu construire !</p>
                  <p className="text-ink-soft">J&apos;ai prérempli une idée selon ton modèle. Modifie-la ou envoie-la.</p>
                </div>
              </div>
            )}
            {project.messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-3xl px-4 py-3 ${
                    m.role === "user" ? "rounded-br-md bg-grass text-white" : "rounded-bl-md bg-sky-bottom text-ink"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="w-64 rounded-3xl rounded-bl-md bg-sky-bottom p-4">
                  <p className="font-display font-semibold">🏗️ L&apos;IA construit ton jeu…</p>
                  <div className="conveyor mt-3 h-3 rounded-full" />
                </div>
              </div>
            )}
          </div>
          <div className="border-t-3 border-black/5 p-4">
            {error && <p className="mb-2 text-sm font-semibold text-red-600">{error}</p>}
            <div className="mb-3 flex flex-wrap gap-2">
              {IDEAS.map((idea) => (
                <button key={idea} onClick={() => setInput(idea)} className="chip bg-cream text-ink-soft hover:bg-gold/30" disabled={busy}>
                  {idea}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-end gap-2"
            >
              <textarea
                className="input min-h-[52px] resize-none"
                rows={2}
                placeholder="Décris ce que tu veux ajouter ou changer…"
                value={input}
                maxLength={4000}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
              />
              <button className="btn btn-green h-[52px] shrink-0" disabled={busy || !input.trim() || coins <= 0}>
                {busy ? "…" : <>Envoyer <Coin size={18} /></>}
              </button>
            </form>
          </div>
        </section>

        {/* Studio / Scripts */}
        <section className="card flex h-[70vh] min-h-[480px] flex-col overflow-hidden">
          <div className="flex gap-2 border-b-3 border-black/5 bg-cream p-2">
            <TabButton active={tab === "studio"} onClick={() => setTab("studio")}>
              🔌 Studio <StatusDot status={studio} />
            </TabButton>
            <TabButton active={tab === "scripts"} onClick={() => setTab("scripts")}>
              📜 Scripts ({project.files.length})
            </TabButton>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {tab === "studio" ? (
              <StudioPanel projectId={project.id} status={studio} onChange={refresh} />
            ) : (
              <ScriptsPanel files={project.files} highlighted={changed} />
            )}
          </div>
        </section>
      </div>

      {toast && (
        <div className="animate-pop fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-ink px-6 py-3 font-display text-lg font-bold text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-4 py-2 font-display font-semibold transition ${
        active ? "bg-white shadow-[0_3px_0_rgb(0_0_0/0.08)]" : "text-ink-soft hover:bg-white/60"
      }`}
    >
      {children}
    </button>
  );
}

function StatusDot({ status }: { status: StudioStatus }) {
  const color = !status.linked ? "bg-stone-300" : status.online ? "bg-grass" : "bg-brick";
  return <span className={`inline-block size-2.5 rounded-full ${color}`} />;
}

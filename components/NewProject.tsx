"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TEMPLATES } from "@/lib/templates";

export function NewProject() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [template, setTemplate] = useState("tycoon");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, template }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Erreur");
      setBusy(false);
      return;
    }
    router.push(`/projet/${data.project.id}`);
  }

  return (
    <form onSubmit={create} className="card h-fit p-6">
      <h2 className="text-2xl font-bold">➕ Nouveau jeu</h2>
      <label className="mt-5 block font-display font-semibold" htmlFor="name">Nom du jeu</label>
      <input
        id="name"
        className="input mt-2"
        placeholder="Mon super tycoon"
        value={name}
        maxLength={60}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <p className="mt-5 font-display font-semibold">Type de jeu</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {TEMPLATES.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => setTemplate(t.id)}
            className={`flex items-center gap-2 rounded-2xl border-3 p-2 text-left font-display font-semibold transition ${
              template === t.id ? "border-gold bg-gold/20" : "border-black/5 bg-white hover:border-black/15"
            }`}
          >
            <span className="text-2xl">{t.emoji}</span>
            <span className="text-sm">{t.name}</span>
          </button>
        ))}
      </div>
      {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}
      <button className="btn btn-green mt-6 w-full" disabled={busy || !name.trim()}>
        {busy ? "Création…" : "🔨 Construire"}
      </button>
    </form>
  );
}

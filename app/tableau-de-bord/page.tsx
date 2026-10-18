import Link from "next/link";
import { redirect } from "next/navigation";
import { ensureProfile, levelFromXp } from "@/lib/coins";
import { config, features } from "@/lib/config";
import { getSession } from "@/lib/session";
import { store } from "@/lib/store";
import { templateById } from "@/lib/templates";
import { Coin } from "@/components/Coin";
import { NewProject } from "@/components/NewProject";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/connexion");
  const profile = await ensureProfile(session);
  const projects = await store.listProjects(session.uid);
  const level = levelFromXp(profile.xp);
  const xpInLevel = profile.xp % 100;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {!features.database && (
        <p className="mb-6 rounded-2xl bg-amber-100 p-3 text-sm font-semibold text-amber-900">
          🧪 Mode démo : les projets sont gardés en mémoire et disparaissent au redémarrage du serveur. Configure
          Supabase pour les sauvegarder.
        </p>
      )}

      {/* Barre du créateur façon tycoon */}
      <div className="card flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {session.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.avatar} alt="" className="size-16 rounded-2xl bg-sky-bottom" />
          ) : (
            <div className="grid size-16 place-items-center rounded-2xl bg-sky-top text-3xl">🧑‍🚀</div>
          )}
          <div>
            <p className="text-sm text-ink-soft">Salut,</p>
            <h1 className="text-2xl font-bold">{session.name}</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Stat label="Pièces du jour" value={`${profile.coins} / ${config.freeDailyCoins}`} icon={<Coin size={26} spin />} tone="bg-gold/30" />
          <div className="rounded-2xl bg-ocean/15 px-4 py-2">
            <p className="text-xs font-semibold text-ink-soft">Niveau créateur</p>
            <p className="font-display text-xl font-bold">⭐ {level}</p>
            <div className="mt-1 h-2 w-32 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-ocean" style={{ width: `${xpInLevel}%` }} />
            </div>
          </div>
          <Stat label="Jeux" value={String(projects.length)} icon="🎮" tone="bg-grass/20" />
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <h2 className="text-2xl font-bold">Mes jeux</h2>
          {projects.length === 0 ? (
            <div className="card mt-4 grid place-items-center p-12 text-center">
              <div className="text-6xl">🏝️</div>
              <p className="mt-3 font-display text-xl font-semibold">Ton île est encore vide</p>
              <p className="text-ink-soft">Crée ton premier jeu avec le formulaire à droite.</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {projects.map((p) => {
                const t = templateById(p.template);
                return (
                  <Link key={p.id} href={`/projet/${p.id}`} className="card group overflow-hidden transition hover:-translate-y-1">
                    <div className="flex h-20 items-center justify-between px-5" style={{ background: t.color }}>
                      <span className="text-4xl">{t.emoji}</span>
                      <span className="chip bg-white/90 text-ink">v{p.version}</span>
                    </div>
                    <div className="p-4">
                      <h3 className="truncate text-xl font-bold">{p.name}</h3>
                      <p className="text-sm text-ink-soft">
                        {t.name} · {p.files.length} script{p.files.length > 1 ? "s" : ""} ·{" "}
                        {new Date(p.updated_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        <NewProject />
      </div>
    </div>
  );
}

function Stat({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone: string }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl px-4 py-2 ${tone}`}>
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xs font-semibold text-ink-soft">{label}</p>
        <p className="font-display text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

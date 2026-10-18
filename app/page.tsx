import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { TEMPLATES } from "@/lib/templates";
import { Coin } from "@/components/Coin";

const STEPS = [
  { emoji: "💬", color: "bg-gold", title: "Décris ton jeu", text: "« Un tycoon de pizzeria avec des fours à acheter. » En français, sans coder." },
  { emoji: "🤖", color: "bg-ocean", title: "L'IA construit", text: "Elle écrit tous les scripts : argent, boutiques, interfaces, sauvegarde." },
  { emoji: "🎮", color: "bg-grass", title: "Ça arrive dans Studio", text: "Le plugin installe tout dans ton jeu ouvert. Tu cliques sur Play, c'est jouable." },
];

const FAQ = [
  {
    q: "C'est vraiment gratuit ?",
    a: "Oui. Chaque jour tu reçois des pièces gratuites : une pièce = une demande à l'IA. Elles reviennent tous les jours.",
  },
  {
    q: "Je dois savoir coder ?",
    a: "Non. Tu décris ce que tu veux et tu demandes des changements comme à un ami développeur. Le code reste visible si tu veux apprendre.",
  },
  {
    q: "Pourquoi un plugin Studio ?",
    a: "Parce que c'est dans Roblox Studio que ton jeu vit et se publie. Le plugin reçoit les scripts écrits par l'IA et les place au bon endroit, sans copier-coller.",
  },
  {
    q: "Vous voyez mon mot de passe Roblox ?",
    a: "Jamais. La connexion passe par la page officielle de Roblox, qui nous donne seulement ton pseudo et ton avatar.",
  },
  {
    q: "Le jeu m'appartient ?",
    a: "Oui. Le jeu est publié sur ton compte Roblox et tu gardes tout ce que tu gagnes avec.",
  },
];

export default function Home() {
  return (
    <>
      {/* ---------- Héros ---------- */}
      <section className="sky relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <span className="animate-float absolute left-[8%] top-16 text-5xl">☁️</span>
          <span className="animate-float absolute right-[10%] top-24 text-6xl [animation-delay:1.2s]">☁️</span>
          <span className="animate-float absolute right-[30%] top-10 [animation-delay:.6s]">
            <Coin size={34} spin />
          </span>
          <span className="animate-float absolute left-[22%] top-56 [animation-delay:2s]">
            <Coin size={26} spin />
          </span>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-0 pt-16 text-center md:pt-24">
          <span className="chip animate-pop bg-white/80 text-ink">
            <Coin size={16} /> Gratuit · aucune installation compliquée
          </span>
          <h1 className="animate-pop mx-auto mt-5 max-w-3xl text-4xl font-bold leading-tight text-ink md:text-6xl">
            Construis ton <span className="text-grass-dark">jeu Roblox</span> avec l&apos;IA, en parlant
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-soft md:text-xl">{BRAND.tagline}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/connexion" className="btn btn-green text-lg">🚀 Créer mon jeu</Link>
            <Link href="/comment-ca-marche" className="btn btn-white text-lg">Comment ça marche ?</Link>
          </div>

          {/* Usine tycoon décorative */}
          <div className="relative mx-auto mt-14 max-w-4xl" aria-hidden>
            <div className="flex items-end justify-between px-6">
              <Machine color="bg-brick" label="IDÉE" emoji="💡" />
              <Machine color="bg-ocean" label="IA" emoji="🤖" big />
              <Machine color="bg-berry" label="STUDIO" emoji="🎮" />
            </div>
            <div className="conveyor h-6 rounded-t-lg border-x-4 border-t-4 border-stone-700" />
            <div className="h-10 bg-grass shadow-[inset_0_6px_0_#16a34a]" />
          </div>
        </div>
      </section>

      {/* ---------- 3 étapes ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold md:text-4xl">3 étapes, et ton jeu est jouable</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="card p-6">
              <div className="flex items-center gap-3">
                <span className={`grid size-14 place-items-center rounded-2xl text-3xl ${s.color} shadow-[0_4px_0_rgb(0_0_0/0.15)]`}>
                  {s.emoji}
                </span>
                <span className="font-display text-sm font-semibold text-ink-soft">ÉTAPE {i + 1}</span>
              </div>
              <h3 className="mt-4 text-2xl font-bold">{s.title}</h3>
              <p className="mt-2 text-ink-soft">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Modèles ---------- */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold md:text-4xl">Pars d&apos;un modèle qui cartonne</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-ink-soft">
            Les genres préférés des joueurs Roblox, prêts à personnaliser. Ou une page blanche pour ton idée.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
            {TEMPLATES.map((t) => (
              <div key={t.id} className="card overflow-hidden">
                <div className="grid h-24 place-items-center text-5xl" style={{ background: t.color }}>
                  {t.emoji}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold">{t.name}</h3>
                  <p className="mt-1 text-sm text-ink-soft">{t.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Site + Studio ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">Tu parles sur le site, ton jeu se construit dans Studio</h2>
            <p className="mt-4 text-lg text-ink-soft">
              Le site est ton atelier : tu discutes avec l&apos;IA, tu vois les scripts, tu suis tes projets. Notre petit
              plugin Studio reçoit chaque changement en direct et le place dans ton jeu. Tu n&apos;as rien à copier-coller.
            </p>
            <Link href="/plugin" className="btn btn-blue mt-6">🔌 Voir le plugin</Link>
          </div>
          <div className="card p-6">
            <Flow />
          </div>
        </div>
      </section>

      {/* ---------- Sécurité ---------- */}
      <section className="bg-ink py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold md:text-4xl">🔒 Tes infos restent en sécurité</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["🔑", "Pas de mot de passe", "Connexion via la page officielle Roblox. Nous ne voyons ni ton mot de passe, ni tes Robux."],
              ["🧰", "Clés cachées", "Les clés de l'IA et de la base de données sont gardées sur le serveur, jamais dans ton navigateur."],
              ["🧹", "Plugin prudent", "Le plugin ne touche qu'aux scripts qu'il a créés. Chaque synchro s'annule avec Ctrl+Z."],
            ].map(([e, t, d]) => (
              <div key={t} className="rounded-3xl bg-white/10 p-6">
                <div className="text-4xl">{e}</div>
                <h3 className="mt-3 text-xl font-bold">{t}</h3>
                <p className="mt-2 text-white/80">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold md:text-4xl">Questions fréquentes</h2>
        <div className="mt-8 space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="card group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg font-semibold">
                {f.q}
                <span className="text-2xl transition group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-3 text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------- Appel final ---------- */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="card flex flex-col items-center gap-5 bg-gold p-10 text-center">
          <h2 className="text-3xl font-bold text-amber-950 md:text-4xl">Prêt à lancer ton premier jeu ?</h2>
          <p className="text-amber-900">Tes pièces gratuites t&apos;attendent.</p>
          <Link href="/connexion" className="btn btn-green text-lg">🚀 C&apos;est parti</Link>
        </div>
      </section>
    </>
  );
}

function Machine({ color, label, emoji, big }: { color: string; label: string; emoji: string; big?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`${color} grid place-items-center rounded-t-2xl border-4 border-b-0 border-black/15 ${
          big ? "h-36 w-32 text-6xl md:h-44 md:w-40" : "h-24 w-24 text-4xl md:h-28 md:w-28"
        }`}
      >
        <span className="animate-float">{emoji}</span>
      </div>
      <span className="-mt-1 rounded-md bg-ink px-2 py-0.5 font-display text-xs font-bold text-white">{label}</span>
    </div>
  );
}

function Flow() {
  const rows = [
    ["🌐", "Le site", "Tu écris : « ajoute une boutique de pets »", "bg-gold"],
    ["🤖", "L'IA (sur notre serveur)", "Écrit les scripts Luau du jeu", "bg-ocean"],
    ["🔌", "Le plugin Studio", "Reçoit les scripts toutes les 2 secondes", "bg-berry"],
    ["🎮", "Roblox Studio", "Tu cliques sur Play et tu testes", "bg-grass"],
  ];
  return (
    <ol className="space-y-3">
      {rows.map(([e, t, d, c], i) => (
        <li key={t}>
          <div className="flex items-center gap-4">
            <span className={`grid size-12 shrink-0 place-items-center rounded-xl text-2xl ${c}`}>{e}</span>
            <div>
              <p className="font-display font-bold">{t}</p>
              <p className="text-sm text-ink-soft">{d}</p>
            </div>
          </div>
          {i < rows.length - 1 && <div className="ml-6 h-4 border-l-4 border-dashed border-black/15" />}
        </li>
      ))}
    </ol>
  );
}

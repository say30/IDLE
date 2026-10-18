import { BRAND } from "@/lib/brand";

const STEPS = [
  {
    title: "Télécharge le plugin",
    body: (
      <>
        <a href="/api/plugin/download" className="btn btn-green mt-2">⬇️ Télécharger {BRAND.name}.server.lua</a>
        <p className="mt-2 text-sm">L&apos;adresse de ce site est déjà écrite dedans.</p>
      </>
    ),
  },
  {
    title: "Ouvre le dossier des plugins",
    body: <>Dans Roblox Studio : onglet <b>Plugins</b> → bouton <b>Plugins Folder</b>. Un dossier s&apos;ouvre sur ton ordinateur.</>,
  },
  {
    title: "Glisse le fichier dedans",
    body: <>Mets le fichier téléchargé dans ce dossier, puis ferme et rouvre Studio.</>,
  },
  {
    title: "Clique sur le bouton du plugin",
    body: (
      <>
        Onglet <b>Plugins</b> → bouton <b>{BRAND.name}</b>. Une fenêtre s&apos;ouvre à droite : tape le code affiché sur
        la page de ton projet.
      </>
    ),
  },
  {
    title: "Autorise la connexion",
    body: <>La première fois, Studio te demande si le plugin peut contacter ce site : clique sur <b>Allow</b>.</>,
  },
];

export default function PluginPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold">🔌 Installer le plugin Studio</h1>
      <p className="mt-3 text-lg text-ink-soft">
        Le plugin est le pont entre le site et ton jeu. Il reçoit les scripts écrits par l&apos;IA et les place au bon
        endroit dans Studio. Installation : 1 minute, une seule fois.
      </p>
      <ol className="mt-8 space-y-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="card flex gap-4 p-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold font-display text-lg font-bold text-amber-950">
              {i + 1}
            </span>
            <div className="text-ink-soft">
              <h2 className="font-display text-xl font-bold text-ink">{s.title}</h2>
              <div className="mt-1">{s.body}</div>
            </div>
          </li>
        ))}
      </ol>
      <div className="card mt-8 bg-sky-bottom p-6">
        <h2 className="text-xl font-bold">🛡️ Ce que fait le plugin (et ce qu&apos;il ne fait pas)</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-soft">
          <li>Il ne contacte que ce site, jamais un autre.</li>
          <li>Il crée et met à jour uniquement les scripts qu&apos;il a lui-même créés. Tes propres scripts ne sont jamais touchés.</li>
          <li>Chaque synchronisation s&apos;annule avec Ctrl+Z.</li>
          <li>Il ne fait rien pendant que tu testes ton jeu (Play).</li>
          <li>Le code du plugin est lisible : ouvre le fichier pour le vérifier.</li>
        </ul>
      </div>
    </div>
  );
}

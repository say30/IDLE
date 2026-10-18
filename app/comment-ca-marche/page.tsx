import { BRAND } from "@/lib/brand";
import { features } from "@/lib/config";

export const dynamic = "force-dynamic";

const PIECES = [
  {
    emoji: "🌐",
    name: "Le site (Vercel)",
    color: "bg-gold",
    text: "Les pages que tu vois et le serveur qui reçoit tes demandes. Hébergé gratuitement sur Vercel.",
  },
  {
    emoji: "🤖",
    name: "L'IA (Google Gemini)",
    color: "bg-ocean",
    text: "Écrit les scripts Luau. Seul notre serveur lui parle, avec une clé secrète que ton navigateur ne voit jamais.",
  },
  {
    emoji: "🗄️",
    name: "La base de données (Supabase)",
    color: "bg-berry",
    text: "Garde tes projets, tes scripts et tes pièces. Fermée au public : seul notre serveur a la clé.",
  },
  {
    emoji: "🔑",
    name: "La connexion (Roblox)",
    color: "bg-grass",
    text: "Tu te connectes sur la page officielle de Roblox. Roblox nous donne ton pseudo et ton avatar, rien d'autre.",
  },
  {
    emoji: "🔌",
    name: "Le plugin Studio",
    color: "bg-brick",
    text: "Tourne dans Studio sur ton PC. Il demande au site toutes les 2 s s'il y a du nouveau et place les scripts.",
  },
];

const SECRETS = [
  ["Clé de l'IA (Gemini)", "Variables secrètes du serveur Vercel", "Jamais envoyée au navigateur"],
  ["Clé de la base (Supabase service_role)", "Variables secrètes du serveur Vercel", "Jamais envoyée au navigateur"],
  ["Secret Roblox OAuth", "Variables secrètes du serveur Vercel", "Jamais envoyé au navigateur"],
  ["Mot de passe Roblox", "Nulle part chez nous", "Tapé uniquement sur roblox.com"],
  ["Carte bancaire (plus tard)", "Chez Stripe uniquement", "Ne passe jamais par nos serveurs"],
  ["Jeton du plugin", "Dans les réglages du plugin, sur ton PC", "Nous ne gardons qu'une empreinte"],
];

export default function HowItWorks() {
  const status = [
    ["IA Gemini", features.ai],
    ["Connexion Roblox", features.roblox],
    ["Base de données", features.database],
  ] as const;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold">⚙️ Comment fonctionne {BRAND.name}</h1>
      <p className="mt-3 max-w-3xl text-lg text-ink-soft">
        Cinq pièces travaillent ensemble. Tu n&apos;as besoin de comprendre aucune d&apos;elles pour créer ton jeu, mais
        voici tout, en toute transparence.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {PIECES.map((p) => (
          <div key={p.name} className="card flex gap-4 p-5">
            <span className={`grid size-14 shrink-0 place-items-center rounded-2xl text-3xl ${p.color}`}>{p.emoji}</span>
            <div>
              <h2 className="font-display text-xl font-bold">{p.name}</h2>
              <p className="mt-1 text-ink-soft">{p.text}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-14 text-3xl font-bold">🔄 Le trajet d&apos;une demande</h2>
      <ol className="card mt-6 space-y-3 p-6 text-ink-soft">
        {[
          "Tu écris « ajoute une boutique » dans l'atelier du site.",
          "Ton navigateur envoie le message à notre serveur. Il ne contient aucune clé, juste ton texte et ton cookie de connexion.",
          "Le serveur vérifie qui tu es, retire 1 pièce, puis envoie ta demande et les scripts actuels à l'IA avec la clé secrète.",
          "L'IA renvoie les scripts. Le serveur vérifie qu'ils vont dans des dossiers autorisés et les sauvegarde (nouvelle version).",
          "Le plugin Studio, qui demande toutes les 2 secondes « du nouveau ? », reçoit la nouvelle version.",
          "Le plugin crée ou met à jour les scripts dans ton jeu, puis confirme au site. Tu cliques sur Play.",
        ].map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-ink font-display font-bold text-white">{i + 1}</span>
            <span className="pt-1">{step}</span>
          </li>
        ))}
      </ol>

      <h2 className="mt-14 text-3xl font-bold">🔒 Où sont rangés les secrets ?</h2>
      <p className="mt-3 text-ink-soft">
        Règle d&apos;or : <b>aucun secret n&apos;est écrit dans le code du site ni envoyé au navigateur.</b> Les clés sont
        rangées dans les « variables d&apos;environnement » de l&apos;hébergeur, un coffre que seul le serveur peut lire.
      </p>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left">
          <thead className="bg-cream font-display">
            <tr>
              <th className="p-4">Secret</th>
              <th className="p-4">Où il est</th>
              <th className="p-4">Visible par le navigateur ?</th>
            </tr>
          </thead>
          <tbody className="text-ink-soft">
            {SECRETS.map(([a, b, c]) => (
              <tr key={a} className="border-t-2 border-black/5">
                <td className="p-4 font-semibold text-ink">{a}</td>
                <td className="p-4">{b}</td>
                <td className="p-4">❌ {c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-14 text-3xl font-bold">📡 État de ce site</h2>
      <div className="mt-6 flex flex-wrap gap-3">
        {status.map(([label, on]) => (
          <span key={label} className={`chip text-base ${on ? "bg-grass text-white" : "bg-amber-100 text-amber-900"}`}>
            {on ? "✅" : "🧪"} {label} : {on ? "activée" : "mode démo"}
          </span>
        ))}
      </div>
    </div>
  );
}

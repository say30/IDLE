import Link from "next/link";
import { redirect } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { features } from "@/lib/config";
import { getSession } from "@/lib/session";

const ERRORS: Record<string, string> = {
  "roblox-non-configure": "La connexion Roblox n'est pas encore configurée sur ce site. Utilise le mode démo.",
  "session-expiree": "La connexion a pris trop de temps. Réessaie.",
  "roblox-refus": "Roblox a refusé la connexion. Réessaie dans un instant.",
  "secret-manquant": "Le site n'est pas fini d'installer : il manque la variable SESSION_SECRET sur l'hébergeur.",
};

export default async function SignIn({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  if (await getSession()) redirect("/tableau-de-bord");
  const { erreur } = await searchParams;

  return (
    <section className="sky min-h-[80vh] px-4 py-16">
      <div className="card animate-pop mx-auto max-w-md p-8 text-center">
        <div className="text-6xl">🏗️</div>
        <h1 className="mt-4 text-3xl font-bold">Bienvenue sur {BRAND.name}</h1>
        <p className="mt-2 text-ink-soft">Connecte-toi pour créer ton premier jeu.</p>

        {erreur && ERRORS[erreur] && (
          <p className="mt-5 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{ERRORS[erreur]}</p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          {features.roblox && (
            <a href="/api/auth/roblox" className="btn btn-green w-full text-lg">
              <RobloxMark /> Se connecter avec Roblox
            </a>
          )}
          {features.demoLogin && (
            <form action="/api/auth/demo" method="post">
              <button className="btn btn-gold w-full text-lg">🧪 Essayer en mode démo</button>
            </form>
          )}
        </div>

        <div className="mt-8 rounded-2xl bg-cream p-4 text-left text-sm text-ink-soft">
          <p className="font-display font-semibold text-ink">🔒 Ce que nous recevons</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Ton identifiant, ton pseudo et ton avatar Roblox.</li>
            <li>Jamais ton mot de passe, tes Robux ou tes messages.</li>
          </ul>
          <Link href="/comment-ca-marche" className="mt-2 inline-block font-semibold text-ocean-dark underline">
            En savoir plus sur la sécurité
          </Link>
        </div>
      </div>
    </section>
  );
}

function RobloxMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" transform="rotate(15 12 12)" fill="white" />
      <rect x="9.5" y="9.5" width="5" height="5" transform="rotate(15 12 12)" fill="#22c55e" />
    </svg>
  );
}

import Link from "next/link";
import { config } from "@/lib/config";
import { Coin } from "@/components/Coin";

export default function Pricing() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 text-center">
      <h1 className="text-4xl font-bold">Tarifs</h1>
      <p className="mt-3 text-lg text-ink-soft">Pour l&apos;instant, tout est gratuit.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="card border-grass p-8">
          <span className="chip bg-grass text-white">Disponible</span>
          <h2 className="mt-4 text-3xl font-bold">Gratuit</h2>
          <p className="mt-1 font-display text-5xl font-bold">0 €</p>
          <ul className="mt-6 space-y-2 text-left text-ink-soft">
            <li className="flex items-center gap-2"><Coin size={18} /> {config.freeDailyCoins} pièces par jour (1 pièce = 1 demande)</li>
            <li>✅ Tous les modèles de jeux</li>
            <li>✅ Plugin Studio</li>
            <li>✅ Jusqu&apos;à 20 projets</li>
          </ul>
          <Link href="/connexion" className="btn btn-green mt-8 w-full">Commencer</Link>
        </div>
        <div className="card p-8 opacity-70">
          <span className="chip bg-stone-200 text-ink">Bientôt</span>
          <h2 className="mt-4 text-3xl font-bold">Pro</h2>
          <p className="mt-1 font-display text-5xl font-bold">?</p>
          <ul className="mt-6 space-y-2 text-left text-ink-soft">
            <li>🚀 Beaucoup plus de pièces</li>
            <li>🧠 IA plus puissante</li>
            <li>🎨 Génération d&apos;images et de sons</li>
            <li>💬 Support prioritaire</li>
          </ul>
          <button className="btn btn-white mt-8 w-full" disabled>Bientôt disponible</button>
        </div>
      </div>
      <p className="mt-8 text-sm text-ink-soft">
        Les paiements, quand ils arriveront, passeront par Stripe : tes données bancaires ne toucheront jamais nos serveurs.
      </p>
    </div>
  );
}

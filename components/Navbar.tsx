import Link from "next/link";
import { getSession } from "@/lib/session";
import { Logo } from "./Logo";

export async function Navbar() {
  const session = await getSession();
  return (
    <header className="sticky top-0 z-30 border-b-4 border-black/5 bg-cream/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Logo />
        <div className="hidden items-center gap-6 font-display font-semibold text-ink-soft md:flex">
          <Link href="/comment-ca-marche" className="hover:text-ink">Comment ça marche</Link>
          <Link href="/plugin" className="hover:text-ink">Plugin Studio</Link>
          <Link href="/tarifs" className="hover:text-ink">Tarifs</Link>
        </div>
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Link href="/tableau-de-bord" className="btn btn-green btn-sm">Mes jeux</Link>
              <form action="/api/auth/logout" method="post">
                <button className="btn btn-white btn-sm" title="Se déconnecter">⏻</button>
              </form>
            </>
          ) : (
            <Link href="/connexion" className="btn btn-green btn-sm">Commencer</Link>
          )}
        </div>
      </nav>
    </header>
  );
}

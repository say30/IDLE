import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="mt-16 border-t-4 border-black/5 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-ink-soft md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} {BRAND.name}. Projet indépendant, non affilié à Roblox Corporation.
        </p>
        <div className="flex flex-wrap gap-4 font-semibold">
          <Link href="/comment-ca-marche">Sécurité</Link>
          <Link href="/plugin">Plugin</Link>
          <Link href="/tarifs">Tarifs</Link>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { Coin } from "./Coin";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-display text-2xl font-bold text-ink">
      <span className="grid size-10 place-items-center rounded-xl bg-grass shadow-[0_4px_0_#15803d]">
        <Coin size={26} />
      </span>
      {BRAND.name}
    </Link>
  );
}

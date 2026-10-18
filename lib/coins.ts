// Pièces = générations IA gratuites par jour. Elles protègent le quota gratuit de l'IA.
import "server-only";
import { config } from "./config";
import { store } from "./store";
import type { Profile } from "./types";
import type { Session } from "./session";

const today = () => new Date().toISOString().slice(0, 10);

export const levelFromXp = (xp: number) => Math.floor(xp / 100) + 1;

/** Récupère le profil, le crée si besoin, et remet les pièces à zéro chaque jour. */
export async function ensureProfile(s: Session): Promise<Profile> {
  const existing = await store.getProfile(s.uid);
  const base: Profile = existing ?? {
    id: s.uid,
    name: s.name,
    avatar: s.avatar,
    coins: config.freeDailyCoins,
    coins_day: today(),
    xp: 0,
    created_at: new Date().toISOString(),
  };
  const refreshed = { ...base, name: s.name, avatar: s.avatar };
  if (refreshed.coins_day !== today()) {
    refreshed.coins = config.freeDailyCoins;
    refreshed.coins_day = today();
  }
  if (!existing || JSON.stringify(existing) !== JSON.stringify(refreshed)) await store.saveProfile(refreshed);
  return refreshed;
}

export async function spendCoin(p: Profile, xpGain: number): Promise<Profile | null> {
  if (p.coins <= 0) return null;
  return store.saveProfile({ ...p, coins: p.coins - 1, xp: p.xp + xpGain });
}

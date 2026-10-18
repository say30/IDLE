# 🏭 IdleForge

Site web + plugin Roblox Studio pour créer des jeux Roblox avec l'IA, en parlant.
Le créateur discute avec l'IA sur le site ; le plugin Studio reçoit les scripts et les place dans le jeu.

> Le nom « IdleForge » est provisoire : change-le dans `lib/brand.ts`.

---

## 🧭 Comment ça marche

```
 Navigateur du créateur          Serveur (Vercel)                 Services externes
 ┌──────────────────┐   texte   ┌────────────────────┐   clé    ┌──────────────────┐
 │ Site (pages)     │ ────────► │ Routes /api/...    │ ───────► │ Google Gemini    │
 │ aucun secret ici │ ◄──────── │ lit les secrets    │ ◄─────── │ (écrit le Luau)  │
 └──────────────────┘  scripts  │ dans les variables │          └──────────────────┘
                                │ d'environnement    │   clé    ┌──────────────────┐
 Roblox Studio (PC)             │                    │ ───────► │ Supabase (base)  │
 ┌──────────────────┐  jeton    │                    │          └──────────────────┘
 │ Plugin IdleForge │ ────────► │ /api/plugin/poll   │          ┌──────────────────┐
 │ toutes les 2 s   │ ◄──────── │ (nouvelle version?)│ ◄──────► │ Roblox OAuth     │
 └──────────────────┘  scripts  └────────────────────┘          └──────────────────┘
```

1. Le créateur se connecte avec Roblox (page officielle Roblox : on ne voit jamais son mot de passe).
2. Il crée un projet à partir d'un modèle (Tycoon, Simulator, Obby, RNG/Pets, Idle Clicker, page blanche).
3. Il écrit ce qu'il veut. Le serveur retire 1 pièce, envoie la demande + les scripts actuels à l'IA, vérifie la réponse et enregistre une nouvelle version.
4. Sur la page du projet, il clique « Afficher mon code » (6 caractères, valable 10 min) et le tape dans le plugin Studio.
5. Le plugin échange ce code contre un jeton personnel, puis demande toutes les 2 secondes s'il y a une nouvelle version. Si oui, il crée/met à jour les scripts et confirme.

## 🔒 Où sont les secrets ?

| Secret | Où il est rangé | Visible dans le navigateur ? |
|---|---|---|
| `GEMINI_API_KEY` | Variables d'environnement Vercel | Non |
| `SUPABASE_SERVICE_ROLE_KEY` | Variables d'environnement Vercel | Non |
| `ROBLOX_CLIENT_SECRET` | Variables d'environnement Vercel | Non |
| `SESSION_SECRET` | Variables d'environnement Vercel | Non |
| Mot de passe Roblox | Nulle part chez nous (tapé sur roblox.com) | — |
| Carte bancaire (plus tard) | Chez Stripe uniquement | — |
| Jeton du plugin | Réglages du plugin sur le PC ; le serveur ne garde qu'une empreinte SHA-256 | — |

- Aucun secret n'est écrit dans le code ni sur GitHub (`.env.local` est ignoré par git).
- Tout le code qui lit un secret importe `server-only` : Next.js refuse de l'envoyer au navigateur.
- Les tables Supabase ont la sécurité RLS activée sans règle publique : seule la clé `service_role` du serveur y accède.

## 🆓 Mise en ligne gratuite (pas à pas)

Tout est gratuit au départ. **Sans aucune clé, le site marche déjà en mode démo** : connexion de test, IA qui renvoie un jeu d'exemple, données en mémoire.

### 1. Héberger le site sur Vercel
1. Crée un compte sur [vercel.com](https://vercel.com) avec ton compte GitHub.
2. « Add New… → Project » → importe le dépôt `say30/IDLE` → **Deploy**.
3. Dans **Settings → Environment Variables**, ajoute au minimum :
   - `SESSION_SECRET` : une longue chaîne aléatoire (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `SITE_URL` : l'adresse donnée par Vercel, ex. `https://idleforge.vercel.app`
4. Redéploie (onglet Deployments → ⋯ → Redeploy). Le site est en ligne en mode démo.

> ⚠️ L'offre gratuite de Vercel (Hobby) est réservée aux projets non commerciaux. Quand tu commenceras à vendre, passe à l'offre Pro ou déplace le site (par exemple sur Cloudflare).

### 2. Activer la vraie IA (Google Gemini, gratuit)
1. Va sur [aistudio.google.com/apikey](https://aistudio.google.com/apikey) → « Create API key ».
2. Ajoute `GEMINI_API_KEY` dans Vercel, puis redéploie.
3. L'offre gratuite a des limites de requêtes par minute et par jour ; les **pièces** (25/jour/créateur par défaut, `FREE_DAILY_COINS`) évitent qu'un seul créateur vide le quota.

### 3. Sauvegarder les projets (Supabase, gratuit)
1. Crée un projet sur [supabase.com](https://supabase.com).
2. **SQL Editor → New query** : colle le contenu de `supabase/schema.sql` → **Run**.
3. **Project Settings → API** : copie « Project URL » dans `SUPABASE_URL` et la clé **service_role** dans `SUPABASE_SERVICE_ROLE_KEY` (Vercel), puis redéploie.

### 4. Connexion avec Roblox (gratuit)
1. Va sur [create.roblox.com/dashboard/credentials](https://create.roblox.com/dashboard/credentials) → **OAuth 2.0 Apps** → crée une app.
2. Redirect URL : `https://TON-SITE/api/auth/roblox/callback`. Permissions (scopes) : `openid` et `profile`.
3. Copie le Client ID et le Client Secret dans `ROBLOX_CLIENT_ID` et `ROBLOX_CLIENT_SECRET` (Vercel), puis redéploie.
4. Le bouton « Mode démo » disparaît automatiquement (remets-le avec `ALLOW_DEMO=true`).

> Roblox peut limiter une app OAuth tant qu'elle n'a pas été vérifiée : vérifie les conditions affichées dans le Creator Dashboard avant d'ouvrir au public.

### 5. Le plugin Studio
- Le site sert le plugin sur `/api/plugin/download`, avec l'adresse du site déjà remplie. Le guide d'installation est sur la page `/plugin`.
- Plus tard, publie-le sur le Creator Store pour que les créateurs l'installent en un clic.

La page `/comment-ca-marche` du site affiche quelles fonctions sont activées.

## 💻 Travailler sur ton PC

```bash
npm install
cp .env.example .env.local   # puis remplis ce que tu as (tout est facultatif)
npm run dev                  # http://localhost:3000
npm run typecheck
npm run build
```

## 📁 Organisation du code

| Dossier | Contenu |
|---|---|
| `app/` | Pages (accueil, connexion, tableau de bord, projet, plugin, tarifs, sécurité) et routes `api/` |
| `components/` | Interface : atelier IA, panneau Studio, liste des scripts… |
| `lib/ai.ts` | Appel à Gemini, consignes données à l'IA, vérification des chemins de scripts |
| `lib/store.ts` | Données : Supabase, ou mémoire en mode démo |
| `lib/session.ts` | Cookie de connexion signé |
| `lib/coins.ts` | Pièces quotidiennes et niveaux |
| `plugin/IdleForge.server.lua` | Le plugin Roblox Studio |
| `supabase/schema.sql` | Tables à créer dans Supabase |

## 🗺️ Prochaines étapes

- Le plugin envoie aussi l'arborescence du jeu ouvert à l'IA (meilleur contexte).
- Paiement des pièces avec Stripe (offre Pro).
- Publication du plugin sur le Creator Store.
- Galerie des jeux créés, parrainage.

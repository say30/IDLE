export type Template = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  prompt: string;
};

export const TEMPLATES: Template[] = [
  {
    id: "tycoon",
    name: "Tycoon",
    emoji: "🏭",
    color: "#22c55e",
    description: "Des machines qui produisent de l'argent, des boutons d'achat, des améliorations.",
    prompt:
      "Crée un tycoon : chaque joueur reçoit une parcelle, un générateur produit des pièces, des boutons au sol achètent des machines et des améliorations, un leaderboard affiche l'argent.",
  },
  {
    id: "simulator",
    name: "Simulator",
    emoji: "💪",
    color: "#3b82f6",
    description: "Clique, gagne de la force, revends-la et débloque de nouvelles zones.",
    prompt:
      "Crée un simulator : le joueur clique pour gagner de la force, la vend contre des pièces dans une zone de vente, achète de meilleurs outils et débloque des zones avec des portes payantes.",
  },
  {
    id: "obby",
    name: "Obby",
    emoji: "🧗",
    color: "#f97316",
    description: "Un parcours d'obstacles avec checkpoints, pièges et chrono.",
    prompt:
      "Crée un obby de 10 étapes : plateformes, sauts, lave qui tue, checkpoints sauvegardés, compteur d'étapes dans le leaderboard et un chrono affiché à l'écran.",
  },
  {
    id: "rng",
    name: "RNG / Pets",
    emoji: "🥚",
    color: "#a855f7",
    description: "Ouvre des œufs, collectionne des pets rares, équipe les meilleurs.",
    prompt:
      "Crée un jeu RNG de pets : le joueur achète des œufs, chaque pet a une rareté (commun à légendaire) avec une probabilité, un inventaire affiché à l'écran et un bonus de pièces selon le pet équipé.",
  },
  {
    id: "idle",
    name: "Idle Clicker",
    emoji: "🪙",
    color: "#eab308",
    description: "Un clicker qui rapporte même quand tu ne fais rien, avec rebirth.",
    prompt:
      "Crée un idle clicker : un gros bouton à l'écran rapporte des pièces, des améliorations augmentent le gain par clic et le gain automatique par seconde, et un rebirth remet à zéro contre un multiplicateur.",
  },
  {
    id: "blank",
    name: "Page blanche",
    emoji: "✨",
    color: "#64748b",
    description: "Décris ton idée librement, l'IA s'occupe du reste.",
    prompt: "",
  },
];

export const templateById = (id: string) => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[TEMPLATES.length - 1];

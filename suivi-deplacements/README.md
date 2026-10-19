# 🚗 Suivi des déplacements

Petite fenêtre qui s'ouvre à chaque démarrage du PC pour noter en un clic où tu es allé aujourd'hui.

## Installation (Windows)

1. Installe Python : https://www.python.org/downloads/ (coche **« Add python.exe to PATH »**).
2. Copie le dossier `suivi-deplacements` où tu veux (ex. `Documents`) — ne le déplace plus ensuite.
3. Double-clique sur **`installer.bat`**.

La fenêtre s'ouvre et s'inscrit toute seule au démarrage de Windows.

> Option : `creer_exe.bat` fabrique un `SuiviDeplacements.exe` (dans `dist`) qui marche sans Python.
> Lance-le une fois : c'est lui qui sera lancé au démarrage.

## Utilisation

| Élément | Rôle |
|---|---|
| Boutons des villes | Inscrit la ville **à la date du jour uniquement**. Re-clic = l'enlève (en cas d'erreur). Plusieurs villes possibles dans la journée. |
| **Calendrier / Villes** (barre du haut) | Bascule entre la petite fenêtre des boutons et le grand calendrier. |
| ◀ ▶ | Change de mois — **consultation seulement**, on ne peut rien ajouter sur un autre jour. |
| **Voir tous les mois** | Affiche les 12 mois de l'année (◀ ▶ = année). Clique sur un mois pour le voir en grand. |
| **Aujourd'hui** | Revient au mois en cours. |
| Barre de titre | Attrape-la pour déplacer la fenêtre (ex. sur ton 2ᵉ écran). |
| **Bloquer** | Verrouille la position (re-clic pour débloquer). La position est mémorisée. |
| — / ✕ | Réduire / fermer. |

## Données

Tout est enregistré dans `%APPDATA%\SuiviDeplacements\data.json` (tape `%APPDATA%` dans l'explorateur).
Pour ajouter ou renommer une ville, modifie la liste `CITIES` en haut de `suivi_deplacements.pyw`.

## Désinstaller

Double-clique sur `desinstaller.bat` (tes déplacements sont conservés).

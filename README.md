# DataAuto

DataAuto est une extension Chrome pour aider les particuliers dans leurs achats
de voiture d'occasion. L'extension analyse les annonces Leboncoin pour faire
ressortir des informations pertinentes afin d'aider la decision d'achat.

## Fonctionnalites

- Analyse des annonces Leboncoin.
- Mise en evidence d'informations utiles a la decision.
- Extension Chrome simple a installer.

## Installation (mode extension)

1. Construire l'extension.
2. Ouvrir `chrome://extensions`.
3. Activer le "Mode developpeur".
4. Cliquer sur "Charger l'extension non empaquetee".
5. Selectionner le dossier `dist`.

## Developpement

Prerequis:

- Node.js (LTS conseillee)
- npm ou pnpm

Commandes:

- Installer les dependances: `npm install`
- Lancer le build: `npm run build`

## Structure

- `manifest.json`: Manifest de l'extension.
- `popup.html` / `popup.tsx`: UI du popup.
- `dist/`: Build de l'extension.

## A propos

Le projet est heberge sur GitHub et vise a simplifier l'analyse d'annonces
pour un achat de voiture d'occasion.

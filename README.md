# 🎯 Taktik / Jaquaroo - Moteur de Jeu & Multijoueur en Ligne

Une version web moderne, réactive et multijoueur en temps réel du jeu de plateau tactique **Taktik / Jaquaroo / Keezen / Brändi Dog**.

![Taktik Game Engine](https://img.shields.io/badge/Version-1.0.0-cyan?style=for-the-badge)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)

---

## ✨ Fonctionnalités Principales

### 1. Deux Modes de Jeu Distincts
* **Mode 1 : Pure Duel (1v1 Condensé)** :
  * Piste circulaire personnalisée à **32 cases** (16 par joueur).
  * Joueur 1 (Bleu, 4 pions) vs Joueur 2 (Rouge, 4 pions).
  * 6 cartes distribuées par manche.
  * Pas d'échange de cartes : intensité maximale en tête-à-tête.
  * Condition de victoire : premier joueur à verrouiller ses 4 pions en Maison.

* **Mode 2 : Two-Handed Classic (Plateau 4 Sièges, 2 Humains)** :
  * Piste classique à **64 cases** avec 4 bases et 4 maisons d'arrivée.
  * **Humain 1 (Équipe A)** contrôle le siège Nord (Bleu) et le siège Sud (Vert).
  * **Humain 2 (Équipe B)** contrôle le siège Est (Rouge) et le siège Ouest (Jaune).
  * Ordre horaire : Nord ➔ Est ➔ Sud ➔ Ouest.
  * **Mécaniques d'équipe** :
    * Échange stratégique obligatoire d'une carte au début de chaque donne entre partenaires (Nord ↔ Sud, Est ↔ Ouest).
    * Dès qu'un siège rentre ses 4 pions en Maison, ses cartes servent à déplacer les pions restants de son coéquipier.
  * Condition de victoire : première équipe à rentrer ses 8 pions en Maison.

---

### 2. Multijoueur en Ligne & Salons Privés
* **Système de Salons avec Codes à 6 caractères** (ex: `TK8492`).
* **Créer une salle** : génération d'un code partageable en un clic.
* **Rejoindre une salle** : saisie immédiate du code.
* **Attribution automatique des rôles** : Joueur 1 (Hôte) et Joueur 2 (Invité).
* **Synchronisation temps réel** ultra-fluide via WebSockets / WebRTC DataChannels.
* **Sécurité des mains** : les cartes adverses sont masquées (face cachée), seules les cartes du joueur actif sont visibles.
* **Protection des tours** : interaction strictement verrouillée si ce n'est pas votre tour de jouer.
* **Mode Pass & Play** : possibilité de jouer sur le même écran à 2 en local.

---

### 3. Règles Complètes des Cartes (Standard Taktik)
* **As (A)** : Sortir un pion de sa Base vers sa case départ, ou avancer de +1.
* **Roi (K)** : Sortir un pion de sa Base vers sa case départ, ou avancer de +13.
* **Valet (J)** : Échanger les positions de n'importe quels deux pions situés sur la piste principale (les pions en Base ou en Maison sont protégés).
* **Quatre (4)** : Doit obligatoirement reculer de 4 cases sur la piste (sens anti-horaire).
* **Sept (7)** : Partager un total de 7 cases entre plusieurs pions de son camp.
* **Dame (Q)** : Avancer de +12.
* **Numériques (2, 3, 5, 6, 8, 9, 10)** : Avancer de la valeur faciale de la carte.
* **Collisions & Captures** : Atterrir sur une case occupée renvoie immédiatement le pion adverse (ou allié) dans sa Base.
* **Entrée en Maison** : Entrée sur compte exact sans pouvoir sauter par-dessus les pions déjà placés.

---

## 🚀 Démarrage Rapide

### Prérequis
* [Node.js](https://nodejs.org/) (version 18 ou supérieure)
* npm ou pnpm

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/Vivien274/TakTik.git
cd TakTik

# Installer les dépendances
npm install

# Lancer le serveur de développement local
npm run dev
```

Ouvrez ensuite [http://localhost:5173/](http://localhost:5173/) dans votre navigateur.

---

## 🧪 Tests Unitaires

Le projet inclut une suite de tests unitaires complète vérifiant l'intégrité du moteur de jeu :

```bash
npm test
```

### Vérifications testées :
* ✅ Génération du jeu de 52 cartes
* ✅ Sortie de base sur As et Roi
* ✅ Déplacement arrière sur la carte 4
* ✅ Échange de pions sur la piste via le Valet
* ✅ Collisions et renvoi en base
* ✅ Entrée en maison au compte exact (interdiction du dépassement)
* ✅ Détection des conditions de victoire (Pure Duel & Classique)

---

## 🛠️ Stack Technique

* **Framework** : [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
* **Langage** : [TypeScript](https://www.typescriptlang.org/)
* **Styles & Thème** : [Tailwind CSS v4](https://tailwindcss.com/) (Glassmorphism sombre, néons cyber, animations fluides)
* **Icônes** : [Lucide React](https://lucide.dev/)
* **Réseau Multijoueur** : [PeerJS / WebRTC DataChannels](https://peerjs.com/) & [Supabase Realtime](https://supabase.com/docs/guides/realtime)
* **Effets Spéciaux** : [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)

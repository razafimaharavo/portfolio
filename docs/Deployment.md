# 🚀 Guide de Compilation et Déploiement en Production

Ce document détaille les étapes requises pour compiler et déployer l'application full-stack du Portfolio dans un environnement de production cloud moderne (tel que **Google Cloud Run** ou tout autre hébergeur compatible Docker / Node.js).

---

## 🏗️ Le Système de Compilation (Build Pipeline)

L'application utilise un système de build double-flux optimisé, déclaré dans les scripts du fichier `package.json` :

```json
{
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
    "start": "node dist/server.cjs"
  }
}
```

### Étape 1 : Compilation du Frontend (`vite build`)
* Cette commande prend l'ensemble du code React, des hooks, des images et des fichiers de traduction.
* Elle compile, minifie, et purge le CSS inutile à l'aide du compilateur à haute performance Vite.
* Le résultat (fichiers HTML statiques, CSS atomisé, bundles JS hautement optimisés) est enregistré dans le dossier `/dist`.

### Étape 2 : Compilation du Serveur Backend (`esbuild server.ts ...`)
* Pour garantir des démarrages de conteneurs ultra-rapides et éviter des problèmes d'importation de modules TypeScript en production, le fichier point d'entrée du serveur `server.ts` est compilé par **`esbuild`**.
* **Bundling CJS** : Le serveur TypeScript est compilé en un unique fichier auto-contenu au format CommonJS : `dist/server.cjs`.
* **Pourquoi CommonJS (`.cjs`) ?** : Cela permet de contourner les restrictions strictes d'ES Modules de Node.js concernant la résolution des chemins relatifs (`import` sans extension).
* **Dépendances Externes** : La directive `--packages=external` indique à `esbuild` de ne pas intégrer les grosses dépendances externes (comme `express`, `nodemailer`) dans le fichier compilé pour laisser Node.js les charger directement depuis le dossier `node_modules` de production.

---

## 🏃 Commande de Démarrage en Production (`npm run start`)

En production, l'application démarre simplement en lançant le fichier compilé à l'aide de Node.js :
`node dist/server.cjs`

Le serveur Express est alors lancé en mode production, sert statiquement les fichiers clients du dossier `/dist`, et répond aux requêtes arrivant sur les endpoints de l'API `/api/*`.

---

## 🌐 Déploiement sur Google Cloud Run

**Cloud Run** est la plateforme idéale pour héberger cette application car elle permet d'exécuter des conteneurs légers avec une mise à l'échelle automatique (y compris réduction à zéro en l'absence de trafic, supprimant ainsi les coûts d'hébergement).

### Contraintes Réseau Majeures
* **Le Port Unique 3000** : L'infrastructure de proxy inverse de Cloud Run achemine l'intégralité du trafic externe (HTTPS standard sur le port 443) exclusivement vers le port interne **3000** du conteneur.
* **L'Hôte d'Écoute `0.0.0.0`** : Le serveur ne doit pas écouter sur `localhost` ou `127.0.0.1` car ces adresses bloqueraient la communication avec la carte réseau virtuelle du conteneur. Le serveur Express est programmé pour écouter impérativement sur `0.0.0.0`.

### Variables et Secrets de Déploiement
Lors de la configuration du service Cloud Run, vous devez configurer les variables d'environnement suivantes dans l'onglet des variables d'environnement ou du gestionnaire de secrets (GCP Secret Manager) :
1. `GEMINI_API_KEY` (Récupérée depuis la console Google AI Studio / Google Cloud).
2. `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD` (Pour le bon acheminement des formulaires de contact).
3. `WEATHER_API_KEY` (Optionnelle, si vous utilisez WeatherAPI).

# 📚 Documentation Technique - Portfolio de Marion Razafimaharavo

Bienvenue dans la documentation technique officielle du Portfolio Interactif de **Marion Razafimaharavo**, Développeur Full Stack spécialisé en React, Node.js et solutions digitales modernes.

Cette documentation a été rédigée avec une approche pédagogique et professionnelle pour vous permettre de :
* Comprendre en détail l'architecture générale du projet (Frontend & Backend).
* Maintenir l'application de manière autonome.
* Intégrer de nouvelles fonctionnalités ou faire évoluer les modules existants.
* Former d'autres développeurs sur cette base technique.
* Préparer des soutenances techniques ou des démonstrations.

---

## 🗺️ Index de la Documentation

Pour faciliter la navigation, la documentation est structurée en plusieurs modules thématiques :

| Section | Fichier | Description |
| :--- | :--- | :--- |
| **01** | [Architecture.md](./Architecture.md) | Vision d'ensemble, flux de données général et schéma d'architecture. |
| **02** | [Frontend.md](./Frontend.md) | Structure React, composants, hooks, gestion des états et design réactif. |
| **03** | [Backend.md](./Backend.md) | Serveur Express, point d'entrée, middlewares, contrôleurs et gestion globale des erreurs. |
| **04** | [RazmaIA.md](./RazmaIA.md) | Fonctionnement détaillé de l'assistante virtuelle Razma (Gemini, prompts, actions). |
| **05** | [VoiceAssistant.md](./VoiceAssistant.md) | Intégration de la Web Speech API (reconnaissance vocale et synthèse vocale locale). |
| **06** | [EmailSystem.md](./EmailSystem.md) | Formulaire de contact, validation avec Zod, et acheminement SMTP avec Nodemailer. |
| **07** | [Translations.md](./Translations.md) | Système de traduction multilingue (Français, Anglais, Malagasy). |
| **08** | [Weather.md](./Weather.md) | Module météo intelligent (Open-Meteo, reverse geocoding, fallback). |
| **09** | [Geolocation.md](./Geolocation.md) | Fonctionnement de la géolocalisation navigateur et permissions de l'iframe. |
| **10** | [ThreeJS.md](./ThreeJS.md) | Arrière-plan réseau interactif en 3D (WebGL, particules, parallaxe souris). |
| **11** | [EnvironmentVariables.md](./EnvironmentVariables.md) | Tableau des variables d'environnement, secrets et configurations requises. |
| **12** | [Deployment.md](./Deployment.md) | Instructions pour compiler et déployer l'application en production sur Cloud Run. |

---

## 🛠️ Aperçu des Technologies Clés

* **Frontend** : React 18, Vite (compilateur ultra-rapide), Tailwind CSS (style utilitaire moderne), Lucide React (icônes vectorielles), Motion (animations complexes et fluides).
* **Graphismes 3D** : Three.js (scène WebGL optimisée pour le fond d'écran réseau).
* **Backend** : Node.js, Express, TypeScript (compilé via `esbuild` en mode production pour d'excellentes performances).
* **Intelligence Artificielle** : SDK `@google/genai` de Google, modèle `gemini-2.5-flash` pour la logique conversationnelle et détection d'intentions de navigation, et `gemini-3.1-flash-tts-preview` pour la voix synthétique haute fidélité.
* **Services Tiers** : Nodemailer (emails), Open-Meteo API (météo keyless), BigDataCloud (reverse-geocoding).

---

## 🎯 Philosophie de Conception

L'application a été bâtie selon les principes du **"Craftsmanship" logiciel** :
1. **Zéro superflu** : Pas d'informations de diagnostic inutiles dans l'interface, esthétique soignée, épurée et très professionnelle.
2. **Double résilience (Hybrid Architecture)** : 
   * Si la voix native Gemini échoue ou manque de quota, le navigateur prend le relais de manière transparente grâce à la synthèse vocale intégrée (`window.speechSynthesis`).
   * Si les appels de géolocalisation ou d'API météo échouent, des données de repli élégantes et dynamiques sont présentées sans planter l'interface.
3. **Optimisation des performances** : 
   * Aucun fichier CSS lourd n'est chargé, tout passe par le moteur JIT de Tailwind CSS.
   * L'arrière-plan Three.js nettoie sa mémoire (géométries, textures, canvas, animation frames) lors du démontage du composant React pour éviter toute fuite de mémoire.

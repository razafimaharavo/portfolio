# 💻 Documentation du Frontend React

L'application client est construite avec **React 18** et **Vite**. Son interface utilisateur utilise une esthétique épurée, un design "Bento Grid" fluide, des micro-interactions soignées via Framer Motion, et un arrière-plan WebGL immersif.

---

## 📂 Structure des Dossiers du Frontend

```
/src
├── assets/         # Images statiques et fichiers multimédias
├── components/     # Composants React de l'interface utilisateur
│   ├── about/      # Sections académiques, formations et expériences (Bento)
│   ├── contact/    # Formulaire de contact interactif et validations
│   ├── layout/     # En-tête (Header), pied de page (Footer), Hero et fond d'écran 3D
│   ├── portfolio/  # Sections de projets (Web, Desktop, Mobile)
│   ├── services/   # Grille de services et d'expertises annexes
│   ├── LottiePlayer.tsx  # Lecteur d'animations vectorielles JSON
│   ├── ProjectDetailModal.tsx  # Modale détaillée des projets
│   └── RazmaAssistant.tsx      # Sidebar interactive de l'assistante vocale
├── hooks/          # Hooks React personnalisés réutilisables
│   ├── useActiveSection.ts   # Intercepte la section visible à l'écran
│   ├── useRandomProjects.ts  # Mélange et sélectionne des projets uniques
│   ├── useTheme.ts           # Système de thèmes clair/sombre persistant
│   └── useWeather.ts         # Récupération de l'état météo et géolocalisation
├── i18n/           # Contexte et fichiers de traductions de l'application
│   ├── LanguageContext.tsx   # Fournit la langue globale du site
│   ├── translations.ts       # Dictionnaires de chaînes (FR, EN, MG)
│   └── types.ts              # Typages TypeScript des clés de traduction
├── types/          # Dossier de typage additionnels
├── utils/          # Scripts utilitaires et de défilement de l'UI
│   └── scroll.ts   # Logique de navigation animée fluide
├── App.tsx         # Composant racine orchestrant l'application
├── main.tsx        # Point d'entrée d'initialisation React
├── types.ts        # Typages globaux partagés (Projet, Météo, ChatMessage)
└── index.css       # Imports Tailwind CSS, configurations thématiques, polices Google
```

---

## 🧱 Analyse des Composants Clés

### 1. `App.tsx` (L'Orchestrateur Principal)
Il centralise la gestion globale de l'interface et assure le partage d'informations entre les différents composants :
* **Défilement d'Intention** : C'est ici que réside la fonction de routage `handleNavAction(action)`. Lorsque l'assistante Razma IA détecte que l'utilisateur veut voir un contenu (ex: les diplômes), elle émet une action. `App.tsx` intercepte cette action, ouvre le volet d'accordéon correspondant, puis effectue un défilement fluide vers la section ciblée.
* **Marges Adaptatives** : Si le volet de l'assistant IA est ouvert, `App.tsx` injecte dynamiquement un décalage horizontal de marge à droite (`lg:pr-[384px]`) sur grand écran. Cela permet de décentrer proprement le portfolio sans masquer le contenu derrière la barre latérale.

### 2. Le Bento Accordéon (`/src/components/about`)
La section "À propos" utilise une architecture innovante appelée **Bento Accordéon** :
* **Grid Layout** : Quatre volets principaux (Diplômes, Formations, Expériences, Compétences) sont disposés sous forme de blocs "Bento" asymétriques et élégants.
* **Accordéon Exclusif** : Afin de préserver la lisibilité de la page, un seul bloc peut être étendu à la fois. Si un utilisateur ouvre "Formations", le bloc précédemment ouvert se replie automatiquement, créant une chorégraphie visuelle fluide orchestrée par Framer Motion.

### 3. Les Grilles de Projets (`/src/components/portfolio`)
Les projets de Marion sont classés en trois typologies distinctes :
* **Web** (projets SaaS, Dashboards interactifs)
* **Desktop** (logiciels lourds d'ingénierie ou de productivité)
* **Mobile** (applications grand public)

Pour éviter la surcharge visuelle, un hook personnalisé `useRandomProjects` effectue un mélange aléatoire de la base de données de projets (`portfolio-context.json`) au montage, n'affichant qu'une sélection prestigieuse. L'utilisateur peut cliquer sur "Voir plus" ou "Mélanger" pour charger d'autres éléments.

---

## ⚡ Hooks Personnalisés

L'application sépare rigoureusement la logique métier et l'affichage visuel en utilisant des hooks spécialisés :

### `useTheme.ts`
* **Rôle** : Gère le Dark / Light Mode.
* **Fonctionnement** : Lit la valeur initiale dans `localStorage` (avec un repli vers les préférences système de l'OS de l'utilisateur). Injecte ou retire la classe `.dark` sur la racine `document.documentElement` pour piloter les styles Tailwind, et enregistre chaque changement en local.

### `useWeather.ts`
* **Rôle** : Pilote la géolocalisation et l'appel API météo.
* **Fonctionnement** : Offre une fonction `requestWeather()` qui utilise l'API de géolocalisation native du navigateur. Après obtention des coordonnées (latitude et longitude), elle appelle l'API backend `/api/weather` pour récupérer les conditions et la ville en temps réel.

### `useActiveSection.ts`
* **Rôle** : Suit la section actuellement lue à l'écran pour mettre en valeur le bouton correspondant dans l'en-tête (Header).
* **Fonctionnement** : Implémente un **Intersection Observer** sur les éléments du dôme (`#section-about`, `#section-contact`, etc.). Met à jour un état textuel dès qu'une section franchit un seuil de visibilité de 30% dans la fenêtre de visualisation (viewport).

---

## 💫 Intégration de Framer Motion (`motion`)

Toutes les animations de l'interface utilisent la bibliothèque `motion` de manière subtile et professionnelle :
1. **Entrées Progressives (Staggered Entrances)** : Les éléments des grilles apparaissent avec de légers retards ordonnés (décalage temporel) et un effet de fondu ascendant.
2. **Animation de Hauteur Fluide (AnimatePresence)** : L'extension et le repliement des panneaux de l'accordéon s'adaptent de façon dynamique à la hauteur de leur contenu textuel, évitant ainsi tout saut visuel brusque.
3. **Animations de Retour Tactique** : Les boutons disposent d'animations réactives au survol (`whileHover={{ scale: 1.02 }}`) et à la pression (`whileTap={{ scale: 0.98 }}`).

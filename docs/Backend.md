# ⚙️ Documentation du Backend Express

Le backend du Portfolio de Marion est une application **Node.js** robuste et performante, construite avec le framework **Express** et écrite en **TypeScript**. Il sert de passerelle API sécurisée et résiliente pour distribuer le site et orchestrer les technologies complexes (Gemini API, mailer, météo).

---

## 🏗️ Architecture du Code Backend

```
/backend/src
├── ai/                      # Service d'Intelligence Artificielle
│   └── aiService.ts         # Intégration Gemini & Synthèse Vocale (TTS)
├── config/                  # Chargement des configurations
│   └── env.ts               # Parsing sécurisé de process.env
├── controllers/             # Contrôleurs HTTP Express
│   └── portfolioController.ts # Logique de traitement des requêtes
├── mail/                    # Module d'envoi d'e-mail
│   └── mailer.ts            # Intégration Nodemailer SMTP
├── routes/                  # Routeurs d'API Express
│   └── api.ts               # Déclaration des routes REST (/api/*)
└── weather/                 # Module météo et reverse geocoding
    └── weatherService.ts    # Service d'interrogation Open-Meteo
```

---

## 🔌 Point d'Entrée Global : `server.ts`

Situé à la racine du projet, le fichier `server.ts` orchestre le démarrage global de l'application :
1. **Chargement de l'environnement** : Initialise la configuration via le fichier `/backend/src/config/env.ts` et charge le fichier de secrets `.env`.
2. **Configuration réseau** : Force le démarrage sur l'hôte `0.0.0.0` et le port fixe `3000` requis pour l'infrastructure Cloud Run.
3. **Double mode d'exécution (Vite Middleware)** :
   * **En développement (`NODE_ENV !== "production"`)** : Le serveur monte le middleware de Vite à la volée via `createViteServer({ server: { middlewareMode: true }, appType: "spa" })`. Cela permet de compiler et servir le frontend React à la demande sur le même port, facilitant les tests sans avoir à démarrer deux serveurs distincts.
   * **En production (`NODE_ENV === "production"`)** : Le serveur sert de manière statique les fichiers pré-compilés du répertoire `/dist` (HTML, JS, CSS) et redirige toutes les requêtes de navigation inconnues vers `index.html` (comportement SPA standard).

---

## 🔄 Flux Complet de Traitement d'une Requête API

Pour assurer une maintenance optimale, le serveur s'appuie sur le modèle de conception classique **Route ➔ Contrôleur ➔ Service** :

```
             Requête Client (ex: POST /api/chat)
                           │
                           v
                     [Routeur api.ts]
                           │ (Intercepte l'URL et délègue)
                           v
           [portfolioController.ts (handleAIChat)]
                           │
             ┌─────────────┴─────────────┐
             │ (Valide le payload,       │ (Optionnel : si synthèse
             │  délègue à l'IA)          │  vocale requise)
             v                           v
     [aiService.ts (askRazma)]   [aiService.ts (generateVoice)]
             │                           │
             └─────────────┬─────────────┘
                           │ (Regroupe les résultats)
                           v
               Construction de la réponse JSON
                           │
                           v
             Réponse HTTP JSON (Status 200 OK)
```

### Étape 1 : Le Routeur (`/backend/src/routes/api.ts`)
Il écoute les requêtes HTTP arrivant sur le préfixe `/api/*`. Sa seule responsabilité est de mapper l'URI à la méthode de contrôleur adéquate :
```ts
router.post("/chat", handleAIChat);
router.post("/contact", handleContactForm);
```

### Étape 2 : Le Contrôleur (`/backend/src/controllers/portfolioController.ts`)
Il agit comme un chef d'orchestre :
1. **Extraction** : Récupère les données transmises dans le corps de la requête (`req.body`).
2. **Validation** : Effectue des validations préliminaires (ex : vérifier la présence des champs obligatoires, s'assurer que le message du formulaire comporte au moins 20 caractères).
3. **Délégation** : Appelle le ou les services appropriés.
4. **Réponse** : Gère l'encapsulation de la réponse JSON avec le code de statut HTTP adapté (200, 400 ou 500).

### Étape 3 : Le Service (`/backend/src/ai/aiService.ts` par exemple)
Le service est le module qui détient la logique métier pure :
* Il ne sait pas qu'il est appelé par une requête HTTP Express.
* Il communique avec les API externes (Google Gemini, SMTP, Open-Meteo).
* Il retourne les données brutes au contrôleur.

---

## 🛡️ Gestion des Erreurs et Robustesse

Le backend met en œuvre une politique stricte de prévention des pannes :
* **Blocs Try/Catch Systématiques** : Chaque route et chaque appel asynchrone est sécurisé individuellement. Un crash de l'API météo ou de l'API Gemini ne fera jamais s'effondrer le processus global du serveur Node.js.
* **Fallbacks (Solutions de Repli) Intelligents** :
  * Si l'API Gemini vocale native renvoie un quota insuffisant (Erreur 429), le service ne plante pas : il renvoie la réponse textuelle normalement et informe discrètement la console que le client Web Speech API prendra automatiquement le relais.
  * Si la géolocalisation IP échoue, le pays de l'expéditeur d'un mail est simplement renseigné à `"Non identifié"` sans bloquer la soumission du formulaire.
* **Typage TypeScript Strict** : Garantit qu'aucun attribut inattendu ne vienne perturber la structure des données transmises.

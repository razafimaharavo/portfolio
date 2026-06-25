# 🏗️ Architecture Générale du Projet

Ce document présente l'architecture globale de l'application full-stack du Portfolio de Marion. L'application combine un client **React interactif hautement dynamique en 3D** et un serveur **Express léger faisant office de proxy API sécurisé** pour l'accès aux modèles d'IA de Google et aux services SMTP.

---

## 🧭 Diagramme d'Architecture Global

```
+-------------------------------------------------------------------------------+
|                                FRONTEND REACT                                 |
|                                                                               |
|  [Interface Utilisateur] <--- [LanguageContext] <--- (i18n / Traductions)     |
|         |                           |                                         |
|         v                           v                                         |
|  [Bento Accordion]         [RazmaAssistant] <=== (Web Speech API / Vocal)     |
|         |                           ||                                        |
|         +-- (Action Défilement) <===++                                        |
|         |                                                                     |
|         v (Requêtes HTTP REST / JSON)                                         |
+---------||--------------------------------------------------------------------+
          ||
          v  [Proxy Réseau / Port 3000]
+---------||--------------------------------------------------------------------+
|         ||                     BACKEND NODE.JS (Express)                      |
|         v                                                                     |
|    [Routes API]  (/api/chat, /api/contact, /api/weather, /api/voice)          |
|         |                                                                     |
|         v                                                                     |
|   [Contrôleurs]  (portfolioController.ts)                                     |
|         |                                                                     |
|         +--------------> [aiService] ------> (Google Gemini API / Client SDK) |
|         |                                                                     |
|         +--------------> [mailer] ---------> (Nodemailer / Serveur SMTP)      |
|         |                                                                     |
|         +--------------> [weatherService] --> (Open-Meteo & BigDataCloud APIs)|
|                                                                               |
+-------------------------------------------------------------------------------+
```

---

## 1. Description des Couches de l'Application

### A. Le Frontend React (SPA - Single Page Application)
Le client est une application monopage moderne, performante et adaptative. 
* **Moteur de rendu** : React 18 managé par Vite pour une compilation instantanée.
* **Arrière-plan 3D** : Un canvas WebGL contrôlé par Three.js dessine un réseau dynamique réagissant aux mouvements de la souris, apportant une dimension technologique sans ralentir la navigation.
* **Animations** : Les transitions d'accords (Bento Accordion), l'affichage du tiroir de discussion et les effets au survol de la souris s'appuient sur la bibliothèque `motion` (importée depuis `motion/react`).
* **Gestion locale de la géolocalisation** : Interroge les API du navigateur pour récupérer les coordonnées de l'utilisateur afin de personnaliser la météo locale en temps réel.

### B. Le Backend Node.js / Express
Le serveur sert un double objectif :
1. **Sécurité (Masquage des Secrets)** : Toutes les clés sensibles (`GEMINI_API_KEY`, identifiants `SMTP`) restent cloisonnées côté serveur, à l'abri de l'inspecteur d'éléments du navigateur web.
2. **Distribution de l'Application** : En production, Express distribue également les fichiers statiques HTML/JS du dossier `/dist` produits lors du build.

### C. Communication API
Les communications entre le client et le serveur s'effectuent au format **JSON structuré** via des requêtes HTTP POST standard. Toutes les requêtes transitent par le port unique **3000** (exigence d'ingress Cloud Run).
* **Endpoints interactifs** :
  * `/api/chat` : Transmet le message utilisateur, l'historique et le contexte météo pour recevoir une réponse structurée de Razma IA.
  * `/api/contact` : Réceptionne le formulaire, valide les données, recherche le pays de l'expéditeur via son IP, et envoie l'e-mail.
  * `/api/weather` : Récupère la météo d'après les coordonnées latitude/longitude fournies par le navigateur.
  * `/api/voice` : Génère un flux audio TTS natif en base64 pour un texte donné.

---

## 2. Gestion Globale des États

Plutôt que d'introduire des gestionnaires d'état complexes et lourds (comme Redux) inutiles pour une application monopage, l'application utilise une approche moderne et optimisée combinant :
* **Contextes React** : Notamment `LanguageContext` pour propager dynamiquement la langue choisie par l'utilisateur à l'ensemble des composants enfants sans "prop-drilling".
* **Hooks d'États Locaux (`useState`)** : Pour les variables dynamiques d'interfaces (tiroir de l'assistant ouvert/fermé, accordéon de la section À propos, projet sélectionné pour la modale détaillée).
* **Références React (`useRef`)** : Utilisées de manière critique pour suivre l'état de lecture audio de la voix, les instances d'enregistrement de microphone, et le thème actuel à l'intérieur de la boucle de rendu à 60 FPS de Three.js (évitant ainsi les blocages de rendu ou les cycles de réécriture infinis).

---

## 3. Gestion des Traductions (Internationalisation)

L'internationalisation est gérée par un système léger de dictionnaire dynamique personnalisé.
* **Fichier centralisé** : `/src/i18n/translations.ts` contient les dictionnaires de traduction structurés pour le Français (`fr`), l'Anglais (`en`), et le Malgache (`mg`).
* **Propagation** : Le `LanguageProvider` enveloppe l'application et fournit la fonction de traduction `t(key)` et la variable d'état `language`.
* **Traduction à la volée** : Dès que l'utilisateur modifie sa langue préférée dans le menu de l'en-tête, tous les textes, les labels de formulaires, les états météo ainsi que l'assistant vocal Razma adaptent instantanément leur syntaxe et leur prononciation sans rechargement de page.

---

## 4. Choix et Avantages de cette Architecture

* **Sécurité Absolue** : L'architecture de proxy interdit l'exposition de la clé d'API Gemini dans le code client.
* **Résilience Réseau** : L'implémentation de mécanismes d'essais automatiques avec délai d'attente exponentiel (`generateContentWithRetry`) permet de surmonter les erreurs transitoires 503 ou de surcharge de l'API Gemini.
* **Performance et Fluidité** : Le regroupement de la logique backend au sein d'un serveur compilé par `esbuild` permet un temps de réponse de l'assistant d'environ une seconde.

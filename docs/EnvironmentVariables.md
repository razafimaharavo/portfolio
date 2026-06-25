# 🔑 Variables d'Environnement et Secrets (.env)

L'application s'appuie sur des variables d'environnement configurées via un fichier `.env` à la racine en développement, ou injectées de manière sécurisée via la console Cloud Run / AI Studio secrets en production.

---

## 📋 Tableau Récapitulatif des Variables d'Environnement

| Variable | Description | Obligatoire ? | Utilisation | Exemple |
| :--- | :--- | :---: | :--- | :--- |
| **`GEMINI_API_KEY`** | Clé secrète d'accès à l'API Google Gemini. | **Oui** | Alimente le moteur de dialogue intelligent Razma IA et la synthèse vocale native `gemini-3.1-flash-tts-preview`. | `AIzaSyD5b...` |
| **`PORT`** | Port réseau d'écoute du serveur Express. | Non *(Défaut: `3000`)* | Définit sur quel port le backend distribue le site et écoute les appels API. Bloqué à `3000` en production. | `3000` |
| **`EMAIL_HOST`** | Hôte du serveur SMTP d'envoi d'e-mail. | Non | Adresse du serveur de messagerie sortant pour le formulaire de contact. | `smtp.gmail.com` |
| **`EMAIL_PORT`** | Port du serveur SMTP. | Non | Port réseau du serveur de messagerie. | `465` (SSL) ou `587` (TLS) |
| **`EMAIL_USER`** | Nom d'utilisateur ou adresse mail d'authentification SMTP. | Non | Utilisé par Nodemailer pour s'authentifier. Si absent, le serveur utilise un compte de test virtuel (Ethereal). | `razafimaharavomarion@gmail.com` |
| **`EMAIL_PASSWORD`** | Mot de passe SMTP d'authentification. | Non | Mot de passe d'application généré pour sécuriser la connexion de messagerie. | `wmuscbddfzhawamf` |
| **`WEATHER_API_KEY`** | Clé secrète de l'API WeatherAPI. | Non | Si renseignée, elle active l'affichage météo via WeatherAPI. Sinon, le système bascule sur Open-Meteo (gratuit sans clé). | `e2a4f...` |
| **`APP_URL`** | URL racine hébergeant l'application. | Non | Utilisée pour configurer d'éventuels liens d'envoi ou callbacks d'authentification sécurisés. | `https://portfolio-marion.com` |

---

## ⚙️ Explications Détaillées par Module

### A. Clé d'API Google Gemini (`GEMINI_API_KEY`)
* **Utilité** : C'est le moteur cérébral de l'application. Sans cette clé, l'assistante virtuelle Razma IA ne pourra pas répondre aux questions de l'utilisateur ni générer de fichiers audio haute fidélité.
* **Sécurité** : Cette clé ne doit **jamais être préfixée par `VITE_`** car les variables préfixées par `VITE_` sont lues et compilées dans le code client visible par n'importe quel visiteur inspectant la console Web. Elle doit rester exclusivement confinée au backend Express.
* **Résilience** : Si la clé expire ou est absente, l'assistant renvoie une réponse éducative explicative indiquant au développeur comment configurer sa clé d'API, garantissant un comportement professionnel.

### B. Configuration de la Messagerie SMTP (Nodemailer)
Pour recevoir les messages de vos visiteurs directement dans votre boîte de messagerie Gmail (par exemple), vous devez renseigner les quatre variables `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER` et `EMAIL_PASSWORD`.

> ⚠️ **Sécurité Gmail** : Si vous utilisez une adresse Gmail, n'utilisez **jamais** votre mot de passe de connexion Gmail principal. Google bloque ces connexions par défaut. Vous devez vous rendre sur votre compte Google, activer la double authentification, puis générer un **"Mot de passe d'application" (App Password)** de 16 caractères de type `wmuscbddfzhawamf` dédié uniquement à l'application portfolio.

### C. Mode Sandbox de Test (Ethereal Email)
Si vous ne renseignez pas les variables d'e-mail dans le fichier `.env`, le backend est conçu pour ne pas planter. Il instancie automatiquement un compte d'e-mail temporaire factice auprès d'**Ethereal Email**. Le mail est envoyé de manière simulée, et le backend renvoie l'URL de prévisualisation dans la réponse de l'API. L'utilisateur peut inspecter l'e-mail envoyé de manière interactive en cliquant sur le lien fourni par le système.

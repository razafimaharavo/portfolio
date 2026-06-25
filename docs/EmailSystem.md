# ✉️ Système d'Envoi d'E-mail

Le portfolio intègre un formulaire de contact professionnel et sécurisé. Ce document détaille le flux complet des données, de la saisie utilisateur sur l'interface jusqu'à la réception de l'e-mail dans la boîte aux lettres du développeur.

---

## 🧭 Diagramme du Flux de l'E-mail

```
+---------------------------------------------------------------------------------+
|                                 FRONTEND REACT                                  |
|                                                                                 |
|   [Utilisateur remplit le formulaire]                                           |
|                │                                                                |
|                v                                                                |
|   [Validation Locale par Zod (ZodSchema)] ───> Erreur ───> [Affichage d'alertes]|
|                │                                                                |
|                v (Pas d'erreur)                                                 |
|   [Appel API POST /api/contact] (JSON Payload)                                  |
+----------------||---------------------------------------------------------------+
                 ||
                 v (Requête Réseau)
+----------------||---------------------------------------------------------------+
|                ||               BACKEND EXPRESS                                 |
|                v                                                                |
|   [Routeur Express : POST /api/contact]                                         |
|                │                                                                |
|                v                                                                |
|   [portfolioController (handleContactForm)]                                     |
|                │                                                                |
|                ├─> (Résolution IP & Pays de l'expéditeur)                       |
|                v                                                                |
|   [mailerService (sendContactEmail)]                                            |
|                │                                                                |
|                ├─> EMAIL_USER & EMAIL_PASSWORD configurés                       |
|                │         │                                                      |
|                │         ├───> [OUI] ───> Envoi réel via SMTP configuré         |
|                │         │                                                      |
|                │         └───> [NON] ───> Envoi de test via Ethereal SMTP       |
|                v                                                                |
|   [Boîte mail de destination]                                                   |
+---------------------------------------------------------------------------------+
```

---

## 1. Le Formulaire React & Validation Zod (Frontend)

Le formulaire de contact réside dans `/src/components/contact/ContactSection.tsx`.
* **Gestion du Formulaire** : Utilise la bibliothèque populaire **React Hook Form** (via le hook `useForm`), qui évite les re-rendus inutiles de la page entière à chaque caractère saisi.
* **Validation des Saisies (Zod)** : Un schéma de validation Zod (`contactSchema`) est déclaré pour garantir l'intégrité et la sécurité des données avant tout envoi réseau :
  * Le champ **Nom** est obligatoire.
  * Le champ **Email** doit respecter un format d'adresse de courrier électronique valide.
  * Le champ **Sujet** est requis.
  * Le champ **Message** doit contenir **au moins 20 caractères** pour éviter les spams de soumissions de formulaires vides ou trop courts.
* **Gestion de l'état d'envoi** : Pendant le traitement de la requête, le bouton de validation affiche un indicateur de chargement (`Loader2`) et passe à l'état désactivé (`disabled`) pour empêcher l'utilisateur de soumettre le formulaire plusieurs fois d'affilée.

---

## 2. Le Contrôleur Express & Enrichissement de la Requête (Backend)

Une fois les données reçues par le backend sur la route `/api/contact`, le contrôleur `handleContactForm` effectue les opérations suivantes :

### A. Double Validation de Sécurité
Bien que validées côté client, les données sont de nouveau vérifiées côté serveur pour bloquer d'éventuelles attaques de robots contournant l'interface React :
```ts
if (!name || !senderEmail || !subject || !message) {
  res.status(400).json({ error: "Tous les champs sont obligatoires." });
  return;
}
```

### B. Résolution Géographique de l'Expéditeur
Pour apporter une valeur ajoutée professionnelle aux notifications par e-mail de Marion, le serveur extrait l'adresse IP de la requête de manière robuste (gestion du proxy ou de la connexion locale) :
1. **Extraction de l'IP** : Lit les en-têtes `x-forwarded-for` (fournis par le proxy Cloud Run) ou se replie sur l'adresse de socket distante de connexion.
2. **Reverse IP Geocoding** : Si l'IP est publique (non locale), le backend effectue un appel asynchrone léger vers le service gratuit **`ipapi.co`** :
   * Si l'appel réussit, le nom du pays de l'expéditeur est extrait.
   * Si l'appel échoue (ex: blocage réseau ou IP privée), l'erreur est interceptée en silence et le pays est simplement valorisé à `"Non identifié"`.

---

## 3. Acheminement SMTP avec Nodemailer

Le service `/backend/src/mail/mailer.ts` utilise la bibliothèque de référence **Nodemailer** pour formater et transmettre le courrier électronique.

### A. Conception Hybride du Transporteur (Double Résilience)
Pour permettre un déploiement fluide dans tous les environnements, le service propose une double configuration automatique :

1. **SMTP Réel de Production** :
   * Si les variables d'environnement `EMAIL_USER` et `EMAIL_PASSWORD` sont détectées, Nodemailer instancie un transporteur SMTP sécurisé s'appuyant sur le serveur configuré (ex: `smtp.gmail.com` sur le port sécurisé `465` ou TLS `587`).
   * Le mail est alors instantanément envoyé dans la boîte aux lettres officielle de Marion : `razafimaharavomarion@gmail.com`.
2. **SMTP Sandbox de Test (Ethereal)** :
   * En l'absence de variables d'environnement configurées (par exemple, lors du développement local ou du test dans un bac à sable), le service instancie automatiquement un compte de test éphémère auprès du service **Ethereal Email** via `nodemailer.createTestAccount()`.
   * Le mail est envoyé virtuellement et l'API retourne un lien URL de prévisualisation dans la réponse JSON. L'utilisateur peut ainsi cliquer sur ce lien dans l'interface du portfolio pour inspecter le rendu visuel exact du mail envoyé sans avoir eu besoin de configurer de serveur de messagerie !

### B. Formatage Professionnel du Message
Nodemailer transmet le courrier en double format :
* **Format Texte Brut** : Assure la compatibilité avec tous les clients de messagerie, même les plus anciens.
* **Format HTML Enrichi** : Un gabarit d'e-mail responsive avec un design épuré, des couleurs en accord avec le portfolio (accents indigo), un tableau structuré présentant l'identité de l'expéditeur, sa date d'envoi locale et un encadré stylisé contenant son message. Des métriques techniques (IP, pays d'origine) sont ajoutées discrètement en pied de page.

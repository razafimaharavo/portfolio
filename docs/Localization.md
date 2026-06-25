# 📍 Système de Localisation Géographique et Régionale

La **localisation** (à ne pas confondre avec la simple traduction de texte) consiste à adapter le contenu, les fonctionnalités et les données de l'application en fonction de la situation géographique réelle de l'utilisateur. 

Le portfolio de Marion intègre des briques avancées pour détecter et exploiter la position physique du visiteur de manière éthique, sécurisée et optimale.

---

## 🏗️ Structure des Éléments de Localisation

Le système de localisation rassemble trois informations complémentaires :
1. **La détection explicite par GPS (Navigateur)** : Demande de coordonnées haute précision au système d'exploitation du visiteur.
2. **Le géocodage inversé (Reverse Geocoding)** : Convertit des coordonnées mathématiques brutes (latitude, longitude) en une identité textuelle lisible par un humain (Ville, Pays).
3. **Le profilage géographique par IP (Backend fallback)** : Détermine approximativement le pays de l'expéditeur d'un e-mail à partir de son adresse réseau publique.

---

## 🔄 Flux d'Adaptation et Synchronisation de la Localisation

```
             [Visiteur autorise la Géolocalisation]
                                │
                                v
               [Latitude & Longitude récupérées]
                                │
             ┌──────────────────┴──────────────────┐
             ▼                                     ▼
   [Appel API Open-Meteo]              [Appel API Reverse Geocoding]
- Analyse des coordonnées            - Analyse des coordonnées
- Retour des données météo            - Retour textuel (ex : "Lyon, France")
  physiques brutes (température)
             │                                     │
             └──────────────────┬──────────────────┘
                                │ (Regroupement des données)
                                v
            [Adaptation multilingue et culturelle]
- Traduction automatique des codes de conditions météo (WMO)
- Injection dans le prompt de Razma IA
- Affichage dans le widget de l'assistant vocal
```

---

## 🛠️ Composants de Localisation en Détail

### A. Détermination du Pays par Adresse IP (`/backend/src/controllers/portfolioController.ts`)
Lorsqu'un utilisateur soumet un message via le formulaire de contact, le backend souhaite enregistrer l'origine géographique approximative de l'envoi pour enrichir la notification de Marion.
1. **Extraction de l'IP publique** : Le backend analyse l'en-tête `x-forwarded-for` (transmis par les proxies d'entrée et équilibreurs de charge de Cloud Run) ou se replie sur `req.socket.remoteAddress`.
2. **Requête Géographique** : Envoie une requête asynchrone légère au service tiers de confiance `https://ipapi.co/${ip}/json/`.
3. **Extraction** : Récupère le champ `country_name` pour l'ajouter au courrier final, évitant ainsi à Marion d'avoir à deviner d'où provient la demande de service.

### B. Le Géocodage Inversé de Coordonnées GPS (`/backend/src/weather/weatherService.ts`)
Lorsque l'utilisateur clique sur le bouton "Détecter ma position" dans la barre d'assistance Razma, le navigateur renvoie des nombres complexes comme : `45.764043, 4.835659`.
Pour que l'assistant puisse dire oralement "Il fait beau à Lyon", ces coordonnées doivent être traduites.
1. Le service interroge l'API de géolocalisation gratuite de BigDataCloud : `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=fr`.
2. Il extrait de manière sécurisée les propriétés `city` ou `locality` et `countryName`.
3. Ces chaînes remplacent les données de repli et sont injectées dynamiquement dans l'en-tête de la page et dans le prompt de Razma IA.

---

## 🌍 Avantages de la Localisation

* **Personnalisation Élevée** : L'assistante virtuelle accueille le visiteur en faisant allusion aux conditions climatiques de sa propre ville, créant une expérience d'interaction d'une rare élégance technologique.
* **Résilience** : En l'absence d'autorisation de géolocalisation, le système bascule automatiquement sur un profil d'accueil neutre ciblé par défaut sur Antananarivo, Madagascar, sans dégrader l'expérience globale du site.

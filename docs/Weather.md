# 🌤️ Système Météo Intelligent

L'application intègre un module météo temps réel performant et gratuit, connecté à l'assistant vocal Razma IA. Cela permet de personnaliser les réponses de l'IA en fonction du temps qu'il fait chez le visiteur.

---

## 🧭 Diagramme du Flux de Données Météo

```
[Navigateur récupère les coordonnées GPS]
                  │
                  v  (Envoi des coordonnées POST /api/weather)
        [Routeur API Express]
                  │
                  v  (portfolioController.ts -> handleWeatherLookup)
     [weatherService.ts (fetchWeather)]
                  │
                  ├─> WEATHER_API_KEY configurée
                  │         │
                  │         ├───> [OUI] ───> Appel API Premium WeatherAPI
                  │         │
                  │         └───> [NON] ───> Appel API gratuite Open-Meteo
                  v
       [Récupération des données brutes]
                  │
                  ├─> Traduction du code météo (WMO Code -> Texte Français)
                  ├─> Reverse Geocoding (Résolution du nom de Ville)
                  v
       [Réception par le Contrôleur Express]
                  │
                  v  (Réponse JSON retournée au client)
  [Mise à jour de l'affichage UI & Injection dans le prompt Gemini]
```

---

## 1. Choix Technologiques et APIs Utilisées

Le service de météo `/backend/src/weather/weatherService.ts` a été conçu selon les standards de la double résilience, lui permettant de fonctionner avec ou sans clé d'API propriétaire :

### A. L'API Premium : WeatherAPI (Optionnelle)
Si Marion configure une clé d'API `WEATHER_API_KEY` dans ses secrets, le système interroge le service professionnel **WeatherAPI** :
`https://api.weatherapi.com/v1/current.json?key=${key}&q=${lat},${lon}`
Ce service fournit en un seul appel les données atmosphériques et les noms géographiques correspondants.

### B. L'API Gratuite de Repli : Open-Meteo (Par Défaut, sans clé)
Pour assurer que le site fonctionne immédiatement après son installation sans exiger du développeur la création préalable de comptes tiers, le système interroge le service public et libre **Open-Meteo** :
`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code`
Ce service ultra-rapide fournit les constantes physiques physiques brutes sous forme de codes numériques standardisés.

---

## 2. Traduction des Codes Météo (WMO Codes)

L'API Open-Meteo communique les conditions météo sous forme de codes définis par l'Organisation Météorologique Mondiale (WMO). Le service intègre une table de correspondance (`weatherCodesMap`) pour traduire instantanément ces codes en descriptions francophones élégantes :

```ts
const weatherCodesMap: Record<number, string> = {
  0: "Ciel dégagé",
  1: "Principalement dégagé",
  2: "Partiellement nuageux",
  3: "Couvert",
  45: "Brouillard",
  48: "Brouillard givrant",
  51: "Bruine légère",
  53: "Bruine modérée",
  55: "Bruine dense",
  61: "Pluie faible",
  63: "Pluie modérée",
  65: "Pluie forte",
  71: "Chute de neige légère",
  73: "Chute de neige modérée",
  75: "Chute de neige forte",
  80: "Averses de pluie faibles",
  81: "Averses de pluie modérées",
  82: "Averses de pluie violentes",
  95: "Orage faible ou modéré",
  99: "Orage avec grêle forte",
};
```

---

## 3. Gestion des Erreurs et Robustesse

Si l'utilisateur bloque la géolocalisation, si le réseau rencontre une perturbation, ou si les requêtes de reverse-geocoding échouent, le service intercepte l'erreur proprement :
* **Aucun Plantage** : Un message informatif s'affiche dans la console, et le système bascule sur un profil climatique de repli par défaut.
* **Valeurs par défaut professionnelles** : Les données météo de Madagascar (Antananarivo, 21°C, Nuages épars) sont chargées. L'application reste totalement opérationnelle, esthétique et l'assistant IA continue de discuter sans interruption.

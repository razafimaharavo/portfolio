# 🛰️ Système de Géolocalisation par Navigateur

Le portfolio utilise les capacités matérielles et logicielles du navigateur web du visiteur pour localiser géographiquement l'appareil de manière dynamique et non intrusive. Ce document détaille l'utilisation de la **W3C Geolocation API**, la gestion des requêtes asynchrones et le paramétrage de sécurité requis pour les environnements en conteneurs ou en iframes.

---

## 🧭 Diagramme d'Obtention de la Position GPS

```
                   [Clic sur le bouton "Détecter Position"]
                                │
                                v
               [Vérification de l'API Geolocation]
                                │
       ┌────────────────────────┴────────────────────────┐
       ▼ (API non supportée)                             ▼ (API supportée)
[Alerte d'incompatibilité]                    [Demande d'autorisation]
                                                         │
                                ┌────────────────────────┴────────────────────────┐
                                ▼ (Autorisation refusée)                          ▼ (Autorisation acceptée)
                  [Notification d'erreur]                             [Appel asynchrone getCurrentPosition]
                                                                                  │
                                                                                  v
                                                                    [Extraction Latitude & Longitude]
                                                                                  │
                                                                                  v
                                                                  [Appel POST /api/weather (Backend)]
```

---

## 1. Utilisation de la W3C Geolocation API (Client)

Le hook personnalisé `/src/hooks/useWeather.ts` implémente l'interrogation du capteur de position natif du système d'exploitation par le biais de la fonction standard :
`navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options)`

### Paramètres d'Écoute Optimisés
Pour garantir une détection rapide et économe en batterie, la requête est configurée avec des tolérances adaptées :
```ts
const options = {
  enableHighAccuracy: false, // Inutile de forcer la puce GPS haute précision, la géolocalisation par réseau WiFi ou IP suffit amplement pour la météo.
  timeout: 8000,             // Abandonne la recherche après 8 secondes pour ne pas figer l'interface si l'appareil est lent à répondre.
  maximumAge: 120000         // Autorise l'utilisation d'une position enregistrée en cache si elle date de moins de 2 minutes (économie d'appels réseau).
};
```

---

## 2. Permissions de Sécurité dans les Iframes (Sandboxing)

Comme l'application s'exécute souvent au sein d'une iframe (notamment sur l'interface de prévisualisation d'AI Studio), la géolocalisation est soumise à des restrictions de sécurité strictes du navigateur.

### A. La Directive `requestFramePermissions`
Pour autoriser explicitement le conteneur d'iframe à interroger le service de localisation du visiteur, le fichier de configuration de l'application `/metadata.json` doit déclarer de manière claire la permission correspondante.
C'est pourquoi le tableau `requestFramePermissions` contient l'élément `"geolocation"`. Cela injecte l'attribut HTML `allow="geolocation"` sur l'iframe de rendu de production, débloquant l'accès à la puce matérielle.

### B. Gestion Résiliente des Refus de Permission
Si l'utilisateur refuse l'accès, ou si le protocole de sécurité (ex : absence de HTTPS) interdit l'appel, la fonction `errorCallback` intercepte l'erreur proprement :
* **Code d'Erreurs standardisés** : Le hook décode les codes d'erreur `PERMISSION_DENIED` (1), `POSITION_UNAVAILABLE` (2), et `TIMEOUT` (3).
* **Affichage Pédagogique** : Au lieu de bloquer l'interface, le state `weatherError` est mis à jour avec un message traduit explicatif (ex : `"Accès refusé"`), et le site bascule instantanément sur l'affichage thématique neutre de Madagascar.

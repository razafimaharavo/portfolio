# 🎙️ Assistant Vocal Temps Réel & Web Speech API

L'assistant vocal utilise les interfaces natives de la **Web Speech API** pour offrir une expérience de dialogue "mains libres" bidirectionnelle. Cette implémentation comprend des mécanismes complexes pour assurer la clarté de la voix, gérer les permissions de microphone dans des environnements d'iframe sécurisés, et prévenir les boucles d'écho audio désagréables.

---

## 🛠️ Composants de la Web Speech API utilisés

1. **`SpeechRecognition`** (ou `webkitSpeechRecognition` pour Safari/Chrome) : Intercepte les signaux sonores capturés par le microphone de l'utilisateur, les analyse localement via les modèles de reconnaissance vocale du système d'exploitation, et génère une transcription sous forme de texte brut.
2. **`SpeechSynthesis`** : Prend en charge la lecture de texte écrit à l'aide des moteurs de synthèse vocale locaux intégrés au navigateur.

---

## ⚙️ Processus Étape par Étape d'une Conversation Vocale

```
[État Initial : Microphone Désactivé]
       │
       v  (Clic sur le bouton micro ou switch de dialogue)
[Étape 1 : Demande de Permission] ───> Refusé ───> [Affichage Modale d'aide ou d'erreur]
       │
       ├───> Accepté
       v
[Étape 2 : Lancement d'Écoute (SpeechRecognition.start)]
       │
       v  (L'utilisateur parle)
[Étape 3 : Capture & Analyse Locale]
       │
       v  (Événement "onresult" déclenché)
[Étape 4 : Soumission Automatique à Razma API]
       │
       v  (Arrivée de la réponse textuelle)
[Étape 5 : Lancement de la Synthèse Vocale (SpeechSynthesis ou Audio base64)]
       │
       ├───> Désactivation temporaire de l'écoute du micro (onstart)
       ├───> Lecture Audio
       v
[Étape 6 : Fin de Parole (onend)]
       │
       v  (Attente de sécurité de 600ms)
[Étape 7 : Relance automatique de l'écoute (SpeechRecognition.start)]
```

---

## 🛡️ Gestion Securisée des Permissions & Contraintes d'Iframe

### Le Problème de l'Iframe
L'application s'exécute souvent au sein d'une interface d'iframe sécurisée (notamment dans la prévisualisation d'AI Studio). Par défaut, les navigateurs modernes bloquent l'accès au microphone dans les iframes si les permissions de sécurité ne sont pas explicitement déléguées.

### La Solution Technique
1. **Mise à jour des Métadonnées** : Le fichier `metadata.json` inclut explicitement la permission `"microphone"` dans le tableau `requestFramePermissions`.
2. **Gestion de l'Erreur `network` ou `not-allowed`** : Si le navigateur bloque l'accès au micro en raison des contraintes d'iframe, le composant `RazmaAssistant.tsx` l'intercepte dans le gestionnaire `recognition.onerror`. Une alerte jaune pédagogique s'affiche instantanément, expliquant clairement le problème et fournissant un bouton interactif **"Ouvrir dans un nouvel onglet"** pour contourner de manière fluide la restriction et restaurer l'expérience vocale complète.

---

## 🔇 Prévention des Boucles Vocales (Anti-Feedback Loops)

Un défi majeur des assistants vocaux continus est d'empêcher que le microphone n'intercepte la voix de l'assistant sortant par les haut-parleurs de l'ordinateur, créant ainsi une boucle de réponse infinie (le robot se répond à lui-même).

L'application résout ce problème de manière très élégante grâce à un **mécanisme de verrouillage d'état croisé** s'appuyant sur des références React (`useRef`) ultra-rapides :

### 1. Le Verrou de Parole (`isAudioPlayingRef`)
Dès que la lecture audio commence (que ce soit via l'audio binaire Gemini ou via `SpeechSynthesis.speak`), l'événement `onstart` de la synthèse vocale s'active :
* Le microphone est immédiatement stoppé via `recognition.abort()`.
* La variable d'état `isAudioPlayingRef.current` est passée à `true`.
* Pendant toute la durée de la parole, toutes les transcriptions éventuellement perçues par le micro de manière résiduelle sont explicitement ignorées.

### 2. Le Verrou de Réflexion (`isLoadingRef`)
Pendant que l'IA réfléchit (requête HTTP en cours vers `/api/chat`), `isLoadingRef.current` est positionné à `true`. Le microphone reste éteint pour empêcher l'utilisateur de soumettre une nouvelle phrase avant d'avoir reçu la réponse de la première.

### 3. Le Délai de Sédimentation (Settle Timeout)
Lorsque la lecture de la réponse se termine, l'événement `onend` est capturé :
* `isAudioPlayingRef.current` repasse à `false`.
* Pour éviter de capturer l'écho de fin de vibration du haut-parleur, un délai d'attente de sécurité de **600 millisecondes** est observé avant de réactiver le microphone.
* Passé ce délai, et si l'assistant est toujours configuré en mode vocal continu, `recognition.start()` est invoqué pour réengager l'écoute du visiteur.

---

## 📈 Avantages de cette Implémentation

* **Dialogue Naturel** : L'utilisateur n'a pas besoin de recliquer sur le bouton du micro à chaque réplique ; l'assistant gère l'alternance de la parole de manière autonome.
* **Grande Rapidité** : En désactivant la voix native Gemini lourde pour la synthèse vocale locale du navigateur en cas de ralentissement réseau, le temps de réponse est divisé par trois tout en conservant une diction de grande qualité.

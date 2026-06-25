# 🧠 Système d'Intelligence Artificielle - Razma IA

**Razma IA** est l'assistante virtuelle intelligente intégrée au Portfolio de Marion. Elle ne se contente pas de répondre à des questions sur les compétences de Marion : elle possède le **"super-pouvoir" technique d'interagir directement avec l'affichage graphique du site** d'après les intentions exprimées par le visiteur.

---

## 🗺️ Schéma Complet du Flux Conversationnel et Vocal

```
                  [Utilisateur parle au micro]
                                │
                                v  (Capture locale par le navigateur)
                [Reconnaissance vocale (SpeechRecognition)]
                                │
                                v  (Transcription en texte brut)
                   [Envoi de la requête textuelle]
                                │
                                v  (Appel POST /api/chat)
                     [SERVEUR EXPRESS (Backend)]
                                │
                                v  (Injection des données de Marion & météo)
                  [Appel API Google Gemini 2.5-Flash]
                                │
                                v  (Analyse de l'intention et réponse JSON)
                 [Retour de la Réponse Structurée]
                                │
       ┌────────────────────────┴────────────────────────┐
       │ (Réponse textuelle + action à exécuter)         │ (Flux audio natif base64)
       v                                                 v
 [Action Défilement UI]                           [Synthèse vocale (TTS)]
   - Détection section                              - Lecture audio immédiate
   - Dépliage Bento Accordéon                       - Repli vers SpeechSynthesis
   - Défilement fluide (Scroll)                       si indisponible
```

---

## 🧭 Fonctionnement de l'Interface Sidebar

L'assistant est accessible via un bouton flottant persistant en bas à gauche de l'écran (avec un cercle d'onde d'animation pulsée signalant son statut). Son activation ouvre une barre latérale élégante à droite de l'écran.

Cette barre latérale intègre :
1. **Lottie Player Dynamique** : Une animation vectorielle de vagues d'ondes de parole dont l'amplitude et le rythme s'adaptent à l'état de l'assistant (Écoute, Réflexion, Parole, Inactif).
2. **Widget Météo & Géo** : Affiche les coordonnées et les conditions atmosphériques locales détectées chez le visiteur.
3. **Zone de Discussion (Chat Thread)** : Présente les messages échangés de façon fluide (animations d'entrée progressives de bas en haut).
4. **Formulaire d'Écriture** : Permet au visiteur de choisir entre l'écriture textuelle classique ou le dialogue vocal continu par microphone.

---

## 🔗 Communication avec Gemini & Gestion du Contexte

L'intelligence de Razma repose sur l'intégration du SDK officiel `@google/genai` et l'interrogation du modèle de pointe de Google : **`gemini-2.5-flash`**.

### A. La Construction du Contexte
Pour formuler des réponses extrêmement précises et fidèles, le backend lit le fichier de structure professionnelle `/portfolio-context.json` au démarrage. À chaque interaction de l'utilisateur, le serveur injecte dans le prompt système de Gemini :
1. **L'identité de Razma** : Définie comme l'assistante d'exception de Marion Razafimaharavo.
2. **La Base de Connaissances Professionnelle** : L'historique complet des diplômes, des certifications, des expériences professionnelles, des technologies maîtrisées et de la description détaillée de chaque projet de Marion.
3. **Le Contexte Environnemental de l'Utilisateur** : Si l'utilisateur a autorisé la géolocalisation, les données de sa ville et de sa météo actuelle (ex: "Il fait 22°C et le ciel est dégagé à Antananarivo") sont injectées, permettant à Razma de briser la glace avec une remarque chaleureuse sur le temps qu'il fait chez l'utilisateur.

### B. Gestion de l'Historique
Pour conserver le fil de la discussion, les messages précédents sont convertis au format officiel requis par Google (`{ role: "user" | "model", parts: [{ text: "..." }] }`) et transmis dans la propriété `contents` de l'API. Les messages d'introduction et les métriques de mise à jour système sont filtrés de l'historique pour éviter d'encombrer inutilement la mémoire de contexte de l'IA (Token savings).

---

## 🕹️ Le Système de Navigation dans le Portfolio (Détection d'Intentions)

C'est l'un des aspects les plus innovants du portfolio. Razma est instruite pour **renvoyer exclusivement une réponse structurée au format JSON strict** respectant le schéma d'interface suivant :

```json
{
  "reply": "Texte explicatif à prononcer chaleureusement.",
  "action": "NOM_DE_L_ACTION_OU_NULL"
}
```

### Liste des Actions et Mappings UI
Lorsqu'un utilisateur dit quelque chose à l'assistant, Gemini l'analyse et associe une action si l'intention est détectée :

| Phrase Utilisateur (Exemple) | Action Détectée (`action`) | Réaction Visuelle du Portfolio (Frontend) |
| :--- | :--- | :--- |
| "Où as-tu étudié ?" | `scroll_diplomes` | Ouvre l'onglet "Diplômes" du Bento et fait défiler la page jusqu'à la section. |
| "Montre-moi tes certifications" | `scroll_formations` | Ouvre l'onglet "Formations" du Bento et fait défiler la page jusqu'à la section. |
| "Quels jobs as-tu occupés ?" | `scroll_experiences` | Ouvre l'onglet "Expériences" du Bento et fait défiler la page jusqu'à la section. |
| "Quelles techno utilises-tu ?" | `scroll_competences` | Ouvre l'onglet "Compétences" du Bento et fait défiler la page jusqu'à la section. |
| "Fais voir tes applications mobiles" | `scroll_mobile_projets` | Fait défiler l'écran jusqu'à la section des Projets Mobiles. |
| "Montre tes projets web" | `scroll_web_projets` | Fait défiler l'écran jusqu'à la section des Projets Web. |
| "Quels services proposes-tu ?" | `scroll_services` | Fait défiler l'écran jusqu'à la section des Services du portfolio. |
| "Je veux t'envoyer un mail" | `scroll_contact` | Fait défiler l'écran jusqu'au Formulaire de Contact. |

Si aucune intention de navigation n'est formulée (ex: "Tu aimes le chocolat ?"), la propriété `action` vaut simplement `null` et l'interface reste stable.

---

## 🎙️ Synthèse et Reconnaissance Vocale

### A. Synthèse Vocale (Text-To-Speech - TTS)
Razma utilise une approche hybride de synthèse vocale pour garantir une performance optimale :
1. **La Voix Native d'IA (Gemini TTS)** : Le serveur appelle le modèle de prévisualisation vocale de Google **`gemini-3.1-flash-tts-preview`** en requérant une modalité `AUDIO` et le profil de voix féminine `"Kore"`. Cette API retourne un flux binaire audio brut en base64 (format PCM linéaire 16 bits à 24000 Hz). Le client décode ce flux à l'aide d'un contexte de graphe audio Web (`AudioContext`) et lance la lecture de manière instantanée et naturelle.
2. **Le Repli Local (Browser SpeechSynthesis)** : Si la clé d'API ne dispose pas du quota suffisant ou si le réseau restreint les flux de données volumineux, le client bascule automatiquement sur la synthèse vocale intégrée du navigateur (`window.speechSynthesis`). Ce système choisit la meilleure voix féminine disponible en fonction de la langue actuelle.

### B. Reconnaissance Vocale (Speech-To-Text - STT)
S'appuie sur la technologie Web Speech API du navigateur (`window.webkitSpeechRecognition`). Elle convertit la parole du microphone de l'utilisateur en texte brut, qui est ensuite automatiquement injecté dans le formulaire et soumis à l'assistant. (Voir le document [VoiceAssistant.md](./VoiceAssistant.md) pour les détails d'implémentation et la gestion des permissions).

---

## 🌍 Gestion des Langues et des Émotions

* **Militilinguisme natif** : Le prompt système est dynamique. Si l'utilisateur bascule le portfolio en anglais ou en malgache, les instructions injectent des directives de langue impératives : `"Tu dois répondre en ANGLAIS"` ou `"Tu devez répondre en MALAGASY"`. L'assistant adapte immédiatement sa formulation, ses expressions idiomatiques et la prononciation vocale.
* **Directives d'empathie et de concision** : Pour éviter que la lecture vocale ne devienne fastidieuse, Razma reçoit pour instruction d'être **chaleureuse, accueillante, d'exprimer des émotions positives de bienveillance**, mais d'être **extrêmement concise** (1 à 2 phrases simples maximum par réponse). Cela garantit un temps de génération vocal extrêmement court et une interaction dynamique digne d'un assistant vocal intelligent de nouvelle génération.

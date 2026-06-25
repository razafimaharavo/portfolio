# 🌐 Système Multilingue - Internationalisation (i18n)

Pour s'ouvrir à une audience internationale, le portfolio propose une architecture d'internationalisation (i18n) légère, robuste et entièrement typée en **TypeScript**. L'application prend en charge trois langues de manière native : le **Français (`fr`)**, l'**Anglais (`en`)**, et le **Malgache (`mg`)**.

---

## 🏗️ Architecture du Système i18n

Le système d'internationalisation s'appuie sur trois piliers majeurs situés dans le répertoire `/src/i18n` :

1. **Les Dictionnaires de Traduction (`translations.ts`)** : Contiennent les chaînes textuelles clés-valeurs organisées de manière rigoureuse par section.
2. **Le Contrôleur de Types (`types.ts`)** : Un fichier qui garantit la sécurité des types au moment de la compilation. Toute omission d'une clé de traduction dans une langue provoque une erreur immédiate à la compilation, assurant qu'aucun texte ne soit manquant à l'écran.
3. **Le Fournisseur de Langue (`LanguageContext.tsx`)** : Un Context Provider React qui enveloppe l'intégralité du site et distribue l'état de la langue active ainsi que la fonction utilitaire de traduction.

---

## 🔄 Flux d'Internationalisation et de Changement de Langue

```
            [Utilisateur clique sur le sélecteur de langue (Header)]
                                │
                                v  (Ex: Sélection de "mg" pour le Malgache)
                     [Sélecteur appelle setLanguage]
                                │
                                v  (Mise à jour du LanguageContext)
            ┌───────────────────┴───────────────────┐
            ▼                                       ▼
  [Interface Graphique (UI)]               [RazmaAssistant (Vocal)]
- Re-rendu instantané                     - Mise à jour de la langue STT
- Remplacement des clés textuelles          (recognition.lang = "mg-MG")
- Dictionnaires traduits                  - Mise à jour du prompt Gemini
                                            ("Répondre en MALAGASY")
                                          - Voix féminine malgache activée
```

---

## 🛠️ Implémentation du Fournisseur et Hooks

Le fichier `LanguageContext.tsx` implémente un contexte React classique :

```tsx
interface LanguageContextType {
  language: "fr" | "en" | "mg";
  setLanguage: (lang: "fr" | "en" | "mg") => void;
  t: (key: string) => string;
}
```

### La Fonction Traduction `t(key)`
La fonction `t` reçoit une chaîne de caractères représentant le chemin vers le texte recherché (ex : `"about.diplomes.title"`). Elle sépare la clé par le caractère point (`.`) et parcourt l'arbre du dictionnaire de la langue active pour retourner la chaîne de texte correspondante. 

Si la clé demandée n'existe pas, la fonction retourne simplement le nom de la clé par mesure de sécurité, évitant ainsi un plantage d'affichage de l'interface (Graceful fallback).

---

## 📍 Rôle et Avantages de cette Approche

* **Aucune Dépendance Lourde** : Cette implémentation évite d'installer des bibliothèques externes complexes (comme `react-i18next` ou `formatjs`) qui alourdissent le fichier final de production et ralentissent le temps de chargement initial.
* **Sécurité de Compilation Strict** : TypeScript analyse la structure de l'objet de traduction de référence. Si Marion ajoute un nouveau projet ou une nouvelle compétence et oublie de traduire son titre ou sa description dans l'un des trois dictionnaires, le linter et le compilateur le signalent immédiatement.
* **Synchronisation Instantanée** : La mise à jour de la langue se fait à la volée. Aucun rafraîchissement réseau n'est requis, la transition est parfaitement invisible pour le visiteur.

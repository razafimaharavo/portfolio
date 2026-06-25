# 🌌 Arrière-Plan Réseau 3D Three.js

L'application intègre un arrière-plan en 3D interactif et immersif, représentant un réseau de neurones ou une constellation de connexions technologiques. Ce document détaille l'implémentation graphique réalisée avec la bibliothèque de référence **Three.js** dans le composant `/src/components/layout/InteractiveNetworkBackground.tsx`.

---

## 🛠️ Concepts Majeurs et Éléments de la Scène 3D

```
+-------------------------------------------------------------------------------+
|                             SCÈNE THREE.JS (Scene)                            |
|                                                                               |
|   [75 Particules (Nodes)]                                                     |
|         - 3D PlaneGeometry de petite taille                                   |
|         - Mouvement de dérive sinusoïdale organique (Drift)                   |
|         - Parallaxe tridimensionnelle basée sur la profondeur (Z-depth)       |
|                                                                               |
|   [Fils de Connexion (LineSegments)]                                          |
|         - BufferGeometry à coordonnées dynamiques réécrites à 60 FPS          |
|         - Connexion limitée à max 2 liaisons par nœud (Sparse Network)        |
|                                                                               |
|   [Courants Électriques Lumineux (Pulses)]                                    |
|         - Textures de halo radiales interpolées par blending additif          |
|         - Circulation périodique le long des segments de connexion            |
|                                                                               |
+-------------------------------------------------------------------------------+
```

---

## 1. Description du Moteur 3D

La scène s'initialise dans un hook `useEffect` et s'adosse à un canvas en arrière-plan fixe couvrant l'intégralité de l'écran.

### A. La Caméra et le Rendu (WebGLRenderer)
* **Caméra Perspective** : Un modèle `PerspectiveCamera(fov: 60, aspect, near: 0.1, far: 1000)` est placé à la position `z = 80`. La perspective permet d'obtenir un effet de profondeur naturelle : les objets proches de la caméra bougent plus vite que les objets éloignés lors des mouvements.
* **WebGLRenderer** : Configuré avec `alpha: true` pour permettre l'affichage de dégradés CSS en arrière-plan et `antialias: true` pour supprimer l'effet d'escalier sur les contours des particules et des segments. La résolution de rendu est verrouillée à un ratio maximal de 2 (`Math.min(window.devicePixelRatio, 2)`) pour ménager la carte graphique (GPU) des écrans Retina ou 4K sans compromettre la netteté visuelle.

---

## 2. Animation Organique & Effet de Parallaxe Mouse-Tracked

L'animation du réseau se fait à une cadence ciblée de 60 images par seconde (via `requestAnimationFrame`) et combine deux mouvements distincts :

### A. La Dérive Naturelle (Drift Wave)
Chaque particule flotte de manière asynchrone grâce à des formules trigonométriques s'appuyant sur un nombre aléatoire (seed) propre à chaque nœud :
```ts
const driftX = Math.sin(elapsed + p.seed) * 1.8;
const driftY = Math.cos(elapsed * 0.8 + p.seed * 1.2) * 1.8;
```
Cela produit un mouvement de flottaison doux et relaxant ressemblant à un écosystème biologique.

### B. Le Parallaxe 3D Réactif (Mouse Lerp)
Le déplacement du curseur de la souris (ou les glissements tactiles sur smartphone) influe directement sur les coordonnées tridimensionnelles des nœuds :
1. **Calcul standardisé** : Les mouvements de souris sont capturés et convertis en valeurs normées comprises entre `-1` et `1` par rapport au centre de l'écran.
2. **Smoothing (Lerp)** : Pour éviter des mouvements saccadés désagréables pour l'utilisateur, les coordonnées de la souris sont interpolées de façon progressive (6% de rapprochement par frame) :
   `mouse.x += (mouse.targetX - mouse.x) * 0.06`
3. **Facteur de Profondeur (Depth-Multiplier)** : Les particules disposant d'un `z` proche de la caméra ont un multiplicateur de parallaxe plus élevé. Celles situées en arrière-plan se déplacent très peu, simulant un effet de parallaxe 3D saisissant.

---

## 3. Courants Électriques (Glowing Pulses)

Pour accentuer la dimension vivante et dynamique du site, des halos lumineux circulent le long de 18% des lignes de connexion :
* **Texture Custom** : Une texture de lueur circulaire douce est générée dynamiquement en mémoire grâce à un dégradé radial tracé sur un élément de Canvas HTML bidimensionnel éphémère (`createRadialGlowTexture`).
* **Blending Additif** : La lueur est projetée à l'aide d'un matériau paramétré en `THREE.AdditiveBlending`. Les pixels lumineux s'additionnent mathématiquement à ceux de l'arrière-plan, simulant un éclairage d'électricité néon ultra-réaliste.
* **Interpolation** : Chaque impulsion progresse de manière linéaire entre deux nœuds liés. Une fois sa destination atteinte, elle est automatiquement affectée à un nouveau segment aléatoire avec une vitesse de croisière différente.

---

## 4. Adaptation Dynamique Thème Sombre / Clair

Pour assurer un contraste de lecture parfait, l'arrière-plan s'adapte instantanément au changement de thème initié par l'utilisateur :
* **Réaction à la Volée** : Le composant React surveille la variable de thème. Au sein même de la boucle de rendu WebGL à 60 images par seconde, une référence (`themeRef`) met à jour la couleur des matériaux en quelques millisecondes sans avoir à recréer la scène ou recharger le canvas :
  * **Thème Sombre** : Les particules et connexions adoptent des couleurs **cyan électrique (`0x06b6d4` / `0x22d3ee`)** avec une opacité lumineuse.
  * **Thème Clair** : Les matériaux basculent sur un **bleu roi doux (`0x2563eb` / `0x3b82f6`)** avec des opacités atténuées pour ne pas perturber la lisibilité du texte noir.

---

## 5. Optimisation des Performances & Nettoyage de la Mémoire

Trois principes de protection matérielle ont été implémentés pour garantir la fluidité sur tous les appareils (notamment les ordinateurs portables ou mobiles d'entrée de gamme) :
1. **Sparse Connectivity (Réseau Épars)** : Au lieu de relier tous les nœuds entre eux (calcul quadratique lourd), chaque point ne peut s'associer qu'à **un maximum de 2 connexions**. Cela réduit le nombre de segments à tracer à un niveau linéaire raisonnable et préserve un style visuel aéré et chic.
2. **BufferGeometry Unique** : Toutes les lignes de connexions sont intégrées au sein d'une unique structure optimisée `THREE.LineSegments` s'appuyant sur un tableau de coordonnées à plat (`Float32Array`).
3. **Nettoyage Strict des Ressources (Garbage Collection)** : Lors du démontage de la page ou du composant, la fonction de nettoyage (cleanup callback) du hook `useEffect` détruit explicitement chaque structure de données du GPU :
   * Arrêt de la boucle d'animation via `cancelAnimationFrame`.
   * Libération de la mémoire des géométries (`geometry.dispose()`).
   * Libération des matériaux et des textures (`material.dispose()`, `texture.dispose()`).
   * Retrait de l'élément canvas du DOM.
   Cela évite tout risque de fuite de mémoire (memory leak) et d'usure anormale de la batterie de l'utilisateur.

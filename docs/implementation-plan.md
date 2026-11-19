# Plan d'Implémentation & Feuille de Route · Protocol Explorer

Ce document formalise la feuille de route méthodique pour la recréation indépendante de l'application **Protocol Explorer**, depuis l'initialisation de la stack technique jusqu'au déploiement final en production.

---

## Vue d'Ensemble des Phases

```
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 1 : Analyse Technique & Spécifications (COMPLÉTÉE)               │
│ Production de docs/product.md, ui.md, architecture.md, protocols.md    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ PHASE 2 : Initialisation du Projet & Architecture Fondatrice           │
│ Next.js 14+, TypeScript strict, Tailwind CSS, Arborescence modulaire   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ PHASE 3 : Moteur Binaire & Système de Décodage (PacketBuilder)         │
│ Constructeur d'octets, calculs de checksums (RFC 1071), dissection    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ PHASE 4 : Moteur de Simulation & Événements Discrets                  │
│ Machine à états, chronomètre virtuel, ordonnanceur, latences relatives │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ PHASE 5 : Composants Visuels (Topologie Réseau & Diagramme de Séquence)│
│ Scènes SVG isométriques, nœuds dynamiques, lanes, flèches temporelles  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ PHASE 6 : Tableau de Flux & Inspecteur Wireshark-like                  │
│ Table de paquets, arbre de dissection, hex dump 16 B, hover synchrone  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ PHASE 7 : Intégration des 39 Leçons de Protocoles                      │
│ Core (11) ➔ Application (19) ➔ Security (9)                            │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ PHASE 8 : Contrôles, Raccourcis Clavier, Recherche & Thèmes            │
│ Command Palette (Ctrl+K), shortcuts (?), speed, focus mode, dark/light │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ PHASE 9 : Internationalisation (15 Langues, RTL) & Tests Automatisés   │
│ Dictionnaires i18n, support LTR/RTL, suites de tests Vitest & E2E      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ PHASE 10 : Optimisation, Audit Final & Déploiement Vercel              │
│ Profiling 60 FPS, validation responsive 5 paliers, README & déploiement│
└────────────────────────────────────────────────────────────────────────┘
```

---

## Détail des Phases & Livrables

### Phase 1 : Analyse & Spécifications (Statut : ✅ COMPLÉTÉE)
- **Objectif** : Déconstruire exhaustivement l'application de référence pour en extraire la logique sans copier de code propriétaire.
- **Livrables produits** :
  - `docs/product.md` : Vision, mission pédagogique, public cible, exigences fonctionnelles et non-fonctionnelles.
  - `docs/ui.md` : Système de design, thèmes, paliers responsives, vues topologie/séquence, inspecteur binaire.
  - `docs/architecture.md` : Stack retenue, structure modulaire, moteur de simulation, moteur binaire.
  - `docs/protocols.md` : Spécifications détaillées des 39 protocoles (Core, Application, Security).
  - `docs/implementation-plan.md` : Feuille de route par étapes et critères d'acceptation.

---

### Phase 2 : Initialisation du Projet & Architecture Fondatrice
- **Objectif** : Mettre en place l'environnement de développement Next.js / TypeScript / Tailwind CSS.
- **Tâches** :
  1. Initialiser le projet Next.js avec App Router et configuration TypeScript stricte.
  2. Configurer Tailwind CSS avec variables CSS pour le support natif des thèmes sombre et clair.
  3. Définir les classes utilitaires de couleurs par couche réseau (`c-eth`, `c-ip`, `c-tcp`, `c-udp`, `c-dns`, `c-tls`, etc.).
  4. Créer la structure complète de dossiers (`app/`, `components/`, `lib/`, `data/`, `hooks/`, `tests/`).
  5. Configurer les linters (ESLint) et l'environnement de test (Vitest).
- **Critères d'acceptation** :
  - `pnpm build` ou `npm run build` réussit sans avertissement ni erreur TypeScript.
  - La page racine se charge et applique les styles de base avec bascule de thème sombre/clair.

---

### Phase 3 : Moteur Binaire & Décodage (`lib/packet/`)
- **Objectif** : Développer le système de construction binaire et de dissection en mémoire.
- **Tâches** :
  1. Implémenter la classe `PacketBuilder` avec méthodes `u8`, `u16`, `u24`, `u32`, `u64`, `ascii`, `raw`, `unknown`, `field` et `append`.
  2. Implémenter les algorithmes de checksum standard (Internet Checksum RFC 1071 pour IPv4, TCP, UDP, ICMP).
  3. Implémenter le constructeur de couches d'encapsulation `assembleLayers` qui calcule les offsets globaux de début et de fin (`from`, `to`).
  4. Créer des helpers de formatage pour les adresses MAC, adresses IPv4/IPv6, ports et indicateurs de drapeaux.
- **Critères d'acceptation** :
  - 100% de couverture de tests unitaires sur `PacketBuilder` et `computeInternetChecksum`.
  - Vérification de la conformité octet par octet sur un paquet TCP SYN et une trame DNS standard.

---

### Phase 4 : Moteur de Simulation Réseau (`lib/simulation/`)
- **Objectif** : Bâtir le moteur de calcul temporel et d'ordonnancement d'événements.
- **Tâches** :
  1. Définir les types et interfaces stricts pour les étapes (`Step`), événements (`SimulationEvent`), métadonnées et états.
  2. Implémenter la machine à états de simulation (`SimulationEngine`) : `idle`, `running`, `paused`, `stepping`, `completed`.
  3. Gérer l'horloge virtuelle avec prise en charge des coefficients de vitesse ($0.5\times$, $1\times$, $1.5\times$, $2\times$).
  4. Implémenter les fonctions de navigation : avancer d'un pas (`step`), reculer d'un pas (`prev`), saut d'étape (`jump`), réinitialisation (`reset`).
- **Critères d'acceptation** :
  - Tests unitaires validant l'ordonnancement séquentiel des événements et le respect des durées de latence.
  - La simulation peut être mise en pause et reprise sans dérive temporelle.

---

### Phase 5 : Scènes Graphiques (Topologie Réseau & Diagramme de Séquence)
- **Objectif** : Construire les deux visualisations centrales sous forme de composants SVG réactifs.
- **Tâches** :
  1. Implémenter `NetworkDiagram.tsx` : grille isométrique de fond, positionnement des nœuds matériels, tracés vectoriels des liaisons (`lanes`).
  2. Implémenter l'animation des paquets circulant sur les liaisons avec vitesse proportionnelle à la latence du lien.
  3. Implémenter l'animation de frappe d'URL dans la barre de navigateur du client (`type-url`) et la mise à jour de l'écran (`render`).
  4. Implémenter `SequenceDiagram.tsx` : lignes de vie verticales par équipement, flèches temporelles diagonales avec étiquettes, cadenas TLS et croix de paquets perdus.
  5. Implémenter le basculeur de vue Topologie $\leftrightarrow$ Séquence avec raccourci `V`.
- **Critères d'acceptation** :
  - Rendu fluide à 60 FPS sur moniteur standard et écran haute densité (Retina).
  - Clic sur une flèche du diagramme de séquence déclenche la sélection du paquet correspondant.

---

### Phase 6 : Tableau de Flux & Inspecteur Wireshark-like
- **Objectif** : Offrir l'outil de dissection binaire interactif complet.
- **Tâches** :
  1. Implémenter `PacketFlowTable.tsx` : colonnes No, Time, Source, Destination, Protocol, Info, Size, avec ligne active et défilement synchronisé.
  2. Implémenter `LayerProportionBar.tsx` : barre segmentée proportionnelle représentant l'empreinte de chaque couche.
  3. Implémenter `DissectionTree.tsx` : arbre hiérarchique avec niveaux d'indentation, valeurs formatées, badges `E.G.` et notes pédagogiques.
  4. Implémenter `HexAsciiViewer.tsx` : affichage 16 octets/ligne (Offset, Hexadécimal coloré par couche, Texte ASCII).
  5. Implémenter le survol bidirectionnel synchronisé (`Bidirectional Hover`) : survoler un champ illumine les octets correspondants ; survoler un octet illumine et déroule le champ correspondant dans l'arbre.
- **Critères d'acceptation** :
  - Survol instantané sans latence perceptible.
  - Rendu fidèle et alignement parfait des colonnes hexadécimales et ASCII.

---

### Phase 7 : Implémentation des 39 Leçons de Protocoles
- **Objectif** : Structurer l'ensemble des contenus pédagogiques et paquets binaires associés.
- **Tâches** :
  1. **Lot Core (11)** : `http`, `tcp`, `udp`, `ip`, `dns`, `dhcp`, `icmp`, `ipv6`, `ethernet`, `pppoe`, `bgp`, `quic`, `igmp`.
  2. **Lot Application (19)** : `websocket`, `webrtc`, `sip`, `rtsp`, `rtmp`, `ntp`, `portal`, `smtp`, `pop3`, `imap`, `ftp`, `smb`, `proxy`, `socks`, `reverse`, `modbus`.
  3. **Lot Security (9)** : `https`, `tls`, `doh`, `dnssec`, `wpa3`, `radius`, `ssh`, `wireguard`, `ipsec`.
  4. Pour chaque protocole, définir l'aperçu général (`overview`), les faits clés, les étapes narratives détaillées, les événements de simulation et les paquets binaires réels.
- **Critères d'acceptation** :
  - Les 39 protocoles sont tous fonctionnels, sélectionnables et animés sans exception.
  - Chaque étape est accompagnée de son texte d'explication pédagogique clair.

---

### Phase 8 : Navigation, Raccourcis Clavier, Recherche & Thèmes
- **Objectif** : Parfaire l'ergonomie, les contrôles et les interactions transverses.
- **Tâches** :
  1. Implémenter la `Sidebar.tsx` avec regroupement en 3 catégories (`Core`, `Application`, `Security`) et indicateurs d'état.
  2. Implémenter la `CommandPalette.tsx` accessible via `Ctrl+K` ou `/` avec recherche floue en direct.
  3. Implémenter la modale d'aide des raccourcis clavier accessible via `?`.
  4. Implémenter les touches de raccourci complètes (`Espace`, `S`, `Flèches`, `1-9`, `V`, `D`, `L`, `F`, `T`, `N`, `P`, `Échap`).
  5. Implémenter la persistance dans `localStorage` du thème, de la vitesse de lecture et de l'état des panneaux.
- **Critères d'acceptation** :
  - Toutes les actions sont réalisables sans souris au moyen du clavier seul.
  - La palette de commande permet de sauter directement à n'importe quel protocole ou étape en moins de 3 frappes.

---

### Phase 9 : Internationalisation (15 Langues, RTL) & Tests Automatisés
- **Objectif** : Rendre la plateforme accessible mondialement et sécuriser la non-régression.
- **Tâches** :
  1. Mettre en place le moteur de localisation supportant 15 langues : Anglais (en), Français (fr), Espagnol (es), Allemand (de), Italien (it), Portugais (pt-BR), Néerlandais (nl), Polonais (pl), Turc (tr), Indonésien (id), Vietnamien (vi), Japonais (ja), Chinois (zh-CN), Coréen (ko), Hindi (hi), Arabe (ar) et Hébreu (he).
  2. Gérer la direction d'écriture RTL (*Right-to-Left*) pour l'Arabe et l'Hébreu, tout en maintenant les tables d'octets et adresses IP en LTR.
  3. Écrire les suites de tests unitaires pour le moteur binaire, les calculs de somme de contrôle et la machine à états.
  4. Écrire les tests d'intégration et end-to-end pour les parcours de navigation principaux.
- **Critères d'acceptation** :
  - Les 15 langues s'affichent correctement sans rupture de mise en page.
  - 100% des tests automatisés passent avec succès.

---

### Phase 10 : Optimisation, Audit Final & Déploiement Vercel
- **Objectif** : Valider l'excellence technique et préparer la mise en production.
- **Tâches** :
  1. Effectuer un audit de performance Lighthouse (score cible > 95 en Performance, Accessibilité, Best Practices et SEO).
  2. Vérifier la conformité responsive sur les 5 facteurs de forme réels (Mobile 375px, Phablet 640px, Tablette 900px, Desktop 1100px, Wide 1440px+).
  3. Éliminer tout avertissement critique dans les logs de build et d'exécution.
  4. Rédiger un `README.md` exhaustif incluant la présentation du projet, les prérequis, l'installation locale, les scripts de développement/test et les instructions de déploiement Vercel.
- **Critères d'acceptation** :
  - Build de production exempt de toute erreur.
  - Application prête pour un déploiement en 1 clic sur Vercel.

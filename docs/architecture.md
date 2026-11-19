# Architecture Technique & Moteurs de Calcul · Protocol Explorer

## 1. Stack Technique et Choix d'Ingénierie

### 1.1 Composants de la Stack
- **Framework** : **Next.js** (App Router) avec **React** et **TypeScript** en mode strict.
- **Styling & Design System** : **Tailwind CSS** avec variables CSS pour le theming dynamique sombre/clair et les codes couleur de couches réseau.
- **Moteur Graphique & Animations** : **SVG Vectoriel Natif** couplé à une boucle d'animation basée sur **`requestAnimationFrame`** pour garantir 60 FPS constants sans surcharge de bundle.
- **Composants d'Interface Réutilisables** : Architecture modulaire basée sur des primitives légères et accessibles (conformes ARIA).
- **Tests** : **Vitest** pour les tests unitaires (moteur binaire, checksums, simulateur) et **Playwright** pour les tests end-to-end de navigation et d'interaction.

### 1.2 Justification des Choix
- **Next.js & App Router** : Permet un rendu initial ultra-rapide (SSR/SSG), un SEO optimal pour chaque protocole, un découpage de code automatique par route et une facilité de déploiement sur Vercel.
- **TypeScript Strict** : Indispensable pour modéliser précisément les structures d'octets, les types de paquets, les événements de simulation et les métadonnées de champs sans erreur d'exécution.
- **Zéro Dépendance Lourde d'Animation** : Pas de bibliothèque 3D ou de moteur physique lourd. L'utilisation d'équations mathématiques pures (fonctions de Bézier cubique pour le easing, trigonométrie pour les angles de flèches) garantit un bundle minimal (< 200 Ko gzippé).

---

## 2. Structure Modulaire du Code Source

```
protocol-explorer/
├── app/                              # Pages et routes Next.js
│   ├── layout.tsx                    # Layout racine (HTML, meta, polices, providers)
│   ├── page.tsx                      # Page d'accueil (chargeur du protocole par défaut : HTTP)
│   ├── [protocol]/                   # Routes dynamiques par protocole (ex. /tcp, /dns, /tls)
│   │   └── page.tsx
│   └── globals.css                   # Styles globaux, variables CSS, utilitaires Tailwind
├── components/
│   ├── ui/                           # Composants d'interface génériques
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   ├── Dropdown.tsx
│   │   └── Tooltip.tsx
│   ├── layout/                       # Composants structurels
│   │   ├── Topbar.tsx                # En-tête avec contrôles globaux
│   │   ├── Sidebar.tsx               # Liste des 39 protocoles par catégorie
│   │   ├── MobileDrawer.tsx          # Tiroir de navigation mobile
│   │   └── CommandPalette.tsx        # Palette de recherche rapide (Ctrl+K)
│   ├── network/                      # Vue Topologie Réseau
│   │   ├── NetworkDiagram.tsx        # Scène SVG principale et grille isométrique
│   │   ├── NetworkNode.tsx           # Rendu des équipements (client, routeur, serveurs...)
│   │   ├── NetworkLane.tsx           # Chemins de liaison entre nœuds
│   │   ├── PacketParticle.tsx        # Animation des paquets le long des lanes
│   │   └── ClientUrlBar.tsx          # Simulation de la saisie d'URL dans le navigateur
│   ├── sequence/                     # Vue Diagramme de Séquence
│   │   ├── SequenceDiagram.tsx       # Scène SVG avec lignes de vie
│   │   ├── SequenceArrow.tsx         # Flèche de paquet temporelle interactive
│   │   └── SequenceNote.tsx          # Notes explicatives d'étapes
│   ├── packet/                       # Tableau et Inspecteur de paquets
│   │   ├── PacketFlowTable.tsx       # Tableau récapitulatif des paquets de la trace
│   │   ├── PacketInspector.tsx       # Fenêtre principale de dissection
│   │   ├── LayerProportionBar.tsx    # Barre de proportions relatives des couches
│   │   ├── DissectionTree.tsx        # Arbre hiérarchique des champs et métadonnées
│   │   └── HexAsciiViewer.tsx        # Vue 16 octets/ligne avec surbrillance synchronisée
│   └── explanation/                  # Panneaux pédagogiques
│       ├── ProtocolOverview.tsx      # Fiche d'identité du protocole et faits clés
│       ├── StepExplanation.tsx       # Explication narrative de l'étape active
│       └── LessonOutro.tsx           # Synthèse de fin de leçon
├── lib/
│   ├── simulation/                   # Moteur d'animation et de simulation
│   │   ├── types.ts                  # Interfaces SimulationState, Step, Event, PacketEvent
│   │   ├── SimulationEngine.ts       # Machine à états et boucle d'ordonnancement
│   │   ├── timeline.ts               # Calcul des horodatages et durées
│   │   └── easing.ts                 # Fonctions d'interpolation (cubic-bezier)
│   ├── packet/                       # Moteur de génération et dissection binaire
│   │   ├── PacketBuilder.ts          # Constructeur binaire fluide (u8, u16, u32, ascii...)
│   │   ├── checksum.ts               # Algorithmes de hachage et sommes de contrôle (RFC 1071)
│   │   ├── dissector.ts              # Fonctions d'assemblage des couches et champs
│   │   └── formatters.ts             # Formatage des adresses IP, MAC, ports et drapeaux
│   ├── protocols/                    # Définitions modulaires des protocoles
│   │   ├── core/                     # Protocoles de base (IP, TCP, UDP, BGP, Ethernet...)
│   │   ├── application/              # Protocoles applicatifs (HTTP, DNS, DHCP, WebRTC...)
│   │   └── security/                 # Protocoles de sécurité (TLS, SSH, WireGuard...)
│   └── i18n/                         # Système de traduction et localisation
│       ├── config.ts                 # Liste des 15 langues supportées
│       ├── dict.ts                   # Dictionnaires de chaînes de base
│       └── useTranslation.ts         # Hook de traduction et remplacement de motifs
├── data/                             # Données statiques de topologie, nœuds et constantes
├── hooks/                            # Hooks React personnalisés
│   ├── useSimulation.ts              # Connexion au moteur de simulation
│   ├── useInspector.ts               # Gestion de l'état de l'inspecteur binaire
│   ├── useKeyboardShortcuts.ts       # Gestionnaire centralisé des raccourcis clavier
│   └── useTheme.ts                   # Gestion du thème sombre/clair et localStorage
└── tests/                            # Suites de tests automatisés
    ├── unit/                         # Tests unitaires du builder et de la simulation
    └── e2e/                          # Tests end-to-end d'interaction et de navigation
```

---

## 3. Moteur de Simulation Réseau (`SimulationEngine`)

Le moteur de simulation est entièrement déterministe et fonctionne selon un modèle d'événements discrets calés sur une échelle de temps virtuelle.

### 3.1 Machine à États Finis
Le simulateur évolue entre les états suivants :
- `IDLE` : Leçon chargée, positionnée au début (temps $t = 0$), en attente de démarrage.
- `RUNNING` : Lecture en cours, l'horloge virtuelle progresse en fonction du facteur de vitesse sélectionné ($0.5\times$ à $2\times$).
- `PAUSED` : Horloge figée à l'instant courant ; l'apprenant peut observer et inspecter les paquets.
- `STEPPING` : Progression contrôlée jusqu'à la fin du paquet ou de l'étape courante, puis pause automatique.
- `COMPLETED` : L'ensemble des étapes est terminé ; l'écran de synthèse récapitulatif (*Outro*) est activé.

### 3.2 Modélisation des Événements
Chaque protocole expose une liste ordonnée d'étapes (`steps`), chacune contenant une séquence d'événements primitifs :
```typescript
export type SimulationEvent =
  | { type: 'show'; nodes: string[]; frame: 'local' | 'lookup' | 'full' | 'client' }
  | { type: 'type-url'; text: string }
  | { type: 'render'; content?: string }
  | { type: 'camera'; frame: string }
  | { type: 'note'; text: string; tone?: 'navy' | 'amber' | 'green' }
  | {
      type: 'packet';
      from: string;
      to: string;
      color: 'blue' | 'green' | 'amber' | 'violet' | 'red';
      label: string;
      row: PacketTableRow;
      wire: DissectedFrame;
      lost?: boolean;
    };
```

---

## 4. Moteur de Construction et Décodage Binaire (`PacketBuilder`)

Pour offrir un décodage fidèle sans recourir à des fichiers PCAP externes préenregistrés volumineux, l'application intègre une classe fluide `PacketBuilder`.

### 4.1 Spécification de la Classe `PacketBuilder`
```typescript
export interface PacketField {
  name: string;
  value: string;
  from: number;   // Offset de début en octets
  to: number;     // Offset de fin en octets
  depth?: number; // Niveau d'indentation dans l'arbre (0 = racine du protocole)
  note?: string;  // Explication pédagogique
  example?: boolean; // Indicateur de valeur d'exemple
  heading?: boolean; // Séparateur de sous-bloc
  hidden?: boolean;  // Champ masqué par défaut dans l'arbre
  mono?: boolean;    // Formatage police monospace
}

export class PacketBuilder {
  public id: string;
  public name: string;
  public bytes: (number | null)[] = [];
  public fields: PacketField[] = [];

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  get length(): number {
    return this.bytes.length;
  }

  // Écriture d'entiers non signés (Big-Endian par défaut pour le format réseau)
  u8(val: number): this;
  u16(val: number): this;
  u24(val: number): this;
  u32(val: number): this;

  // Écriture d'entiers en Little-Endian (ex. SMB, protocoles spécifiques)
  u16le(val: number): this;
  u32le(val: number): this;
  u64le(val: number): this;

  // Ajout de chaînes ASCII / UTF-8
  ascii(str: string): this;

  // Ajout de données brutes
  raw(bytes: number[]): this;

  // Enregistrement d'octets inconnus ou de remplissage
  unknown(count: number): this;

  // Déclaration d'un champ avec fonction d'écriture des octets correspondants
  field(name: string, value: string | number, writeBytes?: () => void, opts?: Partial<PacketField>): this;

  // Concaténation d'une sous-couche (encapsulation)
  append(child: PacketBuilder): this;
}
```

### 4.2 Algorithme de Calcul de Somme de Contrôle (Internet Checksum RFC 1071)
L'implémentation de la somme de contrôle IP/TCP/UDP est réalisée conformément aux spécifications standard :
```typescript
export function computeInternetChecksum(bytes: (number | null)[]): number {
  let sum = 0;
  for (let i = 0; i < bytes.length; i += 2) {
    const high = bytes[i];
    const low = i + 1 < bytes.length ? bytes[i + 1] : 0;
    if (high === null || low === null) return 0;
    sum += (high << 8) | low;
  }
  while (sum > 0xffff) {
    sum = (sum & 0xffff) + (sum >>> 16);
  }
  return ~sum & 0xffff;
}
```

---

## 5. Gestion de la Performance et Optimisation

1. **Rendu SVG Déclaratif et Isolé** : Chaque sous-partie animée (paquet en transit, onde de propagation) est un élément SVG distinct bénéficiant de l'accélération matérielle du navigateur.
2. **Mémoïsation et Rendu Dérivé** : Les listes de paquets et les arbres de dissection sont calculés une seule fois au chargement du protocole et conservés en mémoire cache.
3. **Absence de Fuite Mémoire** : Tout abonnement à la boucle d'animation `requestAnimationFrame` est automatiquement nettoyé lors du changement de vue ou de protocole.
4. **Transition Fluide de Textes (View Transitions)** : Utilisation de l'API moderne `document.startViewTransition` lors du changement de langue pour une mise à jour textuelle sans clignotement de l'interface.

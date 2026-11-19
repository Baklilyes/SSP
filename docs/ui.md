# Spécifications d'Interface Utilisateur (UI/UX) · Protocol Explorer

## 1. Identité Visuelle et Système de Design

### 1.1 Palette de Couleurs & Thèmes
L'interface propose une esthétique technique, élégante et haut de gamme, rappelant les interfaces de monitoring réseau et d'ingénierie moderne. Elle supporte nativement un **Mode Sombre** (par défaut ou selon préférence système) et un **Mode Clair**.

- **Mode Sombre (Dark Mode)** :
  - Fond de base de la fenêtre : `#0b1020` (Bleu nuit profond)
  - Surface des panneaux : `#11182c` (Navy technique)
  - Bordures et séparateurs : `#1e2947` / `#29385c`
  - Texte principal : `#f1f5f9` (Blanc cassé doux)
  - Texte secondaire / commentaires : `#94a3b8` (Gris bleuâtre)
  - Accentuation primaire : `#38bdf8` (Cyan lumineux) ou `#3b82f6` (Bleu cobalt)
- **Mode Clair (Light Mode)** :
  - Fond de base de la fenêtre : `#fdfdfe` / `#f8fafc`
  - Surface des panneaux : `#ffffff`
  - Bordures et séparateurs : `#e2e8f0`
  - Texte principal : `#0f172a`
  - Texte secondaire : `#64748b`
  - Accentuation : `#0284c7`

### 1.2 Couleurs Sémantiques par Couches et Flux
Pour distinguer instantanément les différentes natures de trafic réseau, un code couleur rigoureux est employé dans l'ensemble des composants (barre de légende, flèches de séquence, paquets en transit, arbre de dissection, dump hexadécimal) :
- **Ethernet / Couche 2 (Liaison)** : `c-eth` `#64748b` (Ardoise)
- **IP / IPv6 / Couche 3 (Réseau)** : `c-ip` `#0ea5e9` (Bleu ciel)
- **TCP (Transport Fiable)** : `c-tcp` `#10b981` (Émeraude / Vert)
- **UDP (Datagrammes)** : `c-udp` `#f59e0b` (Ambre / Jaune)
- **DNS / Résolution** : `c-dns` `#3b82f6` (Bleu roi)
- **TLS / Sécurité / Chiffrement** : `c-tls` `#8b5cf6` (Violet électrique)
- **HTTP / Application Requête** : `c-req` `#f97316` (Orange vif)
- **HTTP / Application Réponse** : `c-res` `#a855f7` (Pourpre)
- **Paquet Perdu / Erreur** : `c-lost` `#ef4444` (Rouge vif)

### 1.3 Typographie
- **Interface & Titres** : Police sans-serif moderne, géométrique et lisible (`Inter`, `system-ui`, `-apple-system`, `sans-serif`).
- **Données Techniques, Hexadécimal & Code** : Police monospace à chasse fixe haute lisibilité (`JetBrains Mono`, `Fira Code`, `ui-monospace`, `monospace`).

---

## 2. Architecture Globale de la Page (`Shell`)

L'application s'articule autour d'une coquille globale (`.shell`) divisée en zones fonctionnelles cohérentes :

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR (Logo, Tiroir mobile, Sélecteur de protocole, Vue D/L/F/T, Recherche Ctrl+K, Langues, Thème)   │
├─────────────────┬─────────────────────────────────────────────────┬────────────────────────────────────┤
│ SIDEBAR         │ ESPACE CENTRAL DE SIMULATION                    │ PANNEAU LATÉRAL DROIT              │
│                 │                                                 │                                    │
│ - Recherche     │ [Onglets de Vue : Topologie | Séquence]         │ [PANNEAU EXPLICATION & VUE D'ENSEMBLE]
│ - Catégories :  │ ┌─────────────────────────────────────────────┐ │ - Titre, badge actif               │
│   • Core        │ │                                             │ │ - Description du protocole         │
│   • Application │ │   Scène interactive SVG (Topologie réseau   │ │ - Faits techniques clés          │
│   • Security    │ │   ou Diagramme de séquence temporelle)      │ │ - Explication narrative de l'étape │
│ - 39 protocoles │ │                                             │ │ - Carte d'aperçu du paquet       │
│ - État & étapes │ └─────────────────────────────────────────────┘ │                                    │
│                 │ [Barre de Contrôles : Play, Step, Speed, Reset] │                                    │
│                 ├─────────────────────────────────────────────────┼────────────────────────────────────┤
│                 │ TABLEAU DE FLUX DES PAQUETS                     │ [INSPECTEUR DE PAQUETS FLOTTANT]   │
│                 │ No. | Heure | Source | Dest | Proto | Info | B │ (Arbre de dissection + Hex Dump)   │
└─────────────────┴─────────────────────────────────────────────────┴────────────────────────────────────┘
```

---

## 3. Paliers de Responsive Design

L'application supporte 5 paliers stricts définis pour garantir une lisibilité optimale sur tout facteur de forme :

| Palier | Largeur d'écran | Disposition du Shell | Sidebar | Panneaux | Inspecteur |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Wide** | $\ge 1440\text{ px}$ | Grille multi-colonnes élargie | Visible fixe à gauche | Topologie, Explication et Tableau affichés simultanément | Tiroir coulissant / Modal dédiée |
| **Medium** | $1100\text{ px} - 1439\text{ px}$ | Grille standard 3 colonnes | Visible à gauche | Disposition complète équilibrée | Panneau superposé |
| **Tablet** | $900\text{ px} - 1099\text{ px}$ | Empilement vertical (`is-stacked`) | Masquée dans un tiroir mobile avec fond d'atténuation (*scrim*) | Scène en haut, Explication & Tableau sous la scène | Tiroir inférieur extensible |
| **Narrow** | $640\text{ px} - 899\text{ px}$ | Colonne unique fluide | Tiroir mobile latéral | Empilement séquentiel de chaque panneau | Modale plein écran adaptée |
| **Phone** | $< 640\text{ px}$ | Colonne unique ultra-compacte | Tiroir mobile plein écran | Scène redimensionnée avec zoom tactile, contrôles flottants simplifiés | Fiche inférieure coulissante (*Bottom Sheet*) |

---

## 4. Composant Vue Topologie Réseau (`.network`)

### 4.1 Caractéristiques Graphiques & Canvas SVG
- Rendu vectoriel SVG isométrique haute définition avec grille d'alignement (`iso-grid`) et effet de vignette subtil.
- **Nœuds matériels modélisés** :
  - `client` : Ordinateur portable avec écran dynamique et barre d'URL interactive.
  - `router` / `ap` : Routeur domestique / Point d'accès Wi-Fi.
  - `lan` : Deuxième machine sur le réseau local.
  - `switch` : Commutateur Ethernet d'entreprise.
  - `isp` : Routeur de tête de réseau FAI.
  - `transit` / `hosting` : Routeurs de transit Internet et d'hébergement cloud.
  - `dns` / `root` / `tld` / `auth` : Hiérarchie de serveurs DNS.
  - `web` / `app` / `mx` : Serveurs web, d'application et de messagerie.
  - `cam` / `stb` : Caméra IP de vidéosurveillance et décodeur TV (flux RTSP/IGMP).
  - `peer` : Machine distante pour échanges poste à poste (WebRTC).

### 4.2 Chemins et Animations
- **Lanes** : Chemins vectoriels reliant les nœuds matériels, avec flèches d'orientation.
- **Pulses & Packets** : Des pastilles animées se déplacent le long des lanes au rythme défini par la latence relative entre équipements.
- **Saisie d'URL** : Animation de frappe lettre par lettre dans la barre d'adresse du client (`type-url`), avec icône de cadenas et validation visuelle.
- **Rendu du navigateur** : Mise à jour de l'écran du client (`render`) lorsque les données applicatives sont acquises.

---

## 5. Composant Vue Diagramme de Séquence (`.sequence`)

Permet d'appréhender le protocole selon une approche temporelle type UML / RFC :
- **Lignes de vie verticales** : Une ligne par équipement impliqué dans la session (ex. Client, Routeur, DNS, Serveur Web).
- **Flèches directionnelles temporelles** :
  - Tracées de la ligne source à la ligne de destination.
  - Étiquette textuelle descriptive (ex. `SYN`, `SYN-ACK`, `GET /index.html`, `200 OK`).
  - Heure relative précise affichée à gauche.
  - Icône de cadenas (`seq-lock`) si le segment est chiffré (TLS, SSH, WireGuard).
  - Croix d'annulation (`seq-cross`) et ligne interrompue si le paquet est simulé comme perdu (simulation de retransmission TCP ou timeout).
- **Interactivité** : Clic direct sur n'importe quelle flèche du diagramme pour ouvrir immédiatement la dissection détaillée de ce paquet.

---

## 6. Inspecteur de Paquets Binaire (Wireshark-like) (`.inspector`)

L'inspecteur binaire est le cœur pédagogique de l'application. Il reproduit fidèlement la puissance d'analyse de Wireshark tout en restant accessible et didactique.

### 6.1 En-tête de l'Inspecteur
- Numéro d'ordre du paquet dans la trace (ex. `#3`).
- Horodatage relatif (ex. `0.041 s`).
- Sens de transfert : `Source → Destination`.
- Protocole dominant et longueur totale en octets (ex. `TCP · 74 bytes`).
- Explication contextuelle : rôle du paquet dans l'échange global.

### 6.2 Barre de Proportions des Couches (`.ins-bar`)
Une barre segmentée horizontale colorée montre visuellement la part relative de chaque couche dans la taille totale de la trame :
- Exemple : `Ethernet (14 B)` (18%) | `IPv4 (20 B)` (27%) | `TCP (32 B)` (43%) | `HTTP (8 B)` (12%).
- Clic sur un segment pour faire défiler instantanément l'arbre vers cette couche.

### 6.3 Arbre de Dissection Structuré (`.ins-tree`)
Organisé couche par couche de bas en haut (Couche 2 → Couche Application) :
- Chaque couche forme une section distincte avec son titre et sa couleur dédiée.
- Chaque champ détaille :
  - Le nom standard du champ (ex. *Source Port*, *Sequence Number*, *Flags*, *Window Size*).
  - Sa valeur formatée lisiblement (ex. `52344`, `0x0002 (SYN)`, `65,535 bytes`).
  - Badge optionnel `E.G.` si la valeur est un exemple simulé réaliste.
  - Note explicative pédagogique en dessous (ex. *"Port éphémère attribué par le système d'exploitation du client"*).

### 6.4 Dump Hexadécimal & ASCII (`.ins-hex`)
Affichage classique en 3 colonnes à 16 octets par ligne :
1. **Colonne Offset** : Adresse hexadécimale de début de ligne (`0000`, `0010`, `0020`...).
2. **Colonne Hexadécimale** : 16 octets encodés en hexadécimal sur 2 caractères (`45 00 00 3c ...`), colorés selon leur couche d'appartenance. Les octets non déterminés ou de remplissage sont notés `··`.
3. **Colonne Texte ASCII** : Représentation textuelle de chaque octet. Caractères imprimables affichés tels quels, caractères non-imprimables représentés par un point `.`.

### 6.5 Synchronisation Interactive au Survol (`Bidirectional Hover`)
- **Survol d'un champ dans l'arbre** : Les octets correspondants dans la colonne hexadécimale et la colonne ASCII s'illuminent immédiatement en surbrillance (`is-lit`).
- **Survol d'un octet hexadécimal ou d'un caractère ASCII** : Le champ le plus spécifique englobant cet octet est identifié, mis en surbrillance dans l'arbre, et l'arbre défile automatiquement vers ce champ (`scrollIntoView({ block: 'nearest' })`).

---

## 7. Contrôles de Lecture et Raccourcis Clavier

### 7.1 Barre de Contrôle de Simulation
- **Bouton Play / Pause** : Bascule la lecture automatique des étapes.
- **Bouton Step (Étape)** : Fait avancer la simulation d'un seul paquet / d'une seule étape narrative.
- **Bouton Précédent (Prev)** : Revient au paquet précédent ou au début de l'étape.
- **Bouton Réinitialiser (Reset)** : Remet la leçon à son état initial.
- **Menu Vitesse** : Permet de choisir entre `0.5×`, `1×` (défaut), `1.5×`, et `2×`.

### 7.2 Raccourcis Clavier Complets
| Touche | Action |
| :--- | :--- |
| `Espace` | Lecture / Pause de la simulation |
| `Flèche Droite` / `S` | Avancer d'une étape / d'un paquet |
| `Flèche Gauche` | Reculer d'une étape / d'un paquet |
| `1` à `9` | Saut direct à l'étape narrative numéro 1 à 9 |
| `[` / `]` | Réduire / Augmenter la vitesse de lecture |
| `V` | Basculer la vue (Topologie Réseau $\leftrightarrow$ Diagramme de Séquence) |
| `D` | Mode Focus : agrandit le diagramme en masquant les panneaux périphériques |
| `L` | Afficher / Masquer la liste latérale des protocoles |
| `F` | Basculer en mode Plein Écran (*Fullscreen*) |
| `T` | Basculer entre Mode Sombre et Mode Clair |
| `N` / `P` | Passer au protocole Suivant / Précédent |
| `/` ou `Ctrl+K` (`Cmd+K`) | Ouvrir la palette de recherche rapide de protocoles |
| `?` | Ouvrir la boîte de dialogue d'aide sur les raccourcis |
| `Échap` | Fermer l'inspecteur / Fermer le tiroir / Réinitialiser la simulation |

# Document Produit · Protocol Explorer (Recréation Indépendante)

## 1. Vision et Mission Pédagogique

### 1.1 Objectif Fondamental
L'objectif de **Protocol Explorer** est de démystifier le fonctionnement d'Internet à travers une expérience d'apprentissage visuelle, interactive et rigoureuse au bit près. 

La plupart des développeurs, étudiants et ingénieurs réseau connaissent les protocoles de façon abstraite (diagrammes théoriques, RFC textuelles) ou à travers des outils d'analyse complexes (Wireshark, tcpdump). **Protocol Explorer** comble le fossé en permettant d'observer le trafic réseau s'animer étape par étape, paquet par paquet, tout en reliant directement chaque échange visuel à sa structure binaire exacte décodée octet par octet.

### 1.2 Principes Pédagogiques Clés
1. **Visualisation Déterministe et Progressive** : Chaque protocole est découpé en étapes claires et narratives (ex. *Résolution DNS*, *Handshake TCP*, *Négociation TLS*, *Échange applicatif*).
2. **Double Niveau de Lecture (Macro & Micro)** :
   - **Vue Macro** : Animation des flux sur une topologie de réseau (Client, Routeur, Résolveur DNS, Internet, Serveurs distants) ou sur un diagramme de séquence temporel.
   - **Vue Micro** : Décodage binaire Wireshark-like avec arbre de dissection, dump hexadécimal et texte ASCII synchronisés interactivement.
3. **Contrôle Total par l'Apprenant** : Possibilité de mettre en pause, d'avancer pas-à-pas (*Step*), de changer la vitesse (0.5× à 2×), ou de sauter directement à une étape précise.
4. **Précision Technique Réelle** : Les paquets ne sont pas de faux exemples graphiques simplifiés ; ils comportent de véritables en-têtes (Ethernet II, IPv4/IPv6, TCP/UDP/ICMP, charges utiles réelles, calculs de checksums et numéros de séquence valides).
5. **Accessibilité Universelle** : Accessible sans installation, 100% exécutable dans le navigateur, support multi-écrans (du smartphone au moniteur ultra-large) et internationalisé (15+ langues avec support RTL).

---

## 2. Public Cible

1. **Étudiants en Informatique et Réseaux** (BTS, DUT, Licence, Écoles d'ingénieurs) : Pour appréhender concrètement les couches du modèle OSI, l'encapsulation et les handshakes.
2. **Développeurs Web et Full-Stack** : Pour comprendre ce qui se passe sous le capot lors d'un `fetch()`, d'une connexion WebSocket ou d'une négociation TLS.
3. **Ingénieurs DevOps, SRE et Administrateurs Système** : Pour visualiser les mécanismes de routage BGP, résolutions DNSSEC, tunnels VPN (WireGuard, IPsec) ou proxies HTTP/SOCKS.
4. **Professionnels de la Cybersécurité** : Pour analyser les couches de chiffrement, l'authentification 802.1X/RADIUS, WPA3 ou les vulnérabilités de protocoles non chiffrés.
5. **Passionnés et Autodidactes de la Tech** : Pour explorer le fonctionnement intime du réseau mondial de façon ludique et intuitive.

---

## 3. Périmètre Fonctionnel (Scope)

L'application couvre **39 protocoles et mécanismes fondamentaux**, regroupés en 3 grandes familles :

### 3.1 Famille « Core » (Réseau, Transport & Infrastructure) - 11 Protocoles
- **Ethernet** (Couche 2) : Trames Ethernet II, commutateurs (switches), tables MAC.
- **Wi-Fi** (Couche 2) : Connexion WPA2 à un point d'accès, association 802.11.
- **PPPoE** (Couche 2/3) : Authentification et encapsulation FAI sur ligne d'accès.
- **IPv4** (Couche 3) : Adressage IP, masque de sous-réseau, routage, fragmentation, TTL.
- **IPv6** (Couche 3) : Autoconfiguration SLAAC, Neighbor Discovery (NDP).
- **ICMP** (Couche 3) : Diagnostics réseau (Ping, Echo Request/Reply, TTL Exceeded).
- **IGMP** (Couche 3) : Multicast IP, adhésion à des flux TV/vidéo.
- **TCP** (Couche 4) : Connexion fiable, 3-way handshake (SYN, SYN-ACK, ACK), fenêtrage, numéros de séquence, clôture (FIN).
- **UDP** (Couche 4) : Datagrammes sans état, transmission rapide à faible latence.
- **QUIC** (Couche 4) : Protocole moderne sur UDP, multiplexage sans blocage de tête de ligne, chiffrement natif (HTTP/3).
- **BGP** (Couche 7/Routage) : Annonces de préfixes et chemins AS entre opérateurs Internet.

### 3.2 Famille « Application » (Services & Protocoles Web) - 19 Protocoles
- **HTTP** : Requêtes/réponses textuelles HTTP/1.1 (GET, status codes, headers, chunking).
- **WebSocket** : Établissement par Upgrade HTTP, communication bidirectionnelle en duplex intégral.
- **WebRTC** : Négociation SDP, découverte ICE (STUN/TURN), flux audio/vidéo peer-to-peer.
- **SIP** : Signalisation téléphonique VoIP, établissement d'appel (INVITE, 200 OK, ACK, BYE).
- **RTSP** : Contrôle de flux pour caméras IP (DESCRIBE, SETUP, PLAY).
- **RTMP** : Diffusion en direct (handshake chunking, commandes AMF, publication de flux).
- **DNS** : Résolution de noms de domaine (requêtes A, CNAME, récursivité).
- **DHCP** : Attribution dynamique de configuration IP (DORA : Discover, Offer, Request, Acknowledge).
- **NTP** : Synchronisation précise des horloges système.
- **Captive Portal** : Détection et redirection HTTP pour portails d'hôtels/cafés.
- **SMTP** : Envoi de courriers électroniques entre MTA.
- **POP3** : Récupération et suppression de boîte aux lettres.
- **IMAP** : Synchronisation bidirectionnelle de dossiers et messages électroniques.
- **FTP** : Transfert de fichiers avec canaux de commande et de données distincts.
- **SMB** : Partage de fichiers sous Windows (négociation dialecte, sessions, lecture/écriture).
- **HTTP Proxy** : Proxy direct avec méthode `CONNECT` pour tunnels HTTP.
- **SOCKS5** : Proxy générique au niveau transport TCP/UDP avec authentification.
- **Reverse Proxy** : Terminaison TLS et répartition de charge en amont de serveurs web.
- **Modbus** : Protocole industriel SCADA/PLC pour la lecture et l'écriture de registres d'automates.

### 3.3 Famille « Security » (Chiffrement, Authentification & VPN) - 9 Protocoles
- **HTTPS** : HTTP encapsulé dans un canal sécurisé TLS.
- **TLS/SSL** : Négociation TLS 1.3 (Client Hello, Server Hello, échange de clés X25519, certificats, dérivation de clés).
- **DoH (DNS over HTTPS)** : Chiffrement des requêtes DNS via des requêtes HTTP/2 ou HTTP/3.
- **DNSSEC** : Signatures cryptographiques (RRSIG, DNSKEY, DS) protégeant l'intégrité du DNS.
- **SSH** : Connexion à distance sécurisée, échange de clés Diffie-Hellman et chiffrement symétrique.
- **WPA3** : Sécurisation Wi-Fi via le protocole SAE (Simultaneous Authentication of Equals) résistant aux attaques par dictionnaire.
- **RADIUS / 802.1X** : Authentification entreprise centralisée pour réseaux d'entreprise.
- **WireGuard** : VPN moderne, rapide et minimaliste basé sur Curve25519 et ChaCha20-Poly1305.
- **IPsec** : Architecture de sécurité IP (négociation IKEv2 et encapsulation chiffrée ESP).

---

## 4. Parcours Utilisateur (User Experience Journey)

```
[Arrivée sur l'application]
       │
       ▼
[Sélection automatique d'un protocole d'accueil (HTTP)]
       │
       ├───────────────────────────────┬───────────────────────────────┐
       ▼                               ▼                               ▼
[Exploration Macro]             [Contrôle Temporel]             [Exploration Micro]
- Visualisation Topologie       - Lecture automatique           - Tableau des paquets
- Visualisation Séquence        - Avance pas-à-pas (Step)       - Clic sur un paquet
- Focus mode (Plein diagramme)  - Réglage vitesse (0.5× à 2×)   - Inspecteur binaire
                                - Relecture (Replay)            - Survol octet / champ
                                                                - Arbre de dissection
       │                               │                               │
       └───────────────────────────────┴───────────────────────────────┘
                                       │
                                       ▼
             [Changement de protocole via Sidebar ou Command Palette (Ctrl+K)]
                                       │
                                       ▼
             [Fin de leçon : Écran de synthèse et métriques globales]
```

---

## 5. Exigences Non-Fonctionnelles

1. **Performance** : 
   - Animations à 60 images par seconde sans à-coups (*jank*).
   - Bundle initial léger, chargement en moins de 1.5 seconde sur connexion mobile 4G.
   - Utilisation de `requestAnimationFrame` et de transformations CSS GPU (`transform`, `opacity`).
2. **Indépendance & Absence de Dépendance Réseau Runtime** :
   - Fonctionnement 100% autonome côté client (zéro appel API ou backend nécessaire pendant la simulation).
   - Compatible avec un fonctionnement hors-ligne (PWA Ready / Service Worker optionnel).
3. **Responsive Design Rigoureux** :
   - Prise en charge native de 5 paliers : Smartphone vertical (<640px), Smartphone horizontal / Phablet (640-899px), Tablette (900-1099px), Desktop standard (1100-1439px), Écran large (>=1440px).
4. **Accessibilité (a11y)** :
   - Navigation intégrale au clavier avec raccourcis intuitifs (`Espace`, `S`, `Flèches`, `D`, `L`, `V`, `F`, `Ctrl+K`, etc.).
   - Support des lecteurs d'écran (attributs ARIA, `aria-live` pour l'explication des étapes, rôles sémantiques).
   - Respect des contrastes WCAG AA en mode sombre et clair.
5. **Internationalisation (i18n)** :
   - Support de 15 langues majeures (Anglais, Français, Espagnol, Allemand, Italien, Portugais, Néerlandais, Polonais, Turc, Indonésien, Vietnamien, Japonais, Chinois, Coréen, Hindi, Arabe, Hébreu).
   - Prise en charge bidirectionnelle (LTR et RTL pour l'Arabe et l'Hébreu).

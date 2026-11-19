# Répertoire Exhaustif des 39 Protocoles · Protocol Explorer

L'application couvre **39 protocoles et mécanismes réseaux fondamentaux**, articulés en 3 grandes familles : **Core** (11), **Application** (19) et **Security** (9).

---

## 1. Famille « Core » (Réseau, Transport & Infrastructure) - 11 Protocoles

### 1.1 Tableau Récapitulatif
| ID | Nom | Titre Pédagogique | Couche | Nœuds Clés | Transport | Ports / Rôles |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ethernet` | **Ethernet** | Trames & Commutateurs | 2 | `client`, `switch`, `lan` | Direct | Adresses MAC, Broadcast FF:FF:FF:FF:FF:FF |
| `wifi` | **Wi-Fi** | Connexion Réseau (WPA2) | 2 | `client`, `ap`, `router` | 802.11 RF | Beacons, Probe Request/Response, 4-Way Handshake |
| `pppoe` | **PPPoE** | Connexions Haut Débit | 2/3 | `router`, `bng`, `isp` | Ethernet | PADI, PADO, PADR, PADS, Session PPP |
| `ip` | **IP (IPv4)** | Adressage & Routage | 3 | `client`, `router`, `internet` | - | TTL, Masque de sous-réseau, MTU, Fragmentation |
| `ipv6` | **IPv6** | Configuration d'Adresses | 3 | `client`, `router`, `lan` | - | SLAAC, Router Solicitation/Advertisement, DAD |
| `icmp` | **ICMP** | Diagnostics Réseau | 3 | `client`, `router`, `web` | IP (Proto 1) | Type 8 (Echo Req), Type 0 (Echo Reply), Type 11 (TTL Exceeded) |
| `igmp` | **IGMP** | Télévision Multicast | 3 | `stb`, `router`, `isp` | IP (Proto 2) | Membership Query/Report, Adhésion à un groupe multicast |
| `tcp` | **TCP** | Acheminement Fiable | 4 | `client`, `router`, `web` | IP (Proto 6) | 3-Way Handshake (SYN/ACK), Seq/Ack, Window, FIN |
| `udp` | **UDP** | Datagrammes Rapides | 4 | `client`, `dns`, `web` | IP (Proto 17) | Datagrammes sans connexion, en-tête minimal de 8 octets |
| `quic` | **QUIC** | HTTP/3 sur UDP | 4 | `client`, `router`, `web` | UDP (Port 443) | Handshake 1-RTT combiné, Streams multiplexés, Pas de HoL blocking |
| `bgp` | **BGP** | Routage Inter-Domaines | 7/Routage| `transit`, `isp`, `hosting`| TCP (Port 179) | Messages OPEN, UPDATE, KEEPALIVE, Chemins AS (AS-PATH) |

### 1.2 Focus Détaillé : Le Protocole TCP (`tcp`)
- **Déroulement de la leçon** :
  1. *Établissement (3-Way Handshake)* : Le client envoie un paquet avec le drapeau `SYN` et son numéro de séquence initial (`ISN_c`). Le serveur répond par `SYN-ACK` avec son propre `ISN_s` et acquitte `ISN_c + 1`. Le client confirme par `ACK`.
  2. *Échange de Données & Fenêtrage* : Envoi de segments de données. Utilisation des accusés de réception cumulatifs et gestion de la taille de fenêtre (`Window Size`) pour éviter d'engorger le récepteur.
  3. *Retransmission sur Perte* : Simulation d'un paquet perdu en route (`lost: true`). Expiration du temporisateur RTO (*Retransmission Timeout*) et réémission du paquet.
  4. *Clôture Propre (4-Way Teardown)* : Envoi d'un segment avec drapeau `FIN`, accusé de réception `ACK`, suivi du `FIN` de l'autre extrémité et de son `ACK` final.
- **En-tête binaire décodé** : Ports source/destination (16 bits), Numéro de séquence (32 bits), Numéro d'acquittement (32 bits), Data Offset (4 bits), Drapeaux `URG, ACK, PSH, RST, SYN, FIN` (6 bits), Taille de fenêtre (16 bits), Checksum (16 bits), Options TCP (MSS, Window Scale, SACK Permitted, Timestamps).

---

## 2. Famille « Application » (Services & Protocoles Web) - 19 Protocoles

### 2.1 Tableau Récapitulatif
| ID | Nom | Titre Pédagogique | Couche | Nœuds Clés | Transport | Ports |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `http` | **HTTP** | Communication Web | 7 | `client`, `dns`, `web` | TCP | 80 |
| `websocket` | **WebSocket** | Messagerie Web Temps Réel | 7 | `client`, `web` | TCP | 80 / 443 |
| `webrtc` | **WebRTC** | Appel Vidéo Navigateur | 7 | `client`, `peer`, `lan` | UDP / STUN | Éphémères |
| `sip` | **SIP** | Téléphonie sur IP (VoIP) | 7 | `client`, `router`, `peer`| UDP / TCP | 5060 |
| `rtsp` | **RTSP** | Flux de Caméra IP | 7 | `client`, `cam` | TCP / UDP | 554 |
| `rtmp` | **RTMP** | Diffusion en Direct | 7 | `client`, `web` | TCP | 1935 |
| `dns` | **DNS** | Résolution de Noms | 7 | `client`, `dns`, `root` | UDP / TCP | 53 |
| `dhcp` | **DHCP** | Obtention d'une IP | 7 | `client`, `router` | UDP | 67 / 68 |
| `ntp` | **NTP** | Synchronisation d'Horloge | 7 | `client`, `router` | UDP | 123 |
| `portal` | **Captive Portal** | Connexion Wi-Fi Hôtel | 7 | `client`, `router`, `web` | TCP / HTTP | 80 / 443 |
| `smtp` | **SMTP** | Envoi de Courriels | 7 | `client`, `relay`, `mx` | TCP | 25 / 587 |
| `pop3` | **POP3** | Relève de Courriels | 7 | `client`, `mx` | TCP | 110 / 995 |
| `imap` | **IMAP** | Messagerie Synchronisée | 7 | `client`, `mx` | TCP | 143 / 993 |
| `ftp` | **FTP** | Transfert de Fichiers | 7 | `client`, `web` | TCP | 20 / 21 |
| `smb` | **SMB** | Partage de Fichiers Windows | 7 | `client`, `lan` | TCP | 445 |
| `proxy` | **HTTP Proxy** | Proxy HTTP & Méthode CONNECT| 7 | `client`, `relay`, `web` | TCP | 8080 |
| `socks` | **SOCKS5** | Proxy Universel de Connexion | 5 | `client`, `relay`, `web` | TCP | 1080 |
| `reverse` | **Reverse Proxy** | Déchargement TLS & Équilibrage| 7 | `client`, `relay`, `app` | TCP | 80 / 443 |
| `modbus` | **Modbus** | Communication avec un Automate | 7 | `client`, `lan` | TCP | 502 |

### 2.2 Focus Détaillé : Résolution DNS (`dns`)
- **Déroulement de la leçon** :
  1. *Requête Locale* : Le client interroge son résolveur configuré (ex. `8.8.8.8`) pour `www.example.com` (Type A, classe IN).
  2. *Requête Racine (Root Hints)* : Si le cache est vide, le résolveur interroge un serveur racine (`.` Root Server) qui lui renvoie un NS de premier niveau (`.com`).
  3. *Requête TLD* : Interrogation du serveur TLD `.com` qui oriente vers les serveurs autoritaires du domaine.
  4. *Réponse Fiscale Autoritée* : Le serveur de zone renvoie l'enregistrement A contenant l'adresse IP finale (ex. `203.0.113.10`) avec un TTL donné.
  5. *Réponse au Client* : Le résolveur met en cache et retourne l'adresse IP au client.
- **En-tête binaire décodé** : Transaction ID (16 bits), Flags (QR, Opcode, AA, TC, RD, RA, RCODE), Nombre de questions, Nombre de réponses, Questions (Nom encodé par longueurs de labels, Type, Classe), Réponses (Pointeurs de compression DNS `0xc000`, TTL 32 bits, RDATA).

---

## 3. Famille « Security » (Chiffrement, Authentification & VPN) - 9 Protocoles

### 3.1 Tableau Récapitulatif
| ID | Nom | Titre Pédagogique | Couche | Nœuds Clés | Transport | Caractéristiques Cryptographiques |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `https` | **HTTPS** | Web Sécurisé | 7 | `client`, `dns`, `web` | TCP / TLS | Chiffrement bout-en-bout du trafic HTTP |
| `tls` | **TLS/SSL** | Chiffrement Réseau | 6 | `client`, `web` | TCP | TLS 1.3, Échange hybride X25519 + MLKEM768 |
| `doh` | **DoH** | DNS Chiffré sur HTTPS | 7 | `client`, `dns` | HTTPS/HTTP2| Dissimulation des résolutions DNS dans le port 443 |
| `dnssec` | **DNSSEC** | Réponses DNS Signées | 7 | `client`, `dns`, `auth` | UDP / DNS | RRSIG, DNSKEY, DS, Chaîne de confiance |
| `wpa3` | **WPA3** | Sécurité Wi-Fi Avancée | 2 | `client`, `ap` | 802.11 | Protocole SAE (Dragonfly handshake) |
| `radius` | **RADIUS** | Authentification Entreprise | 2/7 | `client`, `ap`, `auth` | UDP | 802.1X, EAP-TLS, Authentification centralisée |
| `ssh` | **SSH** | Connexion Distante Sécurisée | 7 | `client`, `web` | TCP (Port 22)| Échange Diffie-Hellman, Authentification par clé publique |
| `wireguard` | **WireGuard** | VPN Moderne & Léger | 3 | `client`, `router`, `web` | UDP (Port 51820)| Cryptokey Routing, Curve25519, ChaCha20-Poly1305 |
| `ipsec` | **IPsec** | Tunnels Sécurisés IKEv2/ESP | 3 | `client`, `router`, `web` | UDP 500 / ESP | Négociation IKEv2 SA, En-têtes ESP chiffrés |

### 3.2 Focus Détaillé : Négociation TLS 1.3 (`tls`)
- **Déroulement de la leçon** :
  1. *Client Hello* : Le client envoie la liste des suites cryptographiques supportées (ex. `TLS_AES_128_GCM_SHA256`), l'extension SNI (`server_name: www.example.com`), les protocoles applicatifs (`ALPN: h2, http/1.1`) et sa part de clé éphémère (*Key Share* X25519).
  2. *Server Hello & Handshake Secrets* : Le serveur choisit la suite, transmet sa propre part de clé éphémère. Les deux parties dérivent instantanément les clés de session symétriques.
  3. *Encrypted Extensions & Certificat* : Tous les messages suivants du serveur sont chiffrés. Le serveur envoie la chaîne de certificats X.509, la signature `Certificate Verify` et le message de contrôle `Finished`.
  4. *Confirmation Client & Clés Applicatives* : Le client valide la chaîne, envoie son propre `Finished`, puis bascule en transmission `Application Data`.
- **En-tête binaire décodé** : Type d'enregistrement TLS (22 = Handshake, 23 = Application Data), Version factice de compatibilité (`0x0303` pour TLS 1.2), Longueur du record, Type de handshake (1 = Client Hello, 2 = Server Hello), Extensions TLS détaillées octet par octet.

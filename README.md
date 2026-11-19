<div align="center">

# 🌐 Protocol Explorer

**Watch the Internet Work, Packet by Packet.**  
*An interactive educational platform decoding computer network protocols from macro topologies down to Wireshark-level binary dissections.*

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-92%20Passing-brightgreen?logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)

</div>

---

## 📖 Overview

**Protocol Explorer** is a high-fidelity, independent educational web application built from scratch to demystify computer networking. Instead of abstract theoretical formulas or static diagrams, Protocol Explorer visualizes realistic packet transmissions in real-time across dynamic network nodes and dissects each byte using an RFC-compliant packet inspection engine.

### 🌟 Key Highlights

- **39 Network Protocols Covered**: Spanning Core Transport & Internet routing, Application-layer services, and Modern Cryptographic security.
- **Micro & Macro Dual Visualization**:
  - **Isometric Topology View**: Real-time packet pulses, LAN/WAN routers, NAT gateways, DNS roots, and cloud relays.
  - **Sequence Diagram View**: Chronological lifelines, directional message flows, encryption indicators, and timestamped latency markers.
- **Wireshark-Grade Binary Dissector**:
  - **Proportional Layer Bar**: Visual representation of protocol encapsulation overhead (Ethernet → IP → TCP/UDP → Application).
  - **Hierarchical Dissection Tree**: Expandable fields, flags, bitmasks, sequence numbers, and educational notes.
  - **Bidirectional Hex/ASCII Viewer**: Synchronized hovering highlighting exact byte offsets across hex tables and dissected fields.
- **Deterministic Simulation Engine**:
  - Discrete-event virtual timeline with step jumps, forward/backward stepping, auto-play, and dynamic playback speeds ($0.5\times$ to $2\times$).
- **Multilingual & Accessible**:
  - Full internationalization supporting 7 languages (**English, Français, Español, Deutsch, 中文, 日本語, العربية**).
  - Native RTL (Right-to-Left) typography support for Arabic.
  - Light & Dark theme toggle with persistent user preferences.
  - Comprehensive keyboard shortcuts for power users.

---

## 📚 39 Implemented Protocols

### 1. ⚙️ Core & Internet Transport (11 Protocols)
| Protocol | Full Name | Layer | Key Concepts Explored |
|---|---|---|---|
| **TCP** | Transmission Control Protocol | L4 | 3-Way Handshake (SYN/ACK), MSS, RTO Retransmission, FIN Teardown |
| **UDP** | User Datagram Protocol | L4 | Connectionless 8-byte header datagram, zero handshake overhead |
| **IP** | Internet Protocol (IPv4) | L3 | Subnetting, Gateway routing, NAT translation, TTL decrement |
| **IPv6** | Internet Protocol v6 | L3 | 128-bit addresses, SLAAC auto-configuration, Router Solicitations |
| **ICMP** | Internet Control Message Protocol | L3 | Echo Request/Reply (Ping), TTL Exceeded (Traceroute) |
| **QUIC** | HTTP/3 Transport over UDP | L4 | 0-RTT Connection, stream multiplexing, head-of-line blocking prevention |
| **BGP** | Border Gateway Protocol | L7/L4 | Autonomous Systems (AS), OPEN, KEEPALIVE, UPDATE with AS_PATH & NLRI |
| **Ethernet** | IEEE 802.3 Frame | L2 | MAC addresses, Broadcast ARP flooding, Switch MAC learning |
| **Wi-Fi** | IEEE 802.11 / WPA2 | L2 | Association, WPA2 4-Way EAPOL Handshake (ANonce, SNonce, MIC) |
| **PPPoE** | PPP over Ethernet | L2 | Broadband ISP access, PADI broadcast, PADO offer, PADS session ID |
| **IGMP** | Internet Group Management | L3 | Multicast TV channels, Membership Queries (224.0.0.1) & Reports |

### 2. 🚀 Application Layer (19 Protocols)
| Protocol | Full Name | Layer | Key Concepts Explored |
|---|---|---|---|
| **HTTP** | Hypertext Transfer Protocol | L7 | GET/POST methods, Status Codes (200/302/404), Keep-Alive headers |
| **HTTPS** | HTTP Secure | L7 | Complete TLS 1.3 handshake, Encrypted requests and responses |
| **DNS** | Domain Name System | L7 | Recursive query traversal (Root `.` → TLD `.com` → Authoritative) |
| **DHCP** | Dynamic Host Configuration | L7 | Full DORA sequence (Discover, Offer, Request, ACK), IP leasing |
| **WebSocket** | Full-Duplex Web Socket | L7 | HTTP 101 Upgrade, masked client frames, unmasked server pushes |
| **WebRTC** | Real-Time Communications | L7 | STUN NAT discovery, SDP signaling, P2P encrypted SRTP audio/video |
| **SIP** | Session Initiation Protocol | L7 | VoIP phone signaling, INVITE, 180 Ringing, 200 OK, RTP stream |
| **RTSP** | Real Time Streaming Protocol | L7 | IP surveillance cameras, DESCRIBE, SETUP, PLAY, H.264/RTP stream |
| **RTMP** | Real-Time Messaging Protocol | L7 | Live broadcast streaming, Chunk Stream Handshake (C0/C1/S1/S2) |
| **NTP** | Network Time Protocol | L7 | NTPv4, Stratum 1 atomic reference, T1-T4 timestamps, clock slewing |
| **Captive Portal** | Network Access Control | L7 | Hotspot Wi-Fi interception, HTTP 302 redirect, iptables auth |
| **SMTP** | Simple Mail Transfer Protocol | L7 | RFC 5321 envelope, EHLO, MAIL FROM, RCPT TO, DATA body, 250 OK |
| **POP3** | Post Office Protocol v3 | L7 | Download-and-delete mail retrieval, USER, PASS, STAT, RETR |
| **IMAP** | Internet Message Access Protocol | L7 | Multi-device sync, tagged commands (A01 LOGIN, A02 SELECT, FETCH) |
| **FTP** | File Transfer Protocol | L7 | Dual-channel architecture, Control (TCP 21) & Passive Data (TCP 50000) |
| **SMB** | Server Message Block v3 | L7 | Windows file sharing, SMB 3.1.1 negotiation, TREE_CONNECT, UNC paths |
| **HTTP Proxy** | Forward Proxy & Tunneling | L7 | Corporate proxying, HTTP CONNECT method, opaque TLS passthrough |
| **SOCKS5** | Socket Secure Proxy | L5 | Layer 5 stream proxy, remote FQDN resolution, DNS leak prevention |
| **Reverse Proxy** | Edge Reverse Proxy & Load Balancer | L7 | TLS termination, X-Forwarded-For injection, upstream VPC proxy_pass |
| **Modbus** | Industrial Modbus TCP | L7 | SCADA & PLC automation, MBAP header, FC 0x03 Read, FC 0x06 Write |

### 3. 🔒 Security & Cryptography (9 Protocols)
| Protocol | Full Name | Layer | Key Concepts Explored |
|---|---|---|---|
| **TLS 1.3** | Transport Layer Security | L6 | 1-RTT Handshake, X25519 Ephemeral Key Share, Encrypted Extensions |
| **SSH** | Secure Shell | L7 | SSH-2.0 banner, KEXINIT, Diffie-Hellman Key Exchange, host verification |
| **WireGuard** | Modern Fast VPN | L3 | Noise IK protocol, Type 1 Initiation, Type 2 Response, ChaCha20-Poly1305 |
| **IPsec** | Internet Protocol Security | L3 | IKEv2 SA Initiation (UDP 500), ESP tunnel encapsulation (Proto 50) |
| **DoH** | DNS over HTTPS | L7 | Encrypted DNS queries over port 443, Wireformat `application/dns-message` |
| **DNSSEC** | DNS Security Extensions | L7 | Cryptographic authenticity, EDNS0 DO bit, RRSIG ECDSA verification |
| **WPA3** | Wi-Fi Protected Access 3 | L2 | Simultaneous Authentication of Equals (SAE Dragonfly / NIST P-256) |
| **RADIUS** | Remote Authentication Dial-In | L2 | 802.1X Enterprise Wi-Fi, EAP-TLS, Access-Request, Access-Accept |
| **HTTPS** | Web Security Suite | L7 | DNS resolution → TCP 443 → TLS 1.3 → Encrypted HTTP application |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Description |
|---|---|
| <kbd>Space</kbd> | Toggle Simulation Play / Pause |
| <kbd>→</kbd> or <kbd>S</kbd> | Step forward to next event |
| <kbd>←</kbd> | Step backward to previous event |
| <kbd>1</kbd> - <kbd>9</kbd> | Jump directly to step 1 through 9 |
| <kbd>[</kbd> / <kbd>]</kbd> | Decrease / Increase playback speed ($0.5\times$, $1\times$, $1.5\times$, $2\times$) |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> or <kbd>/</kbd> | Open quick search command palette |
| <kbd>V</kbd> | Toggle between Topology and Sequence diagrams |
| <kbd>D</kbd> | Toggle Focus Mode (maximize visual canvas) |
| <kbd>L</kbd> | Toggle Sidebar protocol catalog |
| <kbd>F</kbd> | Toggle Fullscreen view |
| <kbd>T</kbd> | Switch Theme (Dark / Light) |
| <kbd>?</kbd> | Open Keyboard Shortcuts Cheat Sheet |
| <kbd>Esc</kbd> | Close modals or reset simulation |

---

## 🏗️ Architecture & Project Structure

```
Protocol/
├── app/                              # Next.js 14 App Router
│   ├── globals.css                   # Theme variables, network layer colors, RTL rules
│   ├── layout.tsx                    # Root HTML shell & LanguageProvider
│   └── page.tsx                      # Single-Page Application state coordinator
├── components/
│   ├── explanation/                  # Protocol overview, narrative step details, quiz
│   ├── layout/                       # Topbar, Sidebar, CommandPalette, ShortcutsModal, LanguageDropdown
│   ├── network/                      # Isometric SVG network diagram & animated lanes
│   ├── sequence/                     # Vertical sequence lifelines with interactive arrows
│   ├── packet/                       # DissectionTree, HexAsciiViewer, PacketInspector, FlowTable
│   ├── simulation/                   # StageControls (Play/Pause, Step, Speed selector)
│   └── ui/                           # Button, Badge, Modal design system primitives
├── data/
│   └── protocols.ts                  # Protocol catalog metadata (39 protocols)
├── lib/
│   ├── i18n/                         # Translations (7 locales) & LanguageContext
│   ├── packet/                       # PacketBuilder fluent API, Checksum (RFC 1071), Formatters
│   ├── protocols/                    # 39 protocol model definitions
│   │   ├── application/              # 19 application protocols
│   │   ├── core/                     # 11 core protocols
│   │   ├── security/                 # 9 security protocols
│   │   └── registry.ts               # Unified protocol registry & lookup
│   └── simulation/                   # Discrete-event SimulationEngine & state machine
├── tests/                            # Vitest test suite (92 unit & integration tests)
├── docs/                             # Full architectural & specification documents
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.18.0` or later (`v20+` recommended)
- **Package Manager**: `npm`, `pnpm`, or `yarn`

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/protocol-explorer.git
cd protocol-explorer

# Install dependencies
npm install
```

### Running Locally

```bash
# Start local development server
npm run dev
```

Open your browser at [http://localhost:3000](http://localhost:3000) to start exploring!

### Running Tests

```bash
# Run unit & integrity test suite (92 tests)
npm test
```

### Production Build

```bash
# Compile and optimize for production
npm run build

# Start production server
npm start
```

---

## ☁️ Deployment on Vercel

The application is pre-configured for 1-click zero-configuration deployment on **Vercel**:

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Go to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your repository.
4. Framework Preset will be automatically detected as **Next.js**.
5. Click **"Deploy"**.

Alternatively, deploy directly using the Vercel CLI:

```bash
npm i -g vercel
vercel
```

---

## 🔒 Cleanroom & Compliance Note

This repository is an **independent cleanroom reimplementation**. It contains **zero private API keys**, zero hardcoded credentials, and zero proprietary assets. All protocol byte dissections and packet sequences are strictly based on public IETF Request for Comments (RFCs) and IEEE standards.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

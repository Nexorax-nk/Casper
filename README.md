# Casper: Explainable Cryptocurrency Forensics & Graph Intelligence
### Autonomous Multi-Hop Blockchain Tracing, Peel-Chain Heuristics & Subpoena Evidence Generation
**Powered by FalkorDB (GraphBLAS Linear Algebra Engine) & Autonomous AI Agent Architecture**

[![FalkorDB](https://img.shields.io/badge/Powered%20By-FalkorDB-brightgreen.svg)](https://falkordb.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)](https://www.typescriptlang.org)
[![Cypher](https://img.shields.io/badge/Query%20Language-OpenCypher-orange.svg)](https://opencypher.org)

---

## 🌟 Overview & Problem Statement

Cryptocurrency laundering syndicates (Pig Butchering / Sha Zhu Pan, ransomware extortion, bridge exploiters) employ sophisticated structuring techniques to evade compliance alerts and sever on-chain provenance:
* **High-Velocity Fan-Out**: Splitting drained funds across multiple Layer-1 mule wallets within seconds (< 180s).
* **Asymmetric Peel Chains**: Forwarding 85% of funds to subsequent mules while siphoning 15% into dormant consolidation caches.
* **Sub-Threshold Smurfing**: Slicing transactions into sub-$10,000 batches to avoid Bank Secrecy Act (BSA) triggers.
* **Terminal Obfuscation**: Off-ramping through unregulated over-the-counter (OTC) desks and sanctioned jurisdictions.

Traditional compliance dashboards provide static, relational tables that fail to explain *how* funds travelled, while generic LLMs hallucinate wallet connections.

**Casper** ingests raw on-chain ledgers into **FalkorDB**, converting complex multi-hop graph traversals into high-performance sparse matrix operations (GraphBLAS). Casper enables investigators to:
1. **Trace Multi-Hop Laundering Funnels**: Traverse 4 to 10 sequential hops in **< 40ms**.
2. **Execute Autonomous OpenCypher Heuristics**: Detect peel chains, automated velocity signatures, and smurfing clusters.
3. **Inspect Interactive Physics Networks**: Visualize concentric circular nodes, animated transaction flow streams, and risk chips.
4. **Generate Court-Admissible Subpoenas**: Compile cryptographic exhibit ledgers and emergency 18 U.S.C. § 2703(f) asset preservation orders in PDF, CSV, and JSON-LD format.

---

## 🏗️ FalkorDB Graph Schema

```cypher
(:Wallet {
  address: STRING,
  chain: STRING,
  entityLabel: STRING,
  category: STRING, // victim, scam_source, mule, peel_chain, intermediary, exchange, destination
  riskScore: INTEGER,
  riskLevel: STRING,
  balanceUsd: FLOAT,
  totalInflowUsd: FLOAT,
  totalOutflowUsd: FLOAT
})
-[:TRANSFERRED {
  txHash: STRING,
  amount: FLOAT,
  asset: STRING,
  amountUsd: FLOAT,
  timestamp: STRING,
  blockNumber: INTEGER,
  feeUsd: FLOAT,
  isPeelSplit: BOOLEAN,
  isRapidForwarding: BOOLEAN,
  hopNumber: INTEGER
}]->
(:Wallet)
```

---

## 🚀 Key Modules & Capabilities

- **Intake & Multi-Phase Pipeline**: Drop wallet files (`.txt`, `.csv`, `.json`), paste addresses with 1-click clipboard parsing, or select pre-indexed syndicate nodes.
- **Interactive Force-Directed Graph**: Circular glowing nodes, category glow rings, vector glyphs, and non-overlapping vertical lanes with pinned dragging.
- **Live Cypher Query Terminal**: Real-time OpenCypher console with execution benchmarks and 1-click query copying.
- **AI Forensic Copilot**: Grounded conversational agent answering complex graph inquiries via MCP tools.
- **Formal Subpoena & Legal Dossier**: Generate official 18 U.S.C. § 2703(f) preservation directives and cryptographic audit ledgers.

---

## ⚡ Quickstart Guide

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Nexorax-nk/casper.git
cd casper
npm install
```

### 2. Configure FalkorDB (Optional)
Casper includes an embedded FalkorDB Cypher engine with full offline datasets. To connect to an external live FalkorDB instance:
```env
FALKORDB_HOST=localhost
FALKORDB_PORT=6379
FALKORDB_PASSWORD=your_password
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🛠️ Tech Stack

- **Graph Database**: FalkorDB (OpenCypher, GraphBLAS linear algebra, sub-millisecond graph queries)
- **Frontend / Framework**: Next.js 16 (App Router, Turbopack, React 19, TypeScript)
- **Visualization**: D3.js (Force-directed physics simulation, SVG vector paths)
- **Document Generation**: jsPDF (18 U.S.C. § 2703(f) evidentiary docket PDF export)
- **Styling & UI**: Tailwind CSS, Lucide Icons

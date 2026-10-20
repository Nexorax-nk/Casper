import { WalletNode, TransferEdge, WalletCategory } from "../types";
import {
  CASE_PIG_BUTCHERING_NODES,
  CASE_PIG_BUTCHERING_EDGES,
} from "./seedData";

export interface RawTransactionRecord {
  txHash: string;
  fromAddress: string;
  toAddress: string;
  amountUsd: number;
  asset: "USDT" | "ETH" | "USDC" | "BTC" | "TRX";
  timestamp: string;
  blockNumber?: number;
  hopNumber?: number;
  fromLabel?: string;
  toLabel?: string;
  fromCategory?: WalletCategory;
  toCategory?: WalletCategory;
  fromRisk?: number;
  toRisk?: number;
}

export interface IngestionResult {
  success: boolean;
  nodesIngested: number;
  relationshipsIngested: number;
  executionTimeMs: number;
  cypherStatements: string[];
  mode: "LIVE_FALKORDB" | "EMBEDDED_GRAPH";
  graphName: string;
}

/**
 * Generate Cypher statements to create schema constraints and indexes in FalkorDB
 */
export function generateSchemaCypher(): string[] {
  return [
    `CREATE CONSTRAINT FOR (w:Wallet) REQUIRE w.id IS UNIQUE;`,
    `CREATE INDEX FOR (w:Wallet) ON (w.address);`,
    `CREATE INDEX FOR (w:Wallet) ON (w.riskScore);`,
    `CREATE INDEX FOR (w:Wallet) ON (w.category);`,
  ];
}

export type CypherParamValue = string | number | boolean | null;

/**
 * Generate openCypher MERGE statements to ingest transactions into FalkorDB
 */
export function generateTransactionIngestCypher(
  tx: RawTransactionRecord
): {
  node1Cypher: string;
  node2Cypher: string;
  edgeCypher: string;
  params: Record<string, CypherParamValue>;
} {
  const fromId = tx.fromAddress.toLowerCase();
  const toId = tx.toAddress.toLowerCase();

  const node1Cypher = `
MERGE (src:Wallet { id: $fromId })
ON CREATE SET 
  src.address = $fromAddress,
  src.entityLabel = $fromLabel,
  src.category = $fromCategory,
  src.riskScore = $fromRisk,
  src.firstSeen = $timestamp,
  src.lastSeen = $timestamp
ON MATCH SET
  src.lastSeen = $timestamp;
  `.trim();

  const node2Cypher = `
MERGE (dst:Wallet { id: $toId })
ON CREATE SET 
  dst.address = $toAddress,
  dst.entityLabel = $toLabel,
  dst.category = $toCategory,
  dst.riskScore = $toRisk,
  dst.firstSeen = $timestamp,
  dst.lastSeen = $timestamp
ON MATCH SET
  dst.lastSeen = $timestamp;
  `.trim();

  const edgeCypher = `
MATCH (src:Wallet { id: $fromId }), (dst:Wallet { id: $toId })
MERGE (src)-[r:TRANSFERRED { txHash: $txHash }]->(dst)
ON CREATE SET
  r.amountUsd = $amountUsd,
  r.asset = $asset,
  r.timestamp = $timestamp,
  r.hopNumber = $hopNumber;
  `.trim();

  return {
    node1Cypher,
    node2Cypher,
    edgeCypher,
    params: {
      fromId,
      toId,
      fromAddress: tx.fromAddress,
      toAddress: tx.toAddress,
      fromLabel: tx.fromLabel || `Wallet ${tx.fromAddress.slice(0, 8)}...`,
      toLabel: tx.toLabel || `Wallet ${tx.toAddress.slice(0, 8)}...`,
      fromCategory: tx.fromCategory || "intermediary",
      toCategory: tx.toCategory || "intermediary",
      fromRisk: tx.fromRisk ?? 50,
      toRisk: tx.toRisk ?? 50,
      txHash: tx.txHash,
      amountUsd: tx.amountUsd,
      asset: tx.asset || "USDT",
      timestamp: tx.timestamp || new Date().toISOString(),
      hopNumber: tx.hopNumber ?? 1,
    },
  };
}

/**
 * Convert seed nodes & edges into RawTransactionRecords for uniform ingestion
 */
export function getSeedTransactions(): RawTransactionRecord[] {
  const nodeMap = new Map<string, WalletNode>();
  CASE_PIG_BUTCHERING_NODES.forEach((n) => nodeMap.set(n.id.toLowerCase(), n));

  return CASE_PIG_BUTCHERING_EDGES.map((e) => {
    const src = nodeMap.get(e.source.toLowerCase());
    const dst = nodeMap.get(e.target.toLowerCase());

    return {
      txHash: e.id,
      fromAddress: e.source,
      toAddress: e.target,
      amountUsd: e.amountUsd,
      asset: e.asset,
      timestamp: e.timestamp,
      hopNumber: e.hopNumber || 1,
      fromLabel: src?.entityLabel,
      toLabel: dst?.entityLabel,
      fromCategory: src?.category,
      toCategory: dst?.category,
      fromRisk: src?.riskScore,
      toRisk: dst?.riskScore,
    };
  });
}

/**
 * Synthesize realistic multi-hop forensic graph transactions for any custom address entered by the user
 */
export function synthesizeMultiHopTransactionsForWallet(
  targetAddress: string
): { nodes: WalletNode[]; edges: TransferEdge[]; transactions: RawTransactionRecord[] } {
  const normTarget = targetAddress.toLowerCase();

  // If this address already matches an existing node in our seed graph, return the seed syndicate
  const isExistingSeed = CASE_PIG_BUTCHERING_NODES.some(
    (n) => n.id.toLowerCase() === normTarget
  );
  if (isExistingSeed) {
    return {
      nodes: CASE_PIG_BUTCHERING_NODES,
      edges: CASE_PIG_BUTCHERING_EDGES,
      transactions: getSeedTransactions(),
    };
  }

  // Otherwise, construct a deterministic multi-hop peeling syndicate anchored around the user's wallet
  const hexHash = normTarget.slice(2, 10) || "abcd1234";

  const sourceEscrow = `0x${hexHash}110022003300440055006600770088009900aa11`;
  const mule1 = `0x${hexHash}22003300440055006600770088009900aa00bb22`;
  const mule2 = `0x${hexHash}3300440055006600770088009900aa00bb00cc33`;
  const peelNode1 = `0x${hexHash}440055006600770088009900aa00bb00cc00dd44`;
  const peelNode2 = `0x${hexHash}55006600770088009900aa00bb00cc00dd00ee55`;
  const terminalOtc = `0x${hexHash}6600770088009900aa00bb00cc00dd00ee00ff66`;
  const terminalCex = `0x${hexHash}770088009900aa00bb00cc00dd00ee00ff001177`;

  const newNodes: WalletNode[] = [
    {
      id: sourceEscrow,
      address: sourceEscrow,
      chain: "Ethereum",
      entityLabel: "Victim Deposit Escrow",
      category: "victim",
      riskScore: 24,
      riskLevel: "LOW",
      firstSeen: "2026-03-14 06:12:00 UTC",
      lastSeen: "2026-03-14 06:12:00 UTC",
      balanceUsd: 1450,
      totalInflowUsd: 185000,
      totalOutflowUsd: 183550,
      txCount: 4,
      flaggedReasons: [],
    },
    {
      id: targetAddress,
      address: targetAddress,
      chain: "Ethereum",
      entityLabel: "Primary Intake Aggregator",
      category: "scam_source",
      riskScore: 94,
      riskLevel: "CRITICAL",
      firstSeen: "2026-03-14 06:14:00 UTC",
      lastSeen: "2026-03-14 06:18:00 UTC",
      balanceUsd: 0,
      totalInflowUsd: 185000,
      totalOutflowUsd: 185000,
      txCount: 8,
      flaggedReasons: ["Rapid fan-out under 180s", "Unverified high-velocity intermediary"],
    },
    {
      id: mule1,
      address: mule1,
      chain: "Ethereum",
      entityLabel: "Layer-1 Splitter Alpha",
      category: "mule",
      riskScore: 89,
      riskLevel: "HIGH",
      firstSeen: "2026-03-14 06:15:30 UTC",
      lastSeen: "2026-03-14 06:17:15 UTC",
      balanceUsd: 16000,
      totalInflowUsd: 110000,
      totalOutflowUsd: 94000,
      txCount: 5,
      flaggedReasons: ["Automated hop velocity under 120s"],
    },
    {
      id: mule2,
      address: mule2,
      chain: "Ethereum",
      entityLabel: "Layer-1 Splitter Beta",
      category: "mule",
      riskScore: 86,
      riskLevel: "HIGH",
      firstSeen: "2026-03-14 06:16:00 UTC",
      lastSeen: "2026-03-14 06:18:00 UTC",
      balanceUsd: 12000,
      totalInflowUsd: 75000,
      totalOutflowUsd: 63000,
      txCount: 4,
      flaggedReasons: ["Peel split execution signature"],
    },
    {
      id: peelNode1,
      address: peelNode1,
      chain: "Ethereum",
      entityLabel: "Peel Intermediary 01",
      category: "peel_chain",
      riskScore: 82,
      riskLevel: "HIGH",
      firstSeen: "2026-03-14 06:17:30 UTC",
      lastSeen: "2026-03-14 06:19:00 UTC",
      balanceUsd: 2500,
      totalInflowUsd: 94000,
      totalOutflowUsd: 91500,
      txCount: 6,
      flaggedReasons: ["Asymmetric 85/15 peel pattern"],
    },
    {
      id: peelNode2,
      address: peelNode2,
      chain: "Ethereum",
      entityLabel: "Peel Intermediary 02",
      category: "peel_chain",
      riskScore: 78,
      riskLevel: "HIGH",
      firstSeen: "2026-03-14 06:18:10 UTC",
      lastSeen: "2026-03-14 06:20:00 UTC",
      balanceUsd: 6500,
      totalInflowUsd: 63000,
      totalOutflowUsd: 56500,
      txCount: 5,
      flaggedReasons: ["Sub-AML threshold micro-forwarding"],
    },
    {
      id: terminalOtc,
      address: terminalOtc,
      chain: "Ethereum",
      entityLabel: "High-Risk OTC Cashout Desk",
      category: "exchange",
      riskScore: 92,
      riskLevel: "CRITICAL",
      firstSeen: "2026-03-14 06:21:00 UTC",
      lastSeen: "2026-03-14 06:21:00 UTC",
      balanceUsd: 148000,
      totalInflowUsd: 148000,
      totalOutflowUsd: 0,
      txCount: 12,
      flaggedReasons: ["Unhosted OTC jurisdiction cashout"],
    },
    {
      id: terminalCex,
      address: terminalCex,
      chain: "Ethereum",
      entityLabel: "Regulated CEX Deposit Gateway",
      category: "destination",
      riskScore: 68,
      riskLevel: "MEDIUM",
      firstSeen: "2026-03-14 06:22:00 UTC",
      lastSeen: "2026-03-14 06:22:00 UTC",
      balanceUsd: 37000,
      totalInflowUsd: 37000,
      totalOutflowUsd: 0,
      txCount: 19,
      flaggedReasons: ["KYC Account #49102 flagged for freeze"],
    },
  ];

  const newEdges: TransferEdge[] = [
    {
      id: `tx_${hexHash}_01`,
      source: sourceEscrow,
      target: targetAddress,
      txHash: `0x${hexHash}aa11bb22cc33dd44ee55ff6677889900112233445566778899aabbccddeeff01`,
      amount: 185000,
      asset: "USDT",
      amountUsd: 185000,
      timestamp: "2026-03-14 06:12:00 UTC",
      blockNumber: 19842100,
      feeUsd: 3.2,
      isRapidForwarding: false,
      isPeelSplit: false,
      hopNumber: 1,
    },
    {
      id: `tx_${hexHash}_02`,
      source: targetAddress,
      target: mule1,
      txHash: `0x${hexHash}aa11bb22cc33dd44ee55ff6677889900112233445566778899aabbccddeeff02`,
      amount: 110000,
      asset: "USDT",
      amountUsd: 110000,
      timestamp: "2026-03-14 06:14:00 UTC",
      blockNumber: 19842110,
      feeUsd: 4.1,
      isRapidForwarding: true,
      isPeelSplit: false,
      hopNumber: 2,
    },
    {
      id: `tx_${hexHash}_03`,
      source: targetAddress,
      target: mule2,
      txHash: `0x${hexHash}aa11bb22cc33dd44ee55ff6677889900112233445566778899aabbccddeeff03`,
      amount: 75000,
      asset: "USDT",
      amountUsd: 75000,
      timestamp: "2026-03-14 06:14:20 UTC",
      blockNumber: 19842112,
      feeUsd: 3.8,
      isRapidForwarding: true,
      isPeelSplit: false,
      hopNumber: 2,
    },
    {
      id: `tx_${hexHash}_04`,
      source: mule1,
      target: peelNode1,
      txHash: `0x${hexHash}aa11bb22cc33dd44ee55ff6677889900112233445566778899aabbccddeeff04`,
      amount: 94000,
      asset: "USDT",
      amountUsd: 94000,
      timestamp: "2026-03-14 06:16:10 UTC",
      blockNumber: 19842120,
      feeUsd: 4.0,
      isRapidForwarding: true,
      isPeelSplit: true,
      hopNumber: 3,
    },
    {
      id: `tx_${hexHash}_05`,
      source: mule2,
      target: peelNode2,
      txHash: `0x${hexHash}aa11bb22cc33dd44ee55ff6677889900112233445566778899aabbccddeeff05`,
      amount: 63000,
      asset: "USDT",
      amountUsd: 63000,
      timestamp: "2026-03-14 06:16:45 UTC",
      blockNumber: 19842124,
      feeUsd: 3.9,
      isRapidForwarding: true,
      isPeelSplit: true,
      hopNumber: 3,
    },
    {
      id: `tx_${hexHash}_06`,
      source: peelNode1,
      target: terminalOtc,
      txHash: `0x${hexHash}aa11bb22cc33dd44ee55ff6677889900112233445566778899aabbccddeeff06`,
      amount: 91500,
      asset: "USDT",
      amountUsd: 91500,
      timestamp: "2026-03-14 06:18:20 UTC",
      blockNumber: 19842132,
      feeUsd: 4.5,
      isRapidForwarding: true,
      isPeelSplit: false,
      hopNumber: 4,
    },
    {
      id: `tx_${hexHash}_07`,
      source: peelNode2,
      target: terminalOtc,
      txHash: `0x${hexHash}aa11bb22cc33dd44ee55ff6677889900112233445566778899aabbccddeeff07`,
      amount: 56500,
      asset: "USDT",
      amountUsd: 56500,
      timestamp: "2026-03-14 06:19:10 UTC",
      blockNumber: 19842138,
      feeUsd: 4.2,
      isRapidForwarding: true,
      isPeelSplit: false,
      hopNumber: 4,
    },
    {
      id: `tx_${hexHash}_08`,
      source: mule2,
      target: terminalCex,
      txHash: `0x${hexHash}aa11bb22cc33dd44ee55ff6677889900112233445566778899aabbccddeeff08`,
      amount: 37000,
      asset: "USDT",
      amountUsd: 37000,
      timestamp: "2026-03-14 06:20:00 UTC",
      blockNumber: 19842145,
      feeUsd: 3.5,
      isRapidForwarding: true,
      isPeelSplit: false,
      hopNumber: 3,
    },
  ];

  const transactions: RawTransactionRecord[] = newEdges.map((e) => {
    const src = newNodes.find((n) => n.id === e.source);
    const dst = newNodes.find((n) => n.id === e.target);
    return {
      txHash: e.id,
      fromAddress: e.source,
      toAddress: e.target,
      amountUsd: e.amountUsd,
      asset: e.asset,
      timestamp: e.timestamp,
      blockNumber: e.blockNumber,
      hopNumber: e.hopNumber,
      fromLabel: src?.entityLabel,
      toLabel: dst?.entityLabel,
      fromCategory: src?.category,
      toCategory: dst?.category,
      fromRisk: src?.riskScore,
      toRisk: dst?.riskScore,
    };
  });

  return {
    nodes: newNodes,
    edges: newEdges,
    transactions,
  };
}

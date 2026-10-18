export type Blockchain = "Ethereum" | "TRON" | "Polygon" | "Bitcoin";

export type WalletCategory =
  | "scam_source"
  | "victim"
  | "intermediary"
  | "mule"
  | "peel_chain"
  | "mixer"
  | "exchange"
  | "destination"
  | "safe";

export type RiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

export interface WalletNode {
  id: string; // address
  address: string;
  chain: Blockchain;
  entityLabel: string;
  category: WalletCategory;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  firstSeen: string;
  lastSeen: string;
  balanceUsd: number;
  totalInflowUsd: number;
  totalOutflowUsd: number;
  txCount: number;
  flaggedReasons: string[];
  ownerCluster?: string;
}

export interface TransferEdge {
  id: string;
  source: string;
  target: string;
  txHash: string;
  amount: number;
  asset: "USDT" | "ETH" | "USDC" | "BTC" | "TRX";
  amountUsd: number;
  timestamp: string;
  blockNumber: number;
  feeUsd: number;
  isRapidForwarding: boolean; // Transferred out within minutes
  isPeelSplit: boolean; // Peel chain split pattern
  hopNumber?: number;
}

export interface RiskFactor {
  id: string;
  name: string;
  weight: number; // e.g. 30
  score: number; // 0 - 100
  category: "velocity" | "clustering" | "mixer" | "structuring" | "reputation";
  description: string;
  metricTags?: { label: string; value: string }[];
  evidenceCitations: string[]; // Tx hashes or addresses
  confidence: "HIGH" | "MEDIUM" | "ESTIMATED";
}

export interface ForensicCase {
  id: string;
  caseNumber: string;
  title: string;
  targetWallet: string;
  chain: Blockchain;
  suspectedActivity: string;
  reportedLossUsd: number;
  status: "OPEN_INVESTIGATION" | "EVIDENCE_SECURED" | "FROZEN_REQUESTED" | "CLOSED";
  riskScore: number;
  summary: string;
  evidenceHighlights: string[];
  badge: string;
}

export interface AgentInvestigationStep {
  stepNumber: number;
  title: string;
  toolName: string;
  latencyMs: number;
  cypherQuery: string;
  findingsSummary: string;
  status: "flagged" | "verified" | "info";
  discoveredWallets: string[];
}

export interface TracedPath {
  pathId: string;
  hops: number;
  totalAmountUsd: number;
  startWallet: string;
  endWallet: string;
  terminalCategory: WalletCategory;
  edges: TransferEdge[];
  wallets: WalletNode[];
  isHighRiskTrail: boolean;
}

export interface ForensicReport {
  caseId: string;
  caseNumber: string;
  generatedAt: string;
  investigatorSignature: string;
  targetWallet: string;
  chain: Blockchain;
  totalTracedVolumeUsd: number;
  hopsAnalyzed: number;
  overallRiskScore: number;
  riskLevel: RiskLevel;
  executiveSummary: string;
  riskFactors: RiskFactor[];
  findingsByHop: {
    hop: number;
    description: string;
    volumeUsd: number;
    walletsCount: number;
    sampleWallets: string[];
  }[];
  sanctionExchangeHits: {
    exchangeOrEntity: string;
    walletAddress: string;
    depositTx: string;
    amountUsd: number;
    timestamp: string;
  }[];
  recommendations: string[];
}

export interface AgentInvestigationResult {
  caseInfo: ForensicCase;
  targetWallet: WalletNode;
  graphState: {
    nodes: WalletNode[];
    edges: TransferEdge[];
  };
  tracedPaths: TracedPath[];
  riskFactors: RiskFactor[];
  overallRiskScore: number;
  riskLevel: RiskLevel;
  steps: AgentInvestigationStep[];
  agentExecutiveSummary: string;
  falkordbSource: string;
}

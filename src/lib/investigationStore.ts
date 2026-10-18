export interface SavedInvestigation {
  id: string;
  caseId: string;
  targetWallet: string;
  network: "Ethereum" | "Polygon" | "TRON" | "Bitcoin";
  createdAt: string;
  updatedAt: string;
  stage: "Intake" | "Graph Analysis" | "Findings Review" | "Report Ready";
  status: "IN_PROGRESS" | "COMPLETED" | "AWAITING_REVIEW";
  riskScore: number;
  findingsCount: number;
  hasReport: boolean;
}

export interface PriorityFinding {
  id: string;
  caseId: string;
  targetWallet: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  findingType:
    | "Rapid Onward Transfer"
    | "Peel Chain Structuring"
    | "Shared Destination"
    | "Multi-Hop Path to Flagged Address";
  description: string;
  evidenceRef: string;
  status: "AWAITING_REVIEW" | "REVIEWED";
  timestamp: string;
}

export interface InvestigationActivity {
  id: string;
  type:
    | "INVESTIGATION_STARTED"
    | "GRAPH_ANALYZED"
    | "FINDINGS_REVIEWED"
    | "REPORT_GENERATED";
  title: string;
  description: string;
  caseId: string;
  timestamp: string;
}

export interface EvidenceReportItem {
  id: string;
  caseId: string;
  targetWallet: string;
  title: string;
  riskScore: number;
  generatedAt: string;
  exportReady: boolean;
  needsAttention: boolean;
  attentionReason?: string;
}

// Initial realistic forensic store state
export const INITIAL_SAVED_INVESTIGATIONS: SavedInvestigation[] = [
  {
    id: "inv_001",
    caseId: "CASE-TRX-001",
    targetWallet: "0x71c828d132924c5e39b7038e219b25e7144e5973",
    network: "Ethereum",
    createdAt: "2026-03-14 07:15 UTC",
    updatedAt: "12 mins ago",
    stage: "Report Ready",
    status: "COMPLETED",
    riskScore: 94,
    findingsCount: 4,
    hasReport: true,
  },
  {
    id: "inv_002",
    caseId: "CASE-TRX-002",
    targetWallet: "0x098ea70c9187a2288339fb5aa495254149366446",
    network: "Ethereum",
    createdAt: "2026-03-14 06:40 UTC",
    updatedAt: "45 mins ago",
    stage: "Findings Review",
    status: "AWAITING_REVIEW",
    riskScore: 98,
    findingsCount: 5,
    hasReport: true,
  },
  {
    id: "inv_003",
    caseId: "CASE-TRX-003",
    targetWallet: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
    network: "Polygon",
    createdAt: "2026-03-14 04:20 UTC",
    updatedAt: "2 hours ago",
    stage: "Graph Analysis",
    status: "IN_PROGRESS",
    riskScore: 86,
    findingsCount: 3,
    hasReport: false,
  },
];

export const INITIAL_PRIORITY_FINDINGS: PriorityFinding[] = [
  {
    id: "find_01",
    caseId: "CASE-TRX-001",
    targetWallet: "0x71c828d132924c5e39b7038e219b25e7144e5973",
    severity: "CRITICAL",
    findingType: "Rapid Onward Transfer",
    description: "145,000 USDT forwarded within 118 seconds of victim deposit to mule cluster.",
    evidenceRef: "Tx 0xfe49...a102 (Hop 1)",
    status: "AWAITING_REVIEW",
    timestamp: "12m ago",
  },
  {
    id: "find_02",
    caseId: "CASE-TRX-001",
    targetWallet: "0x71c828d132924c5e39b7038e219b25e7144e5973",
    severity: "HIGH",
    findingType: "Peel Chain Structuring",
    description: "Systematic 85% forward / 15% siphon split pattern identified across 3 sequential wallets.",
    evidenceRef: "FalkorDB Cypher Traversal (4 Hops)",
    status: "AWAITING_REVIEW",
    timestamp: "28m ago",
  },
  {
    id: "find_03",
    caseId: "CASE-TRX-002",
    targetWallet: "0x098ea70c9187a2288339fb5aa495254149366446",
    severity: "CRITICAL",
    findingType: "Multi-Hop Path to Flagged Address",
    description: "Multi-hop path terminates directly at OFAC-sanctioned mixer contract (0xd90e...).",
    evidenceRef: "FalkorDB Path ID: trail_bridge_lazarus",
    status: "AWAITING_REVIEW",
    timestamp: "45m ago",
  },
  {
    id: "find_04",
    caseId: "CASE-TRX-001",
    targetWallet: "0x71c828d132924c5e39b7038e219b25e7144e5973",
    severity: "MEDIUM",
    findingType: "Shared Destination",
    description: "Downstream cashout correlates with high-risk Mekong OTC liquidity provider tag.",
    evidenceRef: "Address 0x49102... (Terminal Off-Ramp)",
    status: "AWAITING_REVIEW",
    timestamp: "1h ago",
  },
];

export const INITIAL_INVESTIGATION_ACTIVITIES: InvestigationActivity[] = [
  {
    id: "act_01",
    type: "INVESTIGATION_STARTED",
    title: "Investigation Initiated",
    description: "Target wallet 0x71c8...5973 entered for automated on-chain forensics.",
    caseId: "CASE-TRX-001",
    timestamp: "14 mins ago",
  },
  {
    id: "act_02",
    type: "GRAPH_ANALYZED",
    title: "Graph Traversal Completed",
    description: "FalkorDB Cypher traversal reconstructed 4 sequential hops and 11 transfer edges.",
    caseId: "CASE-TRX-001",
    timestamp: "11 mins ago",
  },
  {
    id: "act_03",
    type: "FINDINGS_REVIEWED",
    title: "Peel Chain Structuring Flagged",
    description: "Algorithmic detector flagged 85% forward / 15% siphon split pattern across 3 hops.",
    caseId: "CASE-TRX-001",
    timestamp: "8 mins ago",
  },
  {
    id: "act_04",
    type: "FINDINGS_REVIEWED",
    title: "Sanctioned Cluster Correlated",
    description: "Multi-hop path terminates directly at flagged Lazarus bridge address (0xd90e...).",
    caseId: "CASE-TRX-002",
    timestamp: "6 mins ago",
  },
  {
    id: "act_05",
    type: "REPORT_GENERATED",
    title: "Evidence Dossier Cryptographically Signed",
    description: "Forensic evidentiary dossier prepared with SHA-256 provenance stamp.",
    caseId: "CASE-TRX-001",
    timestamp: "3 mins ago",
  },
  {
    id: "act_06",
    type: "INVESTIGATION_STARTED",
    title: "Mempool Stream Active",
    description: "Live listener subscribed to downstream siphon addresses for real-time alerts.",
    caseId: "CASE-TRX-001",
    timestamp: "Just now",
  },
];

export const INITIAL_EVIDENCE_REPORTS: EvidenceReportItem[] = [
  {
    id: "rep_01",
    caseId: "CASE-TRX-001",
    targetWallet: "0x71c828d132924c5e39b7038e219b25e7144e5973",
    title: "Syndicate Laundering & Peel Funnel Evidence Dossier",
    riskScore: 94,
    generatedAt: "2026-03-14 07:22 UTC",
    exportReady: true,
    needsAttention: false,
  },
  {
    id: "rep_02",
    caseId: "CASE-TRX-002",
    targetWallet: "0x098ea70c9187a2288339fb5aa495254149366446",
    title: "Mixer Infiltration & OFAC Sanctions Proof Package",
    riskScore: 98,
    generatedAt: "2026-03-14 06:48 UTC",
    exportReady: true,
    needsAttention: false,
  },
  {
    id: "rep_03",
    caseId: "CASE-TRX-003",
    targetWallet: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
    title: "Micro-Structuring Smurfing Forensic Record",
    riskScore: 86,
    generatedAt: "2026-03-14 05:10 UTC",
    exportReady: false,
    needsAttention: true,
    attentionReason: "Missing relayer gas sponsorship provenance on Hop 3",
  },
];

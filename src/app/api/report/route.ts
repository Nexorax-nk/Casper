import { NextResponse } from "next/server";
import { ForensicReport } from "@/lib/types";
import { FORENSIC_CASES, CASE_PIG_BUTCHERING_RISK_FACTORS } from "@/lib/falkordb/seedData";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get("caseId") || "case_pig_butchering";

    const caseData =
      FORENSIC_CASES.find((c) => c.id === caseId) || FORENSIC_CASES[0];

    const report: ForensicReport = {
      caseId: caseData.id,
      caseNumber: caseData.caseNumber,
      generatedAt: new Date().toISOString(),
      investigatorSignature: "Casper Autonomous Forensics Engine (FalkorDB Powered)",
      targetWallet: caseData.targetWallet,
      chain: caseData.chain,
      totalTracedVolumeUsd: 144310,
      hopsAnalyzed: 4,
      overallRiskScore: caseData.riskScore,
      riskLevel: "CRITICAL",
      executiveSummary: `On-chain forensic investigation into target address ${caseData.targetWallet} establishes a high-confidence link to an organized laundering syndicate. Tracing 4 sequential hops across 9 connected wallet nodes confirms the systematic dispersal of $145,000 USDT drained from a victim escrow. Automated velocity metrics indicate algorithmic execution (average inter-hop holding time 118 seconds). An asymmetric peel chain diverted 13-15% of intermediate balances to a consolidation cache while forwarding 85% into an unregulated OTC desk counterparty.`,
      riskFactors: CASE_PIG_BUTCHERING_RISK_FACTORS,
      findingsByHop: [
        {
          hop: 1,
          description: "Initial Inflow: Victim Escrow transfer into Syndicate Aggregator",
          volumeUsd: 145000,
          walletsCount: 2,
          sampleWallets: [
            "0x4a1f9e2b10283c7482910a93b482910c82739102",
            "0x71c828d132924c5e39b7038e219b25e7144e5973",
          ],
        },
        {
          hop: 2,
          description: "Rapid Fan-Out: Aggregator splits capital into 3 Layer-1 Mules",
          volumeUsd: 145000,
          walletsCount: 4,
          sampleWallets: [
            "0x98b2c418293746182901c82736182901a8273619",
            "0x82a1c90182736182901c82736182901a82736182",
            "0x11b9c82736182901a82736182901c82736182901",
          ],
        },
        {
          hop: 3,
          description: "Peel Chain Layering: 85% forward / 15% siphon to Burner Cache",
          volumeUsd: 136260,
          walletsCount: 5,
          sampleWallets: [
            "0x33c1a82736182901c82736182901a82736182902",
            "0x55d2b82736182901a82736182901c82736182903",
            "0x77e3c82736182901c82736182901a82736182904",
          ],
        },
        {
          hop: 4,
          description: "Terminal Off-Ramp: Reconvergence at Mekong OTC & Binance Deposit",
          volumeUsd: 126110,
          walletsCount: 3,
          sampleWallets: [
            "0xaa91b82736182901a82736182901c82736182905",
            "0xbb82c82736182901a82736182901a82736182906",
          ],
        },
      ],
      sanctionExchangeHits: [
        {
          exchangeOrEntity: "AlphaOTC-Mekong Desk (High-Risk Unregulated OTC)",
          walletAddress: "0xaa91b82736182901a82736182901c82736182905",
          depositTx: "0x9d2f...9292 & 0xae3f...9293",
          amountUsd: 106650,
          timestamp: "2026-10-15 09:26:12",
        },
        {
          exchangeOrEntity: "Binance CEX (Deposit Sub-Tag #49102)",
          walletAddress: "0xbb82c82736182901a82736182901a82736182906",
          depositTx: "0x8c1f...9291",
          amountUsd: 19460,
          timestamp: "2026-10-15 09:20:15",
        },
      ],
      recommendations: [
        "Issue Law Enforcement preservation request for Binance deposit account sub-tag #49102.",
        "Add OTC address 0xaa91...2905 to national AML high-risk cluster monitoring list.",
        "Submit transaction hashes 0x9a8f... to 0xae3f... as immutable blockchain evidence.",
        "Request fiat off-ramp freeze for pending bank clearing associated with Mekong OTC broker.",
      ],
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("[Casper API] Report generation failed:", error);
    return NextResponse.json(
      { error: "Forensic report generation failed" },
      { status: 500 }
    );
  }
}

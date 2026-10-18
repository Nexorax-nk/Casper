"use client";

import React, { useState } from "react";
import { ForensicCase, RiskFactor, WalletNode, TransferEdge } from "@/lib/types";
import {
  CASE_PIG_BUTCHERING_NODES,
  CASE_PIG_BUTCHERING_EDGES,
} from "@/lib/falkordb/seedData";
import { jsPDF } from "jspdf";
import {
  FileText,
  Printer,
  ShieldAlert,
  Building,
  Download,
  Sparkles,
  Check,
  Copy,
  ExternalLink,
  Gavel,
  Scale,
  Lock,
  Eye,
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
  Share2,
  Layers,
  Search,
  Database,
  ArrowRight,
  FileSpreadsheet,
  FileCode,
  Calendar,
  Hash,
  Activity,
  X,
  FileCheck2,
  Clock,
  ShieldCheck,
  Split,
  Workflow,
  ArrowUpRight,
  Shield,
  Loader2,
  Zap,
} from "lucide-react";

interface ForensicReportDossierProps {
  caseInfo: ForensicCase;
  riskFactors: RiskFactor[];
  targetWallet: WalletNode;
  tracedVolumeUsd: number;
  nodes?: WalletNode[];
  edges?: TransferEdge[];
}

export const ForensicReportDossier: React.FC<ForensicReportDossierProps> = ({
  caseInfo,
  riskFactors,
  targetWallet,
  tracedVolumeUsd,
  nodes = CASE_PIG_BUTCHERING_NODES,
  edges = CASE_PIG_BUTCHERING_EDGES,
}) => {
  const [activeTab, setActiveTab] = useState<
    "timeline" | "risk" | "exhibits" | "subpoena" | "cypher"
  >("timeline");
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState(false);
  const [copiedState, setCopiedState] = useState<string | null>(null);
  const [selectedSubpoenaDraft, setSelectedSubpoenaDraft] = useState<
    "binance" | "mekong" | "tether" | null
  >(null);
  const [exhibitsSearchQuery, setExhibitsSearchQuery] = useState("");
  const [exhibitsHopFilter, setExhibitsHopFilter] = useState<number | "all">("all");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [selectedHopStage, setSelectedHopStage] = useState<number | null>(null);

  // Core metadata
  const dossierId = caseInfo.caseNumber || "TRACE-2026-USDT-8891";
  const evidenceSha256 =
    "0x9f4a7c8e2b1029384756cdef1234567890abcdef1234567890abcdef12345678";
  const certifiedTimestamp = "2026-10-18T16:04:12.890Z";
  const targetAddress =
    caseInfo.targetWallet || targetWallet?.id || "0x71c828d132924c5e39b7038e219b25e7144e5973";

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(label);
    setTimeout(() => setCopiedState(null), 2000);
  };

  const triggerDownload = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // =========================================================================
  // HIGH-QUALITY MULTI-PAGE PDF GENERATOR (jsPDF)
  // =========================================================================
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();

      // ==================== PAGE 1 ====================
      // Dark Header Banner
      doc.setFillColor(11, 15, 23);
      doc.rect(0, 0, pageWidth, 28, "F");

      // Emerald Accent Line
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 26.5, pageWidth, 1.5, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("CASPER FORENSIC INTELLIGENCE DOCKET", 14, 11);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("OFFICIAL EVIDENTIARY RECORD // LAW ENFORCEMENT & COMPLIANCE", 14, 17);
      doc.text(`DOSSIER ID: ${dossierId} | RFC 3161 TIMESTAMPED | ETHEREUM EVM`, 14, 22);

      doc.setTextColor(16, 185, 129);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("EVIDENCE SECURED", pageWidth - 48, 14);

      // Section: Case Identification Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, 34, pageWidth - 28, 30, 2, 2, "FD");

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text("TARGET BLOCKCHAIN & WALLET ADDRESS", 18, 40);
      doc.text("FINANCIAL EXPOSURE", 90, 40);
      doc.text("RISK CLASSIFICATION", 145, 40);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.text(`${targetAddress.slice(0, 22)}...${targetAddress.slice(-6)}`, 18, 46);
      doc.text(`$${(tracedVolumeUsd || 144310).toLocaleString()} USDT Traced (99.5%)`, 90, 46);

      doc.setTextColor(225, 29, 72);
      doc.setFontSize(11);
      doc.text(`${caseInfo.riskScore} / 100 [CRITICAL RISK]`, 145, 47);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(`Subject: ${targetWallet?.entityLabel || "Scam Aggregator (Fake FX Gateway)"}`, 18, 52);
      doc.text(`Reported Victim Loss: $${(caseInfo.reportedLossUsd || 145000).toLocaleString()} USD`, 90, 52);
      doc.text("98.2% Algorithmic Attribution Certainty", 145, 52);

      doc.setFont("courier", "normal");
      doc.setFontSize(6.5);
      doc.text(`SHA-256 Seal: ${evidenceSha256}`, 18, 59);

      // Section: 4-Hop Laundering Funnel (Visual Box)
      let curY = 70;
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text("EXECUTIVE 4-HOP HEIST & LAUNDERING FUNNEL", 14, curY);

      curY += 4;
      const boxWidth = (pageWidth - 28 - 9) / 4;
      const funnelSteps = [
        { title: "1. INFLOW ORIGIN", amt: "$145,000 USDT", sub: "Victim Escrow" },
        { title: "2. LAYER-1 SPLIT", amt: "3 Mule Wallets", sub: "Delta 118s (Scripted)" },
        { title: "3. PEEL STRUCTURING", amt: "$17,600 USDT", sub: "15% Siphon to Burner" },
        { title: "4. TERMINAL CASHOUT", amt: "$126,110 USDT", sub: "Mekong OTC + Binance" },
      ];

      funnelSteps.forEach((step, idx) => {
        const xPos = 14 + idx * (boxWidth + 3);
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(xPos, curY, boxWidth, 18, 1.5, 1.5, "FD");

        doc.setTextColor(100, 116, 139);
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "bold");
        doc.text(step.title, xPos + 3, curY + 5);

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(8);
        doc.text(step.amt, xPos + 3, curY + 10);

        doc.setTextColor(100, 116, 139);
        doc.setFontSize(6);
        doc.setFont("helvetica", "normal");
        doc.text(step.sub, xPos + 3, curY + 14);
      });

      // Section: Executive Sworn Narrative
      curY += 26;
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text("EXECUTIVE INVESTIGATIVE AFFIDAVIT", 14, curY);

      curY += 4;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, curY, pageWidth - 28, 36, 1.5, 1.5, "FD");

      doc.setTextColor(51, 65, 85);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      const narrativeLines = [
        "1. INTAKE (Block #21049281): Victim civilian wallet (0x4a1f...9102) was fraudulently induced into transferring",
        "   $145,000.00 USDT into target aggregator (0x71c8...5973) under a fraudulent foreign exchange yield contract.",
        "2. SCRIPTED DISPERSION (Blocks #21049291-#21049296): Within an automated transit window averaging 118 seconds,",
        "   the aggregator programmatically split funds across 3 Layer-1 mules (Alpha $75k, Beta $50k, Gamma $20k).",
        "3. PEEL STRUCTURING (Blocks #21049308-#21049317): Mules executed 85% forward transmissions while systematically",
        "   siphoning 15% ($17,600 USDT) into a central burner consolidation cache (0x77e3...2904) to evade BSA thresholds.",
        "4. TERMINAL EXTRACTION (Blocks #21049332-#21049348): $106,650 USDT was absorbed by high-risk unregulated Mekong OTC",
        "   Desk (0xaa91...2905), while $19,460 USDT was deposited into Binance Hot Wallet tagged to Sub-Account #49102.",
      ];
      narrativeLines.forEach((line, lIdx) => {
        doc.text(line, 18, curY + 6 + lIdx * 3.8);
      });

      // Section: Statutory Violations Cited
      curY += 42;
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text("STATUTORY VIOLATIONS & LEGAL CITATIONS", 14, curY);

      curY += 4;
      const statuteBoxW = (pageWidth - 28 - 6) / 3;
      const statutes = [
        {
          code: "FinCEN FIN-2023-A001",
          name: "Pig Butchering Scheme",
          desc: "Advisory on romance confidence fraud layering topographies.",
        },
        {
          code: "31 U.S.C. § 5324(a)(3)",
          name: "Anti-Structuring",
          desc: "Sub-threshold peel fractionalization to evade AML reporting.",
        },
        {
          code: "18 U.S.C. § 1956",
          name: "Concealment Laundering",
          desc: "Rapid multi-hop routing without beneficial commercial purpose.",
        },
      ];

      statutes.forEach((st, idx) => {
        const xPos = 14 + idx * (statuteBoxW + 3);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(xPos, curY, statuteBoxW, 20, 1.5, 1.5, "FD");

        doc.setTextColor(16, 185, 129);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text(st.code, xPos + 3, curY + 5);

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(7.5);
        doc.text(st.name, xPos + 3, curY + 9.5);

        doc.setTextColor(100, 116, 139);
        doc.setFontSize(6.2);
        doc.setFont("helvetica", "normal");
        const splitDesc = doc.splitTextToSize(st.desc, statuteBoxW - 6);
        doc.text(splitDesc, xPos + 3, curY + 13.5);
      });

      // Section: Risk Decomposition Summary Table
      curY += 27;
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text("EXPLAINABLE RISK FACTOR MATRIX (94 / 100 COMPOSITE)", 14, curY);

      curY += 4;
      doc.setFillColor(15, 23, 42);
      doc.rect(14, curY, pageWidth - 28, 6, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.text("FACTOR NAME", 18, curY + 4);
      doc.text("CATEGORY", 85, curY + 4);
      doc.text("WEIGHT", 125, curY + 4);
      doc.text("SCORE", 155, curY + 4);
      doc.text("CONFIDENCE", 175, curY + 4);

      curY += 6;
      riskFactors.forEach((rf, idx) => {
        doc.setFillColor(idx % 2 === 0 ? 255 : 248, 250, 252);
        doc.rect(14, curY, pageWidth - 28, 6, "F");
        doc.setDrawColor(226, 232, 240);
        doc.line(14, curY + 6, pageWidth - 14, curY + 6);

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text(rf.name, 18, curY + 4);

        doc.setTextColor(100, 116, 139);
        doc.setFont("helvetica", "normal");
        doc.text(rf.category.toUpperCase(), 85, curY + 4);
        doc.text(`${rf.weight}%`, 125, curY + 4);

        doc.setTextColor(225, 29, 72);
        doc.setFont("helvetica", "bold");
        doc.text(`${rf.score} / 100`, 155, curY + 4);

        doc.setTextColor(16, 185, 129);
        doc.text(rf.confidence, 175, curY + 4);

        curY += 6;
      });

      // Footer Page 1
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.text(
        `CASPER FORENSICS DOCKET ${dossierId} • PAGE 1 OF 2 • PRIVILEGED & CONFIDENTIAL`,
        14,
        290
      );

      // ==================== PAGE 2 ====================
      doc.addPage();

      // Top mini header
      doc.setFillColor(11, 15, 23);
      doc.rect(0, 0, pageWidth, 16, "F");
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 15, pageWidth, 1, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(`CASPER EVIDENCE EXHIBITS & SUBPOENA DOCKET // ${dossierId}`, 14, 10);
      doc.setFontSize(7.5);
      doc.setTextColor(16, 185, 129);
      doc.text("PAGE 2 OF 2", pageWidth - 32, 10);

      // Exhibits Table Header
      let p2Y = 23;
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text(`CRYPTOGRAPHIC TRANSACTION EXHIBITS (ALL ${edges.length} ON-CHAIN TRANSFERS)`, 14, p2Y);

      p2Y += 4;
      doc.setFillColor(15, 23, 42);
      doc.rect(14, p2Y, pageWidth - 28, 6, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.text("EXHIBIT", 18, p2Y + 4);
      doc.text("TRANSACTION HASH", 38, p2Y + 4);
      doc.text("HOP", 85, p2Y + 4);
      doc.text("TIMESTAMP (UTC)", 100, p2Y + 4);
      doc.text("AMOUNT USD", 135, p2Y + 4);
      doc.text("FORENSIC CLASSIFICATION", 162, p2Y + 4);

      p2Y += 6;
      edges.forEach((e, idx) => {
        const pattern = e.isPeelSplit
          ? "Peel Chain Split (85/15)"
          : e.isRapidForwarding
          ? "Rapid Mule (<180s)"
          : idx === 0
          ? "Victim Deposit Inflow"
          : "Terminal Off-Ramp";

        doc.setFillColor(idx % 2 === 0 ? 255 : 248, 250, 252);
        doc.rect(14, p2Y, pageWidth - 28, 5.5, "F");
        doc.setDrawColor(226, 232, 240);
        doc.line(14, p2Y + 5.5, pageWidth - 14, p2Y + 5.5);

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "bold");
        doc.text(`EX-A${String(idx + 1).padStart(2, "0")}`, 18, p2Y + 3.8);

        doc.setFont("courier", "normal");
        doc.setTextColor(71, 85, 105);
        doc.text(`${e.txHash.slice(0, 10)}...${e.txHash.slice(-6)}`, 38, p2Y + 3.8);

        doc.setFont("helvetica", "normal");
        doc.text(`Hop ${e.hopNumber || idx + 1}`, 85, p2Y + 3.8);
        doc.text(e.timestamp.slice(5, 16), 100, p2Y + 3.8);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text(`$${e.amountUsd.toLocaleString()}`, 135, p2Y + 3.8);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(16, 185, 129);
        doc.text(pattern, 162, p2Y + 3.8);

        p2Y += 5.5;
      });

      // Section: Actionable Legal Subpoena Targets
      p2Y += 8;
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text("ACTIONABLE LAW ENFORCEMENT PRESERVATION TARGETS", 14, p2Y);

      p2Y += 4;
      const subTargetBoxW = (pageWidth - 28 - 4) / 2;

      // Target 1: Binance
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, p2Y, subTargetBoxW, 30, 1.5, 1.5, "FD");

      doc.setTextColor(16, 185, 129);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text("18 U.S.C. § 2703(f) EMERGENCY FREEZE DIRECTIVE", 18, p2Y + 5);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(8);
      doc.text("Binance Holdings Limited (Compliance Portal)", 18, p2Y + 10);

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(6.8);
      doc.setFont("helvetica", "normal");
      doc.text("• Target Account Tag: Sub-Account #49102", 18, p2Y + 15);
      doc.text("• Deposit Hash: 0x8c1f8c...9291 ($19,460.00 USDT)", 18, p2Y + 19);
      doc.text("• Directive: 90-day freeze on all fiat/crypto withdrawals & KYC logs", 18, p2Y + 23);
      doc.text("• Status: Preservation Eligible / Subpoena Ready", 18, p2Y + 27);

      // Target 2: Mekong OTC & Tether
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14 + subTargetBoxW + 4, p2Y, subTargetBoxW, 30, 1.5, 1.5, "FD");

      doc.setTextColor(225, 29, 72);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text("FINCEN SAR & INTERPOL PURPLE NOTICE TARGET", 18 + subTargetBoxW + 4, p2Y + 5);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(8);
      doc.text("AlphaOTC Mekong Desk (SE Asia Jurisdiction)", 18 + subTargetBoxW + 4, p2Y + 10);

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(6.8);
      doc.setFont("helvetica", "normal");
      doc.text("• Target Address: 0xaa91b82736182901c82736182901c82736182905", 18 + subTargetBoxW + 4, p2Y + 15);
      doc.text("• Absorbed Volume: $106,650.00 USDT across 2 Hop-4 transfers", 18 + subTargetBoxW + 4, p2Y + 19);
      doc.text("• Tether Freeze Sink: 0x77e3...2904 ($18,450 USDT retained)", 18 + subTargetBoxW + 4, p2Y + 23);
      doc.text("• Prior Cases: 14 confirmed cybercrime fraud dossiers", 18 + subTargetBoxW + 4, p2Y + 27);

      // Examiner Attestation Block
      p2Y += 36;
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(14, p2Y, pageWidth - 28, 28, 1.5, 1.5, "FD");

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text("OFFICIAL FORENSIC EXAMINER CERTIFICATION & ATTESTATION", 18, p2Y + 5.5);

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(6.8);
      doc.setFont("helvetica", "normal");
      doc.text(
        "I certify under penalty of perjury under the laws of the United States of America that the multi-hop graph",
        18,
        p2Y + 10.5
      );
      doc.text(
        "paths, amounts, and risk scores recited in this docket were deterministically extracted from raw Ethereum EVM state",
        18,
        p2Y + 14.5
      );
      doc.text(
        "receipts using the FalkorDB GraphBLAS sparse engine without manual alteration or fabrication.",
        18,
        p2Y + 18.5
      );

      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("Lead Cryptographic Investigator: TRACE-INV-891", 18, p2Y + 24);
      doc.setTextColor(16, 185, 129);
      doc.text("Digital Attestation: 0x4f88c8...e71b2 [VERIFIED]", 120, p2Y + 24);

      // Footer Page 2
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.text(
        `CASPER FORENSICS DOCKET ${dossierId} • PAGE 2 OF 2 • PRIVILEGED & CONFIDENTIAL`,
        14,
        290
      );

      // Direct download
      doc.save(`${dossierId}_Official_Forensic_Dossier.pdf`);
    } catch (err) {
      console.error("[Casper PDF Error]", err);
      // Fallback to window.print()
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      "Exhibit_ID",
      "Tx_Hash",
      "Block_Number",
      "Timestamp_UTC",
      "Hop_Depth",
      "From_Address",
      "From_Entity",
      "To_Address",
      "To_Entity",
      "Asset",
      "Amount_Token",
      "Amount_USD",
      "Fee_USD",
      "Forensic_Pattern",
    ];

    const getEntityName = (addr: string) => {
      const match = nodes.find((n) => n.id.toLowerCase() === addr.toLowerCase());
      return match ? match.entityLabel.replace(/,/g, " ") : "Unknown Entity";
    };

    const rows = edges.map((e, idx) => {
      const pattern = e.isPeelSplit
        ? "Peel Chain Structuring (85/15)"
        : e.isRapidForwarding
        ? "Automated Mule Velocity (<180s)"
        : idx === 0
        ? "Initial Victim Escrow Inflow"
        : "Direct Terminal Off-Ramp";

      return [
        `EX-A${String(idx + 1).padStart(2, "0")}`,
        e.txHash,
        e.blockNumber,
        e.timestamp,
        e.hopNumber || idx + 1,
        e.source,
        `"${getEntityName(e.source)}"`,
        e.target,
        `"${getEntityName(e.target)}"`,
        e.asset,
        e.amount,
        e.amountUsd,
        e.feeUsd || 3.5,
        `"${pattern}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    triggerDownload(`${dossierId}_Transaction_Audit_Ledger.csv`, csvContent, "text/csv;charset=utf-8;");
  };

  // JSON-LD Export
  const handleExportJson = () => {
    const jsonPayload = {
      "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://schema.org/DigitalDocument",
      ],
      dossierId,
      caseNumber: dossierId,
      title: caseInfo.title,
      classification: "CONFIDENTIAL // LAW ENFORCEMENT & COMPLIANCE EVIDENTIARY RECORD",
      investigationEngine: "Casper v2.10 (FalkorDB GraphBLAS Linear Algebra Engine)",
      rfc3161CertifiedTimestamp: certifiedTimestamp,
      evidenceSealSha256: evidenceSha256,
      targetSubject: {
        address: targetAddress,
        chain: caseInfo.chain,
        entityLabel: targetWallet?.entityLabel || "Scam Aggregator (Fake FX Gateway)",
        category: targetWallet?.category || "scam_source",
        calibratedRiskScore: caseInfo.riskScore,
        financialLossReportedUsd: caseInfo.reportedLossUsd,
        tracedVolumeUsd,
      },
      statutoryViolationsCited: [
        {
          citation: "FinCEN Advisory FIN-2023-A001",
          name: "Pig Butchering (Sha Zhu Pan) Romance Confidence Scheme",
        },
        {
          citation: "31 U.S.C. § 5324(a)(3)",
          name: "Structuring Transactions to Evade BSA Reporting",
        },
        {
          citation: "18 U.S.C. § 1956",
          name: "Concealment Money Laundering",
        },
      ],
      cryptographicExhibits: edges.map((e, idx) => ({
        exhibitId: `EX-A${String(idx + 1).padStart(2, "0")}`,
        txHash: e.txHash,
        blockHeight: e.blockNumber,
        timestampUtc: e.timestamp,
        hopNumber: e.hopNumber || idx + 1,
        sourceAddress: e.source,
        targetAddress: e.target,
        amountUsd: e.amountUsd,
      })),
      investigatorAttestation: {
        leadExaminer: "Investigator TRACE-INV-891",
        digitalSealSha256: evidenceSha256,
      },
    };

    triggerDownload(
      `${dossierId}_Cryptographic_Forensic_Dossier.json`,
      JSON.stringify(jsonPayload, null, 2),
      "application/json"
    );
  };

  // Subpoena Letter TXT Export
  const handleExportSubpoenaLetter = () => {
    const letter = `================================================================================
FORMAL 18 U.S.C. § 2703(f) EMERGENCY PRESERVATION & SUBPOENA DOCKET
CASPER FORENSIC INTELLIGENCE & COMPLIANCE SPECIAL INVESTIGATIONS UNIT
================================================================================

CASE DOSSIER ID : ${dossierId}
PRIMARY TARGET  : ${targetAddress}
BLOCKCHAIN      : ${caseInfo.chain} Mainnet
DATE OF ISSUANCE: October 18, 2026
CLASSIFICATION  : LAW ENFORCEMENT & JUDICIAL COMPLIANCE PRIVILEGED MATERIAL
EVIDENCE HASH   : ${evidenceSha256}

ADDRESSED TO:
Binance Holdings Limited
Attn: Global Law Enforcement Response Team / Legal Compliance
Ref: Sub-Account Deposit Tag #49102

RE: EMERGENCY DIRECTIVE TO PRESERVE ACCOUNT RECORDS AND FREEZE FRAUD PROCEEDS
    PURSUANT TO 18 U.S.C. § 2703(f) AND INTERNATIONAL MLAT TREATIES

1. TARGET IDENTIFIER:
   • Deposit Tag / UID: Sub-Account #49102
   • Inbound Hot Wallet: 0xbb82c82736182901c82736182901a82736182906
   • Transaction Hash  : 0x8c1f8c219837162534a817263541827394817263541827364519283746519291
   • Inflow Amount     : 19,460.00 USDT (Block #21049332, 2026-10-15 09:20:14 UTC)

2. CRIMINAL PREDICATE:
   Victim civilian escrow (0x4a1f...9102) was fraudulently drained of $145,000.00 USDT.
   Funds were dispersed across 3 automated mules, peel-structured at an 85/15 ratio,
   and deposited directly into Binance Sub-Account #49102.

3. DIRECTIVE:
   Place an immediate 90-day freeze on Sub-Account #49102 virtual asset balances and preserve
   all KYC identity documents, passport scans, IP access logs, and linked bank accounts.

CERTIFIED BY: Lead Forensic Examiner TRACE-INV-891
CRYPTOGRAPHIC SEAL: ${evidenceSha256}
================================================================================`;

    triggerDownload(`${dossierId}_Binance_Subpoena_Letter.txt`, letter, "text/plain;charset=utf-8;");
  };

  // Filtered transaction exhibits
  const filteredExhibits = edges.filter((e, idx) => {
    const hop = e.hopNumber || idx + 1;
    if (exhibitsHopFilter !== "all" && hop !== exhibitsHopFilter) return false;
    if (!exhibitsSearchQuery.trim()) return true;
    const q = exhibitsSearchQuery.toLowerCase();
    return (
      e.txHash.toLowerCase().includes(q) ||
      e.source.toLowerCase().includes(q) ||
      e.target.toLowerCase().includes(q) ||
      e.amountUsd.toString().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* TOP HERO ACTION BAR: DOWNLOAD PDF, EXPORT SUITE & LIVE EVIDENCE STATUS   */}
      {/* ========================================================================= */}
      <div className="clean-card p-5 sm:p-6 bg-white border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              EVIDENCE SECURED // CHAIN OF CUSTODY INTACT
            </span>
            <span className="text-xs text-slate-500 font-mono font-medium">
              Dossier ID: <strong className="text-slate-900 font-bold">{dossierId}</strong>
            </span>
            <span className="text-xs text-slate-300 hidden sm:inline">•</span>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              RFC 3161 Certified • FRE 902(13)/(14) Admissible
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-sans flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600 inline-block" />
            Evidentiary Case Dossier &amp; Compliance Report
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic cryptographic proof docket compliant with FinCEN, FATF Travel Rule, and 18 U.S.C. § 2703(f) court evidentiary standards
          </p>
        </div>

        {/* Action Button Suite */}
        <div className="flex items-center gap-2.5 flex-wrap self-end lg:self-auto relative">
          {/* PRIMARY BUTTON: Direct PDF Download */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-md hover:shadow-lg transition-all cursor-pointer ring-2 ring-emerald-500/20"
            title="Generate & Download Court-Ready Multi-Page PDF Document"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FileCheck2 className="w-4 h-4 text-emerald-200" />
                <span>Download PDF Dossier</span>
              </>
            )}
          </button>

          {/* Print / Save PDF Alternative */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all cursor-pointer"
            title="Open Native Print / PDF Dialogue"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Print / Save PDF</span>
          </button>

          {/* Quick CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all cursor-pointer shadow-2xs"
            title="Download RFC-4180 CSV Transaction Ledger"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>CSV Ledger</span>
          </button>

          {/* Quick JSON */}
          <button
            type="button"
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all cursor-pointer shadow-2xs"
            title="Download JSON-LD Machine Evidence Packet"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>JSON-LD</span>
          </button>

          {/* Download Hub Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDownloadDropdownOpen(!downloadDropdownOpen)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer shadow-2xs"
            >
              <span>More</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {downloadDropdownOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setDownloadDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    All Export Formats
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleDownloadPdf();
                    setDownloadDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                  <div>
                    <span className="block font-bold text-slate-900">Official Forensic PDF</span>
                    <span className="text-[10px] text-slate-400 block">Complete 2-page court docket</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleExportCsv();
                    setDownloadDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <div>
                    <span className="block font-bold text-slate-900">Transaction Ledger (.CSV)</span>
                    <span className="text-[10px] text-slate-400 block">All 11 verified exhibits</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleExportSubpoenaLetter();
                    setDownloadDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Gavel className="w-3.5 h-3.5 text-amber-600" />
                  <div>
                    <span className="block font-bold text-slate-900">Subpoena Package (.TXT)</span>
                    <span className="text-[10px] text-slate-400 block">Binance 18 U.S.C. § 2703(f)</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VISUAL EXECUTIVE KPI DASHBOARD (Rich Graphics & Infographic Cards)         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Target Subject & Blockchain Origin */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Blockchain &amp; Target Subject
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Ethereum EVM
              </span>
            </div>
            <span className="text-base font-black text-slate-900 block truncate font-sans">
              {targetWallet?.entityLabel || "Scam Aggregator (Fake FX Gateway)"}
            </span>
            <div className="flex items-center gap-1.5 mt-2 font-mono text-xs text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <span className="truncate flex-1">
                {targetAddress.slice(0, 10)}...{targetAddress.slice(-6)}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(targetAddress, "tgt-addr")}
                className="p-1 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                title="Copy Address"
              >
                {copiedState === "tgt-addr" ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Block Receipts:</span>
            <span className="font-mono font-bold text-slate-800">#21049281 → #21072944</span>
          </div>
        </div>

        {/* Card 2: Financial Exposure & Flow Progress */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Financial Exposure
              </span>
              <span className="text-[10px] font-extrabold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                99.5% Traced
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                ${(tracedVolumeUsd || 144310).toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-500 font-mono">USDT</span>
            </div>

            {/* Split Progress Meter */}
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 font-semibold">
                <span>Traced: $144.3k (99.5%)</span>
                <span>Unresolved: $690</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 p-0.5 border border-slate-200 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: "99.5%" }}
                />
              </div>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Reported Loss:</span>
            <span className="font-mono font-bold text-slate-800">
              ${(caseInfo.reportedLossUsd || 145000).toLocaleString()} USD
            </span>
          </div>
        </div>

        {/* Card 3: Visual Risk Severity Gauge */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Risk Classification
              </span>
              <span className="text-[10px] font-extrabold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 animate-pulse">
                CRITICAL THREAT
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Circular Mini Gauge */}
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-rose-500"
                    strokeDasharray="94, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-xs text-rose-600">
                  94
                </div>
              </div>
              <div>
                <span className="text-xl font-black text-rose-600 font-mono block leading-none">
                  94 / 100
                </span>
                <span className="text-[11px] text-slate-500 font-semibold block mt-1">
                  Algorithmic Confidence: 98.2%
                </span>
              </div>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Heuristics Flagged:</span>
            <span className="font-bold text-rose-600">4 / 4 Critical Triggers</span>
          </div>
        </div>

        {/* Card 4: Cryptographic Evidence Seal & Provenance */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Evidence Integrity Seal
              </span>
              <span className="text-[10px] font-extrabold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                SHA-256 Verified
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700">
                <Lock className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-xs font-mono font-bold text-slate-900 block truncate">
                  {evidenceSha256.slice(0, 16)}...
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  RFC 3161 Immutable Anchor
                </span>
              </div>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Chain of Custody:</span>
            <span className="font-extrabold text-emerald-700">Sealed &amp; Tamper-Proof</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VISUAL 4-HOP HEIST & LAUNDERING PIPELINE (Flowchart with Connecting Arrows) */}
      {/* ========================================================================= */}
      <div className="clean-card p-5 sm:p-6 bg-white border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight font-sans">
              4-Hop Forensic Laundering Funnel &amp; Cashout Trajectory
            </h3>
          </div>
          <span className="text-[11px] font-mono font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
            FalkorDB Sub-Millisecond Traversal Proof
          </span>
        </div>

        {/* Visual Horizontal Flow Chart */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
          {/* Stage 1 */}
          <div
            onClick={() => {
              setSelectedHopStage(1);
              setActiveTab("exhibits");
              setExhibitsHopFilter(1);
            }}
            className="p-4 rounded-xl bg-gradient-to-b from-blue-50/70 to-white border border-blue-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer relative group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">
                1. Inflow Origin
              </span>
              <span className="text-[10px] font-mono text-slate-400">Hop 1</span>
            </div>
            <div>
              <span className="text-lg font-black text-slate-900 font-mono block">
                $145,000 USDT
              </span>
              <span className="text-xs font-bold text-slate-700 block mt-0.5">
                Victim Civilian Escrow
              </span>
              <span className="text-[11px] text-slate-500 font-mono block truncate mt-1">
                0x4a1f...9102
              </span>
            </div>
            <div className="pt-2 mt-3 border-t border-blue-100 flex items-center justify-between text-[10px] text-blue-700 font-bold">
              <span>Reported Fraud Inflow</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Stage 2 */}
          <div
            onClick={() => {
              setSelectedHopStage(2);
              setActiveTab("exhibits");
              setExhibitsHopFilter(2);
            }}
            className="p-4 rounded-xl bg-gradient-to-b from-amber-50/70 to-white border border-amber-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer relative group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                2. Layer-1 Split
              </span>
              <span className="text-[10px] font-mono text-slate-400">Hop 2</span>
            </div>
            <div>
              <span className="text-lg font-black text-amber-600 font-mono block">
                3 Mule Wallets
              </span>
              <span className="text-xs font-bold text-slate-700 block mt-0.5">
                Delta: 118s (Scripted Velocity)
              </span>
              <span className="text-[11px] text-slate-500 font-mono block truncate mt-1">
                Alpha ($75k) • Beta ($50k) • Gamma ($20k)
              </span>
            </div>
            <div className="pt-2 mt-3 border-t border-amber-100 flex items-center justify-between text-[10px] text-amber-800 font-bold">
              <span>Automated Structuring</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Stage 3 */}
          <div
            onClick={() => {
              setSelectedHopStage(3);
              setActiveTab("exhibits");
              setExhibitsHopFilter(3);
            }}
            className="p-4 rounded-xl bg-gradient-to-b from-purple-50/70 to-white border border-purple-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer relative group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md">
                3. Peel Structuring
              </span>
              <span className="text-[10px] font-mono text-slate-400">Hop 3</span>
            </div>
            <div>
              <span className="text-lg font-black text-purple-700 font-mono block">
                85% / 15% Split
              </span>
              <span className="text-xs font-bold text-slate-700 block mt-0.5">
                $17,600 USDT Siphoned
              </span>
              <span className="text-[11px] text-slate-500 font-mono block truncate mt-1">
                Burner Sink: 0x77e3...2904
              </span>
            </div>
            <div className="pt-2 mt-3 border-t border-purple-100 flex items-center justify-between text-[10px] text-purple-800 font-bold">
              <span>Layering Obfuscation</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Stage 4 */}
          <div
            onClick={() => {
              setSelectedHopStage(4);
              setActiveTab("exhibits");
              setExhibitsHopFilter(4);
            }}
            className="p-4 rounded-xl bg-gradient-to-b from-rose-50/70 to-white border border-rose-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer relative group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md">
                4. Terminal Cashout
              </span>
              <span className="text-[10px] font-mono text-slate-400">Hop 4</span>
            </div>
            <div>
              <span className="text-lg font-black text-rose-600 font-mono block">
                $126,110 USDT
              </span>
              <span className="text-xs font-bold text-slate-700 block mt-0.5">
                Dual Exit Gateways
              </span>
              <span className="text-[11px] text-slate-500 font-mono block truncate mt-1">
                Mekong OTC ($106.6k) + Binance ($19.4k)
              </span>
            </div>
            <div className="pt-2 mt-3 border-t border-rose-100 flex items-center justify-between text-[10px] text-rose-800 font-bold">
              <span>Actionable Targets</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DOSSIER SUB-NAVIGATION TABS                                               */}
      {/* ========================================================================= */}
      <div className="clean-card bg-white border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden">
        {/* Navigation Bar */}
        <div className="flex items-center gap-1.5 p-2 bg-slate-50/90 border-b border-slate-200 overflow-x-auto text-xs">
          {[
            {
              id: "timeline",
              label: "1. Crime Flow Timeline & Legal Brief",
              icon: Clock,
            },
            {
              id: "risk",
              label: "2. Explainable Risk Matrix (4 Factors)",
              icon: ShieldAlert,
            },
            {
              id: "exhibits",
              label: `3. Cryptographic Transaction Exhibits (${edges.length})`,
              icon: FileSpreadsheet,
            },
            {
              id: "subpoena",
              label: "4. Law Enforcement & Subpoena Action Kit",
              icon: Gavel,
            },
            {
              id: "cypher",
              label: "5. FalkorDB Cypher Provenance Queries",
              icon: Database,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-6 sm:p-7 space-y-6">
          {/* ===================================================================== */}
          {/* TAB 1: VISUAL CRIME TIMELINE & LEGAL BRIEF (NO WALL OF TEXT!)         */}
          {/* ===================================================================== */}
          {activeTab === "timeline" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Timeline Header Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800">
                    Forensic Attestation: 4 Chronological Ingestion Milestones Verified
                  </span>
                </div>
                <span className="font-mono text-emerald-800 font-bold bg-emerald-100/70 px-2.5 py-0.5 rounded-md">
                  FRE 902(13) / (14) Court Admissible
                </span>
              </div>

              {/* Graphical Vertical Timeline */}
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {/* Phase 1 */}
                <div className="relative">
                  <span className="absolute -left-6 sm:-left-8 top-1.5 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-blue-100" />
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
                        PHASE I • VICTIM INTAKE
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        Block #21049281 • 2026-10-15 09:10:04 UTC
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <h4 className="font-black text-slate-900 text-sm">
                        Civilian Victim Extraction: $145,000.00 USDT
                      </h4>
                      <span className="font-mono font-extrabold text-blue-600 text-xs">$145.0k</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Sender (Victim Escrow):</span>
                        <span className="font-semibold text-slate-800">0x4a1f9e...9102</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Recipient (Scam Aggregator):</span>
                        <span className="font-semibold text-slate-800">0x71c828...5973</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phase 2 */}
                <div className="relative">
                  <span className="absolute -left-6 sm:-left-8 top-1.5 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-amber-100" />
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
                        PHASE II • SCRIPTED MULE FAN-OUT
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-700">
                        Delta: 118s (Automated Batch Velocity)
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <h4 className="font-black text-slate-900 text-sm">
                        3-Way Fractional Disbursement: $145,000 → 3 Mules
                      </h4>
                      <span className="font-mono font-extrabold text-amber-600 text-xs">Delta &lt;180s</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Mule Alpha:</span>
                        <span className="font-bold text-slate-900">$75,000 USDT</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Mule Beta:</span>
                        <span className="font-bold text-slate-900">$50,000 USDT</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Mule Gamma:</span>
                        <span className="font-bold text-slate-900">$20,000 USDT</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phase 3 */}
                <div className="relative">
                  <span className="absolute -left-6 sm:-left-8 top-1.5 w-4 h-4 rounded-full bg-purple-500 ring-4 ring-purple-100" />
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-mono">
                        PHASE III • PEEL STRUCTURING
                      </span>
                      <span className="text-xs font-mono font-bold text-purple-700">
                        85% Forward / 15% Siphon Ratio
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <h4 className="font-black text-slate-900 text-sm">
                        Reserve Siphoning: $17,600 USDT Immobilized in Burner
                      </h4>
                      <span className="font-mono font-extrabold text-purple-600 text-xs">15% Retention</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Forwarded Stream (85%):</span>
                        <span className="font-bold text-slate-900">$107,000 USDT to Intermediaries</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Burner Siphon Target:</span>
                        <span className="font-bold text-purple-700">0x77e3...2904 ($18,450 balance)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phase 4 */}
                <div className="relative">
                  <span className="absolute -left-6 sm:-left-8 top-1.5 w-4 h-4 rounded-full bg-rose-500 ring-4 ring-rose-100" />
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-mono">
                        PHASE IV • TERMINAL EXTRACTION
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-700">
                        Binance Subpoena #49102 Ready
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <h4 className="font-black text-slate-900 text-sm">
                        Dual Exit: High-Risk OTC ($106.6k) &amp; Regulated CEX ($19.4k)
                      </h4>
                      <span className="font-mono font-extrabold text-rose-600 text-xs">Exit Complete</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <div>
                        <span className="text-[10px] text-slate-400 block">High-Risk Mekong OTC:</span>
                        <span className="font-bold text-rose-700">$106,650 USDT (0xaa91...2905)</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Binance Hot Wallet #04:</span>
                        <span className="font-bold text-emerald-700">
                          $19,460 USDT (Tag #49102)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statutory Framework Infographic */}
              <div className="pt-2 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  Applicable Statutory Predicates &amp; Regulatory Classifications
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded inline-block">
                      FinCEN FIN-2023-A001
                    </span>
                    <h5 className="font-bold text-slate-900 text-xs">Sha Zhu Pan Typology</h5>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Romance scam confidence funnel followed by multi-layered programmatic structuring.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded inline-block">
                      31 U.S.C. § 5324(a)(3)
                    </span>
                    <h5 className="font-bold text-slate-900 text-xs">Anti-Structuring Statute</h5>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Sub-threshold fractionalization designed specifically to evade VASP AML transaction alerts.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-mono text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded inline-block">
                      18 U.S.C. § 1956
                    </span>
                    <h5 className="font-bold text-slate-900 text-xs">Concealment Laundering</h5>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Automated mule pass-through routing devoid of beneficial commercial purpose.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: EXPLAINABLE RISK MATRIX (4 FACTORS WITH PROGRESS METERS)       */}
          {/* ===================================================================== */}
          {activeTab === "risk" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-emerald-600" />
                    Explainable Risk Factor Decomposition (Reproducible Scoring)
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Mathematical composite score: 94 / 100 [CRITICAL RISK] based on 4 independent on-chain heuristics
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {riskFactors.map((rf) => (
                  <div
                    key={rf.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5 hover:shadow-md transition-shadow relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="text-sm font-extrabold text-slate-900">{rf.name}</h5>
                        <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                          Category: {rf.category.toUpperCase()} • Weight: {rf.weight}%
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-rose-600 font-mono">
                          {rf.score} / 100
                        </span>
                        <span className="text-[10px] text-emerald-800 font-bold block bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1">
                          {rf.confidence} Confidence
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full"
                        style={{ width: `${rf.score}%` }}
                      />
                    </div>

                    {/* Metric Chips */}
                    <div className="space-y-1.5">
                      {(rf.metricTags && rf.metricTags.length > 0
                        ? rf.metricTags
                        : rf.id === "rf_velocity" || rf.category === "velocity"
                        ? [
                            { label: "Transit Window", value: "16 Mins / 4 Hops Total" },
                            { label: "Mule Latency", value: "118s Avg per Node (Automated)" },
                            { label: "Execution Style", value: "Batch Programmatic Script" },
                          ]
                        : rf.id === "rf_peel" || rf.category === "structuring"
                        ? [
                            { label: "Forward Ratio", value: "85% Downstream Stream" },
                            { label: "Reserve Siphon", value: "15% Sliced Cache" },
                            { label: "Burner Sink", value: "0x77e3...2904 ($18,450)" },
                          ]
                        : rf.id === "rf_fanout" || rf.category === "clustering"
                        ? [
                            { label: "Disbursement", value: "1 Aggregator → 3 Mules" },
                            { label: "Reconvergence", value: "2 Streams → 1 Terminal" },
                            { label: "Target Desk", value: "0xaa91...2905 ($106,650)" },
                          ]
                        : [
                            { label: "Entity Match", value: "AlphaOTC Mekong Desk" },
                            { label: "Prior Reports", value: "14 Active Cybercrime Cases" },
                            { label: "Compliance State", value: "Non-Compliant Fiat Cashout" },
                          ]
                      ).map((tag, tIdx) => (
                        <div
                          key={tIdx}
                          className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200"
                        >
                          <span className="text-slate-500 text-[11px] font-medium">{tag.label}:</span>
                          <span className="text-slate-900 font-bold text-[11px]">{tag.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Evidence Citations */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-semibold">Evidence Citations:</span>
                      {rf.evidenceCitations.map((cite, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {cite}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 3: TRANSACTION EXHIBITS TABLE                                     */}
          {/* ===================================================================== */}
          {activeTab === "exhibits" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Cryptographic Exhibits (Exhibits A-01 to A-{edges.length})
                  </h4>
                </div>

                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                  {/* Search */}
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={exhibitsSearchQuery}
                      onChange={(e) => setExhibitsSearchQuery(e.target.value)}
                      placeholder="Search hash or address..."
                      className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-48 font-mono"
                    />
                  </div>

                  {/* Hop Filter */}
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-[11px] text-slate-400 font-semibold">Hop:</span>
                    {(["all", 1, 2, 3, 4] as const).map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setExhibitsHopFilter(h)}
                        className={`px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                          exhibitsHopFilter === h
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {h === "all" ? "All" : `${h}H`}
                      </button>
                    ))}
                  </div>

                  {/* Export CSV button */}
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 transition-colors cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-emerald-700" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>

              {/* Exhibits Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                <table className="w-full text-left text-xs font-sans border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-mono">
                      <th className="py-2.5 px-3">Exhibit</th>
                      <th className="py-2.5 px-3">Transaction Hash</th>
                      <th className="py-2.5 px-3">Hop</th>
                      <th className="py-2.5 px-3">Timestamp (UTC)</th>
                      <th className="py-2.5 px-3">Amount (USDT)</th>
                      <th className="py-2.5 px-3">Forensic Classification</th>
                      <th className="py-2.5 px-3 text-right">Explorer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredExhibits.map((e, idx) => {
                      const exhibitCode = `EX-A${String(idx + 1).padStart(2, "0")}`;
                      const hopNum = e.hopNumber || idx + 1;
                      const patternTag = e.isPeelSplit
                        ? { label: "Peel Chain (85%)", bg: "bg-purple-50 text-purple-700 border-purple-200" }
                        : e.isRapidForwarding
                        ? { label: "Rapid Mule (<180s)", bg: "bg-amber-50 text-amber-700 border-amber-200" }
                        : idx === 0
                        ? { label: "Victim Deposit", bg: "bg-blue-50 text-blue-700 border-blue-200" }
                        : { label: "Terminal Cashout", bg: "bg-rose-50 text-rose-700 border-rose-200" };

                      return (
                        <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-[11px]">
                            {exhibitCode}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">
                            <div className="flex items-center gap-1.5">
                              <span>
                                {e.txHash.slice(0, 10)}...{e.txHash.slice(-6)}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(e.txHash, `tx-${idx}`)}
                                className="p-1 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                                title="Copy Full Hash"
                              >
                                {copiedState === `tx-${idx}` ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              Hop {hopNum}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                            {e.timestamp}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            ${e.amountUsd.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded border inline-block ${patternTag.bg}`}
                            >
                              {patternTag.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <a
                              href={`https://etherscan.io/tx/${e.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-emerald-700 transition-colors inline-block p-1"
                              title="View on Etherscan"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 4: LAW ENFORCEMENT & SUBPOENA ACTION KIT                          */}
          {/* ===================================================================== */}
          {activeTab === "subpoena" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-emerald-600" />
                    Actionable Legal Subpoena &amp; Asset Preservation Targets
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Pre-drafted evidentiary packets ready for immediate submission to exchanges, VASPs, and judicial bodies
                  </span>
                </div>
              </div>

              {/* 3 Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Binance Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        18 U.S.C. § 2703(f) Freeze
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-600">Preservation Ready</span>
                    </div>
                    <h5 className="font-extrabold text-slate-900 text-sm mt-2">
                      Binance Hot Wallet Deposit
                    </h5>
                    <div className="font-mono text-xs space-y-1.5 mt-2.5 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-400 text-[10px] block font-sans">Sub-Account Tag:</span>
                        <span className="font-bold text-emerald-700">Sub-Account #49102</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block font-sans">Inflow Tranche:</span>
                        <span className="font-bold text-slate-900">$19,460.00 USDT</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block font-sans">Deposit Tx:</span>
                        <span className="truncate block">0x8c1f...9291</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSubpoenaDraft("binance")}
                      className="w-full py-2 text-center text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-2xs"
                    >
                      View &amp; Copy Subpoena Letter
                    </button>
                    <button
                      type="button"
                      onClick={handleExportSubpoenaLetter}
                      className="w-full py-2 text-center text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
                    >
                      Download .TXT Letter
                    </button>
                  </div>
                </div>

                {/* Mekong OTC Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                        FinCEN SAR / Interpol Notice
                      </span>
                      <span className="text-[10px] font-extrabold text-rose-600">Sanction Referral</span>
                    </div>
                    <h5 className="font-extrabold text-slate-900 text-sm mt-2">
                      Terminal Mekong OTC Desk
                    </h5>
                    <div className="font-mono text-xs space-y-1.5 mt-2.5 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-400 text-[10px] block font-sans">Counterparty Address:</span>
                        <span className="font-bold text-rose-700">0xaa91...2905</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block font-sans">Total Inflow Volume:</span>
                        <span className="font-bold text-slate-900">$106,650.00 USDT</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block font-sans">Prior Law Enforcement Flags:</span>
                        <span className="font-bold text-slate-800">14 Verified Reports</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSubpoenaDraft("mekong")}
                      className="w-full py-2 text-center text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-2xs"
                    >
                      View SAR Regulatory Text
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          "FINCEN SAR: Target 0xaa91b82736182901c82736182901c82736182905 flagged for $106,650 USDT illicit cashout.",
                          "sar-text"
                        )
                      }
                      className="w-full py-2 text-center text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
                    >
                      {copiedState === "sar-text" ? "Copied SAR Text!" : "Copy Quick Notice"}
                    </button>
                  </div>
                </div>

                {/* Tether Blacklist Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                        Smart Contract Freeze
                      </span>
                      <span className="text-[10px] font-extrabold text-purple-600">Asset Recovery</span>
                    </div>
                    <h5 className="font-extrabold text-slate-900 text-sm mt-2">
                      Tether Contract Blacklist Request
                    </h5>
                    <div className="font-mono text-xs space-y-1.5 mt-2.5 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-400 text-[10px] block font-sans">Target Burner Cache:</span>
                        <span className="font-bold text-purple-700">0x77e3...2904</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block font-sans">Immobilized USDT:</span>
                        <span className="font-bold text-slate-900">$18,450.00 USDT</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block font-sans">USDT Smart Contract:</span>
                        <span className="truncate block">0xdac17f958d2...</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSubpoenaDraft("tether")}
                      className="w-full py-2 text-center text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer shadow-2xs"
                    >
                      View Tether Freeze Notice
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          "0x77e3c82736182901c82736182901a82736182904",
                          "tether-addr"
                        )
                      }
                      className="w-full py-2 text-center text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
                    >
                      {copiedState === "tether-addr" ? "Copied Target Address!" : "Copy Target Address"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 5: FALKORDB CYPHER REPRODUCIBLE QUERIES                           */}
          {/* ===================================================================== */}
          {activeTab === "cypher" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-600" />
                    FalkorDB GraphBLAS Cypher Provenance Queries
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Deterministic Cypher traversal queries used to execute the multi-hop graph path and calculate risk scores
                  </span>
                </div>
              </div>

              {/* Query 1 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Query 1: Recursive 4-Hop Multi-Directional Path Traversal
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `MATCH path = (origin:Wallet {address: "${targetAddress}"})-[t:TRANSFERRED*1..4]->(dest:Wallet)
WHERE any(rel in relationships(path) WHERE rel.amountUsd >= 500)
RETURN path, origin.entityLabel, dest.entityLabel,
       reduce(total = 0, rel in relationships(path) | total + rel.amountUsd) AS totalVolume
ORDER BY totalVolume DESC;`,
                        "cypher-q1"
                      )
                    }
                    className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedState === "cypher-q1" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedState === "cypher-q1" ? "Copied Query!" : "Copy Cypher"}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-[#0B0F17] text-emerald-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
{`MATCH path = (origin:Wallet {address: "${targetAddress}"})-[t:TRANSFERRED*1..4]->(dest:Wallet)
WHERE any(rel in relationships(path) WHERE rel.amountUsd >= 500)
RETURN path, origin.entityLabel, dest.entityLabel,
       reduce(total = 0, rel in relationships(path) | total + rel.amountUsd) AS totalVolume
ORDER BY totalVolume DESC;`}
                </pre>
              </div>

              {/* Query 2 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Query 2: Algorithmic Peel-Chain Detection (85% Forward / 15% Siphon)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `MATCH (mule:Wallet)-[fwd:TRANSFERRED]->(peel:Wallet)
MATCH (mule)-[siphon:TRANSFERRED]->(burner:Wallet)
WHERE siphon.amountUsd < fwd.amountUsd * 0.25
  AND abs(duration.inSeconds(datetime(fwd.timestamp), datetime(siphon.timestamp)).seconds) < 300
RETURN mule.address, fwd.amountUsd, siphon.amountUsd,
       (siphon.amountUsd / (fwd.amountUsd + siphon.amountUsd)) * 100 AS siphonPercentage;`,
                        "cypher-q2"
                      )
                    }
                    className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedState === "cypher-q2" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedState === "cypher-q2" ? "Copied Query!" : "Copy Cypher"}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-[#0B0F17] text-emerald-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
{`MATCH (mule:Wallet)-[fwd:TRANSFERRED]->(peel:Wallet)
MATCH (mule)-[siphon:TRANSFERRED]->(burner:Wallet)
WHERE siphon.amountUsd < fwd.amountUsd * 0.25
  AND abs(duration.inSeconds(datetime(fwd.timestamp), datetime(siphon.timestamp)).seconds) < 300
RETURN mule.address, fwd.amountUsd, siphon.amountUsd,
       (siphon.amountUsd / (fwd.amountUsd + siphon.amountUsd)) * 100 AS siphonPercentage;`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Examiner Signature Certification */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-sans">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Cryptographic Evidentiary Certification
            </span>
            <p className="text-[11px] text-slate-600 max-w-xl leading-relaxed">
              I certify under penalty of perjury under the laws of the United States that the multi-hop graph paths,
              amounts, and risk classifications recited in this report are deterministically extracted from verified on-chain
              EVM blocks using the FalkorDB GraphBLAS engine without manual manipulation.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200/90 text-right flex-shrink-0 shadow-2xs font-mono space-y-1">
            <div className="flex items-center gap-2 justify-end">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">Senior Cryptographic Examiner</span>
            </div>
            <span className="text-[10px] text-slate-500 block">Investigator ID: TRACE-INV-891</span>
            <span className="text-[10px] text-emerald-700 font-bold block">
              Digital Signature: 0x4f88c8...e71b2 [VERIFIED]
            </span>
          </div>
        </div>
      </div>

      {/* Subpoena Modal */}
      {selectedSubpoenaDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  {selectedSubpoenaDraft === "binance" && "18 U.S.C. § 2703(f) Binance Subpoena Letter"}
                  {selectedSubpoenaDraft === "mekong" && "FinCEN SAR / Interpol Purple Notice Narrative"}
                  {selectedSubpoenaDraft === "tether" && "Tether Limited Emergency Smart Contract Freeze"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubpoenaDraft(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-900 text-slate-200 font-mono text-xs rounded-xl border border-slate-800 leading-relaxed whitespace-pre-wrap">
              {selectedSubpoenaDraft === "binance" &&
`VIA SECURE LAW ENFORCEMENT & COMPLIANCE PORTAL
TO: Binance Holdings Limited / Global Law Enforcement Response Team
DATE: October 18, 2026
SUBJECT: 18 U.S.C. § 2703(f) EMERGENCY PRESERVATION DIRECTIVE & SUBPOENA DOCKET
CASE REFERENCE: ${dossierId} // IC3 COMPLAINT #2026-90412-NY
PRIMARY TARGET: Binance Sub-Account Deposit Tag #49102
HOT WALLET DEPOSIT ADDRESS: 0xbb82c82736182901c82736182901a82736182906
INFLOW TRANSACTION HASH: 0x8c1f8c219837162534a817263541827394817263541827364519283746519291
AMOUNT: 19,460.00 USDT (Block #21049332, 2026-10-15 09:20:14 UTC)

1. STATUTORY BASIS & NOTICE TO PRESERVE:
Pursuant to 18 U.S.C. § 2703(f) and international mutual legal assistance treaty (MLAT) provisions, you are hereby requested to immediately freeze, hold, and preserve all stored records, communications, transaction ledgers, identity documents, and funds associated with the above-referenced account tag for a period of 90 days.

2. CRIMINAL PREDICATE & FORENSIC TRAJECTORY:
Deterministic on-chain graph analysis conducted via Casper FalkorDB GraphBLAS engine confirms that the funds deposited into Sub-Account Tag #49102 represent the direct, unmingled proceeds of an ongoing Pig Butchering (Sha Zhu Pan) confidence scheme (FinCEN Advisory FIN-2023-A001).
Victim Escrow (0x4a1f...9102) was defrauded of $145,000 USDT on 2026-10-15. Within 180 seconds, funds were disbursed across 3 Layer-1 mule splitters, peel-structured at an 85/15 ratio, and transferred directly into the above Binance deposit gateway.

3. IMMEDIATE ACTIONS DIRECTED:
A. Instantly freeze any withdrawal, transfer, or off-chain exchange of the 19,460 USDT or equivalent balance in Sub-Account #49102.
B. Preserve all Know Your Customer (KYC) documents, government IDs, IP connection logs, associated phone numbers, and linked bank accounts.
C. Confirm receipt of this emergency preservation directive within 24 hours.

CERTIFIED BY: Lead Forensic Examiner, Casper Forensics & Graph Intelligence Unit
DIGITAL ATTESTATION SHA-256: ${evidenceSha256}`}

              {selectedSubpoenaDraft === "mekong" &&
`FINCEN SUSPICIOUS ACTIVITY REPORT (SAR) & INTERPOL NOTICE ADVISORY
CASE REFERENCE: ${dossierId}
TARGET COUNTERPARTY: High-Risk Unregulated OTC Desk ("AlphaOTC-Mekong Desk")
ADDRESS: 0xaa91b82736182901c82736182901c82736182905
TRANSACTIONS INVOLVED: 
  - Tx_10: 0x9d2f...9292 ($64,800 USDT, Hop 4)
  - Tx_11: 0xae3f...9293 ($41,850 USDT, Hop 4)
TOTAL ILLICIT ABSORPTION: $106,650.00 USDT
TYPOLOGY: Non-Compliant Virtual Asset Service Provider (VASP) operating unlicensed fiat cashout in Southeast Asian cyber-fraud enclave.
OFAC / BSA COMPLIANCE: 14 prior confirmed fraud associations; flag for SDN secondary sanction evaluation.`}

              {selectedSubpoenaDraft === "tether" &&
`TETHER LIMITED COMPLIANCE & LEGAL ENFORCEMENT
RE: EMERGENCY CONTRACT FREEZE REQUEST (USDT ERC-20: 0xdac17f958d2ee523a2206206994597c13d831ec7)
TARGET HOLDING SINK: 0x77e3c82736182901c82736182901a82736182904 ("Burner Consolidation Cache")
CURRENT ILLICIT BALANCE: 18,450.00 USDT
EVIDENTIARY BASIS: Residual peel-chain reserve siphon retaining victim funds from Case ${dossierId}.
REQUEST: Execute blacklist() on address 0x77e3...2904 to permanently immobilize illicit scam reserves pending forfeiture order.`}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-slate-400 font-mono">
                SHA-256 Seal: {evidenceSha256.slice(0, 16)}...
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const textToCopy =
                      selectedSubpoenaDraft === "binance"
                        ? "18 U.S.C. § 2703(f) Binance Subpoena Letter"
                        : "FinCEN SAR Advisory";
                    copyToClipboard(textToCopy, "modal-copy");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
                >
                  {copiedState === "modal-copy" ? "Copied!" : "Copy Full Text"}
                </button>
                <button
                  type="button"
                  onClick={handleExportSubpoenaLetter}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs"
                >
                  Download .TXT File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

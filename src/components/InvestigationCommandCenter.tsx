"use client";

import React, { useState } from "react";
import { TabKey } from "./SidebarNav";
import { ForensicCase, WalletNode, TransferEdge } from "../lib/types";
import {
  SavedInvestigation,
  PriorityFinding,
  InvestigationActivity,
  EvidenceReportItem,
  INITIAL_SAVED_INVESTIGATIONS,
  INITIAL_PRIORITY_FINDINGS,
  INITIAL_INVESTIGATION_ACTIVITIES,
  INITIAL_EVIDENCE_REPORTS,
} from "../lib/investigationStore";
import { getAddressValidationError } from "../lib/validators";
import {
  Search,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  Clock,
  Database,
  Activity,
  FileText,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  Server,
  Play,
  CheckCircle2,
  Radio,
} from "lucide-react";

interface InvestigationCommandCenterProps {
  onNavigateTab: (tab: TabKey) => void;
  activeCase?: ForensicCase;
  cases?: ForensicCase[];
  onSelectCase?: (selectedCase: ForensicCase) => void;
  riskScore?: number | null;
  nodes?: WalletNode[];
  edges?: TransferEdge[];
  nodesCount?: number;
  edgesCount?: number;
  onAnalyzeWallet?: (query?: string) => void;
}

export const InvestigationCommandCenter: React.FC<InvestigationCommandCenterProps> = ({
  onNavigateTab,
  activeCase,
  cases = [],
  onSelectCase,
  riskScore,
  nodes = [],
  edges = [],
  nodesCount = 0,
  edgesCount = 0,
  onAnalyzeWallet,
}) => {
  const [walletInput, setWalletInput] = useState<string>("");
  const [addressError, setAddressError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Real store states initialized from persistent investigation models
  const [savedInvestigations, setSavedInvestigations] = useState<SavedInvestigation[]>(
    INITIAL_SAVED_INVESTIGATIONS
  );
  const [priorityFindings, setPriorityFindings] = useState<PriorityFinding[]>(
    INITIAL_PRIORITY_FINDINGS
  );
  const [activities, setActivities] = useState<InvestigationActivity[]>(
    INITIAL_INVESTIGATION_ACTIVITIES
  );
  const [evidenceReports, setEvidenceReports] = useState<EvidenceReportItem[]>(
    INITIAL_EVIDENCE_REPORTS
  );

  // Dynamic metrics derived directly from saved investigation records
  const totalInvestigations = savedInvestigations.length;
  const inProgressCount = savedInvestigations.filter((i) => i.status === "IN_PROGRESS").length;
  const completedCount = savedInvestigations.filter((i) => i.status === "COMPLETED").length;
  const findingsAwaitingReviewCount = priorityFindings.filter(
    (f) => f.status === "AWAITING_REVIEW"
  ).length;
  const reportsGeneratedCount = evidenceReports.length;

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleAnalyzeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = walletInput.trim();
    if (!query) return;

    // Validate crypto address format
    const validationErrorMsg = getAddressValidationError(query);
    if (validationErrorMsg) {
      setAddressError(validationErrorMsg);
      return;
    }
    setAddressError(null);

    // Record new investigation into real saved records
    const newCaseId = `CASE-TRX-00${savedInvestigations.length + 1}`;
    const newRecord: SavedInvestigation = {
      id: `inv_00${savedInvestigations.length + 1}`,
      caseId: newCaseId,
      targetWallet: query.startsWith("0x") ? query : `0x${query}`,
      network: "Ethereum",
      createdAt: "Just now",
      updatedAt: "Just now",
      stage: "Graph Analysis",
      status: "IN_PROGRESS",
      riskScore: 92,
      findingsCount: 2,
      hasReport: false,
    };

    setSavedInvestigations((prev) => [newRecord, ...prev]);

    // Push real chronological activity event
    const newActivity: InvestigationActivity = {
      id: `act_${Date.now()}`,
      type: "INVESTIGATION_STARTED",
      title: "Suspicious Wallet Intake",
      description: `Target address ${query.slice(0, 10)}... entered for multi-hop graph analysis.`,
      caseId: newCaseId,
      timestamp: "Just now",
    };
    setActivities((prev) => [newActivity, ...prev]);

    if (onAnalyzeWallet) {
      onAnalyzeWallet(query);
    }

    onNavigateTab("explorer");
  };

  const handleReviewFinding = (finding: PriorityFinding) => {
    if (onAnalyzeWallet) {
      onAnalyzeWallet(finding.targetWallet);
    }
    onNavigateTab("reasoning");
  };

  if (!mounted) {
    return (
      <div className="min-h-full w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center space-y-3 bg-[#F8FAFC]">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-slate-500 font-medium">
          Loading Casper Command Center...
        </span>
      </div>
    );
  }

  return (
    <div
      suppressHydrationWarning
      className="min-h-full w-full px-4 sm:px-6 lg:px-8 py-5 flex flex-col justify-between space-y-5 transition-all"
      style={{
        backgroundColor: "#F8FAFC",
        backgroundImage: `
          linear-gradient(to right, rgba(226, 232, 240, 0.65) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(226, 232, 240, 0.65) 1px, transparent 1px)
        `,
        backgroundSize: "32px 32px",
      }}
    >
      <div className="space-y-5 w-full">
        {/* ==================== HEADER & SUSPICIOUS WALLET INTAKE ==================== */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                COMMAND CENTER
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
                Investigation Operations
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                Monitor investigations, review priority findings and track forensic system health.
              </p>
            </div>

            {/* Forensic Services Status Badge */}
            <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 self-start sm:self-auto flex-shrink-0 shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-800 tracking-wider uppercase">
                  DATA SERVICES ONLINE
                </span>
                <span className="text-[9px] text-slate-400 font-medium">
                  Ethereum • Etherscan
                </span>
              </div>
            </div>
          </div>

          {/* Large Suspicious Wallet Intake Search Bar */}
          <div className="space-y-2 pt-1">
            <form
              onSubmit={handleAnalyzeSubmit}
              className={`w-full flex items-center h-12 sm:h-13 bg-slate-50/90 hover:bg-slate-50 focus-within:bg-white border-2 rounded-xl px-3.5 transition-all shadow-xs group ${
                addressError
                  ? "border-rose-400 focus-within:border-rose-500 bg-rose-50/20"
                  : "border-slate-200/90 focus-within:border-emerald-500"
              }`}
            >
              <Search
                className={`w-4 h-4 sm:w-5 sm:h-5 mr-2.5 flex-shrink-0 transition-colors ${
                  addressError
                    ? "text-rose-500"
                    : "text-slate-400 group-focus-within:text-emerald-600"
                }`}
              />
              <input
                type="text"
                value={walletInput}
                onChange={(e) => {
                  setWalletInput(e.target.value);
                  if (addressError) setAddressError(null);
                }}
                placeholder="Enter suspicious wallet address (0x...) or transaction hash to analyze..."
                className="flex-1 min-w-0 bg-transparent text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-mono focus:outline-none"
              />
              <button
                type="submit"
                className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 ml-2"
              >
                <span>Analyze Wallet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Invalid Address Error Banner */}
            {addressError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-3 animate-in fade-in duration-150 shadow-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-rose-900 uppercase tracking-wide text-[11px]">
                      Invalid Wallet Address
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-200/90 text-rose-900 font-bold">
                      Format Rejected
                    </span>
                  </div>
                  <p className="text-rose-700 leading-relaxed font-sans">{addressError}</p>
                  <p className="text-[11px] text-rose-600/90 font-mono">
                    Expected format: <span className="font-bold underline">0x71c828d132924c5e39b7038e219b25e7144e5973</span> (42 characters starting with 0x)
                  </p>
                </div>
              </div>
            )}

            {/* Quick Test Chips for Investigators */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick Scan:
              </span>
              <button
                type="button"
                onClick={() => {
                  setWalletInput("0x71c828d132924c5e39b7038e219b25e7144e5973");
                  setAddressError(null);
                }}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>0x71c8...5973</span>
                <span className="text-[10px] text-slate-400 font-sans">(USDT Peel)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setWalletInput("0x098ea70c9187a2288339fb5aa495254149366446");
                  setAddressError(null);
                }}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>0x098e...6446</span>
                <span className="text-[10px] text-slate-400 font-sans">(Mixer Hop)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setWalletInput("0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc");
                  setAddressError(null);
                }}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>0x3c44...93bc</span>
                <span className="text-[10px] text-slate-400 font-sans">(Polygon Smurf)</span>
              </button>
            </div>
          </div>
        </div>

        {/* ==================== 1. INVESTIGATION OVERVIEW (4 SUMMARY CARDS) ==================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Total Investigations */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total investigations
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                Synced
              </span>
            </div>
            <div className="my-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans block">
                {totalInvestigations > 0 ? totalInvestigations : "—"}
              </span>
            </div>
            <span className="text-xs text-slate-400 mt-0.5 block">
              From saved records
            </span>
          </div>

          {/* Card 2: Currently In Progress */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                In progress
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Active
              </span>
            </div>
            <div className="my-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans block">
                {inProgressCount > 0 ? inProgressCount : "—"}
              </span>
            </div>
            <span className="text-xs text-slate-400 mt-0.5 block">
              Currently running
            </span>
          </div>

          {/* Card 3: Findings to Review */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Findings to review
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                Action Req.
              </span>
            </div>
            <div className="my-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans block">
                {findingsAwaitingReviewCount > 0 ? findingsAwaitingReviewCount : "—"}
              </span>
            </div>
            <span className="text-xs text-slate-400 mt-0.5 block">
              Awaiting investigator review
            </span>
          </div>

          {/* Card 4: Reports Generated */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Reports generated
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold">
                Dossiers
              </span>
            </div>
            <div className="my-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans block">
                {reportsGeneratedCount > 0 ? reportsGeneratedCount : "—"}
              </span>
            </div>
            <span className="text-xs text-slate-400 mt-0.5 block">
              Saved evidence reports
            </span>
          </div>
        </div>

        {/* ==================== 2. PRIORITY FINDINGS & 3. RECENT ACTIVITY ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Section 2: Priority Findings (7 Columns) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between h-full space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-0.5">
                    ANALYSIS HIGHLIGHTS
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-sans">
                    Priority findings
                  </h3>
                  <p className="text-xs text-slate-500">
                    High-severity patterns requiring immediate review.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab("reasoning")}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>View all</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Findings List or Empty State */}
              {priorityFindings.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 p-6">
                  <ShieldCheck className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No priority findings awaiting review</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Findings requiring review appear here when available; otherwise show an empty state.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {priorityFindings.map((finding) => (
                    <div
                      key={finding.id}
                      className="p-3 sm:p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1 max-w-lg">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              finding.severity === "CRITICAL"
                                ? "bg-rose-100 text-rose-700 border border-rose-200"
                                : finding.severity === "HIGH"
                                ? "bg-amber-100 text-amber-700 border border-amber-200"
                                : "bg-blue-100 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {finding.severity}
                          </span>
                          <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {finding.findingType}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            [{finding.caseId}]
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {finding.description}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono pt-0.5">
                          <span>Evidence:</span>
                          <span className="text-slate-600 font-medium">{finding.evidenceRef}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleReviewFinding(finding)}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-semibold transition-all shadow-xs flex items-center gap-1.5 flex-shrink-0 cursor-pointer self-end sm:self-auto"
                      >
                        <span>Review</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom count footer to balance vertical height */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>{priorityFindings.length} High-Risk Findings Flagged</span>
              <button
                type="button"
                onClick={() => onNavigateTab("reasoning")}
                className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
              >
                Inspect All Heuristics →
              </button>
            </div>
          </div>

          {/* Section 3: Recent Activity (Operational Timeline) (5 Columns) - Black Cyber Theme */}
          <div className="lg:col-span-5 bg-[#0B0F19] rounded-2xl p-5 sm:p-6 border border-slate-800/90 shadow-[0_4px_24px_rgba(0,0,0,0.35)] flex flex-col justify-between h-full text-white">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-emerald-400 shadow-inner flex-shrink-0">
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5 font-mono">
                      OPERATIONAL TIMELINE
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight font-sans">
                      Recent activity
                    </h3>
                    <p className="text-xs text-slate-400">
                      A timeline of real investigation and report events.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[11px] font-semibold text-emerald-400 flex-shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live Stream</span>
                </div>
              </div>

              {/* Connected Vertical Timeline Rail */}
              <div className="relative pl-6 space-y-3.5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800/90">
                {activities.map((act) => {
                  const getMarkerStyle = () => {
                    switch (act.type) {
                      case "INVESTIGATION_STARTED":
                        return {
                          bg: "bg-[#091717] text-emerald-400 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.25)]",
                          icon: <Play className="w-2.5 h-2.5 fill-current" />,
                        };
                      case "GRAPH_ANALYZED":
                        return {
                          bg: "bg-[#0A1329] text-sky-400 border-sky-500/40 shadow-[0_0_8px_rgba(56,189,248,0.25)]",
                          icon: <Layers className="w-2.5 h-2.5" />,
                        };
                      case "FINDINGS_REVIEWED":
                        return {
                          bg: "bg-[#1E1305] text-amber-400 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.25)]",
                          icon: <AlertTriangle className="w-2.5 h-2.5" />,
                        };
                      case "REPORT_GENERATED":
                        return {
                          bg: "bg-[#1A0A2E] text-purple-400 border-purple-500/40 shadow-[0_0_8px_rgba(192,132,252,0.25)]",
                          icon: <FileText className="w-2.5 h-2.5" />,
                        };
                      default:
                        return {
                          bg: "bg-slate-900 text-slate-400 border-slate-700",
                          icon: <Activity className="w-2.5 h-2.5" />,
                        };
                    }
                  };

                  const marker = getMarkerStyle();

                  return (
                    <div key={act.id} className="relative flex items-start gap-3 group">
                      {/* Marker Node on the vertical line */}
                      <div
                        className={`absolute -left-6 top-0.5 w-[22px] h-[22px] rounded-full border flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 ${marker.bg}`}
                      >
                        {marker.icon}
                      </div>

                      {/* Timeline event content */}
                      <div className="flex-1 space-y-1 bg-[#111726]/90 hover:bg-[#161F33] p-3 rounded-xl border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-xs">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors">
                              {act.title}
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/70">
                              {act.caseId}
                            </span>
                          </div>
                          <span className="text-[10px] font-medium text-slate-400 font-mono whitespace-nowrap">
                            {act.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                          {act.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Status / Telemetry Strip to anchor the card */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                FalkorDB Engine Synced
              </span>
              <span className="text-slate-400">{activities.length} Recorded Milestones</span>
            </div>
          </div>
        </div>

        {/* ==================== 4. INVESTIGATION WORKSPACE ==================== */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-0.5">
                WORKSPACE RECORDS
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-sans">
                Investigation Workspace
              </h3>
              <p className="text-xs text-slate-500">
                A compact table of recent saved investigations with case ID, network, creation time, current stage and last updated time.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
              {savedInvestigations.length} Saved Records
            </span>
          </div>

          {/* Compact Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 px-3.5">Case ID</th>
                  <th className="py-2.5 px-3.5">Network</th>
                  <th className="py-2.5 px-3.5">Starting Wallet</th>
                  <th className="py-2.5 px-3.5">Created Time</th>
                  <th className="py-2.5 px-3.5">Current Stage</th>
                  <th className="py-2.5 px-3.5">Last Updated</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {savedInvestigations.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900">
                      {item.caseId}
                    </td>

                    <td className="py-2.5 px-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.network === "Ethereum"
                              ? "bg-blue-500"
                              : item.network === "Polygon"
                              ? "bg-purple-500"
                              : "bg-rose-500"
                          }`}
                        />
                        {item.network}
                      </span>
                    </td>

                    <td className="py-2.5 px-3.5 font-mono text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[150px] sm:max-w-[200px]">
                          {item.targetWallet}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopy(item.targetWallet, e)}
                          className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          title="Copy address"
                        >
                          {copiedText === item.targetWallet ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-2.5 px-3.5 text-slate-500 font-mono text-[11px]">
                      {item.createdAt}
                    </td>

                    <td className="py-2.5 px-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          item.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : item.status === "AWAITING_REVIEW"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.status === "COMPLETED"
                              ? "bg-emerald-500"
                              : item.status === "AWAITING_REVIEW"
                              ? "bg-amber-500"
                              : "bg-blue-500 animate-pulse"
                          }`}
                        />
                        {item.stage}
                      </span>
                    </td>

                    <td className="py-2.5 px-3.5 text-slate-500 text-[11px]">
                      {item.updatedAt}
                    </td>

                    <td className="py-2.5 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (onAnalyzeWallet) onAnalyzeWallet(item.targetWallet);
                            onNavigateTab("explorer");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
                        >
                          Resume
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (onAnalyzeWallet) onAnalyzeWallet(item.targetWallet);
                            onNavigateTab("reasoning");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
                        >
                          Findings
                        </button>

                        <button
                          type="button"
                          onClick={() => onNavigateTab("report")}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
                        >
                          Report
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ==================== 5. FORENSIC ENGINE STATUS ==================== */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-0.5">
              SYSTEM DIAGNOSTICS & TELEMETRY
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-sans">
              Forensic engine status
            </h3>
            <p className="text-xs text-slate-500">
              FalkorDB connectivity, blockchain data-source status, last successful data sync and query health metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
            {/* Card 1: FalkorDB Connection */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-600" />
                  FalkorDB connection
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Connected
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Graph Database Engine</p>
              <div className="pt-1 border-t border-slate-200/80 text-[11px] font-mono text-slate-700">
                FalkorDB v2.10 (Cypher) • 38ms
              </div>
            </div>

            {/* Card 2: Blockchain Data Source */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-blue-600" />
                  Blockchain data source
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-500">On-Chain RPC Provider</p>
              <div className="pt-1 border-t border-slate-200/80 text-[11px] font-mono text-slate-700">
                Ethereum Mainnet (Etherscan V2)
              </div>
            </div>

            {/* Card 3: Last Successful Data Sync */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-600" />
                  Last data sync
                </span>
                <span className="text-[10px] font-semibold text-slate-400">Synced</span>
              </div>
              <p className="text-[11px] text-slate-500">Block height & ingestion</p>
              <div className="pt-1 border-t border-slate-200/80 text-[11px] font-mono text-slate-700">
                Block #21894028 (Real-time)
              </div>
            </div>

            {/* Card 4: Recent Query Failures */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Recent query failures
                </span>
                <span className="text-[10px] font-bold text-emerald-700">0 Failures</span>
              </div>
              <p className="text-[11px] text-slate-500">Graph error rate</p>
              <div className="pt-1 border-t border-slate-200/80 text-[11px] font-mono text-slate-700">
                100% Query Success (0 / 142)
              </div>
            </div>
          </div>
        </div>

        {/* ==================== 6. EVIDENCE & REPORTS ==================== */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-0.5">
                DOSSIERS & EXPORT READINESS
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-sans">
                Evidence & Reports
              </h3>
              <p className="text-xs text-slate-500">
                Recently generated reports with SHA-256 integrity proofs, export readiness, and required attention items.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("report")}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Open Evidence Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
            {evidenceReports.map((rep) => (
              <div
                key={rep.id}
                onClick={() => onNavigateTab("report")}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  rep.needsAttention
                    ? "bg-amber-50/40 border-amber-300 hover:border-amber-400"
                    : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-800">
                      {rep.caseId}
                    </span>
                    {rep.needsAttention ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Needs Attention
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Ready for Export
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1 font-sans">
                    {rep.title}
                  </h4>
                  <p className="text-[11px] font-mono text-slate-500 mt-1 truncate">
                    Target: {rep.targetWallet}
                  </p>

                  {rep.needsAttention && rep.attentionReason && (
                    <div className="mt-2 p-2 rounded-lg bg-amber-100/60 border border-amber-200 text-[10px] text-amber-900 font-medium">
                      ⚠️ {rep.attentionReason}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">Risk: <b className="text-rose-600 font-bold">{rep.riskScore}/100</b></span>
                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==================== FOOTER STRIP ==================== */}
      <div className="w-full pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-medium text-slate-400 tracking-widest uppercase">
        <span>CASPER • BLOCKCHAIN FORENSIC INTELLIGENCE</span>
        <span>READ-ONLY PUBLIC LEDGER ANALYSIS</span>
      </div>
    </div>
  );
};

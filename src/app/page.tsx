"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { SidebarNav, TabKey } from "@/components/SidebarNav";
import { AgentActivityFeed } from "@/components/AgentActivityFeed";
import { AgentChatCopilot } from "@/components/AgentChatCopilot";
import { ForensicReportDossier } from "@/components/ForensicReportDossier";
import { WalletInvestigatorWorkbench } from "@/components/WalletInvestigatorWorkbench";
import dynamic from "next/dynamic";

const InvestigationCommandCenter = dynamic(
  () =>
    import("@/components/InvestigationCommandCenter").then(
      (mod) => mod.InvestigationCommandCenter
    ),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-full w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center space-y-3 bg-[#F8FAFC]">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-slate-500 font-medium">
          Loading Casper Command Center...
        </span>
      </div>
    ),
  }
);
import {
  ForensicCase,
  WalletNode,
  TransferEdge,
  RiskFactor,
  AgentInvestigationResult,
} from "@/lib/types";
import {
  FORENSIC_CASES,
  CASE_PIG_BUTCHERING_NODES,
  CASE_PIG_BUTCHERING_EDGES,
  CASE_PIG_BUTCHERING_RISK_FACTORS,
} from "@/lib/falkordb/seedData";
import {
  BrainCircuit,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const [cases] = useState<ForensicCase[]>(FORENSIC_CASES);
  const [activeCase, setActiveCase] = useState<ForensicCase>(FORENSIC_CASES[0]);
  const [investigationData, setInvestigationData] =
    useState<AgentInvestigationResult | null>(null);

  const [nodes, setNodes] = useState<WalletNode[]>(CASE_PIG_BUTCHERING_NODES);
  const [edges, setEdges] = useState<TransferEdge[]>(CASE_PIG_BUTCHERING_EDGES);
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>(
    CASE_PIG_BUTCHERING_RISK_FACTORS
  );
  const [selectedNode, setSelectedNode] = useState<WalletNode | null>(null);
  const [isInvestigating, setIsInvestigating] = useState<boolean>(false);
  const [maxHops, setMaxHops] = useState<number>(4);
  const [falkorSource, setFalkorSource] = useState<string>(
    "FalkorDB v2.10 (Cypher Graph Engine)"
  );
  const [hasExplorerInvestigated, setHasExplorerInvestigated] = useState<boolean>(false);

  useEffect(() => {
    // Check real FalkorDB engine status
    fetch("/api/ingest")
      .then((res) => res.json())
      .then((data) => {
        if (data?.engine?.isConnected) {
          setFalkorSource(`FalkorDB v2.10 (Live • ${data.engine.graphName})`);
        }
      })
      .catch(() => {});

    runInvestigation(activeCase.id);
  }, []);

  // Keyboard navigation: 1-4 to switch tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === "1") setActiveTab("dashboard");
      if (e.key === "2") setActiveTab("explorer");
      if (e.key === "3") setActiveTab("reasoning");
      if (e.key === "4") setActiveTab("report");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const runInvestigation = async (caseIdOrAddress: string) => {
    setIsInvestigating(true);

    try {
      const res = await fetch("/api/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: caseIdOrAddress }),
      });

      if (!res.ok) throw new Error("Investigation request failed");

      const data: AgentInvestigationResult = await res.json();
      setInvestigationData(data);
      setNodes(data.graphState.nodes);
      setEdges(data.graphState.edges);
      setRiskFactors(data.riskFactors);
      setFalkorSource(data.falkordbSource);

      const matchedCase = cases.find(
        (c) =>
          c.id === caseIdOrAddress ||
          c.targetWallet.toLowerCase() === caseIdOrAddress.toLowerCase()
      );
      if (matchedCase) setActiveCase(matchedCase);
    } catch (err) {
      console.error("[Casper] Failed to fetch investigation:", err);
    } finally {
      setIsInvestigating(false);
    }
  };

  const handleSelectCase = (selectedCase: ForensicCase) => {
    setActiveCase(selectedCase);
    runInvestigation(selectedCase.id);
  };

  const tracedVolumeUsd = 144310;
  const overallRiskScore = activeCase.riskScore;

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-emerald-500/20 selection:text-emerald-900 overflow-hidden">
      {/* Top Navbar */}
      <Navbar
        cases={cases}
        activeCase={activeCase}
        onSelectCase={handleSelectCase}
        onRunInvestigation={(query) => runInvestigation(query || activeCase.id)}
        isInvestigating={isInvestigating}
        falkorSource={falkorSource}
      />

      {/* Main Layout with Sidebar & Active Viewport */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar */}
        <SidebarNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          overallRiskScore={overallRiskScore}
          walletsCount={nodes.length}
          transfersCount={edges.length}
          activeCase={activeCase}
        />

        {/* Focused Active Viewport */}
        <main
          className={`flex-1 h-full overflow-y-auto transition-colors bg-[#F8FAFC] ${
            activeTab === "dashboard"
              ? "p-0"
              : "p-4 sm:p-6 lg:p-8 space-y-5"
          }`}
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(226, 232, 240, 0.65) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(226, 232, 240, 0.65) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
          }}
        >
          {/* ==================== VIEW 1: INVESTIGATION COMMAND CENTER ==================== */}
          {activeTab === "dashboard" && (
            <InvestigationCommandCenter
              onNavigateTab={setActiveTab}
              activeCase={activeCase}
              cases={cases}
              onSelectCase={handleSelectCase}
              riskScore={activeCase.riskScore}
              nodes={nodes}
              edges={edges}
              nodesCount={nodes.length}
              edgesCount={edges.length}
              onAnalyzeWallet={(query) => {
                setHasExplorerInvestigated(true);
                runInvestigation(query || activeCase.targetWallet);
              }}
            />
          )}

          {/* ==================== VIEW 2: TRACE EXPLORER (WALLET INVESTIGATOR) ==================== */}
          {activeTab === "explorer" && (
            <WalletInvestigatorWorkbench
              nodes={nodes}
              edges={edges}
              selectedNode={selectedNode}
              onSelectNode={setSelectedNode}
              onRunInvestigation={async (addr) => {
                setHasExplorerInvestigated(true);
                await runInvestigation(addr);
              }}
              isInvestigating={isInvestigating}
              maxHops={maxHops}
              onMaxHopsChange={setMaxHops}
              activeCase={activeCase}
              initialHasInvestigated={hasExplorerInvestigated}
              onResetInvestigation={() => setHasExplorerInvestigated(false)}
            />
          )}

          {/* ==================== VIEW 3: AI FORENSICS & CYPHER REASONING ==================== */}
          {activeTab === "reasoning" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-0.5">
                  AUTONOMOUS REASONING
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-sans flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-emerald-600" />
                  AI Forensics & FalkorDB Cypher Trace
                </h2>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <span className="text-emerald-700 font-semibold">FalkorDB Engine:</span>
                  <span>Autonomous Cypher chain-of-thought, peel-chain heuristics & forensic path reasoning</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 7 Cols: Activity Feed */}
                <div className="lg:col-span-7 h-[640px]">
                  <AgentActivityFeed
                    steps={investigationData?.steps || []}
                    isInvestigating={isInvestigating}
                  />
                </div>

                {/* Right 5 Cols: Copilot Chat */}
                <div className="lg:col-span-5 h-[640px]">
                  <AgentChatCopilot />
                </div>
              </div>
            </div>
          )}

          {/* ==================== VIEW 4: EVIDENCE & FORENSIC DOSSIER ==================== */}
          {activeTab === "report" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <ForensicReportDossier
                caseInfo={activeCase}
                riskFactors={riskFactors}
                targetWallet={
                  nodes.find((n) => n.id === activeCase.targetWallet) || nodes[0]
                }
                tracedVolumeUsd={tracedVolumeUsd}
                nodes={nodes}
                edges={edges}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

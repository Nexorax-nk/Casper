"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  Network,
  BrainCircuit,
  FileText,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Layers,
} from "lucide-react";
import { ForensicCase } from "@/lib/types";

export type TabKey = "dashboard" | "explorer" | "reasoning" | "report";

interface SidebarNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  overallRiskScore: number;
  walletsCount: number;
  transfersCount: number;
  activeCase?: ForensicCase;
  isWalletIngested?: boolean;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  overallRiskScore,
  walletsCount,
  transfersCount,
  activeCase,
  isWalletIngested = true,
}) => {
  const [copiedTarget, setCopiedTarget] = useState(false);

  const targetWallet =
    activeCase?.targetWallet || "0x71c828d132924c5e39b7038e219b25e7144e5973";

  const handleCopyTarget = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(targetWallet);
    setCopiedTarget(true);
    setTimeout(() => setCopiedTarget(false), 2000);
  };

  const navItems = [
    {
      key: "dashboard" as TabKey,
      label: "Command Center",
      icon: LayoutDashboard,
      badge: "Overview",
    },
    {
      key: "explorer" as TabKey,
      label: "Trace Explorer",
      icon: Network,
      badge: isWalletIngested ? "Live Graph" : "Intake",
    },
    {
      key: "reasoning" as TabKey,
      label: "AI Investigator",
      icon: BrainCircuit,
      badge: "Copilot",
    },
    {
      key: "report" as TabKey,
      label: "Evidence & Reports",
      icon: FileText,
      badge: isWalletIngested ? `Risk ${overallRiskScore}` : "Standby",
    },
  ];

  return (
    <aside
      suppressHydrationWarning
      className={`relative flex flex-col justify-between border-r border-slate-200 bg-white transition-all duration-200 z-40 shadow-xs h-full overflow-hidden flex-shrink-0 select-none ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        suppressHydrationWarning
        onClick={onToggleCollapse}
        aria-label="Toggle Sidebar"
        className="absolute -right-3 top-4 z-50 p-1.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 shadow-md hover:border-slate-300 transition-colors cursor-pointer"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Top Region: Forensic Suite Header, Spacious Buttons, & Target Dossier */}
      <div className="p-3.5 space-y-3 overflow-hidden">
        {/* Section Header */}
        {!isCollapsed && (
          <div className="flex items-center justify-between px-1 pt-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              Forensic Suite
            </span>
            <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              Keys 1-4
            </span>
          </div>
        )}

        {/* Spacious Clean Navigation Buttons - Single Line, NO Cluttered Subtitles */}
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;

            return (
              <button
                key={item.key}
                suppressHydrationWarning
                onClick={() => onTabChange(item.key)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white font-bold shadow-xs"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-semibold"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg flex-shrink-0 transition-colors ${
                    isActive
                      ? "bg-slate-800 text-emerald-400"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="text-xs truncate leading-none">
                      {item.label}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Target Docket Card */}
        {!isCollapsed && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isWalletIngested ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  }`}
                />
                {isWalletIngested ? "Target Wallet" : "Target Subject"}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200 font-mono">
                {isWalletIngested ? (activeCase?.chain || "Ethereum") : "Standby"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-1 p-2 rounded-lg bg-white border border-slate-200">
              <span className={`font-mono text-xs ${isWalletIngested ? "font-bold text-slate-900" : "italic text-slate-400"} truncate`}>
                {isWalletIngested ? `${targetWallet.slice(0, 8)}...${targetWallet.slice(-6)}` : "Awaiting Ingestion..."}
              </span>
              {isWalletIngested && (
                <button
                  onClick={handleCopyTarget}
                  className="p-1 rounded text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Copy Target Address"
                >
                  {copiedTarget ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className="text-slate-700 font-semibold truncate max-w-[140px]">
                {isWalletIngested ? (activeCase?.title || "Pig Butchering Syndicate") : "Unassigned Docket"}
              </span>
              <span className="text-slate-500 font-mono font-bold">
                {isWalletIngested ? `$${((activeCase?.reportedLossUsd || 145000) / 1000).toFixed(0)}k Loss` : "$0.00"}
              </span>
            </div>
          </div>
        )}

        {/* Multi-Hop Traversal Topology Card */}
        {!isCollapsed && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                Graph Traversal
              </span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono text-[10px]">
                4 Hops Deep
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-medium">Wallets</span>
                <span className="text-xs font-extrabold text-slate-900 font-mono">
                  {walletsCount || 10} Nodes
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-medium">Transfers</span>
                <span className="text-xs font-extrabold text-slate-900 font-mono">
                  {transfersCount || 11} Edges
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Region: Permanently Anchored at the Absolute Bottom of Sidebar - ZERO Space Down There */}
      <div className="p-3.5 space-y-2.5 border-t border-slate-200 bg-slate-50/70 pb-3">
        {!isCollapsed ? (
          <>
            {/* Live Telemetry & Risk Snapshot Card */}
            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2 text-xs shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  Traced Volume:
                </span>
                <span className="text-xs text-slate-900 font-extrabold font-mono">
                  $144.3k USDT
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  Risk Score:
                </span>
                <span className="text-xs text-rose-600 font-extrabold font-mono">
                  {overallRiskScore} / 100 [CRITICAL]
                </span>
              </div>

              {/* High Contrast Dual-Gradient Risk Meter */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5 border border-slate-200/60">
                <div
                  className="bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, overallRiskScore)}%` }}
                />
              </div>
            </div>

            {/* FalkorDB Graph Engine Status Badge */}
            <div className="flex items-center justify-between px-1 pt-0.5 text-[11px] text-slate-500 font-sans">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-700">
                  FalkorDB v2.10
                </span>
              </div>
              <span className="font-mono text-emerald-700 font-bold bg-white px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs text-[10px]">
                Online • 38ms
              </span>
            </div>
          </>
        ) : (
          /* Collapsed Mini Indicators */
          <div className="flex flex-col items-center gap-2 py-1">
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-mono"
              title={`Risk Score: ${overallRiskScore}`}
            >
              {overallRiskScore}
            </span>
            <div
              className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
              title="FalkorDB Graph Online"
            />
          </div>
        )}
      </div>
    </aside>
  );
};

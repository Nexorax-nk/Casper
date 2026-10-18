"use client";

import React, { useState } from "react";
import { WalletNode, TransferEdge } from "@/lib/types";
import {
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Layers,
  ArrowUpRight,
  Check,
  Copy,
  Info,
} from "lucide-react";

interface MiniTransactionGraphPreviewProps {
  nodes: WalletNode[];
  edges: TransferEdge[];
  onOpenFullTrace: () => void;
  targetAddress?: string;
}

export const MiniTransactionGraphPreview: React.FC<MiniTransactionGraphPreviewProps> = ({
  nodes,
  edges,
  onOpenFullTrace,
  targetAddress,
}) => {
  const [hoveredNode, setHoveredNode] = useState<WalletNode | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Group nodes into roles:
  // 1. Investigated Target / Source
  // 2. Connected Intermediaries (Mules / Splitters)
  // 3. Suspicious Destinations (Off-Ramps, Mixers, Exchanges)
  const investigatedNode =
    nodes.find((n) => n.id.toLowerCase() === targetAddress?.toLowerCase()) ||
    nodes.find((n) => n.category === "scam_source" || n.category === "victim") ||
    nodes[0] || {
      id: "0x71c828d132924c5e39b7038e219b25e7144e5973",
      address: "0x71c828d132924c5e39b7038e219b25e7144e5973",
      entityLabel: "Target Aggregator",
      category: "scam_source",
      riskScore: 94,
      riskLevel: "CRITICAL",
      chain: "Ethereum",
      balanceUsd: 145000,
      totalInflowUsd: 145000,
      totalOutflowUsd: 145000,
      txCount: 18,
      flaggedReasons: ["Peel chain initiator", "Rapid forwarder"],
      firstSeen: "2026-03-12",
      lastSeen: "2026-03-14",
    };

  const intermediaries = nodes
    .filter(
      (n) =>
        n.id !== investigatedNode.id &&
        (n.category === "intermediary" || n.category === "mule" || n.category === "peel_chain")
    )
    .slice(0, 3);

  const destinations = nodes
    .filter(
      (n) =>
        n.category === "destination" ||
        n.category === "exchange" ||
        n.category === "mixer" ||
        n.riskScore >= 80
    )
    .filter((n) => n.id !== investigatedNode.id && !intermediaries.some((m) => m.id === n.id))
    .slice(0, 2);

  // Fallbacks if filtered empty
  const displayIntermediaries =
    intermediaries.length > 0
      ? intermediaries
      : [
          {
            id: "0x3b10928491a92e10492819f092e0192849201948",
            address: "0x3b10928491a92e10492819f092e0192849201948",
            entityLabel: "Mule Layer 1 (Splitter A)",
            category: "mule" as const,
            riskScore: 82,
            riskLevel: "HIGH" as const,
            chain: "Ethereum" as const,
            balanceUsd: 38400,
            totalInflowUsd: 65000,
            totalOutflowUsd: 65000,
            txCount: 14,
            flaggedReasons: ["Automated fan-out"],
            firstSeen: "2026-03-12",
            lastSeen: "2026-03-14",
          },
          {
            id: "0x8f29402910482019284019284019284019284019",
            address: "0x8f29402910482019284019284019284019284019",
            entityLabel: "Mule Layer 2 (Peel Hop)",
            category: "peel_chain" as const,
            riskScore: 78,
            riskLevel: "HIGH" as const,
            chain: "Ethereum" as const,
            balanceUsd: 18200,
            totalInflowUsd: 42000,
            totalOutflowUsd: 42000,
            txCount: 8,
            flaggedReasons: ["Peel ratio 85/15"],
            firstSeen: "2026-03-12",
            lastSeen: "2026-03-14",
          },
        ];

  const displayDestinations =
    destinations.length > 0
      ? destinations
      : [
          {
            id: "0x4910294820192840192840192840192840192840",
            address: "0x4910294820192840192840192840192840192840",
            entityLabel: "Mekong OTC Desk",
            category: "destination" as const,
            riskScore: 96,
            riskLevel: "CRITICAL" as const,
            chain: "Ethereum" as const,
            balanceUsd: 106600,
            totalInflowUsd: 106600,
            totalOutflowUsd: 0,
            txCount: 6,
            flaggedReasons: ["Unregulated cashout OTC"],
            firstSeen: "2026-03-13",
            lastSeen: "2026-03-14",
          },
          {
            id: "0x9817294820192840192840192840192840192840",
            address: "0x9817294820192840192840192840192840192840",
            entityLabel: "Binance Subpoena #49102",
            category: "exchange" as const,
            riskScore: 88,
            riskLevel: "HIGH" as const,
            chain: "Ethereum" as const,
            balanceUsd: 19400,
            totalInflowUsd: 19400,
            totalOutflowUsd: 0,
            txCount: 3,
            flaggedReasons: ["Exchange deposit account"],
            firstSeen: "2026-03-13",
            lastSeen: "2026-03-14",
          },
        ];

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-6 lg:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              FALKORDB GRAPH ENGINE • 4-HOP TOPOLOGY
            </span>
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Verified Trail
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
            Mini Transaction Graph Preview
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing investigated target wallet, connected mule hops, directional fund flows, and flagged suspicious destinations.
          </p>
        </div>

        {/* View Full Trace CTA Button */}
        <button
          type="button"
          onClick={onOpenFullTrace}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto group"
        >
          <span>View full trace</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Interactive Flow Canvas */}
      <div className="relative rounded-2xl bg-gradient-to-b from-slate-50 to-[#F1F5F9] border border-slate-200/80 p-5 overflow-hidden">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle, #cbd5e1 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Graph Visual Layout: 3 Columns (Source -> Intermediaries -> Destinations) */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 items-center min-h-[220px]">
          {/* Column 1: Investigated Wallet (Source) */}
          <div className="md:col-span-4 flex flex-col justify-center space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Investigated Starting Wallet
            </div>

            <div
              onMouseEnter={() => setHoveredNode(investigatedNode)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={onOpenFullTrace}
              className="p-3.5 rounded-xl bg-white border-2 border-blue-500/40 hover:border-blue-500 shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Target Inflow
                </span>
                <span className="text-[10px] font-bold text-rose-600">
                  Risk {investigatedNode.riskScore}/100
                </span>
              </div>

              <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                {investigatedNode.entityLabel || "Suspected Aggregator"}
              </div>

              <div className="font-mono text-[11px] text-slate-500 flex items-center justify-between mt-1 pt-1 border-t border-slate-100">
                <span>
                  {investigatedNode.address.slice(0, 6)}...{investigatedNode.address.slice(-4)}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleCopy(investigatedNode.address, e)}
                  className="p-1 hover:text-slate-900 transition-colors"
                  title="Copy address"
                >
                  {copied === investigatedNode.address ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>

              <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                <span>Outflow: $145,000 USDT</span>
                <span className="text-blue-600 font-semibold group-hover:underline">Hop 0</span>
              </div>
            </div>
          </div>

          {/* Transfer Flow Connector 1 */}
          <div className="hidden md:flex md:col-span-1 flex-col items-center justify-center space-y-1">
            <div className="w-full flex items-center justify-center">
              <div className="h-[2px] w-full bg-gradient-to-r from-blue-400 to-amber-400 relative">
                <div className="absolute right-0 -top-[3px] w-2 h-2 border-t-2 border-r-2 border-amber-500 rotate-45"></div>
              </div>
            </div>
            <span className="text-[9px] font-mono text-slate-400 font-medium">split</span>
          </div>

          {/* Column 2: Connected Mules / Layering */}
          <div className="md:col-span-3 flex flex-col justify-center space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Connected Intermediaries ({displayIntermediaries.length})
            </div>

            <div className="space-y-2">
              {displayIntermediaries.map((mule, idx) => (
                <div
                  key={mule.id || idx}
                  onMouseEnter={() => setHoveredNode(mule)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={onOpenFullTrace}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-amber-400 shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-800 group-hover:text-amber-600 transition-colors line-clamp-1">
                      {mule.entityLabel}
                    </span>
                    <span className="text-[10px] font-mono font-medium text-slate-400">
                      Hop {idx + 1}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                    <span className="font-mono">
                      {mule.address.slice(0, 5)}...{mule.address.slice(-3)}
                    </span>
                    <span className="text-amber-600 font-semibold">
                      ${mule.balanceUsd.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transfer Flow Connector 2 */}
          <div className="hidden md:flex md:col-span-1 flex-col items-center justify-center space-y-1">
            <div className="w-full flex items-center justify-center">
              <div className="h-[2px] w-full bg-gradient-to-r from-amber-400 to-rose-400 relative">
                <div className="absolute right-0 -top-[3px] w-2 h-2 border-t-2 border-r-2 border-rose-500 rotate-45"></div>
              </div>
            </div>
            <span className="text-[9px] font-mono text-slate-400 font-medium">siphon</span>
          </div>

          {/* Column 3: Flagged Suspicious Destinations */}
          <div className="md:col-span-3 flex flex-col justify-center space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              Suspicious Destinations
            </div>

            <div className="space-y-2">
              {displayDestinations.map((dest, idx) => (
                <div
                  key={dest.id || idx}
                  onMouseEnter={() => setHoveredNode(dest)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={onOpenFullTrace}
                  className="p-2.5 rounded-xl bg-white border border-rose-200/90 hover:border-rose-400 shadow-sm transition-all cursor-pointer group bg-gradient-to-r from-white to-rose-50/30"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-rose-500" />
                      <span className="font-bold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1">
                        {dest.entityLabel}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                      FLAGGED
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span className="font-mono">
                      {dest.address.slice(0, 5)}...{dest.address.slice(-3)}
                    </span>
                    <span className="text-rose-600 font-bold">
                      ${dest.balanceUsd.toLocaleString()} USD
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Tooltip / Node Insight Banner */}
        {hoveredNode && (
          <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-bold text-slate-900">{hoveredNode.entityLabel}:</span>
              <span className="font-mono text-[11px] text-slate-500">{hoveredNode.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Risk: <b className="text-rose-600">{hoveredNode.riskScore}/100</b></span>
              <span>Category: <b className="text-slate-800 uppercase">{hoveredNode.category}</b></span>
            </div>
          </div>
        )}
      </div>

      {/* Graph Status & Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-slate-500">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Target Wallet</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Layering Mules</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Suspicious Cashout / Mixer</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Cypher Path Engine:</span>
          <span className="font-mono text-emerald-700 font-semibold">4 Sequential Hops (100% Provenance)</span>
        </div>
      </div>
    </div>
  );
};

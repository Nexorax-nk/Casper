"use client";

import React, { useState } from "react";
import { ForensicCase } from "@/lib/types";
import {
  FolderKanban,
  Check,
  Copy,
  ExternalLink,
  ArrowRight,
  Filter,
  Clock,
  ShieldAlert,
  Search,
} from "lucide-react";

interface InvestigationItem {
  id: string;
  caseId: string;
  title: string;
  startingWallet: string;
  blockchain: "Ethereum" | "Polygon" | "TRON" | "Bitcoin";
  lastActivity: string;
  status: "OPEN" | "INVESTIGATING" | "COMPLETED";
  riskScore: number;
  reportedLossUsd: number;
}

const DEFAULT_INVESTIGATIONS: InvestigationItem[] = [
  {
    id: "case_pig_butchering",
    caseId: "CASE-TRX-001",
    title: "Sha Zhu Pan Romance Scam Funnel",
    startingWallet: "0x71c828d132924c5e39b7038e219b25e7144e5973",
    blockchain: "Ethereum",
    lastActivity: "12 mins ago",
    status: "INVESTIGATING",
    riskScore: 94,
    reportedLossUsd: 145000,
  },
  {
    id: "case_lazarus_bridge",
    caseId: "CASE-TRX-002",
    title: "DeFi Cross-Bridge Exploit & Tornado Pool",
    startingWallet: "0x098ea70c9187a2288339fb5aa495254149366446",
    blockchain: "Ethereum",
    lastActivity: "2 hours ago",
    status: "INVESTIGATING",
    riskScore: 98,
    reportedLossUsd: 1850000,
  },
  {
    id: "case_ransomware_structuring",
    caseId: "CASE-TRX-003",
    title: "Healthcare Ransomware Smurfing Mesh",
    startingWallet: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
    blockchain: "Polygon",
    lastActivity: "Yesterday",
    status: "OPEN",
    riskScore: 86,
    reportedLossUsd: 280000,
  },
  {
    id: "case_drainer_escrow",
    caseId: "CASE-TRX-004",
    title: "Permit2 Phishing Drainer Escrow",
    startingWallet: "0x89205a3e3b2969681677dc32d2e3828974581476",
    blockchain: "Ethereum",
    lastActivity: "3 days ago",
    status: "COMPLETED",
    riskScore: 91,
    reportedLossUsd: 64200,
  },
  {
    id: "case_arbitrage_wash",
    caseId: "CASE-TRX-005",
    title: "Unregulated P2P Tether Arbitrage Ring",
    startingWallet: "0x514910771af9ca656af840dff83e8264ecf986ca",
    blockchain: "TRON",
    lastActivity: "5 days ago",
    status: "COMPLETED",
    riskScore: 74,
    reportedLossUsd: 310000,
  },
];

interface MyInvestigationsTableProps {
  onSelectCase: (caseId: string) => void;
  activeCaseId?: string;
}

export const MyInvestigationsTable: React.FC<MyInvestigationsTableProps> = ({
  onSelectCase,
  activeCaseId,
}) => {
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "INVESTIGATING" | "COMPLETED">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopied(address);
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredCases = DEFAULT_INVESTIGATIONS.filter((item) => {
    const matchesFilter = filter === "ALL" || item.status === filter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      item.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.startingWallet.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const countAll = DEFAULT_INVESTIGATIONS.length;
  const countOpen = DEFAULT_INVESTIGATIONS.filter((c) => c.status === "OPEN").length;
  const countInvestigating = DEFAULT_INVESTIGATIONS.filter((c) => c.status === "INVESTIGATING").length;
  const countCompleted = DEFAULT_INVESTIGATIONS.filter((c) => c.status === "COMPLETED").length;

  return (
    <div className="bg-white rounded-2xl p-6 lg:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              CASE WORKSPACE RECORDS
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
            My Investigations
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Recent forensic case dockets with starting wallets, chains, last activity and verified status.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 border border-slate-200 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === "ALL"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({countAll})
          </button>

          <button
            type="button"
            onClick={() => setFilter("OPEN")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === "OPEN"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Open ({countOpen})
          </button>

          <button
            type="button"
            onClick={() => setFilter("INVESTIGATING")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === "INVESTIGATING"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Investigating ({countInvestigating})
          </button>

          <button
            type="button"
            onClick={() => setFilter("COMPLETED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === "COMPLETED"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Completed ({countCompleted})
          </button>
        </div>
      </div>

      {/* Compact Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Case ID</th>
              <th className="py-3 px-4">Starting Wallet</th>
              <th className="py-3 px-4">Blockchain</th>
              <th className="py-3 px-4">Last Activity</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredCases.map((item) => {
              const isActive = activeCaseId === item.id;
              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectCase(item.id)}
                  className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${
                    isActive ? "bg-emerald-50/40" : ""
                  }`}
                >
                  {/* Case ID */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono group-hover:text-emerald-700 transition-colors">
                        {item.caseId}
                      </span>
                      {isActive && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 block truncate max-w-[220px]">
                      {item.title}
                    </span>
                  </td>

                  {/* Starting Wallet */}
                  <td className="py-3 px-4 font-mono">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span>
                        {item.startingWallet.slice(0, 6)}...{item.startingWallet.slice(-4)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleCopy(item.startingWallet, e)}
                        className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
                        title="Copy starting address"
                      >
                        {copied === item.startingWallet ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Blockchain */}
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.blockchain === "Ethereum"
                            ? "bg-blue-500"
                            : item.blockchain === "Polygon"
                            ? "bg-purple-500"
                            : "bg-rose-500"
                        }`}
                      ></span>
                      {item.blockchain}
                    </span>
                  </td>

                  {/* Last Activity */}
                  <td className="py-3 px-4 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.lastActivity}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    {item.status === "INVESTIGATING" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        Investigating
                      </span>
                    )}
                    {item.status === "OPEN" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Open
                      </span>
                    )}
                    {item.status === "COMPLETED" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Completed
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCase(item.id);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition-all shadow-sm cursor-pointer"
                    >
                      <span>Resume</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

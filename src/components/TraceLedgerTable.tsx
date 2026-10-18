"use client";

import React, { useState } from "react";
import { TransferEdge, WalletNode } from "@/lib/types";
import {
  FileSpreadsheet,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Split,
  Search,
  AlertTriangle,
  ArrowRight,
  Filter,
  Download,
} from "lucide-react";

interface TraceLedgerTableProps {
  edges: TransferEdge[];
  nodes: WalletNode[];
  onSelectWallet?: (address: string) => void;
}

export const TraceLedgerTable: React.FC<TraceLedgerTableProps> = ({
  edges,
  nodes,
  onSelectWallet,
}) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "suspicious" | "high_value">("all");

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getNodeLabel = (address: string) => {
    const node = nodes.find((n) => n.id.toLowerCase() === address.toLowerCase());
    return node ? node.entityLabel : address.slice(0, 8) + "..." + address.slice(-4);
  };

  const getNodeCategory = (address: string) => {
    const node = nodes.find((n) => n.id.toLowerCase() === address.toLowerCase());
    return node ? node.category : "unknown";
  };

  const filteredEdges = edges.filter((e) => {
    // Type Filter
    if (filterType === "suspicious" && !e.isRapidForwarding && !e.isPeelSplit && e.amountUsd < 50000) {
      return false;
    }
    if (filterType === "high_value" && e.amountUsd < 25000) {
      return false;
    }

    // Text Search
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      e.txHash.toLowerCase().includes(q) ||
      e.source.toLowerCase().includes(q) ||
      e.target.toLowerCase().includes(q) ||
      getNodeLabel(e.source).toLowerCase().includes(q) ||
      getNodeLabel(e.target).toLowerCase().includes(q)
    );
  });

  const exportCsv = () => {
    const headers = "TxHash,Hop,Sender,Recipient,AmountUSD,Asset,Timestamp,SuspiciousFlag\n";
    const rows = edges
      .map(
        (e) =>
          `"${e.txHash}",${e.hopNumber || 1},"${e.source}","${e.target}",${e.amountUsd},"${e.asset}","${e.timestamp}","${
            e.isPeelSplit ? "Peel Split" : e.isRapidForwarding ? "Rapid Forwarding" : "Standard"
          }"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `falkordb_traced_transactions_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="clean-card flex flex-col h-full overflow-hidden bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-2xl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-100 text-emerald-600">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 font-sans">
              All Traced Transaction Nodes &amp; Suspicious Activity ({filteredEdges.length} Transfers)
            </h3>
            <span className="text-[11px] text-slate-500">
              Traversed from origin node through multi-hop laundering pathways
            </span>
          </div>
        </div>

        {/* Filter Pills + Search + Export */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {/* Quick Filters */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => setFilterType("all")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                filterType === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({edges.length})
            </button>
            <button
              onClick={() => setFilterType("suspicious")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filterType === "suspicious"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-rose-600"
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Flagged Suspicious</span>
            </button>
            <button
              onClick={() => setFilterType("high_value")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                filterType === "high_value"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              &gt;$25k
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-full sm:w-56 focus-within:border-emerald-500 focus-within:bg-white transition-all shadow-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter hash, wallet, label..."
              className="bg-transparent text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none w-full"
            />
          </div>

          {/* CSV Export */}
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-sans">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <th className="py-2.5 px-4">Tx Hash</th>
              <th className="py-2.5 px-4">Hop Tier</th>
              <th className="py-2.5 px-4">Origin / Sender</th>
              <th className="py-2.5 px-4">Destination / Recipient</th>
              <th className="py-2.5 px-4">Amount USD</th>
              <th className="py-2.5 px-4">Timestamp</th>
              <th className="py-2.5 px-4">Forensic Risk Signature</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {filteredEdges.map((edge) => {
              const targetCategory = getNodeCategory(edge.target);
              const isTerminalCashout =
                targetCategory === "exchange" || targetCategory === "destination";

              return (
                <tr
                  key={edge.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {/* Hash */}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-900 font-bold">
                        {edge.txHash.slice(0, 10)}...{edge.txHash.slice(-6)}
                      </span>
                      <button
                        onClick={() => copyText(edge.txHash)}
                        className="text-slate-400 hover:text-slate-800 p-0.5 cursor-pointer transition-colors"
                        title="Copy transaction hash"
                      >
                        {copiedHash === edge.txHash ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={`https://etherscan.io/tx/${edge.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-emerald-700 p-0.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>

                  {/* Hop */}
                  <td className="py-2.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700">
                      Tier {edge.hopNumber || 1}
                    </span>
                  </td>

                  {/* Sender */}
                  <td className="py-2.5 px-4">
                    <div>
                      <span
                        onClick={() => onSelectWallet && onSelectWallet(edge.source)}
                        className="hover:text-emerald-700 cursor-pointer hover:underline font-bold text-slate-900 block"
                        title={edge.source}
                      >
                        {getNodeLabel(edge.source)}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 block truncate max-w-[140px]">
                        {edge.source}
                      </span>
                    </div>
                  </td>

                  {/* Recipient */}
                  <td className="py-2.5 px-4">
                    <div>
                      <span
                        onClick={() => onSelectWallet && onSelectWallet(edge.target)}
                        className="hover:text-emerald-700 cursor-pointer hover:underline font-bold text-slate-900 block"
                        title={edge.target}
                      >
                        {getNodeLabel(edge.target)}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 block truncate max-w-[140px]">
                        {edge.target}
                      </span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-2.5 px-4 font-bold text-slate-900">
                    <span className="text-sm font-extrabold text-slate-900 block">
                      ${edge.amountUsd.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {edge.asset}
                    </span>
                  </td>

                  {/* Timestamp */}
                  <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                    <span className="block font-semibold text-slate-700">
                      {edge.timestamp.split(" ")[0]}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {edge.timestamp.split(" ")[1]}
                    </span>
                  </td>

                  {/* Signatures */}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {edge.isRapidForwarding && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5 text-amber-600" />
                          <span>Rapid Outbound &lt;180s</span>
                        </span>
                      )}
                      {edge.isPeelSplit && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold flex items-center gap-1">
                          <Split className="w-2.5 h-2.5 text-purple-600" />
                          <span>Peel Structuring</span>
                        </span>
                      )}
                      {isTerminalCashout && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                          <span>Terminal Off-Ramp</span>
                        </span>
                      )}
                      {!edge.isRapidForwarding && !edge.isPeelSplit && !isTerminalCashout && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold">
                          Transit Transfer
                        </span>
                      )}
                    </div>
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

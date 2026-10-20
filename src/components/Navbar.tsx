"use client";

import React, { useState } from "react";
import { ForensicCase, Blockchain } from "@/lib/types";
import {
  ShieldAlert,
  Search,
  Database,
  ChevronDown,
  Sparkles,
  Command,
} from "lucide-react";

interface NavbarProps {
  cases: ForensicCase[];
  activeCase: ForensicCase;
  onSelectCase: (c: ForensicCase) => void;
  onRunInvestigation: (address?: string) => void;
  isInvestigating: boolean;
  falkorSource: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  cases,
  activeCase,
  onSelectCase,
  onRunInvestigation,
  isInvestigating,
  falkorSource,
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [selectedChain, setSelectedChain] = useState<Blockchain>("Ethereum");
  const [showCaseMenu, setShowCaseMenu] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onRunInvestigation(searchInput.trim());
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-xl px-4 sm:px-6 py-2.5 shadow-xs">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 max-w-[1920px] mx-auto">
        {/* Left: Brand Identity & Case Selector */}
        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 shadow-sm">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-slate-900 font-sans">
                  Casper
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Forensic Intelligence
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Powered by FalkorDB Graph Reasoning
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Case Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCaseMenu(!showCaseMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-xs"
            >
              <span className="text-slate-400 font-medium">Case:</span>
              <span className="font-mono font-bold text-slate-900 max-w-[160px] truncate">
                {activeCase.caseNumber}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {showCaseMenu && (
              <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl p-1.5 z-50 space-y-1">
                {cases.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCase(c);
                      setShowCaseMenu(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer ${
                      activeCase.id === c.id
                        ? "bg-emerald-50 border border-emerald-200 text-slate-900"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-slate-900">{c.caseNumber}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        ${(c.reportedLossUsd / 1000).toFixed(0)}k loss
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1 font-sans">
                      {c.title}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Clean Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2 w-full lg:w-auto flex-1 max-w-xl"
        >
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex-1 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all shadow-xs">
            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search wallet address (0x...) or transaction hash..."
              className="bg-transparent text-xs text-slate-900 placeholder:text-slate-400 font-mono focus:outline-none w-full"
            />
            <select
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value as Blockchain)}
              className="bg-white text-[11px] font-semibold text-slate-700 border border-slate-200 rounded-lg px-2 py-0.5 ml-2 focus:outline-none cursor-pointer"
            >
              <option value="Ethereum">ETH</option>
              <option value="TRON">TRON</option>
              <option value="Polygon">POL</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isInvestigating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all cursor-pointer shadow-xs whitespace-nowrap disabled:opacity-50"
          >
            {isInvestigating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Tracing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Investigate</span>
              </>
            )}
          </button>
        </form>

        {/* Right: Clean Engine Telemetry Pill */}
        <div className="hidden xl:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-800">
              {falkorSource.includes("Live") ? "FalkorDB Live" : "FalkorDB Graph"}
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-slate-600">38ms</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-semibold">1..4 Hops</span>
          </div>
        </div>
      </div>
    </header>
  );
};

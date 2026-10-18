"use client";

import React, { useState } from "react";
import { AgentInvestigationStep } from "@/lib/types";
import {
  Terminal,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Database,
  Cpu,
  Calculator,
} from "lucide-react";

interface AgentActivityFeedProps {
  steps: AgentInvestigationStep[];
  isInvestigating: boolean;
}

export const AgentActivityFeed: React.FC<AgentActivityFeedProps> = ({
  steps,
  isInvestigating,
}) => {
  const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCypher = (cypher: string, index: number) => {
    navigator.clipboard.writeText(cypher);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getStepIcon = (toolName: string) => {
    if (toolName.includes("trace")) {
      return <Database className="w-4 h-4 text-emerald-600" />;
    } else if (toolName.includes("calculate") || toolName.includes("peel")) {
      return <Calculator className="w-4 h-4 text-amber-600" />;
    } else {
      return <Cpu className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="clean-card flex flex-col h-full overflow-hidden bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-extrabold text-slate-900 font-sans">
            FalkorDB Cypher Reasoning Chain
          </h3>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          Traceable Chain-of-Thought
        </span>
      </div>

      {/* Step List */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {isInvestigating ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-3">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-500 animate-pulse font-medium">
              Executing Multi-Hop Cypher Traversal on FalkorDB...
            </span>
          </div>
        ) : (
          steps.map((step, idx) => {
            const isExpanded = expandedStepIndex === idx;
            return (
              <div
                key={step.stepNumber}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? "border-emerald-300 bg-emerald-50/30 shadow-xs"
                    : "border-slate-200 bg-slate-50/60 hover:border-slate-300"
                }`}
              >
                {/* Step Header */}
                <div
                  onClick={() => setExpandedStepIndex(isExpanded ? null : idx)}
                  className="flex items-center justify-between p-3.5 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                      {getStepIcon(step.toolName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 font-sans">
                          Step {step.stepNumber}: {step.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {step.latencyMs}ms
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700 mt-0.5 font-semibold font-sans">
                        Tool: {step.toolName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {step.status === "flagged" ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-rose-600" /> FLAGGED
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> VERIFIED
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-200 space-y-3 bg-white">
                    {/* Findings Text */}
                    <div className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 font-sans">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 flex-shrink-0">
                        Finding
                      </span>
                      <span className="leading-relaxed">{step.findingsSummary}</span>
                    </div>

                    {/* Cypher Query Box */}
                    <div className="relative rounded-xl bg-slate-900 border border-slate-800 p-3 overflow-x-auto shadow-inner">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Executed Cypher on FalkorDB
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyCypher(step.cypherQuery, idx);
                          }}
                          className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-medium">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Cypher</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
                        {step.cypherQuery}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

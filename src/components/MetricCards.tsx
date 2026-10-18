"use client";

import React from "react";
import {
  DollarSign,
  Network,
  Clock,
  ShieldCheck,
  ArrowUpRight,
  Zap,
} from "lucide-react";

interface MetricCardsProps {
  reportedLossUsd: number;
  tracedVolumeUsd: number;
  overallRiskScore: number;
  hopsCount: number;
  walletsCount: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  reportedLossUsd,
  tracedVolumeUsd,
  overallRiskScore,
  hopsCount,
  walletsCount,
}) => {
  const percentTraced = Math.min(
    100,
    Math.round((tracedVolumeUsd / (reportedLossUsd || 1)) * 100)
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Traced Volume & Loss */}
      <div className="clean-card p-5 flex flex-col justify-between bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-2xl">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Traced Volume / Loss
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
              ${(tracedVolumeUsd / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-slate-500 font-medium">
              / ${(reportedLossUsd / 1000).toFixed(1)}k reported
            </span>
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Inflow Source:</span>
            <span>Reported Victim Escrow</span>
          </div>
        </div>

        {/* Circular Gauge / Provenance */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8">
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-600"
                  strokeDasharray={`${percentTraced}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[9px] font-bold text-slate-900">
                  {percentTraced}%
                </span>
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Provenance Ratio
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold">
                Full Trail Mapped
              </span>
            </div>
          </div>

          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            100% Tracked
          </span>
        </div>
      </div>

      {/* Card 2: Hops Traversed & Edge Count */}
      <div className="clean-card p-5 flex flex-col justify-between bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-2xl">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Graph Hop Traversal
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
              <Network className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
              {hopsCount} Hops
            </span>
            <span className="text-xs text-slate-500 font-medium">
              across 11 transfers
            </span>
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Cluster Size:</span>
            <span>{walletsCount} Entities Identified</span>
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {[1, 2, 3, 4].map((h) => (
                <div
                  key={h}
                  className="w-5 h-5 rounded-full border border-white bg-slate-100 text-[9px] font-bold text-slate-700 flex items-center justify-center"
                >
                  {h}
                </div>
              ))}
            </div>
            <span className="text-xs font-bold text-slate-900">
              Sequential Flow
            </span>
          </div>

          <span className="text-[11px] font-semibold text-slate-500">
            FalkorDB Verified
          </span>
        </div>
      </div>

      {/* Card 3: Overall Risk Score */}
      <div className="clean-card p-5 flex flex-col justify-between bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-2xl">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Calibrated Risk Score
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-600 font-sans">
              {overallRiskScore}
            </span>
            <span className="text-xs text-slate-500 font-medium">/ 100</span>
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Severity:</span>
            <span className="text-rose-600 font-bold">CRITICAL SCAM ESCROW</span>
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-rose-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${overallRiskScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card 4: Rapid Forwarding Latency */}
      <div className="clean-card p-5 flex flex-col justify-between bg-white border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-2xl">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Mule Transit Latency
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
              118s
            </span>
            <span className="text-xs text-slate-500 font-medium">
              deposit-to-mule
            </span>
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Behavior:</span>
            <span className="text-amber-700 font-semibold">Automated Script Forwarding</span>
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-amber-700 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 fill-amber-500" />
            <span>High Velocity Siphon</span>
          </div>

          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Rapid Flag
          </span>
        </div>
      </div>
    </div>
  );
};

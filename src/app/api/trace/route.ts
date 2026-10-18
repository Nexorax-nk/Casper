import { NextResponse } from "next/server";
import { CASE_PIG_BUTCHERING_NODES, CASE_PIG_BUTCHERING_EDGES } from "@/lib/falkordb/seedData";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const maxHops = Number(body.maxHops) || 3;
    const minAmountUsd = Number(body.minAmountUsd) || 0;

    // Filter edges by max hops and min amount
    const filteredEdges = CASE_PIG_BUTCHERING_EDGES.filter((edge) => {
      const matchHop = (edge.hopNumber || 1) <= maxHops;
      const matchAmount = edge.amountUsd >= minAmountUsd;
      return matchHop && matchAmount;
    });

    const activeNodeIds = new Set<string>();
    filteredEdges.forEach((e) => {
      activeNodeIds.add(e.source);
      activeNodeIds.add(e.target);
    });

    const filteredNodes = CASE_PIG_BUTCHERING_NODES.filter((n) =>
      activeNodeIds.has(n.id)
    );

    return NextResponse.json({
      nodes: filteredNodes,
      edges: filteredEdges,
      hopsIncluded: maxHops,
      activeWalletsCount: filteredNodes.length,
      activeTransfersCount: filteredEdges.length,
    });
  } catch (error) {
    console.error("[Casper API] Trace expansion failed:", error);
    return NextResponse.json(
      { error: "Dynamic trace expansion failed" },
      { status: 500 }
    );
  }
}

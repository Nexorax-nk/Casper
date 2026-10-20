import { NextResponse } from "next/server";
import { falkorCryptoEngine } from "@/lib/falkordb/falkorClient";
import { getSeedTransactions, synthesizeMultiHopTransactionsForWallet } from "@/lib/falkordb/ingest";

export async function GET() {
  try {
    const status = await falkorCryptoEngine.getEngineStatus();
    return NextResponse.json({
      status: "SUCCESS",
      engine: status,
      dockerCommand: "docker run -p 6379:6379 -it --rm falkordb/falkordb:latest",
      falkorCloudInfo: "Compatible with FalkorDB Cloud & FalkorDB Community v2.10+",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch FalkorDB status";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body.action || "seed";

    if (action === "seed") {
      const seedTxs = getSeedTransactions();
      const result = await falkorCryptoEngine.ingestRawTransactions(seedTxs);
      return NextResponse.json({
        message: "Seeded FalkorDB syndicate graph successfully",
        ...result,
      });
    }

    if (action === "ingest_wallet") {
      const address = body.address || "0x71c828d132924c5e39b7038e219b25e7144e5973";
      const synthesis = synthesizeMultiHopTransactionsForWallet(address);
      const result = await falkorCryptoEngine.ingestRawTransactions(synthesis.transactions);
      return NextResponse.json({
        message: `Ingested multi-hop syndicate graph for wallet ${address}`,
        targetAddress: address,
        ...result,
      });
    }

    if (action === "ingest_transactions") {
      const transactions = body.transactions || [];
      const result = await falkorCryptoEngine.ingestRawTransactions(transactions);
      return NextResponse.json({
        message: `Ingested ${transactions.length} custom transactions into FalkorDB`,
        ...result,
      });
    }

    if (action === "cypher") {
      const query = body.query;
      if (!query) {
        return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
      }
      const result = await falkorCryptoEngine.executeCypher(query);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Data ingestion failed";
    console.error("[Casper API] Ingestion failed:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

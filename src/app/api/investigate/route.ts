import { NextResponse } from "next/server";
import { falkorCryptoEngine } from "@/lib/falkordb/falkorClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const caseIdOrAddress = body.caseId || body.address || "case_pig_butchering";

    const investigation = await falkorCryptoEngine.runForensicInvestigation(
      caseIdOrAddress
    );

    return NextResponse.json(investigation);
  } catch (error) {
    console.error("[Casper API] Investigation failed:", error);
    return NextResponse.json(
      { error: "Forensic graph investigation failed" },
      { status: 500 }
    );
  }
}

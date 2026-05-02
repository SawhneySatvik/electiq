import { NextResponse } from "next/server";
import { generateJSON } from "@/lib/gemini";
import type { Candidate, CandidateInsight } from "@/lib/types";

const PROMPT_PREFIX = `You are an election transparency analyst. Given a candidate's affidavit-declared data, provide context in plain language that a citizen can understand. Compare to typical values where possible.
All asset figures are in Indian Rupees (lakhs). 1 crore = 100 lakhs.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { candidate: Candidate };
    const c = body.candidate;
    if (!c || !c.id) {
      return NextResponse.json({ error: "candidate required" }, { status: 400 });
    }

    const prompt = `${PROMPT_PREFIX}
Candidate data:
${JSON.stringify(c, null, 2)}

Return ONLY valid JSON (no markdown) with this exact structure:
{
  "wealth_summary": "plain language summary of their assets",
  "wealth_context": "how this compares to typical Indian Lok Sabha/Vidhan Sabha candidates",
  "liability_note": "note on liabilities if significant, or 'No notable liabilities' if not",
  "criminal_context": "plain explanation if cases exist, or clean chit",
  "overall_profile": "1-sentence candidate profile"
}`;

    const insight = await generateJSON<CandidateInsight>(prompt);
    return NextResponse.json({ insight });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

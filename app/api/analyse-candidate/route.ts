import { NextResponse } from "next/server";
import { generateJSON } from "@/lib/gemini";
import type { Candidate, CandidateInsight } from "@/lib/types";
import { LOCALE_FOR_AI, LOCALES, type Locale } from "@/lib/i18n";

const PROMPT_PREFIX = `You are an election transparency analyst. Given a candidate's affidavit-declared data, provide context in plain language that a citizen can understand. Compare to typical values where possible.
All asset figures are in Indian Rupees (lakhs). 1 crore = 100 lakhs.`;

function pickLocale(value: unknown): Locale {
  if (typeof value === "string" && (LOCALES as string[]).includes(value)) return value as Locale;
  return "en";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { candidate: Candidate; locale?: unknown };
    const c = body.candidate;
    if (!c || !c.id) {
      return NextResponse.json({ error: "candidate required" }, { status: 400 });
    }
    const locale = pickLocale(body.locale);
    const languageDirective =
      locale === "en"
        ? ""
        : `\n\nWrite every string value in the JSON in ${LOCALE_FOR_AI[locale]}. Keep field names in English. Preserve party acronyms, numbers, and currency tokens (₹, Cr, L) verbatim.`;

    const prompt = `${PROMPT_PREFIX}${languageDirective}
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

import { NextResponse } from "next/server";
import { generateJSON } from "@/lib/gemini";
import type { ConstituencyAnalysis, LSConstituency } from "@/lib/types";
import { LOCALE_FOR_AI, LOCALES, type Locale } from "@/lib/i18n";

const SYSTEM_PROMPT = `You are an Indian election analyst with deep knowledge of the Election Commission of India's processes and Indian political history.
Analyse the provided constituency data and return structured JSON insights.
Be specific, data-grounded, and concise. Never hallucinate election results.
Only analyse what is present in the provided data.`;

function pickLocale(value: unknown): Locale {
  if (typeof value === "string" && (LOCALES as string[]).includes(value)) return value as Locale;
  return "en";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { constituency: LSConstituency; locale?: unknown };
    const c = body.constituency;
    if (!c || !c.results || c.results.length === 0) {
      return NextResponse.json({ error: "constituency with results required" }, { status: 400 });
    }
    const locale = pickLocale(body.locale);
    const languageDirective =
      locale === "en"
        ? ""
        : `\n\nWrite every string value in the JSON in ${LOCALE_FOR_AI[locale]}. Keep field names in English. Preserve party acronyms (BJP, INC, AAP, …), numbers, and currency tokens (₹, Cr, L) verbatim.`;

    const userPrompt = `${SYSTEM_PROMPT}${languageDirective}

Analyse this Lok Sabha / Vidhan Sabha constituency:
Constituency: ${c.name}
State: ${c.state}
Reserved: ${c.reserved}
Historical results:
${JSON.stringify(c.results, null, 2)}

Return ONLY valid JSON (no markdown) with this exact structure:
{
  "character": "stronghold" | "swing" | "volatile",
  "dominant_party": "party name or 'Contested'",
  "trend_summary": "2-3 sentences on overall pattern",
  "key_shift": "Most significant result change and why",
  "competitiveness": "current assessment of how competitive this seat is",
  "watch_factors": ["factor1", "factor2"]
}`;

    const analysis = await generateJSON<ConstituencyAnalysis>(userPrompt);
    return NextResponse.json({ analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

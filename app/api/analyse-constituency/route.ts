import { NextResponse } from "next/server";
import { generateJSON } from "@/lib/gemini";
import type { ConstituencyAnalysis, ConstituencyProfile, LSConstituency } from "@/lib/types";
import { LOCALE_FOR_AI, LOCALES, type Locale } from "@/lib/i18n";

const SYSTEM_PROMPT = `You are an Indian election analyst with deep knowledge of the Election Commission of India's processes and Indian political history.
Analyse the provided constituency data and return structured JSON insights.
Be specific, data-grounded, and concise. Never hallucinate election results.
Only analyse what is present in the provided data; if the structured profile is absent or partial, say so explicitly in the relevant section rather than fabricating numbers.`;

function pickLocale(value: unknown): Locale {
  if (typeof value === "string" && (LOCALES as string[]).includes(value)) return value as Locale;
  return "en";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      constituency: LSConstituency;
      profile?: ConstituencyProfile | null;
      locale?: unknown;
    };
    const c = body.constituency;
    if (!c || !c.results || c.results.length === 0) {
      return NextResponse.json({ error: "constituency with results required" }, { status: 400 });
    }
    const locale = pickLocale(body.locale);
    const languageDirective =
      locale === "en"
        ? ""
        : `\n\nWrite every string value in the JSON in ${LOCALE_FOR_AI[locale]}. Keep field names in English. Preserve party acronyms (BJP, INC, AAP, …), numbers, and currency tokens (₹, Cr, L) verbatim.`;

    const profileBlock = body.profile
      ? `\n\nStructured profile for this seat (use these numbers verbatim, do not invent new ones):\n${JSON.stringify(
          body.profile,
          null,
          2,
        )}`
      : `\n\nStructured profile: NOT PROVIDED. For demographics_summary, key_issues_synthesis, notable_history_summary and electoral_safety, return brief honest strings stating the profile is not loaded for this seat in the demo dataset.`;

    const userPrompt = `${SYSTEM_PROMPT}${languageDirective}

Analyse this Lok Sabha / Vidhan Sabha constituency:
Constituency: ${c.name}
State: ${c.state}
Reserved: ${c.reserved}
Historical results:
${JSON.stringify(c.results, null, 2)}${profileBlock}

Return ONLY valid JSON (no markdown) with this exact structure. Every field is required:
{
  "character": "stronghold" | "swing" | "volatile",
  "dominant_party": "party name or 'Contested'",
  "trend_summary": "2-3 sentences on the electoral pattern across the years provided",
  "key_shift": "Most significant result change and the most likely reason in plain language",
  "competitiveness": "Current assessment of competitiveness (e.g., margin trend, runner-up consolidation)",
  "watch_factors": ["factor1", "factor2"],
  "demographics_summary": "2-3 sentences synthesising population, urban/rural split, literacy and major communities from the structured profile. If profile not provided, say so honestly.",
  "key_issues_synthesis": "2-3 sentences linking the seat's key issues to the electoral outcomes — e.g., how a recurring issue maps onto the winning party. If profile not provided, say so honestly.",
  "notable_history_summary": "2-3 sentences summarising notable_history. If profile not provided, say so honestly.",
  "electoral_safety": "1-2 sentences on poll-violence notes and procedural-fairness context if any. If none documented, say 'No specific incidents documented in the demo profile.' Do NOT invent incidents.",
  "sociopolitical_context": "A single short paragraph (3-5 sentences) giving a holistic read for a citizen — what kind of seat this is socially, economically, and politically. Honest about uncertainty."
}`;

    const analysis = await generateJSON<ConstituencyAnalysis>(userPrompt);
    return NextResponse.json({ analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

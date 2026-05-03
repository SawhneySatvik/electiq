import { NextResponse } from "next/server";
import { generateJSON } from "@/lib/gemini";
import { LOCALES, LOCALE_FOR_AI, type Locale } from "@/lib/i18n";

export const runtime = "nodejs";

const SYSTEM = `You are a translator for an Indian elections data product called ElectoIQ.
You translate short UI strings from English to a target Indian language.

CRITICAL RULES (do not break):
- Preserve party acronyms verbatim: BJP, INC, AAP, TMC, SP, DMK, AIADMK, BSP, NCP, SS, TDP, YSRCP, BRS, CPI, CPI(M), JD(U), JD(S), RJD, RLD, AIMIM, SAD, LJP.
- Preserve numbers and currency tokens verbatim: ₹, Cr, L, lakhs, crore, %.
- Preserve placeholders verbatim, including the curly braces: e.g. {state}, {type}, {count}.
- Preserve URLs verbatim.
- Translate naturally — do not transliterate where a real translation exists.
- Output strictly valid JSON of the form { "translations": ["...", "...", ...] } with the SAME number of items in the SAME order as the input.
- No commentary, no markdown, no extra keys.`;

function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as string[]).includes(value);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { texts?: unknown; locale?: unknown };
    if (!Array.isArray(body.texts) || body.texts.length === 0) {
      return NextResponse.json({ error: "texts (string[]) required" }, { status: 400 });
    }
    if (!isLocale(body.locale)) {
      return NextResponse.json({ error: "valid locale required" }, { status: 400 });
    }
    const texts = body.texts.map((t) => String(t)).slice(0, 200);
    const locale = body.locale;
    if (locale === "en") {
      return NextResponse.json({ translations: texts });
    }

    const prompt = `${SYSTEM}

Target language: ${LOCALE_FOR_AI[locale]}
Translate the following ${texts.length} string(s):
${JSON.stringify(texts, null, 2)}

Return ONLY a JSON object: { "translations": [ ... ] }`;

    const result = await generateJSON<{ translations: string[] }>(prompt);
    if (!Array.isArray(result.translations) || result.translations.length !== texts.length) {
      return NextResponse.json({ translations: texts });
    }
    return NextResponse.json({ translations: result.translations });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

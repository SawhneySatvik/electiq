import { streamText } from "@/lib/gemini";
import { retrieveRelevantContext } from "@/lib/data-utils";
import type { ChatMessage } from "@/lib/types";
import { LOCALE_FOR_AI, LOCALES, type Locale } from "@/lib/i18n";

const SYSTEM_PROMPT = `You are ElectoIQ, an AI assistant for Indian election data analysis.
You have access to structured election data provided in the context below.
Answer questions about elections, constituencies, candidates, parties, and the Indian electoral process.

Rules:
- Only state facts that are supported by the provided context data.
- If asked about something not in the context, say "I don't have that data loaded — try searching for it in the Explore section."
- When citing a result, mention the year and constituency.
- Keep answers concise, factual, and 2-5 short paragraphs at most.
- For questions about the election process (how to vote, EVM, NOTA, model code of conduct), answer from your general knowledge of the Indian electoral system.
- Always be impartial — do not favour any political party.
- Asset figures in candidate records are in lakhs of Indian Rupees (1 crore = 100 lakhs).`;

export const runtime = "nodejs";

function pickLocale(value: unknown): Locale {
  if (typeof value === "string" && (LOCALES as string[]).includes(value)) return value as Locale;
  return "en";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { message: string; history?: ChatMessage[]; locale?: unknown };
    const { message } = body;
    if (!message || !message.trim()) {
      return new Response(JSON.stringify({ error: "message required" }), { status: 400 });
    }
    const locale = pickLocale(body.locale);
    const languageDirective =
      locale === "en"
        ? ""
        : `\n\nRespond in ${LOCALE_FOR_AI[locale]}. Preserve party acronyms (BJP, INC, AAP, …), numbers, and currency tokens (₹, Cr, L) verbatim.`;

    const context = retrieveRelevantContext(message, 10);
    const contextText =
      context.length > 0
        ? `Context data (the only source of facts you may cite):\n${JSON.stringify(
            context.map((c) => ({ type: c.type, label: c.label, data: c.data })),
            null,
            2,
          )}`
        : "Context data: (no matching records found in the dataset)";

    const userPrompt = `${contextText}\n\nUser question: ${message}`;
    const systemPrompt = `${SYSTEM_PROMPT}${languageDirective}`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          encoder.encode(
            `__CONTEXT__${JSON.stringify(
              context.map((c) => ({ type: c.type, id: c.id, label: c.label })),
            )}__END_CONTEXT__`,
          ),
        );
        try {
          for await (const chunk of streamText(systemPrompt, userPrompt)) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          controller.enqueue(encoder.encode(`\n\n[Error from model: ${msg}]`));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}

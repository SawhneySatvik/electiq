import { GoogleGenAI } from "@google/genai";

const FLASH_MODEL = "gemini-2.5-flash";
const PRO_MODEL = "gemini-2.5-pro";

let _client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (_client) return _client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Copy .env.local.example to .env.local and add a key.",
    );
  }
  _client = new GoogleGenAI({ apiKey });
  return _client;
}

export async function generateJSON<T = unknown>(prompt: string): Promise<T> {
  const client = getClient();
  const response = await client.models.generateContent({
    model: FLASH_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.4,
    },
  });
  const text = response.text ?? "";
  return safeParseJSON<T>(text);
}

export async function generateText(systemInstruction: string, userPrompt: string): Promise<string> {
  const client = getClient();
  const response = await client.models.generateContent({
    model: FLASH_MODEL,
    contents: userPrompt,
    config: {
      systemInstruction,
      temperature: 0.6,
    },
  });
  return response.text ?? "";
}

export async function* streamText(
  systemInstruction: string,
  userPrompt: string,
): AsyncGenerator<string> {
  const client = getClient();
  const stream = await client.models.generateContentStream({
    model: FLASH_MODEL,
    contents: userPrompt,
    config: { systemInstruction, temperature: 0.6 },
  });
  for await (const chunk of stream) {
    const t = chunk.text;
    if (t) yield t;
  }
}

function safeParseJSON<T>(raw: string): T {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }
  return JSON.parse(text) as T;
}

export const geminiModels = { flash: FLASH_MODEL, pro: PRO_MODEL };

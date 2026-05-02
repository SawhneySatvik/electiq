# ElectoIQ

India's Election Intelligence Platform — explore Lok Sabha and Vidhan Sabha results across 12 states, candidate-declared assets and criminal records, and ask grounded questions of the data through a Gemini-powered chatbot.

Built for election literacy. Demo data only — modeled on patterns from [MyNeta](https://myneta.info), [ADR](https://adrindia.org), and the Election Commission of India. **Not an official source.**

## Prerequisites

- Node.js 18.17+ (Next.js 14 requirement)
- A Google AI Studio API key for Gemini ([get one here](https://aistudio.google.com/app/apikey))

## Setup

```bash
npm install
cp .env.local.example .env.local
# Open .env.local and paste your GEMINI_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

Three pillars:

1. **Explore** — pick a state, toggle Lok Sabha / Vidhan Sabha, drill into a constituency. Get a Gemini-generated character read of the seat (stronghold / swing / volatile).
2. **Candidates** — search any candidate. See declared assets (movable + immovable), liabilities, criminal cases, education. AI insight card translates the affidavit into plain language.
3. **Chat** — ask anything about Indian elections. The chatbot extracts entities (state, party, year, candidate, constituency), retrieves matching records from the JSON, and grounds Gemini's answer in those records. The retrieved context is shown alongside every answer.

Three Gemini integrations:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/analyse-constituency` | Structured JSON insights about a seat's history |
| `POST /api/analyse-candidate` | Plain-language summary of a candidate's affidavit |
| `POST /api/chat` | Streaming RAG-grounded chat |

All three call **`gemini-2.5-flash`** via `@google/genai`. Model choice is centralised in `lib/gemini.ts`.

## Data sources

Three static JSON files in `/data`. Generated as realistic mock data modeled on real patterns:

- `lok_sabha.json` — 96 LS constituencies × 4 years (2009, 2014, 2019, 2024) across 12 states.
- `state_elections.json` — Recent Vidhan Sabha results: TN 2021, MH 2024, UP 2022, DL 2020, KA 2023.
- `candidates.json` — 78 candidate records with assets, liabilities, criminal cases, education.

Schemas live in `lib/types.ts`.

## Project structure

```
app/                    Next.js App Router pages + API routes
components/             UI components grouped by feature (ui, explore, candidates, chat)
data/                   Static JSON datasets
lib/                    Gemini client, data utilities, TypeScript types
store/                  Zustand global state
hooks/                  React hooks for analysis / search / chat
```

## Deploy

```bash
vercel --prod
```

Set `GEMINI_API_KEY` in the Vercel project's environment variables.

## License

Demo project. Use the patterns; verify the data against MyNeta / ECI before quoting any number.

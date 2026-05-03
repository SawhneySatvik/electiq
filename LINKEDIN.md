# LinkedIn post

> Save this as the post body. ~280 lines · technical · scannable. Tested for LinkedIn's render: hairline rules and pipe tables strip cleanly into bullet lists if the platform doesn't render them.

---

🇮🇳  Spent the last few weeks building **ElectoIQ** — India's Election Intelligence Platform — for **Google Prompt Wars**.

The brief was election literacy. The reality:
**31 states & UTs · 135 Lok Sabha seats · 15 Vidhan Sabha assemblies · 28 Rajya Sabha rosters · 43 curated seat profiles · 6 UI languages · 74 unit tests.**

A live multi-user citizen feed and exit poll. RAG chat grounded in the dataset. A party-coloured choropleth that zooms into any state on click. An AI seat analyst that reads demographics + history + electoral-safety context — but is forbidden from inventing the numbers it doesn't have.

## Eight Google services, end to end

▸  **Gemini 2.5 Flash** (`@google/genai`) drives four production routes:
   • A **constituency analyst** that returns an 11-field structured JSON: character, dominant party, trend, key shift, competitiveness, watch factors, demographics summary, issues × outcomes, notable history, **electoral-safety context**, and a holistic sociopolitical paragraph. Grounded in a structured `seat_profiles.json` block — the model is instructed to use those numbers verbatim and to say "not loaded" honestly when missing, instead of fabricating.
   • A **candidate affidavit explainer** that translates ADR-style declarations into plain-language wealth and criminal-record summaries.
   • A **streaming RAG chat** where a keyword-scoring retriever picks the records and Gemini is constrained to cite only those. The retrieved context is shown alongside every answer in a sidebar.
   • A **batched UI translator** — 80 ms debounce → one Gemini call → forever-cached in `electoiq-tx-{locale}` localStorage. Preserves party acronyms (BJP / INC / AAP / DMK / …) and currency tokens (₹, Cr, L) verbatim.

▸  **Firebase Authentication** — anonymous-by-default, opt-in Google OAuth via `signInWithPopup`. `AuthProvider` auto-bootstraps on first paint; `useAuth()` is the single source of truth across the app.

▸  **Cloud Firestore** — four collections (`voices`, `voice_upvotes`, `exit_poll_votes`, `exit_poll_tallies`). Real-time `onSnapshot` for the feed and tallies. Vote-and-increment runs in a Firestore transaction with `FieldValue.increment` so concurrent writes never lose a count.

▸  **Firebase Security Rules** (`firestore.rules`) — the trust boundary. Owner-only writes; `+1`-only increments on `upvotes` and `total`; doc-id-pattern auth (`voteId.split('_')[0] == request.auth.uid`) so reads of non-existent docs succeed for the owner without leaking other users' data; **image-bearing payloads explicitly rejected at the rules layer**, not just in the client.

▸  **Cloud Run + Cloud Build + Artifact Registry + Secret Manager** — multi-stage Dockerfile on `node:20-alpine` with `output: "standalone"` for a small, non-root-user image. `cloudbuild.yaml` builds, pushes both `:$COMMIT_SHA` and `:latest`, deploys to Cloud Run with `GEMINI_API_KEY` mounted from Secret Manager. `NEXT_PUBLIC_FIREBASE_*` baked at build, secrets at runtime — clean trust-boundary split.

## What I'm proud of

▸  **Defence in depth.** The Firestore rules don't trust the client — only the `upvotes` field on a Voice can change, and only by exactly +1. The Gemini routes don't trust the model — `safeParseJSON` strips fenced markdown before `JSON.parse`, and the chat prompt forbids facts outside the retrieved context. The container doesn't trust the runtime — non-root user, no shell, telemetry off.

▸  **Honest UI for every limitation.** Where data is curated demo (not authoritative), the UI says so. Where exit-poll uniqueness is keyed to a Firebase UID, a banner explains that signing in/out gives you a new UID — UI demo, not cryptographic anonymity. Where Firebase isn't configured, a green "Connected to Firestore" banner flips to amber "device storage" so users are never surprised. Where the GeoJSON fetch fails, a hand-coded centroid `BubbleFallback` keeps the map alive.

▸  **74 unit tests in ~1.3 s** (Vitest + happy-dom). Coverage focuses on logic: RAG retrieval scoring, transactional store paths (including the **double-vote rejection contract** for exit poll, and the **transactional upvote dedup** for voices), i18n fallback semantics, dict-shape invariants, formatter edge cases. The suite caught a real localStorage UID-fallback bug mid-build — fixed inline. Tests aren't theatre.

▸  **Six-locale UI** with a hybrid static + runtime translation system. en + hi from static dicts (zero latency); ta / bn / mr / te dispatched to `/api/translate`, persisted in localStorage. Every Gemini-backed route accepts a `locale` parameter and instructs the model to respond in that language while preserving acronyms and numbers verbatim.

▸  **Phased delivery.** Every feature shipped with `npm run typecheck` + `npm run build` + `npm test` all green at the boundary. No half-finished states checked in.

▸  **Performance hygiene.** Standalone Next.js build (sub-200 MB Cloud Run image). Static generation for 6 of 11 routes. GeoJSON pre-rounded to 2 decimals (1 MB → 369 KB). Map zoom interpolated via `requestAnimationFrame` cubic easing — not per-frame React state thrash. Real-time without polling via `onSnapshot`. Translation cache amortises Gemini calls to once-per-string-ever.

## A few details I think are interesting

▸  **State fills derive from the dominant LS-winner party** in the latest cycle. Click any state on the choropleth — it animates a `geoBounds`-derived zoom into that state, and the constituency grid below filters to its seats. Hover shows the dominant-party badge with brand colour and seat count. A bottom-left legend lists the top 6 parties present.

▸  **Exit poll is per-election.** Pick from 35 upcoming/recent elections (Maharashtra VS 2029, Bihar VS 2030, All India LS 2029, …). Pick from a state-specific party set derived from real LS/VS/RS history (not a global dropdown). The bar chart updates live as other users vote.

▸  **The seat-detail page is the holistic view.** Margin-trend chart + four-cycle history table on the left; on the right, the structured `SeatProfileCard` (population delta, electors, literacy, urban/rural split, communities chip-row, key-issues tag-row, history bullets, poll-period notes with year prefixes) + the AI's holistic read grounded in those exact numbers. The AI section explicitly notes when no profile is loaded — no invented demographics.

## Tech stack

Next.js 14 (App Router) · TypeScript (strict) · Tailwind CSS · Zustand · Recharts · `@google/genai` · Firebase Web SDK 12 · react-simple-maps + d3-geo · Vitest · happy-dom · Docker · GCP (Cloud Run, Cloud Build, Artifact Registry, Secret Manager, Firestore, Firebase Auth, Gemini API)

---

**Repo:** [link]
**Live:** [link]

#GoogleCloud #GeminiAPI #Firebase #CloudRun #NextJS #TypeScript #IndianElections #ElectionTech #PromptEngineering #RAG #PromptWars

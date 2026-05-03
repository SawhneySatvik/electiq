# ElectoIQ — India's Election Intelligence Platform

> **Built for Google Prompt Wars.** Next.js 14 · TypeScript (strict) · Gemini 2.5 · Firebase · Cloud Run.

ElectoIQ turns three decades of Indian election data into something a citizen can actually use:

- **Explore** — a party-coloured choropleth of India that zooms into any state on click; drill into any seat for a four-cycle history table, a margin-trend chart, the Rajya Sabha roster for that state, and an AI-generated *holistic* read of the seat (demographics, key issues × outcomes, notable history, electoral-safety context).
- **Candidates** — affidavit transparency. Search any candidate; see declared assets / liabilities / criminal cases / education with an AI plain-language insight grounded in the affidavit.
- **Chat** — RAG over the dataset. A keyword-scoring retriever picks the records, Gemini is constrained to cite only those, and the retrieved context is shown alongside every answer.
- **Voices** — citizen feed backed by Firebase Auth + Firestore (real-time, anonymous-by-default, optional Google sign-in, "post anonymously" toggle).
- **Exit Poll** — per-Firebase-UID vote on any upcoming election; live tally bar chart that updates as other users vote, via Firestore `onSnapshot`.

Built for election literacy. Demo data only — modeled on patterns from [MyNeta](https://myneta.info), [ADR](https://adrindia.org), the Election Commission of India, and [Lok Dhaba](https://lokdhaba.ashoka.edu.in). **Not an official source.**

---

## Coverage at a glance

| | |
|---|---|
| **States / UTs covered** | All |
| **Lok Sabha seats** | 135 (×4 election cycles: 2009, 2014, 2019, 2024) |
| **Vidhan Sabha records** | 135 across 15 state assemblies |
| **Rajya Sabha rosters** | 28 states |
| **Upcoming-election entries** | 35 |
| **Curated seat profiles** | 43 (population, electors, literacy, communities, key issues, notable history, poll-period notes) |
| **Candidate affidavits** | 78 |
| **UI languages** | 6 (en / hi static · ta / bn / mr / te runtime-translated via Gemini, cached in localStorage) |
| **Unit tests** | 101 across 9 files (Vitest + happy-dom, ~1.7 s) |

---

## Google service integration

Eight Google services back ElectoIQ end to end. Each is documented with the file that exercises it.

| Service | What it powers in ElectoIQ | Where it lives |
|---|---|---|
| **Gemini API** (`@google/genai`, `gemini-2.5-flash`) | Four server routes: streaming RAG chat, structured-JSON constituency + candidate analysis, batched UI translation. Locale-aware system prompts; JSON-mode for deterministic shapes; streaming with chunk guard. | `lib/gemini.ts`, `app/api/{chat,analyse-constituency,analyse-candidate,translate}/route.ts` |
| **Firebase Authentication** | Anonymous-by-default + opt-in Google OAuth. `AuthProvider` auto-bootstraps on first paint; `useAuth()` is the single source of truth across the app. | `lib/firebase.ts`, `lib/auth.tsx`, `components/ui/AuthMenu.tsx` |
| **Cloud Firestore** | Four collections (`voices`, `voice_upvotes`, `exit_poll_votes`, `exit_poll_tallies`). Real-time `onSnapshot` feeds; transactions with `FieldValue.increment` for atomic upvotes and tally updates. | `lib/voices-store.ts`, `lib/exit-poll-store.ts` |
| **Firebase Security Rules** | Defence-in-depth: owner-only writes; `+1`-only increments on `upvotes` and `total`; doc-id-pattern auth (`voteId.split('_')[0] == request.auth.uid`); explicit rejection of any image-bearing payload at the rules layer. | `firestore.rules` |
| **Cloud Run** | Containerised Next.js (`output: "standalone"`); non-root `nextjs:1001` user; `GEMINI_API_KEY` mounted as a runtime secret. | `Dockerfile`, `next.config.js` |
| **Cloud Build** | Single trigger: build → push → deploy. `NEXT_PUBLIC_*` baked at build time via `--build-arg`; secrets at runtime via `--set-secrets`. | `cloudbuild.yaml` |
| **Secret Manager** | `gemini-api-key` mounted into Cloud Run via `--set-secrets=GEMINI_API_KEY=gemini-api-key:latest`. | `cloudbuild.yaml` (deploy step) |
| **Artifact Registry** | Versioned image tags (`:$COMMIT_SHA` + `:latest`) in `${REGION}-docker.pkg.dev/$PROJECT_ID/electoiq/electoiq`. | `cloudbuild.yaml` (push step) |

---

## Codebase quality

- **Strict TypeScript** across `app/`, `components/`, `lib/`, `hooks/`, `store/`. `tsc --noEmit` is green; enforced in CI.
- **ESLint + Prettier + EditorConfig + `.nvmrc`** — `next/core-web-vitals` config with stricter rules (`eqeqeq`, `prefer-const`, `no-console`); `npm run lint` reports zero warnings.
- **GitHub Actions CI** (`.github/workflows/ci.yml`) — runs typecheck → lint → test → build on every push and PR. Concurrency-cancelled per branch; 10-min timeout.
- **Dependabot** weekly npm updates + monthly Action updates with grouped types/vitest PRs.
- **Layered structure** — pure logic in `lib/`, presentation in `components/` (grouped by feature: `ui`, `explore`, `candidates`, `chat`), routing in `app/` (App Router), persistent state in `store/`, side-effecting hooks in `hooks/`.
- **Single source of truth per concern.** Gemini calls through `lib/gemini.ts` only. RAG retrieval in one function (`retrieveRelevantContext`). Brand colours in `lib/party-colors.ts`. localStorage keys in `lib/storage-keys.ts`. API errors via `lib/api-error.ts` (consistent `{ error, code? }` envelope). Theme tokens are CSS variables — no hex hardcodes in components.
- **Hybrid-store pattern.** `lib/voices-store.ts` and `lib/exit-poll-store.ts` expose one public API; internally they dispatch to Firestore when configured, localStorage otherwise. Components never branch on backend mode.
- **JSDoc on every public `lib/` export** so the next reader's hover-IntelliSense answers what they need.
- **Phased delivery discipline.** Each feature shipped with `npm run typecheck` + `npm run lint` + `npm run build` + `npm test` all green at the boundary.
- **MIT `LICENSE`, `CONTRIBUTING.md`, `CHANGELOG.md`** following Keep a Changelog and SemVer.

```
app/                Next.js App Router pages + API routes
components/         Feature-grouped UI (ui, explore, candidates, chat)
data/               Static JSON datasets (LS, VS, RS, candidates, profiles, upcoming)
lib/                Gemini client, Firebase client, auth, i18n, RAG, stores
hooks/              React hooks for analysis / search / chat
store/              Zustand global state
__tests__/          Vitest unit tests
firestore.rules     Production Firestore security rules
Dockerfile          Multi-stage Cloud Run image (node:20-alpine, standalone)
cloudbuild.yaml     Build → push → deploy pipeline
```

---

## Accessibility

- **Skip-to-main-content link** as the first focusable element in the DOM (`SkipLink`); lands on the `#main` landmark.
- **`<html lang>` follows the active locale** via a `HtmlLangSync` client component — screen readers pronounce content correctly when the user switches between en/hi/ta/bn/mr/te.
- **Semantic landmarks** — `<header>`, `<main>` (with `id="main"` and `tabIndex={-1}` for skip-link target), `<footer>`, `<nav aria-label="Primary">`.
- **ARIA where it counts** — `aria-current="page"` on the active nav link; `aria-label`, `aria-haspopup`, `aria-expanded`, `role="menu"` on the auth dropdown; `role="img"` + `aria-label` on the SVG India map; `role="status"` + `aria-live="polite"` on streaming chat assistant messages and the exit-poll tally.
- **Form labels properly associated** — every `<input>`/`<select>`/`<textarea>` has an `htmlFor`-bound `<label>` (visible or `sr-only`).
- **Visible focus rings** — custom `focus-visible:ring-2 focus-visible:ring-accent` on interactive controls; never relies on the default browser outline alone.
- **Icon-only controls labelled** — `ThemeToggle` has `aria-label` + `title`; loading dots in chat are `aria-hidden="true"` with a parent `aria-label="Assistant is typing"`.
- **Keyboard-only flows** for sign-in, locale switch, theme toggle, exit-poll voting, voices composer.
- **Six locales** — en/hi/ta/bn/mr/te. Static dicts for en + hi; ta/bn/mr/te dispatched to `/api/translate` and cached forever in `electoiq-tx-{locale}` localStorage. UI strings via `useT(key)`; dynamic body text via `useTranslated(rawText)`.
- **Light + dark theme** — CSS variables on `[data-theme]`. `prefers-color-scheme` honoured at first paint via an inline boot script — no flash of unstyled content.
- **Graceful degradation** — `BubbleFallback` renders a hand-coded centroid map if the GeoJSON fetch fails; storage banners on `/voices` and `/exit-poll` make backend mode explicit so users are never surprised.
- **Contrast** — accent colour darkens to `#ea580c` in light mode for AA contrast against white surfaces.

---

## Security

Defence in depth across four trust boundaries.

**Firestore rules** (`firestore.rules`):
- Public read on `voices` and `exit_poll_tallies`; everything else owner-only.
- `voice_upvotes` and `exit_poll_votes` use doc-id-pattern auth (`upvoteId.split('_')[0] == request.auth.uid`) so reads of non-existent docs (the transaction's pre-check) succeed without leaking other users' data.
- `voices` updates: `request.resource.data.diff(resource.data).changedKeys().hasOnly(['upvotes']) && upvotes == previous + 1` — only the upvote counter, only +1 at a time.
- `exit_poll_tallies` updates: `total == previous + 1` — no arbitrary tally tampering.
- Voices create: text 1–1500 chars, `upvotes == 0`, `isAnonymous` is bool, **no `image` or `imageUrl` fields permitted at the rules layer** (image upload was deliberately removed; rules enforce that the client can't sneak it back in).

**Secret hygiene:**
- `GEMINI_API_KEY` is server-only — never crosses into the client bundle. Cloud Run mounts it via Secret Manager.
- `NEXT_PUBLIC_FIREBASE_*` are public *by design* — they're meant to live in the client bundle; Firestore rules are what actually protect the data.

**LLM guardrails:**
- RAG chat prompt explicitly forbids facts outside the retrieved context: *"Only state facts that are supported by the provided context data."*
- `safeParseJSON` strips fenced markdown (` ```json `…` ``` `) before `JSON.parse` to defend against model output that wraps JSON.
- Constituency-analysis prompt mandates honest "not loaded" strings when the structured profile is missing — the model is forbidden from inventing demographics or violence incidents.

**Container hardening:**
- Multi-stage Dockerfile copies only the `.next/standalone` bundle into the runtime image.
- Non-root user (`nextjs:1001`) — no shell access, no write permissions outside `/app`.
- `NEXT_TELEMETRY_DISABLED=1`.

**Input validation at the API edge:**
- `/api/translate` clamps `texts.length` to 200 and rejects unknown locales.
- All API routes return structured `{ error }` JSON instead of leaking stack traces.

---

## Test coverage

```bash
npm test            # 101 tests across 9 files in ~1.7 s
npm run test:watch
npm run test:coverage
```

Vitest + happy-dom; `vitest.config.ts` resolves the `@/` alias and mounts a localStorage polyfill (`__tests__/setup.ts`) because happy-dom 15 ships an incomplete `Storage` shim. Same suite runs on every push and PR via the GitHub Actions CI gate.

| File | Tests | Focus |
|---|---|---|
| `__tests__/data-utils.test.ts` | 44 | Formatters (`formatAssets`, `formatVotes`); `getPartyColor` with brand + fallback; dataset coverage helpers (`getAllStates`, `getAllParties`, `getAllYears`); `searchCandidates` filter combinations; `getConstituencyById` / `getCandidateById` lookups; `getDominantPartyByState` invariants; `getCredibleParties` (national + state derivation, sort, dash exclusion); `getNextElections` (status filter, year sort, All-India presence); `getRajyaSabhaForState`, `getSeatProfile`; **RAG (`retrieveRelevantContext`)** — name match, richest intent, schedule intent, Rajya-Sabha intent, profile-merge into context, `maxRecords` cap. |
| `__tests__/i18n.test.ts` | 13 | `interpolate` (vars, missing vars, multi-occurrence, numeric coercion); `lookupStatic` (en hit, hi hit, fallback flag, missing key, en-never-fallback); dict-shape invariants (locale completeness, en/hi key alignment, ta/bn/mr/te empty by design). |
| `__tests__/exit-poll-store.test.ts` | 12 | `electionKey` formatting; validation rejections (empty key, empty party); first-vote success; **double-vote rejection contract**; `getMyVote` reflection; multi-election allowance from same browser; `getAllMyVotes`; `subscribeTally` synchronous emission and persisted-tally emission. |
| `__tests__/voices-store.test.ts` | 5 | `addVoice` create + persist + whitespace trim; newest-first ordering; **transactional upvote dedup**; `getMyUpvotes` set semantics. |
| `__tests__/party-colors.test.ts` | 11 | National + regional brand colours; J&K / Northeast / island coverage; hex format invariants; semantic character-badge palette. |
| `__tests__/storage-keys.test.ts` | 3 | `electoiq-` namespace consistency; suffix-based key builders; mutual distinctness. |
| `__tests__/api-error.test.ts` | 7 | `toErrorMessage` for `Error`/string/opaque; `errorResponse` status + envelope; `unexpectedError` 500 + `UNEXPECTED` code. |
| `__tests__/api-translate.test.ts` | 4 | API route input validation — empty array, non-array, unknown locale, en short-circuit (returns inputs verbatim without a Gemini call). |
| `__tests__/api-analyse-constituency.test.ts` | 2 | API route input validation — missing constituency, empty results array. |

The suite caught a real bug mid-build (`getMyUpvotes` didn't fall back to `lsEnsureUid()` when called with a null uid) — fixed inline. Tests are not theatre.

---

## Performance

- **Standalone Next.js build** (`output: "standalone"`) — Cloud Run image stays under 200 MB.
- **Static generation** for `/`, `/candidates`, `/chat`, `/exit-poll`, `/explore`, `/voices`. Dynamic only where it must be (`/api/*`, `/explore/[id]`, `/candidates/[id]`).
- **Translation runtime** debounces by 80 ms and batches multiple keys into a single Gemini call; results cached in `electoiq-tx-{locale}` localStorage forever. Subsequent visits in non-en/hi locales are instant.
- **Pre-processed GeoJSON** — coordinates rounded to 2 decimals (~1.1 km precision), 1 MB → 369 KB raw / ~80 KB gzipped. Property keys slimmed to just `ST_NM`.
- **Real-time without polling** — Firestore `onSnapshot` for the voices feed (limited to 100 most recent) and exit-poll tally (single doc).
- **Memoised dominant-party map** computed once per page render, not per-feature; passed to `IndiaMap` as a prop.
- **Animated zoom without React thrash** — cubic-easing interpolation via `requestAnimationFrame`, not per-frame state updates; cancelled on unmount.
- **Recharts data clamped** to top-12 parties on the exit-poll bar so the SVG stays light.

Build output (`npm run build`):

```
Route (app)                   Size      First Load JS
○ /                           1.67 kB   139 kB
○ /candidates                 3.7 kB    141 kB
○ /chat                       4.52 kB   106 kB
○ /exit-poll                  3.91 kB   352 kB   (Firebase SDK)
○ /explore                    43.2 kB   181 kB   (react-simple-maps + GeoJSON)
○ /voices                     3.49 kB   219 kB   (Firebase SDK)
ƒ /api/*                      0 B       (server-rendered on demand)
+ First Load JS shared        87.3 kB
```

---

## Quickstart

### Prerequisites

- Node.js 18.17+ (Next.js 14 requirement)
- A Google AI Studio API key for Gemini ([get one here](https://aistudio.google.com/app/apikey))

### Local dev

```bash
npm install
cp .env.local.example .env.local
# Open .env.local and paste your GEMINI_API_KEY
npm run dev
```

Open <http://localhost:3000>.

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server with hot reload |
| `npm run build` | Production build (`output: "standalone"`) |
| `npm start` | Run the standalone build |
| `npm run typecheck` | `tsc --noEmit` strict typecheck |
| `npm test` | Vitest (74 tests, ~1.3 s) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:coverage` | Vitest with v8 coverage |
| `npm run sync-lokdhaba` | Stub script for ingesting Lok Dhaba CSVs (placeholder) |

---

## Architecture deep-dive

### Gemini integration (`lib/gemini.ts`)

```ts
const FLASH_MODEL = "gemini-2.5-flash";

export async function generateJSON<T>(prompt: string): Promise<T> { … }
export async function generateText(systemInstruction: string, userPrompt: string): Promise<string> { … }
export async function* streamText(systemInstruction: string, userPrompt: string): AsyncGenerator<string> { … }
```

All four AI routes go through these three helpers. `safeParseJSON` strips fenced markdown before parsing.

| Route | Helper | Output |
|---|---|---|
| `POST /api/analyse-constituency` | `generateJSON` | 11-field `ConstituencyAnalysis` (character, demographics_summary, key_issues_synthesis, electoral_safety, sociopolitical_context, …) — grounded in `seat_profiles.json` when available |
| `POST /api/analyse-candidate` | `generateJSON` | 5-field `CandidateInsight` (wealth_summary, wealth_context, liability_note, criminal_context, overall_profile) |
| `POST /api/chat` | `streamText` | Streaming RAG; prelude `__CONTEXT__…__END_CONTEXT__` carries the retrieved record IDs to the client |
| `POST /api/translate` | `generateJSON` | `{ translations: string[] }`; preserves party acronyms + ₹/Cr/L tokens |

### RAG retrieval (`lib/data-utils.ts:retrieveRelevantContext`)

Keyword-scoring over five record types (`constituency`, `vs_constituency`, `candidate`, `rajya_sabha`, `upcoming`) with intent boosts:

- State-name aliases (`mumbai → Maharashtra`, `tn → Tamil Nadu`, …)
- Year regex `\b(20\d{2})\b`
- Party matching (acronym in question)
- "Richest" intent → boost candidates by `total_assets_lakhs / 5000`
- "Criminal" intent → boost candidates with `criminal_cases > 0`
- "Rajya Sabha" intent → boost RS rosters
- "Upcoming / next / schedule" intent → boost upcoming-elections records
- Profile-question intent (`population`, `demograph`, `violence`, `history`) → merge `seat_profiles.json` entry into the context record

Top 10 records returned. The chat route forbids any fact outside this set.

### Firebase architecture

| Layer | Responsibility |
|---|---|
| `lib/firebase.ts` | Lazy SDK init from `NEXT_PUBLIC_FIREBASE_*` env. `isFirebaseConfigured()` boolean controls which path the stores take. |
| `lib/auth.tsx` | `AuthProvider` mounts inside `LocaleProvider`. Auto-`signInAnonymously()` on first paint when configured; `signInWithPopup(GoogleAuthProvider)` for opt-in identity. `useAuth()` returns `{ uid, isAnonymous, displayName, photoURL, signInWithGoogle, signOut, configured, ready }`. |
| `lib/voices-store.ts` | Public API: `subscribeVoices`, `addVoice`, `upvote`, `getMyUpvotes`. Internal dispatch on `isFirebaseConfigured()`. Upvotes use a transaction that creates `voice_upvotes/{uid}_{voiceId}` and bumps `voices/{voiceId}.upvotes` atomically. |
| `lib/exit-poll-store.ts` | Public API: `subscribeTally`, `castVote`, `getMyVote`, `electionKey`. Cast-vote transaction creates `exit_poll_votes/{uid}_{key}` and bumps `exit_poll_tallies/{key}.total` + `byParty.{party}` via `FieldValue.increment`. |
| `firestore.rules` | The trust boundary. Owner-only writes, increment-only updates, image rejection. |

---

## Optional: Firebase backend for Voices & Exit Poll

`/voices` and `/exit-poll` work out of the box with per-device localStorage. To make them multi-user, plug in Firebase. Cost stays at $0 on the Spark plan for demo traffic.

1. Create a Firebase project at <https://console.firebase.google.com>.
2. **Authentication → Sign-in method**: enable both **Anonymous** and **Google**.
3. **Firestore Database**: create the database in production mode, then paste the contents of `firestore.rules` (in this repo) into **Rules** and publish.
4. **Project settings → General → Your apps**: register a Web app, copy the config. Map the values into `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
5. Restart `npm run dev`. The green "Connected to Firestore" banner on `/voices` and `/exit-poll` confirms the switch.

Schema:

| Collection | Doc id | Fields |
| --- | --- | --- |
| `voices` | auto | `text`, `authorUid`, `authorName`, `authorPhotoURL`, `isAnonymous`, `createdAt`, `upvotes` |
| `voice_upvotes` | `{uid}_{voiceId}` | `uid`, `voiceId`, `createdAt` |
| `exit_poll_votes` | `{uid}_{electionKey}` | `uid`, `electionKey`, `party`, `createdAt` |
| `exit_poll_tallies` | `{electionKey}` | `total`, `byParty` (map) |

---

## Deploy

### GCP Cloud Run (recommended)

The app ships with `Dockerfile` + `cloudbuild.yaml` ready for Cloud Run.

**One-time setup:**

```bash
PROJECT_ID=$(gcloud config get-value project)
REGION=asia-south1
REPO=electoiq

# 1. APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com \
  artifactregistry.googleapis.com secretmanager.googleapis.com

# 2. Artifact Registry
gcloud artifacts repositories create $REPO \
  --repository-format=docker --location=$REGION

# 3. GEMINI_API_KEY in Secret Manager
echo -n "your_gemini_api_key" | gcloud secrets create gemini-api-key --data-file=-

# 4. Cloud Build SA → run.admin + iam.serviceAccountUser
#    Cloud Run runtime SA → secretmanager.secretAccessor
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com \
  --role=roles/run.admin
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com \
  --role=roles/iam.serviceAccountUser
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member=serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

**Manual deploy:**

```bash
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_NEXT_PUBLIC_FIREBASE_API_KEY=...,_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...,_NEXT_PUBLIC_FIREBASE_PROJECT_ID=...,_NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...,_NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...,_NEXT_PUBLIC_FIREBASE_APP_ID=...
```

**Auto-deploy on push:** create a Cloud Build trigger pointed at this repo; configure the same `_NEXT_PUBLIC_FIREBASE_*` substitutions in the trigger UI.

**Env model (trust boundary split):**

| Var | Where | When | Why |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | Secret Manager → mounted at runtime | runtime | server-only, never in client bundle |
| `NEXT_PUBLIC_FIREBASE_*` | Cloud Build substitutions → `--build-arg` | build | baked into client JS, public anyway; Firestore rules protect the data |

### Vercel

```bash
vercel --prod
```

Set `GEMINI_API_KEY` and the six `NEXT_PUBLIC_FIREBASE_*` vars in the project's environment.

---

## Data sources

Six static JSON files in `/data`. Generated as realistic demo data modeled on real patterns. Not authoritative — verify against MyNeta / ECI / Lok Dhaba before quoting any number.

| File | Coverage |
|---|---|
| `lok_sabha.json` | 135 LS constituencies × 4 cycles (2009 / 2014 / 2019 / 2024) across 31 states/UTs |
| `state_elections.json` | 15 Vidhan Sabha elections (TN 2021, MH 2024, UP 2022, DL 2020, KA 2023, MP 2023, TG 2023, BR 2020, OD 2024, HR 2024, JK 2024, MN 2022, TR 2023, ML 2023, NL 2023) |
| `candidates.json` | 78 affidavit records — assets, liabilities, criminal cases, education |
| `rajya_sabha.json` | 28 state rosters |
| `upcoming_elections.json` | 35 scheduled / recently-completed events |
| `seat_profiles.json` | 43 seat profiles — population, electors, literacy, communities, key issues, notable history, poll-period notes |

Schemas live in `lib/types.ts`. The Lok Dhaba sync script stub is at `scripts/sync-lokdhaba.ts`.

---

## License

Demo project. Use the patterns; verify the data against MyNeta / ECI / Lok Dhaba before quoting any number.

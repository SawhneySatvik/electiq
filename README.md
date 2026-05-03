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

## Optional: Firebase backend for Voices & Exit Poll

`/voices` and `/exit-poll` work out of the box with per-device localStorage. To
make them multi-user, plug in Firebase. Cost stays at $0 on the Spark plan for
demo traffic.

1. Create a Firebase project at <https://console.firebase.google.com>.
2. **Authentication → Sign-in method**: enable both **Anonymous** and **Google**.
3. **Firestore Database**: create the database in production mode, then paste
   the contents of `firestore.rules` (in this repo) into **Rules** and publish.
4. **Project settings → General → Your apps**: register a Web app, copy the
   config. Map the values into `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
5. Restart `npm run dev`. The "Connected to Firestore" banner on `/voices` and
   `/exit-poll` confirms the switch.

Schema:

| Collection | Doc id | Fields |
| --- | --- | --- |
| `voices` | auto | `text`, `authorUid`, `authorName`, `authorPhotoURL`, `isAnonymous`, `createdAt`, `upvotes` |
| `voice_upvotes` | `{uid}_{voiceId}` | `uid`, `voiceId`, `createdAt` |
| `exit_poll_votes` | `{uid}_{electionKey}` | `uid`, `electionKey`, `party`, `createdAt` |
| `exit_poll_tallies` | `{electionKey}` | `total`, `byParty` (map) |

Writes use Firestore transactions and `FieldValue.increment` so concurrent votes
and upvotes settle atomically.

## Deploy

### Vercel

```bash
vercel --prod
```

Set `GEMINI_API_KEY` and the six `NEXT_PUBLIC_FIREBASE_*` vars.

### GCP Cloud Run

The app ships with `Dockerfile` + `cloudbuild.yaml` ready for Cloud Run. Build
output is `output: "standalone"` so the runtime image is small.

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

# 4. Cloud Build SA → run.admin + iam.serviceAccountUser; Cloud Run runtime
#    SA → secretmanager.secretAccessor.
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

**Auto-deploy on push:** create a Cloud Build trigger pointed at this repo,
configure the same `_NEXT_PUBLIC_FIREBASE_*` substitutions in the trigger UI.

**Env model:**

| Var | Where | When | Why |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | Secret Manager → mounted at runtime | runtime | server-only, never in client bundle |
| `NEXT_PUBLIC_FIREBASE_*` | Cloud Build substitutions → `--build-arg` | build | baked into client JS, public anyway |

## License

Demo project. Use the patterns; verify the data against MyNeta / ECI before quoting any number.

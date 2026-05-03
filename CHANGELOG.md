# Changelog

All notable changes to ElectoIQ are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Repo-hygiene scaffolding: ESLint config, Prettier, EditorConfig, `.nvmrc`, MIT `LICENSE`, `CONTRIBUTING.md`, `CHANGELOG.md`, GitHub Actions CI workflow.
- Module extraction: `lib/party-colors.ts`, `lib/storage-keys.ts`, `lib/api-error.ts` for stronger separation of concerns.
- JSDoc across public exports in `lib/`.
- Accessibility polish: skip-to-main-content link, dynamic `<html lang>` driven by the active locale, `aria-current` on active nav links, `aria-live` on streaming chat output and exit-poll tally, `htmlFor` label associations, screen-reader text on icon-only controls.
- Additional tests: API input validators (`/api/translate`, `/api/analyse-constituency`), party-color and storage-key helpers, more RAG edge cases.

## [0.5.0] — Phase E + F

### Added
- **Firebase Auth + Firestore** for `/voices` and `/exit-poll`. Anonymous-by-default with optional Google OAuth.
- **Global AuthMenu** in the navbar (right side) — sign-in pill / avatar dropdown / hidden when Firebase isn't configured.
- **Cloud Run deploy artifacts**: `Dockerfile` (multi-stage, `node:20-alpine`, standalone, non-root user), `cloudbuild.yaml` (build → push → deploy), `.dockerignore`.
- **Vitest test suite** — 74 tests across 4 files, ~1.3 s.
- **Firestore security rules** (`firestore.rules`) — owner-only writes, `+1`-only increments on aggregates, doc-id-pattern auth, image-payload rejection.

### Changed
- Voices: dropped image upload entirely (text-only).
- Exit poll: keyed votes by Firebase UID instead of localStorage device id.

### Fixed
- `getMyUpvotes` now falls back to `lsEnsureUid()` when called with a null UID under the localStorage path (caught by tests).
- Firestore rules `get` permissions split from `list` so non-existent doc reads succeed for the rightful owner.

## [0.4.0] — Phase A–D

### Added
- **Data expansion**: 31 states/UTs covered (135 LS seats, 15 VS state assemblies, 28 RS rosters, 35 upcoming-election entries, 43 curated seat profiles).
- **Map zoom-on-click** with party-coloured fills and a top-party legend.
- **Holistic AI insight** for each LS seat — demographics summary, key issues × outcomes, electoral-safety context, sociopolitical paragraph — grounded in `seat_profiles.json`.
- **Seat profile card** surfacing population, electors, literacy, communities, key issues, notable history, poll-period notes.
- **Exit poll keyed to upcoming elections** — pick from 35 events, vote for a credible state-specific party, live tally bar chart.

## [0.3.0] — Phases 1–5

### Added
- **India choropleth map** (`react-simple-maps` + bundled GeoJSON) with click-to-state filter and bubble-fallback for failure modes.
- **Multilingual UI** — six locales (en/hi/ta/bn/mr/te) with hybrid static + Gemini runtime translation, cached in localStorage.
- **Theme system** — light + dark via CSS variables on `[data-theme]`; no-FOUC inline boot script.
- **Voices and Exit Poll** (initial localStorage versions).

## [0.1.0] — Initial release

### Added
- Three pillars: Explore, Candidates, Chat.
- Three Gemini routes: `/api/analyse-constituency`, `/api/analyse-candidate`, `/api/chat` (streaming RAG).
- Static JSON dataset for 12 states.

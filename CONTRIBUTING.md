# Contributing to ElectoIQ

Thanks for taking a look. ElectoIQ is a demo project but the contribution
workflow is real.

## Local setup

```bash
git clone <repo>
cd electiq
nvm use            # respects .nvmrc → Node 20
npm install
cp .env.local.example .env.local   # paste your GEMINI_API_KEY
npm run dev
```

## Workflow

1. **Open an issue first** for anything beyond a typo. Describe the change and
   link to the file paths affected.
2. **Branch from `main`**: `git checkout -b feat/your-change` or `fix/...`.
3. **Run the gate locally before pushing:**
   ```bash
   npm run typecheck   # tsc --noEmit
   npm run lint        # next lint
   npm test            # 74+ Vitest tests
   npm run build       # next build (output: standalone)
   ```
   All four must pass. CI runs the same gate on every push (`.github/workflows/ci.yml`).
4. **Commit messages**: imperative, present tense, scoped — `feat(voices): debounce composer submit` or `fix(rules): allow get on missing exit-poll vote doc`.
5. **PR description**: what changed, why, and any screenshots if it's UI.

## Code style

- **TypeScript strict** is on; `any` requires a comment justifying it.
- **Pure logic in `lib/`**, presentation in `components/`, routing in `app/`.
- **No hex hardcodes in components** — use Tailwind tokens that resolve to CSS variables (`bg-bg`, `text-text`, `border-border`, etc.). Brand colours (`PARTY_COLORS`) live in `lib/party-colors.ts`.
- **Tests for new logic**: pure helpers in `lib/` get a sibling `__tests__/*.test.ts` file. Components are tested only when behaviour is non-trivial (the AuthMenu dropdown, the exit-poll cast flow).
- **JSDoc on public lib exports** so the Hover-IntelliSense tells the next reader what they need to know.

## Reporting security issues

Open a private security advisory on GitHub instead of a public issue. The
threat model lives in the **Security** section of the README.

## Data contributions

Demo data only — modeled on patterns from MyNeta / ADR / ECI / Lok Dhaba but
not authoritative. Schemas live in `lib/types.ts`. Each new constituency,
candidate, or seat profile must include a `data_quality_note` (or similar)
making the demo nature explicit to end-users.

## Releasing

`CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and [SemVer](https://semver.org). Bump the version in `package.json` and tag
the commit (`git tag v0.x.0`).

# Runbook

Operational procedures for Champion Forge. Each section is a numbered, step-by-step
procedure with expected output and a troubleshooting block.

*Modelled on Google SRE Book runbook principles: every procedure is atomic, includes
expected output, and has an explicit rollback or recovery path.*

---

## Table of Contents

1. [Development Setup (Fresh Clone)](#1-development-setup-fresh-clone)
2. [Daily Development](#2-daily-development)
3. [Running Tests](#3-running-tests)
4. [Generating AI Portraits](#4-generating-ai-portraits)
5. [Deploy to Vercel](#5-deploy-to-vercel)
6. [Roll Back a Vercel Deploy](#6-roll-back-a-vercel-deploy)
7. [Creating and Merging a PR](#7-creating-and-merging-a-pr)
8. [Running a Database Migration (Supabase)](#8-running-a-database-migration-supabase)
9. [Rotating a Leaked Secret](#9-rotating-a-leaked-secret)
10. [Troubleshooting Common Issues](#10-troubleshooting-common-issues)

---

## 1. Development Setup (Fresh Clone)

**When:** Setting up on a new machine or for a new collaborator.

**Prerequisites:** Node.js 20+ (`node --version`), Git, `gh` CLI authenticated

```bash
# 1. Clone
git clone https://github.com/metalphan/champion-forge.git
cd champion-forge

# 2. Install dependencies
npm install

# 3. Create env file (required only for art generation)
cp .env.example .env.local
# Edit .env.local and add your FAL_KEY

# 4. Verify everything works
npm test
# Expected: "48 passed (48)"

npx tsc --noEmit
# Expected: no output (clean)

# 5. Start dev server
npm run dev
# Expected: "▲ Next.js 16.2.x  - Local: http://localhost:3000"
```

**Verify:** Open http://localhost:3000 — Home screen should appear with Play and Perks tabs.

---

## 2. Daily Development

**When:** Starting a work session.

```bash
# 1. Sync with main
git checkout main && git pull origin main

# 2. Create a feature branch
git checkout -b feat/my-feature   # or fix/ chore/ test/ security/

# 3. Start dev server
npm run dev

# 4. Make changes, then verify before committing
npx tsc --noEmit    # must be clean
npm test            # must be 48/48 (or more if you added tests)

# 5. Commit
git add <specific files>   # never git add -A blindly
git commit -m "feat: short description

Longer explanation if needed.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

# 6. Push and open PR
git push -u origin feat/my-feature
gh pr create --base main
```

---

## 3. Running Tests

```bash
# Single run (CI mode)
npm test

# Watch mode (during development)
npm run test:watch

# Coverage report
npm run test:coverage
# Opens coverage/index.html — check src/engine/** stays above 80% line coverage
```

**Expected output:**
```
Test Files  7 passed (7)
     Tests  48 passed (48)
```

**If tests fail:**
1. Read the failure message — it includes file path and line number
2. Run `npm run test:watch` and fix the failing test
3. Do not comment out or skip tests — fix the underlying issue

---

## 4. Generating AI Portraits

**When:** Adding a new champion archetype or regenerating portraits after style changes.

**Prerequisites:** `FAL_KEY` in `.env.local`, balance on fal.ai account.

```bash
# 1. Confirm key is set
cat .env.local | grep FAL_KEY
# Expected: FAL_KEY=<your key>

# 2. Run generator (idempotent — skips existing files)
npm run generate-art

# Expected per portrait:
#   🎨 Generating Ash Soldier (Fire Common)…
#   ✅ Saved fire-common-warrior.png
# or:
#   ⏭  fire-common-warrior already exists, skipping
```

**After generating:**
```bash
# Commit the new PNGs
git add public/champions/
git commit -m "feat: regenerate champion portraits with updated style guide"
```

**Cost:** ~$0.003/image. Full 16-portrait set costs ~$0.05.

**If you get 403 Forbidden:**
- Check balance at https://fal.ai/dashboard/billing
- Re-run the script — it retries only missing files
- The error may appear intermittently even with balance; just run again

---

## 5. Deploy to Vercel

**When:** Merging a PR to `main` that should go live.

**Prerequisites:** Vercel CLI installed (`npm i -g vercel`), authenticated (`vercel login`),
project linked (`vercel link` — run once in the repo root).

```bash
# 1. Ensure you're on main and it's clean
git checkout main && git pull origin main
git status  # must be clean

# 2. Run pre-deploy checks
npm test && npx tsc --noEmit
# Both must pass

# 3. Deploy to production
vercel --prod

# Expected output:
#   ✅  Production: https://champion-forge.vercel.app [3s]
```

**After deploying:**
- Visit the URL and verify the Home screen loads
- Open DevTools → Application → Manifest → confirm PWA manifest loads
- Check DevTools → Network → Headers for security headers (X-Frame-Options, etc.)
- Update `docs/handoff.md`: mark deployment status ✅ and add the URL

**Environment variables in Vercel:**
All env vars must be added in the Vercel dashboard (Project → Settings → Environment Variables).
Never add them to `vercel.json` — that file is committed.

---

## 6. Roll Back a Vercel Deploy

**When:** A production deploy broke something and needs to be reverted immediately.

```bash
# Option A: Roll back via CLI (fastest)
vercel rollback
# Vercel restores the previous deployment

# Option B: Roll back via Git (creates a revert commit)
git revert HEAD --no-edit
git push origin main
# Triggers a new Vercel deploy of the reverted code
```

**Option A** is faster (seconds). Use it for immediate incidents.
**Option B** is auditable — it creates a commit showing what was reverted and why.

After rollback, create a `fix/` branch to address the root cause before re-deploying.

---

## 7. Creating and Merging a PR

```bash
# Create
gh pr create --base main --title "feat: short description" --body "$(cat <<'EOF'
## Summary
- What changed and why

## Test plan
- [ ] npm test passes
- [ ] tsc --noEmit clean
- [ ] Golden path tested manually

## Screenshots
<!-- paste screenshots for UI changes -->
EOF
)"

# Review
gh pr view <number> --web   # open in browser

# Merge (after review)
gh pr merge <number> --squash --delete-branch
```

The standing permission in `AGENTS.md` grants AI assistants authority to merge PRs
once they've reviewed the changes. Human review is always welcome but not required
for solo development.

---

## 8. Running a Database Migration (Supabase)

*This section will be filled in when Supabase is wired up in Phase 1.*

**Conventions (to be enforced when migrations are created):**
- Migration files are numbered sequentially: `001_`, `002_`, `003_`, …
- Never edit an existing migration file — always create a new one
- Migration files live in `supabase/migrations/`
- Every migration must have a corresponding rollback comment or down-migration

```bash
# Apply pending migrations (Supabase CLI)
npx supabase db push

# Check migration status
npx supabase migration list
```

---

## 9. Rotating a Leaked Secret

**When:** A secret was accidentally committed, logged, or otherwise exposed.

**Immediate actions (within minutes, not hours):**

1. **Invalidate the secret first** — rotate it at the source before doing anything else:
   - `FAL_KEY`: https://fal.ai/dashboard/keys → Delete the key → Create a new one
   - Supabase anon key: Supabase Dashboard → Project Settings → API → Rotate
   - Any other key: consult the provider's docs

2. **Remove from git history** if committed:
   ```bash
   # Use git-filter-repo (preferred over BFG)
   pip install git-filter-repo
   git filter-repo --path .env.local --invert-paths
   git push --force-with-lease origin main
   ```
   ⚠️ Force-pushing `main` is destructive. Confirm with the repo owner first.
   All collaborators must `git clone` fresh after a history rewrite.

3. **Update `.env.local`** with the new secret value

4. **Update CI / Vercel** environment variables with the new value

5. **Document the incident** in `docs/handoff.md` under Known Issues, even briefly

**Prevention:**
- `git diff --staged` before every commit — scan for anything that looks like a key
- `.env*` is in `.gitignore` — never override this
- Use `.env.example` for sharing required variable names (with placeholder values only)

---

## 10. Troubleshooting Common Issues

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `tsc` errors on `scripts/` | `tsconfig.json` doesn't exclude `scripts/` | Confirm `"exclude": ["node_modules", "scripts"]` in `tsconfig.json` |
| `npm run generate-art` fails with 403 | No fal.ai balance or key not loaded | Check balance at fal.ai/dashboard/billing; verify `.env.local` has `FAL_KEY=` |
| `npm test` fails with import error | Missing `@` path alias in vitest config | Check `vitest.config.ts` for `resolve.alias: { "@": "/src" }` |
| Game state stuck / wrong screen | Corrupted localStorage | Open DevTools → Application → Storage → Clear Site Data |
| Champions not showing portraits | `public/champions/` files missing | Run `npm run generate-art` |
| Nested button hydration warning | `<button>` inside `<button>` in HTML | ChampionCard uses `Tag = onClick ? "button" : "div"` — check the caller isn't wrapping in another button |
| Hot reload not working | Turbopack edge case | Stop dev server, delete `.next/`, restart `npm run dev` |
| `vercel --prod` fails with env error | Missing env var in Vercel dashboard | Add the var at vercel.com → Project → Settings → Environment Variables |

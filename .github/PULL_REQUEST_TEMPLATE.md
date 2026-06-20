## Summary

<!-- What changed and WHY. The git diff shows the what — this should explain the why.
     Link the related ADR if an architectural decision was made: docs/decisions/NNN-title.md -->

-
-

## Type of change

<!-- Check all that apply -->

- [ ] `feat` — new user-facing feature
- [ ] `fix` — bug fix
- [ ] `chore` — tooling, deps, config (no user-facing change)
- [ ] `test` — tests only
- [ ] `security` — security fix or hardening
- [ ] `docs` — documentation only
- [ ] `perf` — performance improvement

## How has this been tested?

<!-- Describe what you did to verify the change works. "It compiles" is not a test plan.
     For engine changes: which seeds / inputs were tested?
     For UI changes: which screens and flows were exercised? -->

-

## Definition of Done checklist

### Code quality
- [ ] `npx tsc --noEmit` — no TypeScript errors
- [ ] `npm test` — all tests pass (no skipped or commented-out tests)
- [ ] `npm run lint` — no ESLint errors
- [ ] No new `any` types or `@ts-ignore` comments added
- [ ] No `console.error` / `console.warn` in normal code paths

### Testing
- [ ] New engine/logic code has unit tests in a co-located `*.test.ts` file
- [ ] Coverage thresholds maintained (80% `src/engine/`, 60% `src/components/`)
- [ ] Edge cases and error paths considered (not just the happy path)

### Documentation
- [ ] `docs/handoff.md` — "Last updated" date updated + entry added to "Recent changes"
- [ ] `docs/CHANGELOG.md` — updated if this is a user-facing change
- [ ] `docs/decisions/` — new ADR added if an architectural decision was made
- [ ] Inline comments added for non-obvious logic (WHY, not WHAT)

### Security
- [ ] No secrets, API keys, or tokens in code or commit
- [ ] User inputs validated if any new inputs were added
- [ ] No new `eval()`, `dangerouslySetInnerHTML`, or dynamic `require()`

### UI changes (skip if not applicable)
- [ ] Golden path manually tested in browser at http://localhost:3000
- [ ] No new browser console errors in normal flow
- [ ] Tested at 375px width (mobile viewport)
- [ ] Screenshot or recording attached below

## Screenshots / recordings

<!-- Required for any UI change. Paste before/after screenshots or a screen recording.
     Drag and drop images directly into this text box on GitHub. -->

## Related

<!-- Link to related issues, ADRs, or prior PRs if applicable -->

- ADR: <!-- docs/decisions/NNN-title.md -->
- Closes: <!-- #issue-number if applicable -->

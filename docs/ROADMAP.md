# Roadmap

Phases are ordered by dependency. Each phase should be releasable independently.

---

## Phase 0 — Core Loop ✅ Complete

Everything a player needs for a full run:
- Zone select, draft, auto-battle combat, rewards, meta-perk shop
- localStorage persistence
- Vitest test suite (48 tests, 80% engine coverage)

---

## Phase 1 — PWA + Installable (Next)

**Goal:** Playable on any Android device without an app store. Installable from the browser.

### Tasks
- [ ] `public/manifest.json` — name, icons, theme color, display mode
- [ ] `src/app/layout.tsx` — add `<link rel="manifest">`, `theme-color` meta, `apple-touch-icon`
- [ ] `public/icons/` — generate icon set at 192×192 and 512×512
- [ ] Service worker via `next-pwa` or hand-rolled — offline caching of shell
- [ ] `next.config.ts` — security headers (X-Frame-Options, CSP, etc.)
- [ ] Deploy to Vercel — public URL, HTTPS (required for PWA install prompt)

**Outcome:** Player opens `champion-forge.vercel.app` on Android → browser prompts "Add to Home Screen" → app icon on phone, launches fullscreen.

---

## Phase 2 — Supabase / Cloud Persistence

**Goal:** Saves follow the player across devices. Run history viewable.

### Tasks
- [ ] Supabase project setup — copy URL + anon key to `.env.local`
- [ ] Database schema:
  ```sql
  profiles (id uuid, currency int, best_floor int, purchased_perks text[])
  runs (id uuid, user_id uuid, zone_id text, floors_cleared int, outcome text, created_at timestamptz)
  ```
- [ ] Row Level Security on both tables (user can only read/write their own rows)
- [ ] Supabase Auth — magic link or Google OAuth
- [ ] Replace `persistence.ts` localStorage calls with Supabase reads/writes
- [ ] Optimistic updates — update UI immediately, sync in background
- [ ] MSW handlers for Supabase in test suite

**Outcome:** Sign in on phone → see the same Shards balance and perks as on desktop.

---

## Phase 3 — AI Art Pipeline

**Goal:** Each champion archetype has a generated portrait. Visual fidelity goes from Tier 1 → Tier 2.

### Tasks
- [ ] `scripts/generate-art.ts` — calls fal.ai Flux API, saves PNGs to `public/champions/`
- [ ] Add `imageUrl` field to `Champion` type
- [ ] Update `ChampionCard.tsx` — render portrait as background image behind stat overlay
- [ ] Define ~20 stable champion archetypes with name, affinity, rarity, portrait prompt
- [ ] Run generation script once; commit images to repo (or store in Supabase Storage)
- [ ] Style guide prompt: `"fantasy RPG card art, dark painterly style, character portrait, [affinity] warrior, black gradient background, game card illustration"`

### fal.ai Setup
```bash
npm install @fal-ai/client
# Add FAL_KEY=your_key to .env.local
npm run generate-art
```

**Outcome:** Draft screen shows illustrated champion cards instead of gradient placeholders.

---

## Phase 4 — Capacitor (Android APK)

**Goal:** Proper APK installable from Play Store or sideloaded.

### Tasks
- [ ] `npm install @capacitor/core @capacitor/cli @capacitor/android`
- [ ] `npx cap init` — configure app ID (`com.metalphan.championforge`) and name
- [ ] `next build && npx cap sync` — copy web output into native project
- [ ] Configure `capacitor.config.ts` — webDir: `out`, server config for dev
- [ ] Add haptic feedback on combat hit (`@capacitor/haptics`)
- [ ] Add splash screen + status bar styling (`@capacitor/splash-screen`, `@capacitor/status-bar`)
- [ ] Build APK: `npx cap open android` → Android Studio → Build → Generate Signed APK

### Decision Point
If game feel requires native-speed animations (60fps particle effects, physics), consider migrating to **Expo + React Native** instead. Capacitor is fastest to ship; RN is best long-term for game UX.

---

## Phase 5 — Tauri (Windows Desktop)

**Goal:** Native `.exe` installable via Windows Store or direct download.

### Tasks
- [ ] Install Rust toolchain
- [ ] `npm install @tauri-apps/cli`
- [ ] `npx tauri init` — configure identifier, window size, title
- [ ] `npx tauri build` — produces `.msi` and `.exe` installer
- [ ] Configure deep linking for Supabase Auth callback

**Bundle size:** ~8MB vs Electron's ~120MB. Uses system WebView (Edge/WebKit).

---

## Phase 6 — Manual Combat Mode

**Goal:** Player selects abilities each turn rather than auto-resolving.

### Design notes
- Introduce `COMBAT_PLAYER_TURN` game phase
- Combatant whose turn it is highlights; player picks target + ability
- "Auto" button falls back to AI-selected action
- AI opponent picks randomly from available abilities (weighted by effect type vs current state)

### Complexity
This is the largest single feature on the roadmap — it requires a new async combat loop, ability targeting UI, and ability preview tooltips. Do not start until Phases 1-3 are stable.

---

## Backlog (Unscheduled)

| Item | Notes |
|---|---|
| Persistent champion roster | Draft from your collected roster, not generated pool |
| Champion upgrade system | Fuse duplicates → upgrade rarity |
| More zones (4 → 8) | Ice Cave, Lava Forge, Thunder Keep, Poison Swamp |
| Unique boss mechanics | Boss-specific abilities (shield phase, enrage) |
| Daily challenge mode | Fixed seed shared globally, leaderboard |
| Sound effects | Ability SFX, combat hit, victory jingle |
| Accessibility | ARIA labels on all interactive elements, keyboard nav |

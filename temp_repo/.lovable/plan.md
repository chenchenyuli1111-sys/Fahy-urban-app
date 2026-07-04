## The Fahy Hub — mobile community super-app

Mobile-first app (max-width 480px) with bottom tab nav across 5 modules, anchored on the mascot Fahy. Implements the selected "Neo-organic playful" direction verbatim — same tokens, type, radii, density.

## Design tokens (added to `src/styles.css`)

- Colors: `--color-peach #FFB7B2`, `--color-peach-soft #FFE5E0`, `--color-sage #B2E2D2`, `--color-sage-deep #6BBFA0`, `--color-forest #2D4F3C`, `--color-fahy-yellow #FFD97D`, `--color-surface #FDFCFB`
- Fonts: `--font-display "Outfit"`, `--font-body "Plus Jakarta Sans"` — loaded via `<link>` tags in `src/routes/__root.tsx` head
- Radii from the prototype: cards `rounded-3xl`, tiles `rounded-2xl`, pills `rounded-full`

## File structure

```text
src/
  assets/fahy-mascot.png            (generated, transparent PNG)
  components/
    BottomNav.tsx                   5-tab nav, active = forest pill
    AppShell.tsx                    max-w wrapper + BottomNav + fade-in
    fahy/FahyAvatar.tsx             mascot + level badge
    fahy/MetricTile.tsx             AQI / Crowd / Noise tile
    fahy/SpeciesCard.tsx            collection card with evolution state
    fahy/AcousticVisualizer.tsx     animated bars for "Silent Listening"
  routes/
    __root.tsx                      add Outfit + Jakarta <link> tags
    index.tsx                       Dashboard – The Fahy Hub
    ecosystem.tsx                   32x32 Eco-Challenge
    culture.tsx                     Artisan Path
    wallet.tsx                      Peach Blossom Coin + sustainability
    report.tsx                      Eco-Debt Reporter
```

## Module contents

**Dashboard (`/`)** — peach gradient header, Fahy avatar (Lv. 14), 3 live metric tiles (AQI 24 / Crowd Low / Noise 42dB), forest-colored "Fahy's Recommendation" card with CTA (`+10 桃`), horizontal scroll of recent 32x32 species, peach-coin + artisan-badges row, floating "Report & Restore" FAB, "Regional Co-Creators" social-recognition strip with stacked avatars.

**Ecosystem (`/ecosystem`)** — header with "12 / 32 Collected" progress ring, stylized SVG map with 32 species nodes (locked = dashed, unlocked = sage, final-evo = forest), two action buttons "Habitat Tracking (QR)" and "Silent Listening" (opens acoustic visualizer sheet), Digital Collection Book grid showing evolution states (bud → bloom → final).

**Culture (`/culture`)** — Artisan Passport card with badge grid (5 unlocked / 12 total), Certification Centers map list (local shops as pins), Digital Oral History cards (locked behind "Scan artisan card" CTA, unlocked shows video tutorial thumbnail).

**Wallet (`/wallet`)** — large peach-toned coin balance "1,240 桃源幣", Sustainability Tracker bar (Coffee-to-Flowers: 4.2 kg CO₂ saved this month), seasonal redemption grid (blind-box collectibles) with QR redeem button.

**Report (`/report`)** — big forest "Report & Restore" button, simple geo-tagged photo upload card (camera + location pill), recent community reports feed.

## Interaction & motion

- Route transitions: `animate-fade-in` applied at `AppShell` so each screen fades in on mount.
- Tile pulse on live metrics (existing `pulse` utility).
- FAB and primary buttons use `active:scale-95 transition-transform`.
- Mascot Fahy appears on Dashboard header and as a small guide bubble at the top of each module ("Fahy says: scan a node to unlock!").

## Social Recognition

Reusable `CoCreatorStrip` component (stacked avatar ring + "Regional Co-Creator" badge + contribution count) placed on Dashboard and Wallet.

## Out of scope (frontend prototype)

- No backend, no real CSDI/QR/upload integration — all data is mocked in component files. Real-time tiles, species nodes, badges, coin balance, and reports are static demo data so the UI is fully explorable.
- No auth, no persistence.

## Technical notes

- TanStack Start file-based routes; each route exports `head()` with its own title + description.
- Bottom nav uses `useRouterState` for active state; underscore layout not needed since nav lives in `AppShell` wrapper imported per route.
- Fonts loaded via `<link>` in `__root.tsx` (never `@import` URLs in `styles.css`).
- Mascot image already generated at `src/assets/fahy-mascot.png` and imported as ES6.
- Mobile preview viewport already set.

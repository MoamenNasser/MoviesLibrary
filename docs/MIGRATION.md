# Migration notes: React to Angular

This document records how the Movies Library app was migrated from React 19 (Vite) to Angular 22: what the original looked like, what was wrong with it, what the new architecture is, how behavior was preserved, and exactly what was and was not verified.

The original React implementation is preserved in git under the tag `react-final`. To look at it: `git checkout react-final`.

> Note on the starting point: the migration brief described a vanilla HTML/CSS/JavaScript app. The repository actually contained a **React 19 + Vite + React Router 7** app (about 350 lines of JSX/JS and about 420 lines of CSS), so this was a React-to-Angular migration. The findings below come from reading that code, not from assumptions.

---

## 1. Original architecture

```text
src/
  main.jsx                 BrowserRouter + StrictMode, mounts <App/>
  App.jsx                  MovieProvider > NavBar + Routes (/, /favorites, /about)
  contexts/MovieContext    favorites state in React Context, persisted with two useEffects
  components/              NavBar, MovieCard
  pages/                   Home (popular + search), Favorites, About
  services/api.js          fetch wrappers for TMDB
  css/                     six global stylesheets imported by individual components
```

Data came from The Movie Database (TMDB): `GET /movie/popular` and `GET /search/movie`. Favorites were stored as full movie objects under the localStorage key `favorites`.

## 2. Problems identified

These were found by reading the code and by running the app (`npm run dev`, headless Edge screenshots at desktop and 390px width).

| #   | Problem                                                                                                                                                                                                                                       | Evidence                            | Status in Angular                                                                                                                                            |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **API errors were swallowed**: every function in `api.js` caught its own error and returned `[]`, so Home's error message could never appear                                                                                                  | `services/api.js`, `pages/Home.jsx` | Fixed: errors propagate; Home shows them                                                                                                                     |
| 2   | **Crash on missing data**: `release_date.split("-")` throws on a null date and the catch discarded the whole result list; a null `poster_path` produced `.../w500null`                                                                        | `services/api.js`                   | Fixed in `toMovie` (tested)                                                                                                                                  |
| 3   | **Possible favorites loss on reload**: the "save" effect also ran on mount with an empty list. Predicted from reading the code; see section 6 for what was and was not verified                                                               | `contexts/MovieContext.jsx`         | Fixed by design: the store never writes on startup                                                                                                           |
| 4   | **Stale search results**: no cancellation, so a slow earlier response could overwrite a newer one                                                                                                                                             | `pages/Home.jsx`                    | Fixed with `switchMap` (tested)                                                                                                                              |
| 5   | **API key committed** in source and git history; **HTTP** (not HTTPS) endpoints, which browsers block from an HTTPS site                                                                                                                      | `services/api.js:4-7`               | Partly fixed: HTTPS now, key moved to one injected config. The key is still in the repo and must be rotated on TMDB (a browser-side key can never be secret) |
| 6   | **Navbar rendered as a bulleted vertical list**: its CSS targeted classes the markup never used                                                                                                                                               | Screenshot of the running app       | Fixed                                                                                                                                                        |
| 7   | **Mobile overflow**: at 390px the search button was clipped and the grid cut off (hidden by `overflow-x: hidden`)                                                                                                                             | Screenshot                          | Fixed (`min-width: 0` on the input, `min()` in the grid)                                                                                                     |
| 8   | **All CSS global**; `.movie-card` defined in two files, the winner decided by import order                                                                                                                                                    | `css/`                              | Fixed: component-scoped styles                                                                                                                               |
| 9   | **Dead and duplicate code**: `fetchMovies` duplicated `searchMovies`; `getMovieDetails` and `movie.type` were never used; about 90 lines of commented-out code and an unused component in `App.jsx`; three CSS selectors that matched nothing | various                             | Removed (listed in section 5)                                                                                                                                |
| 10  | **Accessibility gaps**: favorite button had no accessible name; no labelled search field; loading and errors not announced; no current-page indicator; no page headings                                                                       | `MovieCard.jsx`, `Home.jsx`         | Fixed; axe-core reports no violations (section 6)                                                                                                            |
| 11  | No tests, no TypeScript; lint failing with 2 errors                                                                                                                                                                                           | `npm run lint` on `react-final`     | Replaced by strict TypeScript and 54 tests                                                                                                                   |

## 3. New architecture

```text
src/app/
  core/       app-wide, UI-free:  TmdbApiService, FavoritesStore, NotificationService, TMDB_CONFIG
  shared/     MovieCard, MovieGrid, models (Movie, TMDB DTOs), tmdb-mapper
  layout/     Navbar
  features/   home, favorites, about, not-found  (each lazy-loaded)
  app.ts, app.routes.ts, app.config.ts
```

The architecture, data flow and every Angular concept used are explained in [ANGULAR_GUIDE.md](ANGULAR_GUIDE.md), including a dependency diagram.

### React to Angular mapping

| React                                                  | Angular                                                                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `MovieContext` (Context + `useState` + 2 `useEffect`s) | `FavoritesStore` (a `signal`, `computed` values, persistence in the mutating methods)                         |
| `services/api.js` (3 duplicated fetch wrappers)        | `TmdbApiService` (one `getMovies` helper over `HttpClient`) + `toMovie` mapper                                |
| `Home.jsx` (`useState` x3, `useEffect`, async handler) | `Home` (one `state` signal built from an RxJS pipeline with `switchMap`, a reactive form)                     |
| `MovieCard.jsx` (reads context, calls `alert`)         | `MovieCard` (pure: `input()`/`output()`); wiring moved to `MovieGrid`; `alert` moved to `NotificationService` |
| two duplicated grid CSS blocks                         | one `MovieGrid` component                                                                                     |
| `NavBar.jsx` with `<Link>`                             | `Navbar` with `routerLink` / `routerLinkActive`                                                               |
| `<Routes>`                                             | `app.routes.ts`, every route lazy-loaded                                                                      |
| `*.css` imported globally                              | component-scoped CSS + design tokens in `styles.css`                                                          |

### Significant decisions

- **Signals + services, no NgRx.** The app has one piece of shared state (favorites). A store library would be pure overhead.
- **RxJS for HTTP, signals for state.** Requests are streams that can be cancelled; `toSignal` bridges them to the template. `switchMap` gives request cancellation without hand-written bookkeeping.
- **Reactive Forms for one input.** A single `FormControl` in a `FormGroup`: handles submit and prevents the page reload, and gives a typed value.
- **`MovieCard` is presentational; `MovieGrid` holds the behavior.** Home and Favorites need identical favorite handling, so it lives once.
- **Config through an `InjectionToken`** so tests can substitute URLs and keys.
- **`alert()` kept, behind `NotificationService`.** Preserves the original UX; a toast would only touch that one file.
- **Backwards-compatible storage.** The `Movie` shape (`url`, `year`) and the `favorites` key match the React app, so favorites saved by the old app still load (tested).
- **Plain CSS with tokens**, no UI library or CSS framework: the design is small and the original colors are now defined once.
- **Strict TypeScript and strict templates** (`"strict": true`, `"strictTemplates": true`), verified to reject implicit `any` and `null` assigned to `string`.
- **Zoneless Angular** (no `zone.js`), chosen at scaffold time with `ng new --zoneless`; it fits a signals-based design.

## 4. How behavior was preserved

- Same pages and routes (`/`, `/favorites`, `/about`), same copy ("Search movies...", "your favorite movies", "No favorites added yet", the empty-state text, "Added to favorites!" / "Removed from favorites!", the two error messages).
- A blank search is ignored, as before.
- Same TMDB endpoints and parameters; same card layout, colors and hover/fade-in motion.
- The original's card background was `#111`: `Home.css` redefined `.movie-card` after `MovieCard.css` loaded, so `#111` is what users actually saw. That value is kept (not the `#1a1a1a` written in `MovieCard.css`).
- Visual comparison: screenshots of the React app and the Angular app at desktop width are in [docs/screenshots/](screenshots/).

## 5. Deliberate differences from the React version

**Bug fixes and corrections** (each is listed in section 2): errors surface; missing dates and posters handled; favorites never wiped on startup; stale searches discarded; HTTPS; horizontal navbar; mobile layout no longer overflows; the Favorites page title is now styled as the CSS intended (it never matched before).

**Additions** (not in the original):

- A `**` not-found page.
- Per-route document titles (the original had one static title).
- A "No movies found." message for empty search results.
- A placeholder when a movie has no poster (the original showed a broken image).
- Current-page highlight in the navbar.
- Accessibility: labelled search field, accessible name and `aria-pressed` on the favorite button, `role="status"` / `role="alert"` on loading and errors, a visually hidden `h1` on Home, `prefers-reduced-motion` support.
- Minimal styling for the loading and error lines (they were unstyled).

**Small visual adjustments made for accessibility or layout:**

- Active navbar link text is white (the original link color failed contrast on the highlighted background).
- The "No favorites added yet" heading is `#ff4757` instead of `#e50914` (the original was 2.79:1 on its panel; 3:1 is the minimum for large text).
- Page titles are `h1` and card titles `h2` (they were `h2` and `h3`) so heading levels are in order; their sizes are set explicitly so they look the same.
- The grid uses `auto-fill` instead of `auto-fit`, so a single favorite is card-sized instead of stretched across the row. A full page of results lays out identically.
- Posters are not lazy-loaded (Angular warned that `loading="lazy"` on the first, largest image hurts load time; the original did not lazy-load either).

**Removed as dead code:** `fetchMovies` (duplicate of `searchMovies`), `getMovieDetails` and the `movie.type` display (never used), the commented-out and unused code in `App.jsx`, and the CSS selectors that matched no element.

## 6. Testing and validation performed

All of the following was run in this repository on the final code. Environment: Windows 11, Node 24.20.0, npm 11.5.2, Microsoft Edge (Chromium).

| Check                                                                                                                          | Result                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build` (production)                                                                                                   | Passes                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `npm run lint`                                                                                                                 | Passes (angular-eslint with template accessibility rules)                                                                                                                                                                                                                                                                                                                                                                                       |
| `npm run format:check`                                                                                                         | Passes                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `npm test -- --watch=false`                                                                                                    | **54 tests in 11 files, all passing**                                                                                                                                                                                                                                                                                                                                                                                                           |
| `npm audit`                                                                                                                    | 0 vulnerabilities                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Strict-mode probe                                                                                                              | A file with an implicit `any` and `null` assigned to `string` failed to compile (then removed)                                                                                                                                                                                                                                                                                                                                                  |
| **Mutation checks** on the two key regression tests                                                                            | Replacing `switchMap` with `mergeMap` made the stale-search test fail; making the store wipe storage on startup made the reload test fail. Both were then restored                                                                                                                                                                                                                                                                              |
| **Live browser run** (headless Edge, scripted over the DevTools protocol), on the dev server and again on the production build | 14/14 checks: popular movies load from the live TMDB API (20 cards, all 20 poster images load); horizontal navbar; active link; adding a favorite shows the alert and saves to localStorage; the favorite survives a full reload; Favorites page lists it; removing the last one shows the empty state; searching "batman" returns Batman titles; at 390px nothing overflows; unknown URL shows the 404 page; **no console errors or warnings** |
| **axe-core accessibility scan** (production build): Home at 1280px and 390px, Favorites (empty state), About, 404              | No violations. The scan found real issues earlier (my own contrast regression, missing `h1`, heading order), which were fixed                                                                                                                                                                                                                                                                                                                   |
| Deep link on a static server with SPA fallback                                                                                 | `/favorites` served correctly                                                                                                                                                                                                                                                                                                                                                                                                                   |

Bundle sizes (production, from `ng build` / `vite build` output; they are measured differently, so treat the comparison as approximate):

|                                            | JavaScript                                                | CSS                       |
| ------------------------------------------ | --------------------------------------------------------- | ------------------------- |
| React + Vite (single bundle)               | 223.76 kB raw, 72.02 kB gzip                              | 4.97 kB raw, 1.53 kB gzip |
| Angular initial chunks                     | 264.60 kB raw, 73.58 kB estimated transfer (includes CSS) |                           |
| Angular Home page chunk (loaded on demand) | 40.12 kB raw, 9.86 kB estimated transfer                  |                           |

**The Angular version is larger than the React version.** The framework runtime is heavier and the app is too small for lazy loading to offset it. No performance improvement is claimed; no runtime performance measurements (Lighthouse, etc.) were taken.

### What was not verified

- **The React favorites-loss bug was never reproduced.** I predicted it from the code (and the dev-mode StrictMode double effect makes it likely) but did not run it. What is verified is that the Angular store does not write on startup and that the reload scenario is tested and passes.
- Only Chromium (Edge) was used. Firefox and Safari were not tested.
- Accessibility was checked with axe-core (automated, which catches only a subset of issues) and not with a screen reader or keyboard-only walkthrough. The Favorites page was scanned in its empty state only.
- Light color scheme: the original mixes a light-mode media query with hardcoded dark colors. That was carried over as is and not reviewed.
- The browser-driving scripts used for the live checks and the axe scan are not committed to the repository (they depend on a local Edge path). The repository has unit and component tests only; there is no end-to-end test suite and no CI.
- The favorited state is conveyed to assistive technology (`aria-pressed`) but visually the ❤️ emoji looks the same in both states, as in the original: the CSS color rule cannot recolor an emoji.

## 7. Lessons learned

- **Run the original before migrating it.** Reading the code suggested the navbar was fine; running it showed a bulleted list, and the phone layout was broken. Those would have been copied into Angular as "preserved behavior".
- **A migration is a chance to find latent bugs, but each fix should be named.** Behavior changes are listed above instead of being folded in silently.
- **Check that regression tests can fail.** The two key tests were verified by deliberately reintroducing the bug.
- **Automated accessibility scanning paid off.** It caught a regression I introduced (the active-link highlight) as well as inherited problems.
- **Observables and signals divide the work cleanly:** request lifecycle and cancellation in RxJS, state read by templates in signals.
- **Colocated, scoped CSS removes a class of bugs** (cascade by import order) that is invisible until two files disagree.

## 8. Known limitations and ideas

- `alert()` is blocking; a toast would be better UX (change `NotificationService` only).
- TMDB results are paged; only the first page is shown.
- The TMDB key is in the source. Rotate it, and for a real deployment put TMDB behind a small backend proxy that holds the key.
- `getMovieDetails` could become a `/movie/:id` details page.
- Search could debounce as you type (`debounceTime` before `switchMap`).
- Add an end-to-end suite (for example Playwright) and CI running lint, tests and build.

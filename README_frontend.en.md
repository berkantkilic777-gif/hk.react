# hk. MüzikAkademi — Frontend

[Türkçe](./README.md) · **English**

This repository contains the frontend (client-side) code of the hk. MüzikAkademi platform. Built on React 19 as a single-page application (SPA). The student-facing side — course showcase page, video player, "Cadenza" AI assistant interface, profile/badge/certificate screens — as well as the admin panel (course/video management, watch analytics charts) are all implemented in this repository. It communicates with the backend over HTTPS using `fetch()`.

Frontend: React 19 · Backend: [hk.MüzikAkademi](https://github.com/berkantkilic777-gif/hk.M-zikAkademi) (ASP.NET Core Web API)

---

## Table of Contents

- [What This Repo Contains](#what-this-repo-contains)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Pages and Routes](#pages-and-routes)
- [Backend Communication](#backend-communication)
- [State Management](#state-management)
- [Animation and Performance Approach](#animation-and-performance-approach)
- [Setup](#setup)
- [Project Structure](#project-structure)
- [Design System](#design-system)
- [Known Limitations](#known-limitations)
- [Links](#links)

---

## What This Repo Contains

The user interface of the hk. MüzikAkademi platform is a single-page application built on React 19. All the screens where students purchase courses, watch videos, interact with the "Cadenza" AI assistant, and track their progress — as well as the control panel where admins manage the platform — are implemented in this repository. The application communicates with the backend through a fully client-side architecture, without any server-side rendering (SSR).

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | Component-based UI library |
| React Router 7 | Client-side routing (SPA navigation) |
| Vite 8 | Build tool / dev server |
| Tailwind CSS v4 | `@theme`-based, centralized design token system |
| Framer Motion | Page transitions, hover animations, modals |
| Web Speech API (browser built-in) | Text-to-speech and speech-to-text |
| Web Audio API (browser built-in) | UI notification sounds |
| MediaDevices API (browser built-in) | Camera access (Cadenza photo capture) |

No external state management library (Redux, Zustand, etc.) is used; per-page `useState`/`useEffect` and `localStorage` (for JWT token storage) are used instead. This choice reflects the fact that the application's data flow largely stays at the page/component level, and avoids adding a global state layer that would be unnecessary complexity for the project's scale.

## Key Features

**Video player**

The browser's default `<video>` controls are removed in favor of a custom-built player interface. It includes A-B repeat (looping a specific segment), playback speed control, keyboard shortcuts (space to play/pause, arrow keys to seek), and a clickable chapter strip derived from the transcript data returned by the backend. During playback, the `onTimeUpdate` event is listened to, sending analytics data (watched seconds, pause points) to the backend at regular intervals.

**Cadenza chat interface**

A fixed, expandable chat window in the bottom-right corner. Beyond text chat, it supports camera access for instant photo capture (with an on-screen framing guide overlay), selecting a photo from the gallery, automatically capturing a frame from the video currently being watched, voice-based question asking, listening to spoken responses, clicking timestamps within replies to jump the video to that moment, and an avatar that changes color based on the emotional tone of the student's message. The window itself features an animated gradient border and a background blur focus effect.

**Authentication flow**

The login form sends a request to the backend; the returned JWT is stored in `localStorage`. The token payload is decoded via a helper module (`jwtYardimci.js`) so that UI elements (e.g., the admin panel link) can be conditionally rendered based on the user's role. The forgot-password flow works through a link sent via email.

**Atmosphere layer**

A handful of decorative components are mounted centrally in `App.jsx` to maintain a consistent visual identity throughout the app: a light effect that follows the cursor with a soft delay, a vertical indicator that fills segment by segment to show scroll progress, a very low-opacity analog texture overlay, and a brief intro animation on first page load. All of these components respect the `prefers-reduced-motion` media query.

**Responsive design**

The navigation bar collapses into a hamburger menu on narrow screens; the vast majority of components adapt to screen size using Tailwind's responsive utility classes. Certain desktop-only decorative components (such as the cursor-tracking light effect) are disabled on mobile, since they are meaningless on touch screens and would otherwise cost performance.

**Centralized notification system**

A toast notification system built on dispatching a custom event via the `window` object. When `bildirimGoster()` (defined in `bildirimSistemi.js`) is called, this event fires, and the `ToastContainer` component listens for it and displays the notification on screen. This architecture allows a notification to be triggered from anywhere in the app without any prop drilling.

**Page transition animations**

`AnimatePresence` provides a consistent enter/exit animation on every page; since this is managed through a shared wrapper component, individual pages don't need to implement their own transition code. A distinct, more pronounced transition effect is defined specifically for the video page.

**Delete confirmations and error pages**

Instead of the browser's default dialogs (such as `window.confirm()`), custom confirmation modals matching the design language are used. A custom 404 page redirects users back to the home page when an undefined route is visited.

## Pages and Routes

All routes are defined in `App.jsx` using React Router 7, and every transition passes through a shared animation wrapper.

| Route | Page | Description |
|---|---|---|
| `/login`, `/register` | Login, Register | Authentication |
| `/sifremi-unuttum`, `/sifre-sifirla` | SifremiUnuttum, SifreSifirla | Password reset flow |
| `/anasayfa` | AnaSayfa | Course showcase, search |
| `/egitimlerim` | Egitimlerim | Purchased courses, search/sort |
| `/egitim/:id` | EgitimDetay | A course's video list, progress state |
| `/video/:id` | VideoDetay | Video player, Cadenza, analytics submission |
| `/profil` | Profile | Profile info, password change, avatar |
| `/rozetlerim` | Rozetlerim | Earned badges |
| `/favorilerim` | Favorilerim | Favorited videos |
| `/admin` | AdminPanel | Admin panel (admin role only, guarded by `AdminRoute`) |
| `*` | SayfaBulunamadi | 404 for undefined routes |

## Backend Communication

Requests are made directly with the browser's built-in `fetch()` API; no additional HTTP client library (axios, etc.) is used. After login, the JWT is attached to every protected request via the `Authorization: Bearer <token>` header. Requests requiring file uploads (photos, videos, certificate downloads) are sent as `multipart/form-data` using a `FormData` object. API errors are surfaced to the user through the centralized notification system, using the message text returned by the backend; successful operations are confirmed through the same system.

The backend address is hardcoded as `https://localhost:7264` in the development environment; running against a different environment requires updating the base URL value in the relevant files.

## State Management

The application does not use a global state management library. Each page fetches its own data from the backend inside `useEffect` and holds it locally with `useState`. Session information (JWT token and user role) is persisted via `localStorage` and read through helper functions in `jwtYardimci.js`. The only piece of data that genuinely needs to be shared across pages is the notification system, and this is solved with browser custom events rather than a state library.

## Animation and Performance Approach

All animations are built with Framer Motion using GPU-accelerated properties (transform, opacity); properties that trigger layout reflow are avoided. Decorative, continuously running animations (such as the cursor-tracking light effect and the texture overlay) all respect the `prefers-reduced-motion` media query and are disabled for users who have that preference enabled. Desktop-only, mouse-movement-dependent effects are scoped to the `md:` breakpoint and above in Tailwind, ensuring neither wasted performance nor lost meaning on mobile devices.

## Setup

Requirements: [Node.js](https://nodejs.org/) (18 or later), a running backend instance ([hk.MüzikAkademi](https://github.com/berkantkilic777-gif/hk.M-zikAkademi)).

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default and connects to the backend at `https://localhost:7264`.

```bash
npm run build      # Production build
npm run preview    # Preview the production build locally
npm run lint         # Static code analysis with ESLint
```

## Project Structure

```
src/
├── AnaSayfa.jsx, Egitimlerim.jsx, EgitimDetay.jsx    Course showcase and listing pages
├── VideoDetay.jsx                                     Video player and watch analytics
├── GeminiAsistan.jsx                                   Cadenza AI assistant
├── Profile.jsx, Rozetlerim.jsx, Favorilerim.jsx        Student account pages
├── AdminPanel.jsx, AdminRoute.jsx                       Admin panel and route guard
├── Login.jsx, Register.jsx, SifremiUnuttum.jsx, ...    Authentication flow
├── SayfaBulunamadi.jsx                                    404 page
├── Navbar.jsx, ToastContainer.jsx, Yukleniyor.jsx      Shared components
├── OdemeModal.jsx                                        Course purchase flow
├── GrainDokusu.jsx, SahneIsigiSpotu.jsx, ...             Atmosphere/theme components
├── bildirimSistemi.js, jwtYardimci.js                   Helper functions
├── index.css                                              Centralized design token system
└── App.jsx                                                Route definitions, global mount point
```

## Design System

Color palette and typography are defined centrally in `index.css` using Tailwind v4's `@theme` directive; a change to a single file propagates across the entire application, with no separate `tailwind.config.js` file required.

| Token | Value | Usage |
|---|---|---|
| `--color-ink` | `#15111f` | Primary background |
| `--color-panel` | `#211c33` | Card / panel background |
| `--color-brass` | `#4fd1c5` | Primary accent color |
| `--color-parchment` | `#ece9f7` | Light text |
| `--color-practice` | `#5fa98a` | Success / confirmation color |

Fonts: Fraunces (headings), Inter (body), IBM Plex Mono (technical labels, counters). This three-font system is used together to give the platform both an elegant and a distinctive visual identity.

## Known Limitations

Scroll-triggered ("scroll-reveal") entrance animations have not yet been implemented; page content currently only animates in on initial load. The backend address is hardcoded in the relevant files rather than being read from an environment variable; for deployment to different environments, moving this value into a centralized configuration file is recommended.

## Links

Backend repository and full project documentation: [hk.MüzikAkademi](https://github.com/berkantkilic777-gif/hk.M-zikAkademi)

# Front-End Guide

## Stack
- Vue 3 with `<script setup lang="ts">`
- Vite for local dev and production builds
- Pinia for client state
- Vue Router with a single `MainLayout` shell and child routes
- Vuetify for UI primitives
- Firebase Auth, Firestore, Storage, and Cloud Functions

## How This App Is Wired
- [`src/App.vue`](/home/node/team-a-quiet-place/front-end/src/App.vue) is intentionally minimal and only mounts `v-app` plus `router-view`.
- [`src/main.ts`](/home/node/team-a-quiet-place/front-end/src/main.ts) creates the app, installs Pinia/router/Vuetify, and eagerly calls `authStore.init()`.
- [`src/nav/navigation.ts`](/home/node/team-a-quiet-place/front-end/src/nav/navigation.ts) mounts all pages under [`src/views/MainLayout.vue`](/home/node/team-a-quiet-place/front-end/src/views/MainLayout.vue).
- `MainLayout` owns the shared chrome, switches `placesStore.readPlaces()` between `"approved"` and `"all"` based on admin route access, resets user-save listeners when auth changes, and can widen the page shell when a route sets `meta.layout = "wide"`.
- [`src/composables/useDirectionalNavigation.ts`](/home/node/team-a-quiet-place/front-end/src/composables/useDirectionalNavigation.ts) centralizes left/right arrow key and touch-swipe navigation for views that page through place cards.

## Current Product Shape
- `HomeView` shows one unsaved place card at a time, with carousel-style navigation, keyboard arrows, touch swipes, and a floating filter action.
- `SavedView` shows a grid of saved places, then opens a selected place in an overlay card with arrow buttons, keyboard arrows, and touch swipes.
- `AddPlaceView` is a richer editor flow that supports multi-image selection, uses contained image previews with an anchored overlay, validates input, creates a place through a callable function, auto-saves it for the author, and optionally creates the first review.
- `AdminReviewView` is the moderation queue for pending places.
- `AdminDashboardView` is the wide admin screen for stats, status changes, and destructive deletion.
- Admin access now comes from the Firestore `admins` collection keyed by Auth `uid`, not from a frontend-only password prompt.

## Working Rules
- Keep views thin when possible. UI orchestration and transient state belong in views/components; shared data fetching and persistence belong in stores.
- Reuse the shared types in [`src/types/data.ts`](/home/node/team-a-quiet-place/front-end/src/types/data.ts) before inventing local copies.
- Preserve the route structure where `MainLayout` is the shell and route `meta.subtitle` drives the top-bar subtitle.
- Use route metadata instead of ad hoc layout switches. Right now `meta.layout = "wide"` is reserved for the admin dashboard.
- Follow the existing visual language: soft cards, rounded corners, glassy top bar, and mobile-first spacing.
- For image-heavy cards, prefer contained images with deliberate background fill when preserving the full photo matters more than edge-to-edge cropping.
- When adding Firebase interactions, prefer placing reads and writes in stores instead of inside view files.
- Shared admin membership logic belongs in [`src/stores/adminStore.ts`](/home/node/team-a-quiet-place/front-end/src/stores/adminStore.ts), not duplicated across views or components.
- Reuse `useDirectionalNavigation` for any new left/right card navigation instead of adding another custom keydown/swipe implementation.

## Useful Commands
- `npm run dev`
- `npm run build`
- `npm run preview`

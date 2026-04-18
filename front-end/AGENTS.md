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
- `MainLayout` owns the shared chrome and starts/stops the long-lived Firestore listeners for places, reviews, and user saves.

## Current Product Shape
- `HomeView` shows one place card at a time, with local carousel-style navigation and a floating filter action.
- `SavedView` shows a grid of saved places, then opens a selected place in an overlay card.
- `AddPlaceView` is a richer editor flow that uploads images, validates input, creates a place through a callable function, auto-saves it for the author, and optionally creates the first review.

## Working Rules
- Keep views thin when possible. UI orchestration and transient state belong in views/components; shared data fetching and persistence belong in stores.
- Reuse the shared types in [`src/types/data.ts`](/home/node/team-a-quiet-place/front-end/src/types/data.ts) before inventing local copies.
- Preserve the route structure where `MainLayout` is the shell and route `meta.subtitle` drives the top-bar subtitle.
- Follow the existing visual language: soft cards, rounded corners, glassy top bar, and mobile-first spacing.
- When adding Firebase interactions, prefer placing reads and writes in stores instead of inside view files.

## Useful Commands
- `npm run dev`
- `npm run build`
- `npm run preview`

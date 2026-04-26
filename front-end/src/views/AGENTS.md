# Views Guide

## Purpose
- Files in this folder are route-level screens or the shared route shell.
- Views should compose components, coordinate stores, and manage page-scoped UI state.

## Existing Patterns
- [`MainLayout.vue`](/home/node/team-a-quiet-place/front-end/src/views/MainLayout.vue) is the app shell. It owns the drawer, top bar, subtitle from route metadata, and lifecycle hooks that start/stop places and saved-place listeners while switching the places read mode for admin routes.
- [`HomeView.vue`](/home/node/team-a-quiet-place/front-end/src/views/HomeView.vue) keeps local navigation state like `currentIndex` and animation direction while reading filtered data from `placesStore`; it hides already-saved places and uses [`../composables/useDirectionalNavigation.ts`](/home/node/team-a-quiet-place/front-end/src/composables/useDirectionalNavigation.ts) for arrow keys and phone swipes.
- [`SavedView.vue`](/home/node/team-a-quiet-place/front-end/src/views/SavedView.vue) derives the selected card from store-backed data, closes the overlay if filters remove the selected item, and uses `useDirectionalNavigation` for overlay arrow-key/swipe navigation.
- [`AddPlaceView.vue`](/home/node/team-a-quiet-place/front-end/src/views/AddPlaceView.vue) is a form-heavy page with inline editing, multi-image selection, anchored overlay controls on the preview carousel, image preview cleanup, validation, and a submit flow that coordinates multiple stores.
- [`AdminReviewView.vue`](/home/node/team-a-quiet-place/front-end/src/views/AdminReviewView.vue) is the moderation queue for pending places and should stay focused on one-card-at-a-time review.
- [`AdminDashboardView.vue`](/home/node/team-a-quiet-place/front-end/src/views/AdminDashboardView.vue) is the wide admin management screen for analytics, filtering, moderation, and destructive actions.

## Authoring Rules
- Keep remote reads/writes in stores. A view may call store actions, but should not duplicate Firestore or Storage logic inline.
- Prefer local `ref` and `computed` state for presentation concerns such as dialogs, selected card ids, slide direction, and form field editing modes.
- If a page needs route copy in the top bar, set `meta.subtitle` in the router instead of hardcoding header text inside the view.
- If a page needs different shell width, set route metadata and let `MainLayout` react to it instead of bypassing the shared layout.
- When a view creates long-lived side effects, clean them up with Vue lifecycle hooks.
- Reuse existing components like `PlaceCard`, `FilterFab`, and `AppDrawer` before adding new page-specific UI.
- Reuse [`../composables/useDirectionalNavigation.ts`](/home/node/team-a-quiet-place/front-end/src/composables/useDirectionalNavigation.ts) when a view needs left/right arrow key or swipe navigation.
- For admin pages, reuse [`../stores/adminStore.ts`](/home/node/team-a-quiet-place/front-end/src/stores/adminStore.ts) so Firestore-backed admin membership checks stay consistent.
- For rich image editors or previews, keep overlay controls anchored outside per-slide markup when you want them to stay fixed while the carousel transitions.

## When Adding A New View
- Register it in [`src/nav/navigation.ts`](/home/node/team-a-quiet-place/front-end/src/nav/navigation.ts) under the `MainLayout` children unless the page truly needs a different shell.
- Match the current layout width constraints and mobile behavior.
- Prefer computed data from stores over copying store state into local arrays.

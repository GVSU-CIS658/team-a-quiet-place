# Views Guide

## Purpose
- Files in this folder are route-level screens or the shared route shell.
- Views should compose components, coordinate stores, and manage page-scoped UI state.

## Existing Patterns
- [`MainLayout.vue`](/home/node/team-a-quiet-place/front-end/src/views/MainLayout.vue) is the app shell. It owns the drawer, top bar, subtitle from route metadata, and lifecycle hooks that start/stop store listeners.
- [`HomeView.vue`](/home/node/team-a-quiet-place/front-end/src/views/HomeView.vue) keeps local navigation state like `currentIndex`, animation direction, and logout dialog visibility while reading filtered data from `placesStore`.
- [`SavedView.vue`](/home/node/team-a-quiet-place/front-end/src/views/SavedView.vue) derives the selected card from store-backed data and closes the overlay if filters remove the selected item.
- [`AddPlaceView.vue`](/home/node/team-a-quiet-place/front-end/src/views/AddPlaceView.vue) is a form-heavy page with inline editing, image preview cleanup, validation, and a submit flow that coordinates multiple stores.

## Authoring Rules
- Keep remote reads/writes in stores. A view may call store actions, but should not duplicate Firestore or Storage logic inline.
- Prefer local `ref` and `computed` state for presentation concerns such as dialogs, selected card ids, slide direction, and form field editing modes.
- If a page needs route copy in the top bar, set `meta.subtitle` in the router instead of hardcoding header text inside the view.
- When a view creates long-lived side effects, clean them up with Vue lifecycle hooks.
- Reuse existing components like `PlaceCard`, `FilterFab`, and `AppDrawer` before adding new page-specific UI.

## When Adding A New View
- Register it in [`src/nav/navigation.ts`](/home/node/team-a-quiet-place/front-end/src/nav/navigation.ts) under the `MainLayout` children unless the page truly needs a different shell.
- Match the current layout width constraints and mobile behavior.
- Prefer computed data from stores over copying store state into local arrays.

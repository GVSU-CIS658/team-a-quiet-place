# Components Guide

## Purpose
- Files in this folder are reusable UI building blocks shared by multiple views.
- Components should focus on presentation, local interaction state, and narrowly scoped UI behavior.

## Current Components
- [`AppDrawer.vue`](/home/node/team-a-quiet-place/front-end/src/components/AppDrawer.vue) owns navigation and shows admin links based on the admin store.
- [`PlaceCard.vue`](/home/node/team-a-quiet-place/front-end/src/components/PlaceCard.vue) is the main place detail component used across user and admin flows. Its carousel now favors full-image visibility with a fixed location/counter overlay anchored above the slide area.
- [`ReviewSection.vue`](/home/node/team-a-quiet-place/front-end/src/components/ReviewSection.vue) renders reviews, handles review submission for a place, and keeps long review lists inside a bounded scroll area.
- [`FilterFab.vue`](/home/node/team-a-quiet-place/front-end/src/components/FilterFab.vue) is the shared filter dialog for store-backed location/rating filtering.

## Authoring Rules
- Keep components reusable across views. If a piece of UI is mostly route-specific layout glue, keep it in the view instead.
- Prefer props, emits, and small local state over coupling a shared component to a specific route.
- Read auth or admin state from existing Pinia stores rather than creating duplicate checks inside components.
- Avoid putting heavy Firebase reads/writes directly in components. Shared data behavior belongs in stores.
- Reuse shared types from [`../types/data.ts`](/home/node/team-a-quiet-place/front-end/src/types/data.ts) instead of creating local duplicates.
- If a component overlays controls on top of media, prefer keeping those controls outside per-slide markup so they stay visually anchored while content transitions underneath.

## Coordination Notes
- `PlaceCard` intentionally supports admin review mode by hiding the save button.
- `AppDrawer` depends on both `authStore` and `adminStore`, so keep its access rules aligned with backend admin authorization.
- `FilterFab` assumes the passed store exposes `filters.location`, `filters.rating`, and `resetFilters()`.

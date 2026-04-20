# Stores Guide

## Purpose
- Files in this folder own shared frontend state, Firebase subscriptions, server writes, and reusable filtering logic.
- Stores are the main boundary between the UI layer and Firebase services.

## Existing Stores
- [`placesStore.ts`](/home/node/team-a-quiet-place/front-end/src/stores/placesStore.ts) reads the `places` collection, exposes approved and pending slices, switches between approved-only and all-place snapshots based on caller mode, uploads images to Storage, creates new places through `addPlace`, and owns the admin moderation/deletion callables.
- [`reviewsStore.ts`](/home/node/team-a-quiet-place/front-end/src/stores/reviewsStore.ts) reads the `reviews` collection one place at a time, keeps one subscription per `placeId`, sorts reviews per place, and writes new reviews through the `addReview` callable function.
- [`savedPlacesStore.ts`](/home/node/team-a-quiet-place/front-end/src/stores/savedPlacesStore.ts) subscribes to the signed-in user’s saves, derives actual `Place` records through `placesStore`, and owns save/remove plus saved-page filtering.
- [`authStore.ts`](/home/node/team-a-quiet-place/front-end/src/stores/authStore.ts) initializes Firebase auth state, signs in with Google, and logs the user out.
- [`adminStore.ts`](/home/node/team-a-quiet-place/front-end/src/stores/adminStore.ts) watches `admins/{uid}` for the signed-in user and exposes app-wide admin membership state.

## Authoring Rules
- Keep one unsubscribe handle per long-lived listener and guard against duplicate subscriptions.
- Keep async status in `isSubmitting` where relevant. Only add persistent `error` state when the UI actually reads and displays it.
- Normalize Firestore snapshots into the shared TypeScript types from [`../types/data.ts`](/home/node/team-a-quiet-place/front-end/src/types/data.ts).
- Put reusable filtering logic in getters or store actions, not duplicated across multiple views.
- If a store depends on auth, read the current user defensively and no-op cleanly when the user is not signed in.
- Use callable functions for privileged admin mutations. Frontend stores should not directly try to delete other documents or storage assets when backend cleanup is required.
- Treat the Firestore `admins/{uid}` document as the source of truth for admin membership; stores should not depend on a frontend-only password for authorization.

## Coordination Notes
- `savedPlacesStore` depends on `placesStore` data being available for its derived `savedPlaces` getter, so avoid moving that mapping into views.
- `MainLayout` owns the long-lived places and saves listener lifecycle, while [`ReviewSection.vue`](/home/node/team-a-quiet-place/front-end/src/components/ReviewSection.vue) starts and stops per-place review listeners as review UI opens, switches place ids, or unmounts.
- Callable functions and Firebase setup live outside this folder in [`../firebase/firebase.ts`](/home/node/team-a-quiet-place/front-end/src/firebase/firebase.ts); reuse that module instead of reinitializing Firebase.
- `placesStore` is now the moderation boundary for `approvalStatus`; regular browsing should keep using the approved-only getters while admin views use the broader dataset.

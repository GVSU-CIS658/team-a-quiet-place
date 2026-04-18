# Stores Guide

## Purpose
- Files in this folder own shared frontend state, Firebase subscriptions, server writes, and reusable filtering logic.
- Stores are the main boundary between the UI layer and Firebase services.

## Existing Stores
- [`placesStore.ts`](/home/node/team-a-quiet-place/front-end/src/stores/placesStore.ts) reads the `places` collection, exposes `filteredPlaces`, uploads images to Storage, and creates new places through the `addPlace` callable function.
- [`reviewsStore.ts`](/home/node/team-a-quiet-place/front-end/src/stores/reviewsStore.ts) reads the `reviews` collection, sorts reviews per place, and writes new reviews through the `addReview` callable function.
- [`savedPlacesStore.ts`](/home/node/team-a-quiet-place/front-end/src/stores/savedPlacesStore.ts) subscribes to the signed-in user’s saves, derives actual `Place` records through `placesStore`, and owns save/remove plus saved-page filtering.
- [`authStore.ts`](/home/node/team-a-quiet-place/front-end/src/stores/authStore.ts) initializes Firebase auth state, signs in with Google, and logs the user out.

## Authoring Rules
- Keep one unsubscribe handle per long-lived listener and guard against duplicate subscriptions.
- Expose user-facing failure state with `error` fields and keep async status in `isSubmitting` where relevant.
- Normalize Firestore snapshots into the shared TypeScript types from [`../types/data.ts`](/home/node/team-a-quiet-place/front-end/src/types/data.ts).
- Put reusable filtering logic in getters or store actions, not duplicated across multiple views.
- If a store depends on auth, read the current user defensively and no-op cleanly when the user is not signed in.

## Coordination Notes
- `savedPlacesStore` depends on `placesStore` data being available for its derived `savedPlaces` getter, so avoid moving that mapping into views.
- `MainLayout` currently owns starting and stopping the places, reviews, and saves listeners; keep that lifecycle contract in mind before moving subscriptions elsewhere.
- Callable functions and Firebase setup live outside this folder in [`../firebase/firebase.ts`](/home/node/team-a-quiet-place/front-end/src/firebase/firebase.ts); reuse that module instead of reinitializing Firebase.

# A Quiet Place Front End

A Quiet Place is a Vue app for finding, saving, reviewing, and submitting calm campus spaces. The front end handles the user experience, authentication state, Firestore listeners, Storage uploads, and calls into Firebase Cloud Functions for privileged writes.

## Tech Stack

- Vue 3 with TypeScript and `<script setup>`
- Vite for local development and production builds
- Vue Router for page navigation
- Pinia for shared client state
- Vuetify and Material Design Icons for UI
- Firebase Auth, Firestore, Storage, and Cloud Functions
- Axios is installed for HTTP use, though Firebase SDK calls handle the core app data flow

## App Structure

- `src/main.ts` creates the Vue app, installs Pinia, Vue Router, and Vuetify, then initializes auth state.
- `src/App.vue` mounts the app shell through `router-view`.
- `src/nav/navigation.ts` defines the main routes under `MainLayout`.
- `src/views/` contains the main screens:
  - `HomeView.vue` for browsing approved quiet places
  - `SavedView.vue` for saved places
  - `AddPlaceView.vue` for submitting a new place
  - `AdminReviewView.vue` for reviewing pending places
  - `AdminDashboardView.vue` for admin management
- `src/stores/` contains Pinia stores for auth, places, saved places, reviews, and admin access.
- `src/firebase/firebase.ts` initializes Firebase services from Vite environment variables.
- `public/quiet-place-logo.png` is the app logo.

## Setup

Install dependencies from this folder:

```bash
npm install
```

Create a `.env` file in `front-end/` with the Firebase web app values:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

The app expects Firebase Auth, Firestore, Storage, and Cloud Functions to be configured for the same project.

## Commands

```bash
npm run dev
```

Starts the Vite dev server on `0.0.0.0`.

```bash
npm run build
```

Runs TypeScript checking with `vue-tsc` and builds the production bundle.

```bash
npm run preview
```

Serves the built app locally for preview.

## Firebase Data Flow

- Approved places are read from the `places` collection.
- Admin views can read all places, including `pending` and `rejected` records.
- New places are submitted through the `addPlace` callable Cloud Function and start with `approvalStatus: "pending"`.
- Reviews are submitted through the `addReview` callable Cloud Function.
- Place ratings and review counts are maintained by the backend when review documents are created.
- Admin-only updates and deletion use backend callables instead of direct client writes.
- Admin access is determined by an `admins/{uid}` Firestore document with `active: true`.

## Related Docs

- Backend setup and Cloud Function details live in `../back-end/README.md`.
- Contributor notes for front-end implementation details live in `AGENTS.md`.

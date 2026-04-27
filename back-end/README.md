# A Quiet Place Back End

This folder contains the Firebase backend for A Quiet Place. It uses Firebase Cloud Functions, Firestore, Storage, and Firebase Admin SDK to handle writes that should be trusted by the server instead of the browser.

## Tech Stack

- Firebase Cloud Functions v2
- Firebase Admin SDK
- Firestore
- Firebase Storage
- TypeScript
- ESLint with the Google config
- Node.js 20 runtime

## Project Structure

- `firebase.json` configures the Firebase functions codebase and predeploy checks.
- `functions/src/index.ts` contains the Cloud Functions source.
- `functions/package.json` contains backend scripts and dependencies.
- `functions/tsconfig.json` controls TypeScript compilation.
- `functions/lib/` is generated build output when TypeScript is compiled.

## Setup

Install dependencies from the functions folder:

```bash
cd functions
npm install
```

Make sure the Firebase CLI is installed and authenticated before serving or deploying functions:

```bash
firebase login
```

If you are using multiple Firebase projects, select the correct project from the `back-end/` folder before deployment:

```bash
firebase use <project-id>
```

## Commands

Run these from `back-end/functions`:

```bash
npm run build
```

Compiles TypeScript into `functions/lib`.

```bash
npm run serve
```

Builds the functions and starts the Firebase Functions emulator.

```bash
npm run shell
```

Builds the functions and opens the Firebase Functions shell.

```bash
npm run deploy
```

Deploys only the Cloud Functions codebase. The deploy runs lint and build first through the `firebase.json` predeploy hook.

```bash
npm run logs
```

Reads Firebase Functions logs.

## Cloud Functions

- `addPlace`: callable function that creates a new place with `approvalStatus: "pending"`, creator metadata, empty rating data, tags, and image URLs.
- `addReview`: callable function that creates a review for an authenticated user.
- `onReviewCreated`: Firestore trigger that updates the related place rating and review count when a review is created.
- `adminUpdatePlaceStatus`: callable function for admins to set a place to `approved`, `pending`, or `rejected`.
- `adminDeletePlace`: callable function for admins to delete a place, its reviews, its saves, and its uploaded Storage images.

## Admin Access

Admin-only functions check Firestore before performing privileged actions. A user is considered an admin when this document exists:

```text
admins/{uid}
```

The document must include:

```json
{
  "active": true
}
```

The frontend also reads this collection to decide whether to show admin screens, but the backend check is the source of truth.

## Data Contracts

The frontend expects place documents to include these fields:

```text
name
location
description
images
tags
rating
reviews
approvalStatus
createdByUid
createdByName
createdAt
```

Reviews should include:

```text
placeId
rating
text
uid
user
createdAt
```

Keep these fields aligned with the shared frontend types in `../front-end/src/types/data.ts`.

## Deployment Notes

- Backend behavior does not change in Firebase until functions are deployed.
- The current deploy target is configured in Firebase CLI project settings, not in this README.
- Generated TypeScript output in `functions/lib/` should be treated as build output.
- Destructive actions, such as deleting places and related data, should stay server-side so cleanup remains consistent.

# Back-End Guide

## Scope
- This folder contains the Firebase project configuration and Cloud Functions source for backend behavior.
- The actual function code lives in [`functions/src/index.ts`](/home/node/team-a-quiet-place/back-end/functions/src/index.ts).

## Current Backend Shape
- `addPlace` creates new place records as `pending` and stamps creator metadata.
- `addReview` creates reviews through a callable function.
- `onReviewCreated` updates aggregate place rating and review counts after a review document is created.
- `adminUpdatePlaceStatus` performs privileged moderation updates for `approvalStatus`.
- `adminDeletePlace` is the destructive cleanup path: it deletes the place document, related reviews, related saves, and uploaded Storage images for that place.
- Admin authorization comes from the Firestore `admins` collection, keyed by Auth `uid`, with `active: true` required for access.

## Working Rules
- Keep privileged or destructive logic in backend callables instead of trusting direct frontend Firestore writes.
- When deleting place data, make the backend responsible for cross-collection cleanup and Storage cleanup in one flow.
- Prefer extending the existing [`functions/src/index.ts`](/home/node/team-a-quiet-place/back-end/functions/src/index.ts) patterns unless the file becomes large enough to justify splitting by domain.
- If you add new admin-only behavior, keep the authorization check server-side by reading `admins/{uid}` instead of trusting the frontend.
- Preserve the current data contract with the frontend `Place` model, especially `approvalStatus`, `createdByName`, `createdByUid`, `createdAt`, `rating`, and `reviews`.
- Keep the explanatory comments in [`functions/src/index.ts`](/home/node/team-a-quiet-place/back-end/functions/src/index.ts) up to date when behavior changes. The file now uses short intent comments plus example callable request payloads to document how each function is expected to be called.
- When adding helper functions such as auth guards or URL parsers, give them a brief comment explaining why they exist, not just what the code literally does.

## Documentation Style
- Use brief, high-signal comments above exported functions to explain the function’s purpose.
- For callable functions, prefer including a small example shape of the `request` object when it materially helps future readers understand the auth context and `data` payload.
- Avoid noisy line-by-line commentary; reserve comments for behavior, data flow, cleanup responsibilities, and assumptions.

## Commands
- From [`back-end/functions`](/home/node/team-a-quiet-place/back-end/functions): `npm run build`
- From [`back-end/functions`](/home/node/team-a-quiet-place/back-end/functions): `npm run deploy`
- From [`back-end/functions`](/home/node/team-a-quiet-place/back-end/functions): `npm run serve`

## Deployment Notes
- If you are deploying straight to Firebase instead of using the emulator, backend behavior will not change until the functions are redeployed.
- Build outputs under `functions/lib` are generated artifacts and can be cleaned up locally when not needed.

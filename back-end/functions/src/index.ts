import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onCall } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = getFirestore();

export const onReviewCreated = onDocumentCreated(
  "reviews/{reviewId}",
  async (event) => {
    const review = event.data?.data();

    if (!review) return;

    const placeId = review.placeId;

    if (!placeId) return;

    const placeRef = db.collection("places").doc(placeId);

    const placeSnap = await placeRef.get();
    if (!placeSnap.exists) return;

    const place = placeSnap.data();

    const currentRating = place?.rating || 0;
    const currentReviews = place?.reviews || 0;

    // Calculate new rating
    const newReviews = currentReviews + 1;
    const newRating =
      (currentRating * currentReviews + review.rating) / newReviews;

    await placeRef.update({
      rating: newRating,
      reviews: newReviews,
    });
  }
);

export const addReview = onCall(async (request) => {
  const uid = request.auth?.uid;
  const user = request.auth?.token?.name ?? "Anonymous";

  if (!uid) throw new Error("Not authenticated");

  const review = request.data;
  const text = review.text?.trim();

  if (!text) {
    throw new Error("Review text cannot be empty");
  }

  const reviewRef = await db.collection("reviews").add({
    placeId: review.placeId,
    rating: review.rating,
    text,
    uid,
    user,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return reviewRef.id;
});


export const addPlace = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new Error("Not authenticated");
  const place = request.data;

  const placeRef = await admin.firestore().collection("places").add(place);

  return placeRef.id;
});

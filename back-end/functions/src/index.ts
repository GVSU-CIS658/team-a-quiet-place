import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = getFirestore();
const bucket = admin.storage().bucket();

// Cloud Function to update place rating and review count when a new review is created
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

    const newReviews = currentReviews + 1;
    const newRating =
      (currentRating * currentReviews + review.rating) / newReviews;

    await placeRef.update({
      rating: newRating,
      reviews: newReviews,
    });
  }
);

// Cloud Function to add a new review
// request is a full callable request object that includes auth context and data payload
// {
//   "auth": {
//     "uid": "user123",
//     "token": {
//       "name": "Jane Doe",
//       "email": "jane@example.com"
//     }
//   },
//   "data": {
//     "placeId": "place456",
//     "rating": 5,
//     "text": "Amazing spot!"
//   }
// }
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

// Cloud Function to add a new place
// request is a full callable request object that includes auth context and data payload
// {
//   "auth": {
//     "uid": "user123",
//     "token": {
//       "name": "Jane Doe",
//       "email": "jane@example.com"
//     }
//   },
//   "data": {
//     "name": "Quiet Cafe",
//     "location": "Downtown",
//     "description": "A peaceful place to relax",
//     "images": ["https://..."],
//     "tags": ["coffee", "quiet"]
//   }
// }
export const addPlace = onCall(async (request) => {
  const uid = request.auth?.uid;
  const user = request.auth?.token?.name ?? "Anonymous";
  if (!uid) throw new Error("Not authenticated");
  const place = request.data;

  const placeRef = await admin.firestore().collection("places").add({
    name: place.name?.trim(),
    location: place.location,
    description: place.description?.trim(),
    images: Array.isArray(place.images) ? place.images : [],
    tags: Array.isArray(place.tags) ? place.tags : [],
    rating: 0,
    reviews: 0,
    approvalStatus: "pending",
    createdByUid: uid,
    createdByName: user,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return placeRef.id;
});

// Helper function to check if the caller has admin access
async function requireAdminAccess(request: any) {
  const uid = request.auth?.uid;

  if (!uid) {
    throw new HttpsError("unauthenticated", "Not authenticated");
  }

  // Check if the user is an admin by looking up their uid in the "admins" collection
  const adminDoc = await db.collection("admins").doc(uid).get();
  const adminData = adminDoc.data();

  if (!adminDoc.exists || adminData?.active !== true) {
    throw new HttpsError("permission-denied", "Admin access required");
  }
}

// Cloud Function for admin to update place approval status
// request is a full callable request object that includes auth context and data payload
// {
//   "auth": {
//     "uid": "admin456",
//     "token": {
//       "name": "Admin User",
//       "email": "admin@example.com"
//     }
//   },
//   "data": {
//     "placeId": "place789",
//     "approvalStatus": "approved"
//   }
// }
export const adminUpdatePlaceStatus = onCall(async (request) => {
  await requireAdminAccess(request);

  const placeId = request.data?.placeId;
  const approvalStatus = request.data?.approvalStatus;

  if (!placeId) {
    throw new HttpsError("invalid-argument", "Missing place id");
  }

  if (!["approved", "pending", "rejected"].includes(approvalStatus)) {
    throw new HttpsError("invalid-argument", "Invalid approval status");
  }

  await db.collection("places").doc(placeId).update({
    approvalStatus,
  });

  return { success: true };
});

// Helper function to extract storage path from a given URL
function getStoragePathFromUrl(fileUrl: string): string | null {
  if (!fileUrl) return null;

  try {
    const parsedUrl = new URL(fileUrl);

    if (!parsedUrl.hostname.includes("firebasestorage.googleapis.com")) {
      return null;
    }

    const objectPath = parsedUrl.pathname.split("/o/")[1];
    return objectPath ? decodeURIComponent(objectPath) : null;
  } catch (error) {
    console.error("Failed to parse storage url:", fileUrl, error);
    return null;
  }
}

// Cloud Function for admin to delete a place and its associated data
// request is a full callable request object that includes auth context and data payload
// {
//   "auth": {
//     "uid": "admin456",
//     "token": {
//       "name": "Admin User",
//       "email": "admin@example.com"
//     }
//   },
//   "data": {
//     "placeId": "place789"
//   }
// }
export const adminDeletePlace = onCall(async (request) => {
  await requireAdminAccess(request);

  const placeId = request.data?.placeId;

  if (!placeId) {
    throw new HttpsError("invalid-argument", "Missing place id");
  }

  const placeRef = db.collection("places").doc(placeId);
  const placeSnap = await placeRef.get();

  if (!placeSnap.exists) {
    throw new HttpsError("not-found", "Place not found");
  }

  const place = placeSnap.data();
  const imageUrls = Array.isArray(place?.images) ? place.images : [];

  // Delete associated images from Firebase Storage
  await Promise.all(
    imageUrls.map(async (imageUrl: string) => {
      const storagePath = getStoragePathFromUrl(imageUrl);

      if (!storagePath) return;

      try {
        await bucket.file(storagePath).delete();
      } catch (error) {
        console.error("Failed to delete image from storage:", storagePath, error);
      }
    }),
  );

  // Delete associated reviews
  const reviewsSnapshot = await db
    .collection("reviews")
    .where("placeId", "==", placeId)
    .get();

  await Promise.all(reviewsSnapshot.docs.map((docSnap) => docSnap.ref.delete()));

  // Delete associated saves
  const savesSnapshot = await db
    .collection("saves")
    .where("placeId", "==", placeId)
    .get();

  await Promise.all(savesSnapshot.docs.map((docSnap) => docSnap.ref.delete()));

  await placeRef.delete();

  return { success: true };
});

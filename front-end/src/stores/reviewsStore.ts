import { defineStore } from "pinia";
import type { Review } from "../types/data";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "../firebase/firebase";

type CreateReviewInput = {
  placeId: string;
  rating: number;
  text: string;
};

const functions = getFunctions();

export const useReviewsStore = defineStore("reviews", {
  state: () => ({
    reviewsByPlace: {} as Record<string, Review[]>,
    // {
    //   "place123": [
    //     {
    //       id: "review1",
    //       placeId: "place123",
    //       createdAt: 1710000000000,
    //       rating: 4,
    //       text: "Quiet in the morning",
    //       user: {
    //         uid: "user1",
    //         name: "Alice"
    //       }
    //     },
    //     {
    //       id: "review2",
    //       placeId: "place123",
    //       createdAt: 1711000000000,
    //       rating: 5,
    //       text: "Great spot near the library",
    //       user: {
    //         uid: "user2",
    //         name: "Bob"
    //       }
    //     }
    //   ],
    //   "place456": [
    //     {
    //       id: "review3",
    //       placeId: "place456",
    //       createdAt: 1712000000000,
    //       rating: 3,
    //       text: "Can get noisy at lunch",
    //       user: {
    //         uid: "user3",
    //         name: "Maya"
    //       }
    //     }
    //   ]
    // }

    unsubscribeByPlace: {} as Record<string, (() => void) | undefined>,
    isSubmitting: false,
  }),

  getters: {
    getReviewsForPlace: (state) => {
      return (placeId: string): Review[] =>
        // sort reviews by createdAt in descending order (newest first)
        [...(state.reviewsByPlace[placeId] ?? [])].sort(
          (a, b) => b.createdAt - a.createdAt,
        );
    },
  },

  actions: {

    // subscriptions are per place
    // updates are scoped per place
    ensureReviewsForPlace(placeId: string) {
      if (!placeId || this.unsubscribeByPlace[placeId]) return;

      const placeReviewsQuery = query(
        collection(db, "reviews"),
        where("placeId", "==", placeId),
      );

      this.unsubscribeByPlace[placeId] = onSnapshot(
        placeReviewsQuery,
        (snapshot) => {
          this.reviewsByPlace[placeId] = snapshot.docs.map((doc) => {
            const data = doc.data();

            return {
              id: doc.id,
              placeId: data.placeId,
              createdAt: data.createdAt?.toMillis?.() ?? 0,
              rating: data.rating,
              text: data.text,
              user: data.user,
            } as Review;
          });
        },
        (error) => {
          console.error("Error reading reviews:", error);
        }
      );
    },

    // stop reading reviews for a place when the user navigates away from it
    stopReadingPlace(placeId: string) {
      const unsubscribe = this.unsubscribeByPlace[placeId];

      if (unsubscribe) {
        unsubscribe();
        delete this.unsubscribeByPlace[placeId];
      }

      if (this.reviewsByPlace[placeId]) {
        delete this.reviewsByPlace[placeId];
      }
    },

    async addReview(input: CreateReviewInput) {
      this.isSubmitting = true;

      try {
        // intialize the callable function
        const fn = httpsCallable(functions, "addReview");
        await fn(input);
      } catch (error) {
        console.error("Failed to create review:", error);
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },
  },
});

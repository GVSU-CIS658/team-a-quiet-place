import { defineStore } from "pinia";
import type { Review } from "../types/data";
import { collection, onSnapshot } from "firebase/firestore";
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
    reviews: [] as Review[],
    unsubscribe: null as (() => void) | null,
    isSubmitting: false,
    error: null as string | null,
  }),

  getters: {
    getReviewsForPlace: (state) => {
      return (placeId: string): Review[] =>
        state.reviews
          .filter((r) => r.placeId === placeId)
          .sort((a, b) => b.createdAt - a.createdAt);
    },
  },

  actions: {
    readReviews() {
      if (this.unsubscribe) return;

      this.unsubscribe = onSnapshot(
        collection(db, "reviews"),
        (snapshot) => {
          this.reviews = snapshot.docs.map((doc) => {
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
          this.error = "Failed to read reviews.";
        }
      );
    },

    stopReading() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    },

    async addReview(input: CreateReviewInput) {
      this.isSubmitting = true;
      this.error = null;

      try {
        const fn = httpsCallable(functions, "addReview");
        await fn(input);
      } catch (error) {
        console.error("Failed to create review:", error);
        this.error = "Failed to create review.";
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },
  },
});
import { defineStore } from "pinia";
import type { Review } from "../types/data";
import {
  collection,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, functions } from '../firebase/firebase'
import { httpsCallable } from "firebase/functions";

type CreateReviewInput = {
  placeId: string;
  rating: number;
  text: string;
};

export const useReviewsStore = defineStore("reviews", {
  state: () => ({
    reviews: [] as Review[],
    unsubscribe: null as (() => void) | null,
    isSubmitting: false,
    error: null as string | null,
  }),

  getters: {
    getReviewsForPlace: (state) => {
      return (placeId: string): Review[] => {
        return state.reviews
          .filter((review) => review.placeId === placeId)
          .sort((a, b) => b.createdAt - a.createdAt);
      };
    },

    getReviewCountForPlace: (state) => {
      return (placeId: string): number => {
        return state.reviews.filter((review) => review.placeId === placeId)
          .length;
      };
    },

    getAverageRatingForPlace: (state) => {
      return (placeId: string): number => {
        const placeReviews = state.reviews.filter(
          (review) => review.placeId === placeId,
        );

        if (placeReviews.length === 0) return 0;

        const total = placeReviews.reduce(
          (sum, review) => sum + review.rating,
          0,
        );

        return Number((total / placeReviews.length).toFixed(1));
      };
    },
  },

  actions: {
    readReviews() {
      if (this.unsubscribe) return;

      this.unsubscribe = onSnapshot(
        collection(db, "reviews"),
        (snapshot) => {
          this.reviews = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();

            return {
              id: docSnap.id,
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
        },
      );
    },

    stopReading() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    },

    async addReview(input: CreateReviewInput): Promise<Review> {
      this.isSubmitting = true;
      this.error = null;

      try {
        const user = auth.currentUser?.displayName ?? "Anonymous";

        const payload = {
          placeId: input.placeId,
          rating: input.rating,
          text: input.text,
          user,
          createdAt: serverTimestamp(),
        };

        const addReview = httpsCallable(functions, "addReview");
        const reviewid = await addReview(payload);

        return {
          id: reviewid.data as string,
          placeId: input.placeId,
          rating: input.rating,
          text: input.text,
          user,
          createdAt: Date.now(),
        };
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
import { defineStore } from "pinia";
import type { Review } from "../types/data";
import mockReviews from "../mockdata/mockReviews.json";

export const useReviewsStore = defineStore("reviews", {
  state: () => ({
    reviews: mockReviews as Review[],
  }),

  getters: {
    getReviewsForPlace: (state) => {
      return (placeId: number): Review[] => {
        return state.reviews
          .filter((review) => review.placeId === placeId)
          .sort((a, b) => {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
      };
    },

    getReviewCountForPlace: (state) => {
      return (placeId: number): number => {
        return state.reviews.filter((review) => review.placeId === placeId)
          .length;
      };
    },

    getAverageRatingForPlace: (state) => {
      return (placeId: number): number => {
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
    addReview(newReview: Omit<Review, "id" | "createdAt">) {
      const nextId =
        this.reviews.length > 0
          ? Math.max(...this.reviews.map((review) => review.id)) + 1
          : 1;

      this.reviews.push({
        id: nextId,
        placeId: newReview.placeId,
        user: newReview.user,
        rating: newReview.rating,
        text: newReview.text,
        createdAt: new Date().toISOString(),
      });
    },

    removeReview(reviewId: number) {
      this.reviews = this.reviews.filter((review) => review.id !== reviewId);
    },
  },
});

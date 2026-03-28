import { defineStore } from "pinia";
import type { Place, Review } from "../types/data";

type CreatePlaceInput = {
  name: string;
  location: string;
  description: string;
  images: string[];
  tags: string[];
  firstReview?: string;
};

type CreatePlaceResult = {
  place: Place;
  firstReview: Review | null;
};

export const useAddPlaceStore = defineStore("addPlace", {
  state: () => ({
    isSubmitting: false,
    error: null as string | null,
  }),

  actions: {
    async createPlace(input: CreatePlaceInput): Promise<CreatePlaceResult> {
      this.isSubmitting = true;
      this.error = null;

      try {
        const placeId = Date.now();
        const trimmedFirstReview = input.firstReview?.trim() ?? "";

        const place: Place = {
          id: placeId,
          name: input.name.trim(),
          location: input.location.trim(),
          description: input.description.trim(),
          rating: trimmedFirstReview ? 5 : 5,
          reviews: trimmedFirstReview ? 1 : 0,
          images: input.images,
          tags: input.tags,
        };

        const firstReview: Review | null = trimmedFirstReview
          ? {
              id: placeId + 1,
              placeId,
              user: "You",
              rating: 5,
              text: trimmedFirstReview,
              createdAt: new Date().toISOString(),
            }
          : null;

        await new Promise((resolve) => setTimeout(resolve, 500));

        return { place, firstReview };
      } catch (error) {
        this.error = "Failed to create place.";
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },
  },
});
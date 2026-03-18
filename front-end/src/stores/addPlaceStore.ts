import { defineStore } from "pinia";
import type { Place } from "../types/data";

type CreatePlaceInput = {
  name: string;
  location: string;
  description: string;
  images: string[];
  tags: string[];
};

export const useAddPlaceStore = defineStore("addPlace", {
  state: () => ({
    isSubmitting: false,
    error: null as string | null,
  }),

  actions: {
    async createPlace(input: CreatePlaceInput): Promise<Place> {
      this.isSubmitting = true;
      this.error = null;

      try {
        const payload: Place = {
          id: Date.now(),
          name: input.name.trim(),
          location: input.location.trim(),
          description: input.description.trim(),
          rating: 5,
          reviews: 0,
          images: input.images,
          tags: input.tags,
        };

        await new Promise((resolve) => setTimeout(resolve, 500));

        return payload;
      } catch (error) {
        this.error = "Failed to create place.";
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },
  },
});

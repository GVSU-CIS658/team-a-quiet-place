import { defineStore } from "pinia";
import mockSaved from "../mockdata/mockSavedPlaces.json";
import { usePlacesStore } from "./placesStore";
import type { Place } from "../types/data";

export const useSavedPlacesStore = defineStore("savedPlaces", {
  state: () => ({
    saved: mockSaved,

    filters: {
      location: "",
      rating: null as number | null,
    },
  }),

  getters: {
    savedPlaces(state): Place[] {
      const placesStore = usePlacesStore();

      return state.saved
        .map((entry) => placesStore.places.find((p) => p.id === entry.placeId))
        .filter((p): p is Place => Boolean(p));
    },

    filteredSavedPlaces(): Place[] {
      return this.savedPlaces.filter((place) => {
        const locationMatch =
          !this.filters.location ||
          place.location
            .toLowerCase()
            .includes(this.filters.location.toLowerCase());

        const ratingMatch =
          this.filters.rating === null || place.rating >= this.filters.rating;

        return locationMatch && ratingMatch;
      });
    },

    isSaved: (state) => {
      return (placeId: string) =>
        state.saved.some((p) => p.placeId === placeId);
    },
  },

  actions: {
    savePlace(placeId: string) {
      if (!this.saved.some((p) => p.placeId === placeId)) {
        this.saved.push({
          placeId,
          savedAt: new Date().toISOString(),
        });
      }
    },

    removePlace(placeId: string) {
      this.saved = this.saved.filter((p) => p.placeId !== placeId);
    },

    resetFilters() {
      this.filters.location = "";
      this.filters.rating = null;
    },

    setLocationFilter(location: string) {
      this.filters.location = location;
    },

    setRatingFilter(rating: number | null) {
      this.filters.rating = rating;
    },
  },
});

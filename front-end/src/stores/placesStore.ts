import { defineStore } from "pinia";
import type { Place } from "../types/data";
import mockPlaces from "../mockdata/mockPlaces.json";

export const usePlacesStore = defineStore("places", {
  state: () => ({
    places: mockPlaces as Place[],

    filters: {
      location: "",
      rating: null as number | null,
    },
  }),

  getters: {
    filteredPlaces(state): Place[] {
      return state.places.filter((place) => {
        const locationMatch =
          !state.filters.location ||
          place.location
            .toLowerCase()
            .includes(state.filters.location.toLowerCase());

        const ratingMatch =
          state.filters.rating === null || place.rating >= state.filters.rating;

        return locationMatch && ratingMatch;
      });
    },
  },

  actions: {
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

    setPlaces(places: Place[]) {
      this.places = places;
    },
  },
});

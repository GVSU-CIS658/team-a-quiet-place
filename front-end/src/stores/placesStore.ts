import { defineStore } from "pinia";
import type { Place } from "../types/data";
import { onSnapshot, collection } from "firebase/firestore";
import { db } from '../firebase/firebase'

let unsubscribe: (() => void) | null = null;

export const usePlacesStore = defineStore("places", {
  state: () => ({
    places: [] as Place[],
    

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

    async getPlacesDB(){
      try {
        if (unsubscribe) return;

        unsubscribe = onSnapshot(collection(db, "places"), (snapshot) => {
          this.places = snapshot.docs.map((doc) => {
            const data = doc.data();

            const placedb: Place = {
              id: data.id,
              name: data.name,
              location: data.location,
              description: data.description,
              rating: data.rating,
              reviews: data.reviews,
              images: data.images,
              tags: data.tags,
            };
            return placedb;
          });
        });
      }catch(error) {
        console.error('Error fetching data: ', error);
      }
    },

    /*async mocktodatabase(){
      try {
        this.places.forEach(async (place) => {
          await setDoc(doc(db, "places", place.id.toString()), place)
        })
      }catch(error) {
        console.error('Error fetching data: ', error);
      }
    }*/
  },
});

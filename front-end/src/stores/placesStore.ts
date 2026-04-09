import { defineStore } from "pinia";
import type { Place, LocationType } from "../types/data";
import { onSnapshot, collection, addDoc } from "firebase/firestore";
import { db, store } from "../firebase/firebase";
import { uploadBytes, getDownloadURL, ref } from "firebase/storage";

type CreatePlaceInput = {
  name: string;
  location: LocationType;
  description: string;
  images: string[];
  tags: string[];
};

type Filters = {
  location: LocationType | null;
  rating: number | null;
};

export const usePlacesStore = defineStore("places", {
  state: () => ({
    places: [] as Place[],
    unsubscribe: null as (() => void) | null,

    isSubmitting: false,
    error: null as string | null,

    filters: {
      location: null as LocationType | null,
      rating: null as number | null,
    },
  }),

  getters: {
    filteredPlaces(state): Place[] {
      return state.places.filter((place) => {
        const locationMatch =
          !state.filters.location ||
          place.location === state.filters.location;

        const ratingMatch =
          state.filters.rating === null ||
          place.rating >= state.filters.rating;

        return locationMatch && ratingMatch;
      });
    },
  },

  actions: {
    updateFilters(partial: Partial<Filters>) {
      this.filters = {
        ...this.filters,
        ...partial,
      };
    },

    resetFilters() {
      this.filters = {
        location: null,
        rating: null,
      };
    },

    // READ
    readPlaces() {
      if (this.unsubscribe) return;

      this.unsubscribe = onSnapshot(
        collection(db, "places"),
        (snapshot) => {
          this.places = snapshot.docs.map((doc) => {
            const data = doc.data();

            return {
              id: doc.id,
              name: data.name,
              location: data.location as LocationType,
              description: data.description,
              rating: data.rating,
              reviews: data.reviews,
              images: data.images,
              tags: data.tags,
            };
          });
        },
        (error) => {
          console.error("Error reading places:", error);
          this.error = "Failed to read places.";
        }
      );
    },

    stopReading() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    },

    // ADD
    async createPlace(input: CreatePlaceInput): Promise<Place> {
      this.isSubmitting = true;
      this.error = null;

      try {
        const payload = {
          name: input.name.trim(),
          location: input.location,
          description: input.description.trim(),
          rating: 0,
          reviews: 0,
          images: input.images,
          tags: input.tags,
        };

        const docRef = await addDoc(collection(db, "places"), payload);

        return {
          id: docRef.id,
          ...payload,
        };
      } catch (error) {
        console.error("Failed to create place:", error);
        this.error = "Failed to create place.";
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },

    async uploadImage(file: File): Promise<string> {
      const storageRef = ref(store, `images/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    },
  },
});
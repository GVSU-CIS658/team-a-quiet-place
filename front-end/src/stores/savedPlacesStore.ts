import { defineStore } from "pinia";
import { usePlacesStore } from "./placesStore";
import type { Place, Saves, LocationType } from "../types/data";
import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

type Filters = {
  location: LocationType | null;
  rating: number | null;
};

export const useSavedPlacesStore = defineStore("savedPlaces", {
  state: () => ({
    saved: [] as Saves[],
    unsubscribe: null as (() => void) | null,
    isSubmitting: false,

    filters: {
      location: null as LocationType | null,
      rating: null as number | null,
    },
  }),

  getters: {
    savedPlaces(state): Place[] {
      const placesStore = usePlacesStore();

      // Map saved entries to their corresponding place objects,
      // if the place no longer exists in the places store, it will be filtered out (ex: when savedPlaces is more than storedPlaces)
      return state.saved
        .map((entry) =>
          placesStore.places.find((place) => place.id === entry.placeId),
        )
        .filter((place): place is Place => Boolean(place));
    },

    filteredSavedPlaces(): Place[] {
      return this.savedPlaces.filter((place) => {
        const locationMatch =
          !this.filters.location || place.location === this.filters.location;

        const ratingMatch =
          this.filters.rating === null || place.rating >= this.filters.rating;

        return locationMatch && ratingMatch;
      });
    },

    // Check if a specific place is saved in the state.saved array by its placeId
    isSaved: (state) => {
      return (placeId: string): boolean => {
        return state.saved.some((entry) => entry.placeId === placeId);
      };
    },
  },

  actions: {
    async savePlace(placeId: string): Promise<void> {
      this.isSubmitting = true;

      try {
        const user = auth.currentUser?.uid;
        if (!user) return;

        const alreadySaved = this.saved.some(
          (entry) => entry.placeId === placeId,
        );
        if (alreadySaved) return;

        await addDoc(collection(db, "saves"), {
          placeId,
          user,
          savedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("Failed to create save:", error);
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },

    async removePlace(placeId: string): Promise<void> {
      this.isSubmitting = true;

      try {
        const user = auth.currentUser?.uid;
        if (!user) return;

        const savesQuery = query(
          collection(db, "saves"),
          where("placeId", "==", placeId),
          where("user", "==", user),
        );

        const snapshot = await getDocs(savesQuery);

        await Promise.all(
          snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref)),
        );
      } catch (error) {
        console.error("Failed to delete save:", error);
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },

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

    setRatingFilter(rating: number | null) {
      this.filters.rating = rating;
    },

    // initialize a real-time listener for the user's saved places, 
    // and update the state.saved array whenever there are changes in the "saves" collection for the current user
    readSaves() {
      if (this.unsubscribe) return;

      const user = auth.currentUser?.uid;
      if (!user) return;

      const userSavesQuery = query(
        collection(db, "saves"),
        where("user", "==", user),
      );

      this.unsubscribe = onSnapshot(
        userSavesQuery,
        (snapshot) => {
          this.saved = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();

            return {
              id: docSnap.id,
              placeId: data.placeId,
              user: data.user,
              savedAt: data.savedAt?.toMillis?.() ?? 0,
            } as Saves;
          });
        },
        (error) => {
          console.error("Error reading saves:", error);
        },
      );
    },

    stopReading() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    },

    clearSaved() {
      this.saved = [];
    },
  },
});
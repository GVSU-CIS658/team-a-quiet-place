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
    error: null as string | null,

    filters: {
      location: null as LocationType | null,
      rating: null as number | null,
    },
  }),

  getters: {
    savedPlaces(state): Place[] {
      const placesStore = usePlacesStore();

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

    isSaved: (state) => {
      return (placeId: string): boolean => {
        return state.saved.some((entry) => entry.placeId === placeId);
      };
    },
  },

  actions: {
    async savePlace(placeId: string): Promise<void> {
      this.isSubmitting = true;
      this.error = null;

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
        this.error = "Failed to create save.";
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },

    async removePlace(placeId: string): Promise<void> {
      this.isSubmitting = true;
      this.error = null;

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
        this.error = "Failed to delete save.";
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
          this.error = "Failed to read saves.";
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
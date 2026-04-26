import { defineStore } from "pinia";
import type {
  ApprovalStatus,
  LocationType,
  Place,
  PlaceFilters,
} from "../types/data";
import {
  onSnapshot,
  collection,
  query,
  where,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db, store } from "../firebase/firebase";
import { uploadBytes, getDownloadURL, ref } from "firebase/storage";

type CreatePlaceInput = {
  name: string;
  location: LocationType;
  description: string;
  images: string[];
  tags: string[];
};

const functions = getFunctions();

export const usePlacesStore = defineStore("places", {
  state: () => ({
    places: [] as Place[],
    unsubscribe: null as (() => void) | null,
    readMode: null as "all" | "approved" | null,

    isSubmitting: false,

    filters: {
      location: null as LocationType | null,
      rating: null as number | null,
    },
  }),

  getters: {
    approvedPlaces(state): Place[] {
      return state.places.filter((place) => place.approvalStatus === "approved");
    },

    pendingPlaces(state): Place[] {
      return state.places.filter((place) => place.approvalStatus === "pending");
    },

    // filteredPlaces updates automatically, when filter location and rating changes, 
    // or when the list of approved places changes. 
    // It returns the list of approved places that match the current filters.
    filteredPlaces(): Place[] {
      return this.approvedPlaces.filter((place) => {
        const locationMatch =
          !this.filters.location ||
          place.location === this.filters.location;

        const ratingMatch =
          this.filters.rating === null ||
          place.rating >= this.filters.rating;

        return locationMatch && ratingMatch;
      });
    },

    filteredPendingPlaces(): Place[] {
      return this.pendingPlaces.filter((place) => {
        const locationMatch =
          !this.filters.location ||
          place.location === this.filters.location;

        const ratingMatch =
          this.filters.rating === null ||
          place.rating >= this.filters.rating;

        return locationMatch && ratingMatch;
      });
    },
  },

  actions: {
    updateFilters(partial: Partial<PlaceFilters>) {
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

    readPlaces(mode: "all" | "approved" = "approved") {
      if (this.unsubscribe && this.readMode === mode) return;

      this.stopReading();
      this.readMode = mode;

      const placesRef =
        mode === "all"
          ? collection(db, "places")
          : query(
              collection(db, "places"),
              where("approvalStatus", "==", "approved"),
            );

      this.unsubscribe = onSnapshot(
        placesRef,
        (snapshot) => {
          this.places = snapshot.docs.map((doc) => {
            const data = doc.data();

            return {
              id: doc.id,
              name: data.name,
              location: data.location as LocationType,
              description: data.description,
              rating: data.rating ?? 0,
              reviews: data.reviews ?? 0,
              images: data.images ?? [],
              tags: data.tags ?? [],
              approvalStatus: (data.approvalStatus ?? "approved") as ApprovalStatus,
              createdByUid: data.createdByUid,
              createdByName: data.createdByName,
              createdAt: data.createdAt?.toMillis?.() ?? undefined,
            } as Place;
          });
        },
        (error) => {
          console.error("Error reading places:", error);
        }
      );
    },

    stopReading() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }

      this.readMode = null;
    },

    async createPlace(input: CreatePlaceInput): Promise<string> {
      this.isSubmitting = true;

      try {
        // initialize callable function
        const addPlace = httpsCallable(functions, "addPlace");
        // call the function with the payload and wait for the result
        const result = await addPlace(input);

        return result.data as string;
      } catch (error) {
        console.error("Failed to create place:", error);
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },

    // Uploads an image file to Firebase Storage and returns the download URL
    async uploadImage(file: File): Promise<string> {
      const storageRef = ref(store, `images/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    },

    // lets admin update the approval status of a place - either approve, reject or set back to pending
    async adminUpdateApprovalStatus(
      placeId: string,
      approvalStatus: ApprovalStatus,
    ): Promise<void> {
      this.isSubmitting = true;

      try {
        // initialize callable function
        const adminUpdatePlaceStatus = httpsCallable(
          functions,
          "adminUpdatePlaceStatus",
        );

        await adminUpdatePlaceStatus({
          placeId,
          approvalStatus,
        });
      } catch (error) {
        console.error("Failed to update approval status:", error);
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },

    // lets admin delete a place
    async adminDeletePlace(placeId: string): Promise<void> {
      this.isSubmitting = true;

      try {
        // initialize callable function
        const adminDeletePlace = httpsCallable(functions, "adminDeletePlace");

        await adminDeletePlace({
          placeId,
        });
      } catch (error) {
        console.error("Failed to delete place:", error);
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },
  },
});

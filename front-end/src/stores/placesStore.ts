import { defineStore } from "pinia";
import type { Place, LocationType, ApprovalStatus } from "../types/data";
import { onSnapshot, collection, doc, updateDoc } from "firebase/firestore";
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

type Filters = {
  location: LocationType | null;
  rating: number | null;
};

const functions = getFunctions();

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
    approvedPlaces(state): Place[] {
      return state.places.filter((place) => place.approvalStatus === "approved");
    },

    pendingPlaces(state): Place[] {
      return state.places.filter((place) => place.approvalStatus === "pending");
    },

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

    async createPlace(input: CreatePlaceInput): Promise<string> {
      this.isSubmitting = true;
      this.error = null;

      try {
        const payload = {
          name: input.name.trim(),
          location: input.location,
          description: input.description.trim(),
          images: input.images,
          tags: input.tags,
        };

        const addPlace = httpsCallable(functions, "addPlace");
        const result = await addPlace(payload);

        return result.data as string;
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

    async updateApprovalStatus(
      placeId: string,
      approvalStatus: ApprovalStatus,
    ): Promise<void> {
      this.isSubmitting = true;
      this.error = null;

      try {
        await updateDoc(doc(db, "places", placeId), {
          approvalStatus,
        });
      } catch (error) {
        console.error("Failed to update approval status:", error);
        this.error = "Failed to update approval status.";
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },
  },
});

import { defineStore } from "pinia";
import { usePlacesStore } from "./placesStore";
import type { Place, Saves } from "../types/data";
import {collection, updateDoc, addDoc, onSnapshot, doc, getDocs, deleteDoc, query, where} from "firebase/firestore";
import { auth, db } from '../firebase/firebase'

let unsubscribe: (() => void) | null = null;

export const useSavedPlacesStore = defineStore("savedPlaces", {
  state: () => ({
    saved: [] as Saves[],
    isSubmitting: false,
    error: null as string | null,

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
    async savePlace(placeId: string) {
      this.isSubmitting = true;
      this.error = null;
      try {
        if(auth.currentUser?.uid){
          const saves: Saves = {
            id: Date.now().toString(),
            placeId: placeId,
            user: auth.currentUser.uid,
            savedAt: Date.now()
          };


          const docSav = await addDoc(collection(db, "saves"), saves);
          await updateDoc(docSav, { id: docSav.id });
        }
      } catch (error) {
        this.error = "Failed to create save.";
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },

    async removePlace(placeId: string) {
      try {
        if(auth.currentUser?.uid){
          const uid = auth.currentUser.uid;

          const saveRef = query(
            collection(db, "saves"),
            where("placeId", "==", placeId),
            where("user", "==", uid)
          );
          const saveDoc = await getDocs(saveRef);
        

          saveDoc.forEach(async (save) => {
            await deleteDoc(doc(db, "saves", save.id));
          });
        }
      }catch (error) {
        this.error = "Failed to delete save.";
        throw error;
      } finally {
        this.isSubmitting = false;
      }
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

    async getSavesDB(){
      try {
        if (unsubscribe) return;
        if (!auth.currentUser?.uid) return;

        const uid = auth.currentUser.uid;

        const userSaves = query(
          collection(db, "saves"),
          where("user", "==", uid)
        );

        unsubscribe = onSnapshot(userSaves, (snapshot) => {
          this.saved = snapshot.docs.map((doc) => {
            const data = doc.data();

            const savedb: Saves = {
              id: data.id,
              placeId: data.placeId,
              user: data.user,
              savedAt: data.savedAt,
            };
            return savedb;
          });
        });
      }catch(error) {
        console.error('Error fetching data: ', error);
      }
    },
    stopListener() {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
    },

    clearSaved() {
      this.saved = [];
    }
  },
});

import { defineStore } from "pinia";
import type { Place, Review} from "../types/data";
import { auth, store, functions } from '../firebase/firebase'
import { uploadBytes, getDownloadURL, ref } from "firebase/storage";
import { httpsCallable } from "firebase/functions";


type CreatePlaceInput = {
  name: string;
  location: string;
  description: string;
  images: string[];
  tags: string[];
  firstReview: string;
  firstReviewScore: number;
};

export const useAddPlaceStore = defineStore("addPlace", {
  state: () => ({
    isSubmitting: false,
    error: null as string | null,
  }),

  actions: {
    async createPlace(input: CreatePlaceInput): Promise<Place> {
      this.error = null;

      try {
        const payload: Place = {
          id: Date.now().toString(),
          name: input.name.trim(),
          location: input.location.trim(),
          description: input.description.trim(),
          rating: 0,
          reviews: 0,
          images: input.images,
          tags: input.tags,
        };
        const addPlace = httpsCallable(functions, "addPlace");
        const placeid = await addPlace(payload);

        if (input.firstReview != ''){
          if(auth.currentUser?.displayName){
            const review: Review = {
              id: Date.now().toString(),
              placeId: placeid.data as string,
              user: auth.currentUser.displayName,
              rating: input.firstReviewScore,
              text: input.firstReview.trim(),
              createdAt: Date.now()
            };


             const addReview = httpsCallable(functions, "addReview");
             await addReview(review);
          }
        }
        return payload;
      } catch (error) {
        this.error = "Failed to create place.";
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },
    async uploadImage(file:File): Promise<string>{
      const storageRef = ref(store, `images/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;

    }
  },
});
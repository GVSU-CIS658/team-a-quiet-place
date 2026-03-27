import { defineStore } from "pinia";
import type { Place, Review} from "../types/data";
import { updateDoc, addDoc, collection } from "firebase/firestore";
import { auth, db } from '../firebase/firebase'

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
      this.isSubmitting = true;
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
        const docPla = await addDoc(collection(db, "places"), payload);
        await updateDoc(docPla, { id: docPla.id });
        if (input.firstReview != ''){
          if(auth.currentUser?.displayName){
            const review: Review = {
              id: Date.now().toString(),
              placeId: payload.id,
              user: auth.currentUser.displayName,
              rating: input.firstReviewScore,
              text: input.firstReview.trim(),
              createdAt: Date.now()
            };


            const docRev = await addDoc(collection(db, "reviews"), review);
            await updateDoc(docRev, { id: docRev.id, placeId: docPla.id });
            await updateDoc(docPla, { rating: input.firstReviewScore, reviews: 1 });
            
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
  },
});

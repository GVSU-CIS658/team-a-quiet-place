import { defineStore } from "pinia";
import type { Place, Review} from "../types/data";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from '../firebase/firebase'

type CreatePlaceInput = {
  name: string;
  location: string;
  description: string;
  images: string[];
  tags: string[];
  firstReview: string;
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
          id: Date.now(),
          name: input.name.trim(),
          location: input.location.trim(),
          description: input.description.trim(),
          rating: 5,
          reviews: 0,
          images: input.images,
          tags: input.tags,
        };
        if (input.firstReview != ''){
          if(auth.currentUser?.displayName){
            const review: Review = {
              id: 1,
              placeId: payload.id,
              user: auth.currentUser.displayName,
              rating: 5,
              text: input.firstReview.trim(),
              createdAt: Date.now().toString()
            };


            await setDoc(doc(db, "reviews", review.id.toString()), review)

          }
        }
        
        await setDoc(doc(db, "places", payload.id.toString()), payload)

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

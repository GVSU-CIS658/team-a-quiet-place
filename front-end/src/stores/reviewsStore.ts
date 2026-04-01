import { defineStore } from "pinia";
import type { Review } from "../types/data";
import { doc, getDoc, onSnapshot, collection, updateDoc, addDoc, deleteDoc} from "firebase/firestore";
import { auth, db } from '../firebase/firebase'

let unsubscribe: (() => void) | null = null;

export const useReviewsStore = defineStore("reviews", {
  state: () => ({
    reviews: [] as Review[],

    isSubmitting: false,
    error: null as string | null,

  }),

  getters: {
    getReviewsForPlace: (state) => {
      return (placeId: string): Review[] => {
        return state.reviews
          .filter((review) => review.placeId === placeId)
          .sort((a, b) => {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
      };
    },

    getReviewCountForPlace: (state) => {
      return (placeId: string): number => {
        return state.reviews.filter((review) => review.placeId === placeId)
          .length;
      };
    },

    getAverageRatingForPlace: (state) => {
      return (placeId: string): number => {
        const placeReviews = state.reviews.filter(
          (review) => review.placeId === placeId,
        );

        if (placeReviews.length === 0) return 0;

        const total = placeReviews.reduce(
          (sum, review) => sum + review.rating,
          0,
        );
        return Number((total / placeReviews.length).toFixed(1));
      };
    },
  },

  actions: {
    async addReview(newReview: Omit<Review, "id" | "createdAt" | "user">) {
      this.isSubmitting = true;
      this.error = null;
      try {
        if (newReview.text != ''){
          if(auth.currentUser?.displayName){
            const review: Review = {
              id: Date.now().toString(),
              placeId: newReview.placeId,
              user: auth.currentUser.displayName,
              rating: newReview.rating,
              text: newReview.text,
              createdAt: Date.now()
            };


            const docRev = await addDoc(collection(db, "reviews"), review);
            await updateDoc(docRev, { id: docRev.id });
            
            const placeRef = doc(db, "places", newReview.placeId);
            const placeDoc = await getDoc(placeRef);
            
            if(placeDoc.exists()){
              const placeData = placeDoc.data();

              const prevRev = placeData.reviews ?? 0;
              const prevRat = placeData.rating ?? 0;

              const newRev = prevRev + 1;
              const newRat = (prevRat * prevRev + newReview.rating) / newRev;
              await updateDoc(placeRef, {reviews: newRev, rating: newRat});
            }
            
          }
        }
      } catch (error) {
        this.error = "Failed to create review.";
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },

    async removeReview(reviewId: string) {
      try{
        const reviewRef = doc(db, "reviews", reviewId);
        const reviewDoc = await getDoc(reviewRef);
        if(reviewDoc.exists()){
          const placeID = reviewDoc.data().placeId
          const oldRating = reviewDoc.data().rating

          await deleteDoc(doc(db, "reviews", reviewId));

          const placeRef = doc(db, "places", placeID);
          const placeDoc = await getDoc(placeRef);
          
          if(placeDoc.exists()){
            const placeData = placeDoc.data();

            const prevRev = placeData.reviews ?? 0;
            const prevRat = placeData.rating ?? 0;

            const newRev = prevRev - 1;
            const newRat = (prevRat * prevRev - oldRating) / newRev;
            await updateDoc(placeRef, {reviews: newRev, rating: newRat});
          }

        }
      }catch (error) {
        this.error = "Failed to delete review.";
        throw error;
      } finally {
        this.isSubmitting = false;
      }
      

    },

    async getReviewsDB(){
          try {
            if (unsubscribe) return;
    
            unsubscribe = onSnapshot(collection(db, "reviews"), (snapshot) => {
              this.reviews = snapshot.docs.map((doc) => {
                const data = doc.data();
    
                const placedb: Review = {
                  id: data.id,
                  placeId: data.placeId,
                  createdAt: data.createdAt,
                  rating: data.rating,
                  text: data.text,
                  user: data.user,
                };
                return placedb;
              });
            });
          }catch(error) {
            console.error('Error fetching data: ', error);
          }
        },

  },
});

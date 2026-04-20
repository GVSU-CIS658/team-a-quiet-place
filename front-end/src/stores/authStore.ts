import { defineStore } from "pinia";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    type User,
} from "firebase/auth";

export const useAuthStore = defineStore("authStore", {
    state: () => ({
        user: null as User | null,
    }),

    actions: {
        init() {
            // A Firebase Authentication is the main object that manages authentication
            // it provides methods for signing in, signing out, and listening for authentication state changes
            const auth = getAuth();

            // Listen for authentication state changes to update the user state accordingly
            onAuthStateChanged(auth, (user) => {
                this.user = user;
            });
        },

        signInWithGoogle() {
            const auth = getAuth();
            const provider = new GoogleAuthProvider();

            return signInWithPopup(auth, provider)
                .then((result) => {
                    this.user = result.user;
                });
        },

        logout() {
            const auth = getAuth();
            
            return signOut(auth)
                .then(() => {
                    this.user = null;
                })
        },

    }
})
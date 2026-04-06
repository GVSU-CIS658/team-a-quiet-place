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
            const auth = getAuth();

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
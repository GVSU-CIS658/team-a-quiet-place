import { defineStore } from "pinia";
import { doc, onSnapshot } from "firebase/firestore";
import { watch } from "vue";
import { db } from "../firebase/firebase";
import { useAuthStore } from "./authStore";

export const useAdminStore = defineStore("admin", {
  state: () => ({
    isAdmin: false,
    isChecking: true,
    unsubscribe: null as (() => void) | null,
    initialized: false,
  }),

  getters: {
    isUnlocked(state): boolean {
      return state.isAdmin && !state.isChecking;
    },
  },

  actions: {

    init() {
      if (this.initialized) return;

      this.initialized = true;

      const authStore = useAuthStore();

      watch(
        () => authStore.user?.uid ?? null,
        (uid) => {
          this.syncForUser(uid);
        },
        { immediate: true },
      );
    },

    // Check admins collection for the current user's UID to determine if they have admin access
    syncForUser(uid: string | null) {
      this.unsubscribe?.();
      this.unsubscribe = null;

      if (!uid) {
        this.isAdmin = false;
        this.isChecking = false;
        return;
      }

      // start checking admin access
      this.isChecking = true;

      this.unsubscribe = onSnapshot(
        doc(db, "admins", uid),
        (snapshot) => {
          const adminData = snapshot.data();
          // check document exists and has active: true to determine if user is an admin
          this.isAdmin = snapshot.exists() && adminData?.active === true;
          this.isChecking = false;
        },
        (error) => {
          console.error("Failed to read admin access:", error);
          this.isAdmin = false;
          this.isChecking = false;
        },
      );
    },
  },
});

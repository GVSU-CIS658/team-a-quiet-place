<template>
  <div class="admin-page">
    <div v-if="!auth.user" class="empty-state">
      <v-card rounded="xl" elevation="2" class="pa-8 text-center">
        <div class="text-h6 font-weight-bold mb-2">Sign in required</div>
        <div class="text-body-2 text-medium-emphasis mb-4">
          Sign in first, then enter the admin password to review pending places.
        </div>

        <v-btn color="primary" rounded="xl" @click="signIn">
          Sign in with Google
        </v-btn>
      </v-card>
    </div>

    <template v-else-if="isUnlocked">
      <div v-if="currentPlace" class="card-stage">
        <div class="card-column">
          <transition :name="slideDirection" mode="out-in">
            <PlaceCard
              :key="currentPlace.id"
              :place="currentPlace"
              :show-save-button="false"
            />
          </transition>
        </div>

        <div class="stage-nav-row">
          <v-btn
            class="stage-nav-btn reject-btn"
            icon="mdi-close"
            variant="outlined"
            rounded="xl"
            :loading="placesStore.isSubmitting"
            @click="reviewPlace('rejected')"
          />

          <v-btn
            class="stage-nav-btn approve-btn"
            icon="mdi-heart"
            color="primary"
            variant="flat"
            rounded="xl"
            :loading="placesStore.isSubmitting"
            @click="reviewPlace('approved')"
          />
        </div>
      </div>

      <div v-else class="empty-state">
        <v-card rounded="xl" elevation="2" class="pa-8 text-center">
          <div class="text-h6 font-weight-bold mb-2">No pending places</div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Everything in the queue has already been reviewed.
          </div>

          <v-btn color="primary" rounded="xl" @click="placesStore.resetFilters()">
            Reset filters
          </v-btn>
        </v-card>
      </div>

      <v-btn
        class="filter-fab"
        icon="mdi-tune-variant"
        variant="flat"
        @click="filterDialog = true"
      />

      <FilterFab v-model="filterDialog" :store="placesStore" />
    </template>

    <v-dialog v-model="passwordDialog" persistent max-width="420">
      <v-card rounded="xl">
        <v-card-title class="text-h6 pt-6 px-6">
          Admin access
        </v-card-title>

        <v-card-text class="px-6 pb-2">
          <div class="text-body-2 text-medium-emphasis mb-4">
            Enter the admin password to review pending places.
          </div>

          <v-text-field
            v-model="passwordInput"
            label="Admin password"
            type="password"
            variant="outlined"
            rounded="lg"
            hide-details="auto"
            :error-messages="passwordError ? [passwordError] : []"
            @keydown.enter.prevent="unlockAdmin"
          />
        </v-card-text>

        <v-card-actions class="px-6 pb-6">
          <v-spacer />
          <v-btn color="primary" rounded="xl" @click="unlockAdmin">
            Unlock
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { ApprovalStatus } from "../types/data";
import FilterFab from "../components/FilterFab.vue";
import PlaceCard from "../components/PlaceCard.vue";
import { useAuthStore } from "../stores/authStore";
import { usePlacesStore } from "../stores/placesStore";

const ADMIN_SESSION_KEY = "quiet-place-admin-unlocked";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? "quiet-place-admin";

const auth = useAuthStore();
const placesStore = usePlacesStore();

const slideDirection = ref("slide-left");
const currentIndex = ref(0);
const filterDialog = ref(false);
const passwordDialog = ref(false);
const passwordInput = ref("");
const passwordError = ref("");
const isUnlocked = ref(false);

const currentPlace = computed(() => {
  const places = placesStore.filteredPendingPlaces;

  if (places.length === 0) return null;

  return places[currentIndex.value] ?? null;
});

watch(
  () => auth.user,
  (user) => {
    if (!user) {
      isUnlocked.value = false;
      passwordDialog.value = false;
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      return;
    }

    const hasSessionAccess = sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
    isUnlocked.value = hasSessionAccess;
    passwordDialog.value = !hasSessionAccess;
  },
  { immediate: true },
);

watch(
  () => placesStore.filteredPendingPlaces,
  (places) => {
    if (places.length === 0) {
      currentIndex.value = 0;
      return;
    }

    if (currentIndex.value > places.length - 1) {
      currentIndex.value = 0;
    }
  },
  { immediate: true },
);

function unlockAdmin() {
  if (passwordInput.value !== ADMIN_PASSWORD) {
    passwordError.value = "Password did not match.";
    return;
  }

  passwordError.value = "";
  passwordInput.value = "";
  isUnlocked.value = true;
  passwordDialog.value = false;
  sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
}

async function signIn() {
  try {
    await auth.signInWithGoogle();
  } catch (error) {
    console.error("Google sign-in failed:", error);
  }
}

async function reviewPlace(approvalStatus: ApprovalStatus) {
  const place = currentPlace.value;
  if (!place) return;

  slideDirection.value = approvalStatus === "approved" ? "slide-left" : "slide-right";

  try {
    await placesStore.updateApprovalStatus(place.id, approvalStatus);
  } catch (error) {
    console.error("Failed to review place:", error);
  }
}
</script>

<style scoped>
.admin-page {
  position: relative;
}

.card-stage {
  min-height: 760px;
}

.card-column {
  width: 100%;
  margin: 0 auto;
  position: relative;
}

.stage-nav-row {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 22px;
}

.stage-nav-btn {
  transform: none;
}

.approve-btn {
  box-shadow: 0 12px 30px rgba(47, 93, 159, 0.22);
}

.reject-btn {
  color: #9b1c1c;
  border-color: rgba(155, 28, 28, 0.22);
  background: rgba(155, 28, 28, 0.04);
}

.empty-state {
  margin-top: 80px;
}

.filter-fab {
  position: fixed;
  bottom: 24px;
  right: max(16px, calc((100vw - 640px) / 2 + 25px));
  z-index: 1200;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: rgba(47, 93, 159, 0.12);
  color: rgba(47, 93, 159, 0.72);
  box-shadow: none;
  opacity: 0.38;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    opacity 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.filter-fab:hover {
  background: rgb(47, 93, 159);
  color: #ffffff;
  opacity: 1;
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(47, 93, 159, 0.25);
}

.filter-fab:focus-visible {
  background: rgb(47, 93, 159);
  color: #ffffff;
  opacity: 1;
}

.filter-fab:active {
  transform: translateY(0);
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition:
    opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(16px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-16px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(16px);
}

@media (max-width: 640px) {
  .filter-fab {
    right: 16px;
    bottom: 16px;
    width: 52px;
    height: 52px;
    border-radius: 16px;
    opacity: 0.88;
  }
}
</style>

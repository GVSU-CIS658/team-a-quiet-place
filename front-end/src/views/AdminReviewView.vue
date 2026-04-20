<template>
  <div class="admin-page">
    <div v-if="!auth.user" class="empty-state">
      <v-card rounded="xl" elevation="2" class="pa-8 text-center">
        <div class="text-h6 font-weight-bold mb-2">Sign in required</div>
        <div class="text-body-2 text-medium-emphasis mb-4">
          Sign in first to review pending places.
        </div>

        <v-btn color="primary" rounded="xl" @click="signIn">
          Sign in with Google
        </v-btn>
      </v-card>
    </div>

    <div v-else-if="isCheckingAdmin" class="empty-state">
      <v-card rounded="xl" elevation="2" class="pa-8 text-center">
        <div class="text-h6 font-weight-bold mb-2">Checking access</div>
        <div class="text-body-2 text-medium-emphasis">
          Verifying your admin membership.
        </div>
      </v-card>
    </div>

    <div v-else-if="!isAdmin" class="empty-state">
      <v-card rounded="xl" elevation="2" class="pa-8 text-center">
        <div class="text-h6 font-weight-bold mb-2">Admin access required</div>
        <div class="text-body-2 text-medium-emphasis">
          Your account is signed in, but it is not active in the `admins` collection.
        </div>
      </v-card>
    </div>

    <template v-else>
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

  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { ApprovalStatus } from "../types/data";
import FilterFab from "../components/FilterFab.vue";
import PlaceCard from "../components/PlaceCard.vue";
import { useAdminStore } from "../stores/adminStore";
import { useAuthStore } from "../stores/authStore";
import { usePlacesStore } from "../stores/placesStore";

const auth = useAuthStore();
const adminStore = useAdminStore();
const placesStore = usePlacesStore();

const slideDirection = ref("slide-left");
const currentIndex = ref(0);
const filterDialog = ref(false);

const isAdmin = computed(() => adminStore.isAdmin);
const isCheckingAdmin = computed(() => adminStore.isChecking);
const isUnlocked = computed(() => adminStore.isUnlocked);

async function signIn() {
  try {
    await auth.signInWithGoogle();
  } catch (error) {
    console.error("Google sign-in failed:", error);
  }
}

const currentPlace = computed(() => {
  const places = placesStore.filteredPendingPlaces;

  if (places.length === 0) return null;

  return places[currentIndex.value] ?? null;
});

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

async function reviewPlace(approvalStatus: ApprovalStatus) {
  const place = currentPlace.value;
  if (!place || !isUnlocked.value) return;

  slideDirection.value = approvalStatus === "approved" ? "slide-left" : "slide-right";

  try {
    await placesStore.adminUpdateApprovalStatus(place.id, approvalStatus);
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

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
        </v-card>
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { ApprovalStatus } from "../types/data";
import PlaceCard from "../components/PlaceCard.vue";
import { useAdminStore } from "../stores/adminStore";
import { useAuthStore } from "../stores/authStore";
import { usePlacesStore } from "../stores/placesStore";

const auth = useAuthStore();
const adminStore = useAdminStore();
const placesStore = usePlacesStore();

const slideDirection = ref("slide-left");

// Admin access state controls which gate or review UI is shown.
const isAdmin = computed(() => adminStore.isAdmin);
const isCheckingAdmin = computed(() => adminStore.isChecking);
const isUnlocked = computed(() => adminStore.isUnlocked);

// Starts Google sign-in from the signed-out state.
async function signIn() {
  try {
    await auth.signInWithGoogle();
  } catch (error) {
    console.error("Google sign-in failed:", error);
  }
}

// Admin review works through the pending queue one place at a time.
const currentPlace = computed(() => {
  const places = placesStore.filteredPendingPlaces;

  if (places.length === 0) return null;

  return places[0] ?? null;
});

// Approves or rejects the current pending place through the admin store action.
async function reviewPlace(approvalStatus: ApprovalStatus) {
  const place = currentPlace.value;
  if (!place || !isUnlocked.value) return;

  slideDirection.value = approvalStatus === "approved" ? "slide-right" : "slide-left";

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
  box-shadow: 0 12px 30px rgba(0, 50, 160, 0.22);
}

.reject-btn {
  color: #9B1C1C;
  border-color: rgba(155, 28, 28, 0.22);
  background: rgba(155, 28, 28, 0.04);
}

.empty-state {
  margin-top: 80px;
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
</style>

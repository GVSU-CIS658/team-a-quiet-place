<template>
  <div class="saved-page">
    <div v-if="!auth.user" class="empty-state">
      <v-card rounded="xl" elevation="2" class="pa-8 text-center">
        <div class="text-h6 font-weight-bold mb-2">Sign in required</div>
        <div class="text-body-2 text-medium-emphasis mb-4">
          Sign in first to view your saved places.
        </div>

        <v-btn color="primary" rounded="xl" @click="signIn">
          Sign in with Google
        </v-btn>
      </v-card>
    </div>

    <template v-else>
      <div v-if="filteredSavedPlaces.length > 0" class="saved-grid-wrap">
        <div class="saved-grid">
          <v-card
            v-for="place in filteredSavedPlaces"
            :key="place.id"
            class="saved-tile"
            rounded="xl"
            elevation="2"
            @click="openPlace(place.id)"
          >
            <v-img
              :src="place.images[0]"
              :alt="place.name"
              height="220"
              cover
              class="saved-tile-image"
            />

            <div class="saved-tile-overlay">
              <div class="saved-tile-title">{{ place.name }}</div>
              <div class="saved-tile-location">{{ place.location }}</div>
            </div>
          </v-card>
        </div>
      </div>

      <div v-else class="empty-state">
        <v-card rounded="xl" elevation="2" class="pa-8 text-center">
          <div class="text-h6 font-weight-bold mb-2">No saved places yet</div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Save a place from the home page and it will show up here.
          </div>

          <v-btn color="primary" rounded="xl" :to="{ name: 'home' }">
            Browse places
          </v-btn>
        </v-card>
      </div>

      <transition name="overlay-fade">
        <div v-if="selectedPlace" class="place-overlay" @click="closePlace">
          <div
            class="place-overlay-content"
            @click.stop
            @touchstart.passive="handleTouchStart"
            @touchend="handleTouchEnd"
          >
            <PlaceCard :place="selectedPlace" />
            <div class="place-overlay-actions">
              <v-btn
                icon="mdi-chevron-left"
                variant="outlined"
                color="white"
                rounded="xl"
                :disabled="filteredSavedPlaces.length < 2"
                @click="previousSavedPlace"
              />

              <v-btn
                icon="mdi-close"
                variant="flat"
                color="white"
                rounded="xl"
                @click="closePlace"
              />

              <v-btn
                icon="mdi-chevron-right"
                variant="outlined"
                color="white"
                rounded="xl"
                :disabled="filteredSavedPlaces.length < 2"
                @click="nextSavedPlace"
              />
            </div>
          </div>
        </div>
      </transition>

      <v-btn
        class="filter-fab"
        icon="mdi-tune-variant"
        variant="flat"
        @click="filterDialog = true"
      />

      <FilterFab v-model="filterDialog" :store="savedPlacesStore" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import FilterFab from "../components/FilterFab.vue";
import PlaceCard from "../components/PlaceCard.vue";
import { useDirectionalNavigation } from "../composables/useDirectionalNavigation";
import { useAuthStore } from "../stores/authStore";
import { useSavedPlacesStore } from "../stores/savedPlacesStore";

const auth = useAuthStore();
const savedPlacesStore = useSavedPlacesStore();

const filterDialog = ref(false);
const selectedPlaceId = ref<string | null>(null);

// Reads the saved places after applying the current saved-place filters.
const filteredSavedPlaces = computed(() => {
  return savedPlacesStore.filteredSavedPlaces;
});

// Finds the full place object for the saved tile currently open in the overlay.
const selectedPlace = computed(() => {
  if (!selectedPlaceId.value) return null;

  return (
    filteredSavedPlaces.value.find(
      (place) => place.id === selectedPlaceId.value,
    ) ?? null
  );
});

const selectedPlaceIndex = computed(() => {
  if (!selectedPlaceId.value) return -1;

  return filteredSavedPlaces.value.findIndex(
    (place) => place.id === selectedPlaceId.value,
  );
});

// Closes the overlay if filtering or data changes remove the selected place.
watch(
  filteredSavedPlaces,
  (places) => {
    if (!selectedPlaceId.value) return;

    const stillExists = places.some((place) => place.id === selectedPlaceId.value);
    if (!stillExists) {
      selectedPlaceId.value = null;
    }
  },
  { immediate: true },
);

// Opens the full PlaceCard overlay for the selected saved place.
function openPlace(placeId: string) {
  selectedPlaceId.value = placeId;
}

// Closes the saved-place overlay.
function closePlace() {
  selectedPlaceId.value = null;
}

function nextSavedPlace() {
  const places = filteredSavedPlaces.value;
  if (places.length < 2) return;

  const nextIndex = (selectedPlaceIndex.value + 1) % places.length;
  const nextPlace = places[nextIndex];
  if (!nextPlace) return;

  selectedPlaceId.value = nextPlace.id;
}

function previousSavedPlace() {
  const places = filteredSavedPlaces.value;
  if (places.length < 2) return;

  const previousIndex =
    (selectedPlaceIndex.value - 1 + places.length) % places.length;
  const previousPlace = places[previousIndex];
  if (!previousPlace) return;

  selectedPlaceId.value = previousPlace.id;
}

const { handleTouchStart, handleTouchEnd } = useDirectionalNavigation({
  next: nextSavedPlace,
  previous: previousSavedPlace,
  isActive: () => Boolean(selectedPlaceId.value),
});

// Starts Google sign-in from the signed-out empty state.
async function signIn() {
  try {
    await auth.signInWithGoogle();
  } catch (error) {
    console.error("Google sign-in failed:", error);
  }
}
</script>

<style scoped>
.saved-page {
  min-height: 100%;
  padding: 8px 0px 32px;
}

.saved-grid-wrap {
  max-width: 1200px;
  margin: 0 auto;
}

.saved-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 18px;
}

.saved-tile {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  background: #ffffff;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.saved-tile:hover {
  transform: translateY(-4px);
}

.saved-tile-image {
  background: #EEF4FF;
}

.saved-tile-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 14px 14px 12px;
  background: linear-gradient(
    to top,
    rgba(19, 21, 92, 0.78),
    rgba(19, 21, 92, 0.28),
    rgba(19, 21, 92, 0)
  );
  color: white;
}

.saved-tile-title {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.25;
  margin-bottom: 3px;
}

.saved-tile-location {
  font-size: 0.88rem;
  opacity: 0.92;
}

.empty-state {
  max-width: 720px;
  margin: 80px auto 0;
  padding: 0 16px;
}

.place-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(19, 21, 92, 0.42);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 88px 16px 32px;
  overflow-y: auto;
}

.place-overlay-content {
  width: min(100%, 640px);
}

.place-overlay-actions {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 12px;
}

.place-overlay-actions :deep(.v-btn) {
  width: 52px;
  height: 52px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.filter-fab {
  position: fixed;
  bottom: 24px;
  right: max(16px, calc((100vw - 640px) / 2 + 16px));
  z-index: 1200;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  color: rgb(0, 50, 160);
  border: 1px solid rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 8px 24px rgba(19, 21, 92, 0.08);
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.filter-fab:hover {
  background: rgba(255, 255, 255, 0.9);
  color: rgb(0, 50, 160);
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 50, 160, 0.25);
}

.filter-fab:focus-visible {
  background: rgba(255, 255, 255, 0.9);
  color: rgb(0, 50, 160);
}

.filter-fab:active {
  transform: translateY(0);
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.22s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .saved-page {
    padding: 8px 12px 28px;
  }

  .saved-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .place-overlay {
    padding: 20px 12px;
  }

  .place-overlay-content {
    width: 100%;
  }

  .filter-fab {
    right: 16px;
    bottom: 16px;
    width: 52px;
    height: 52px;
    border-radius: 16px;
  }
}
</style>

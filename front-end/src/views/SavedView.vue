<script setup lang="ts">
import { computed, ref } from "vue";
import FilterFab from "../components/FilterFab.vue";
import PlaceCard from "../components/PlaceCard.vue";
import { useSavedPlacesStore } from "../stores/savedPlacesStore";

const savedPlacesStore = useSavedPlacesStore();
const filterDialog = ref(false);

const filteredSavedPlaces = computed(
  () => savedPlacesStore.filteredSavedPlaces,
);

const selectedPlaceId = ref<number | null>(null);

const selectedPlace = computed(() => {
  if (selectedPlaceId.value === null) return null;

  return (
    filteredSavedPlaces.value.find(
      (place) => place.id === selectedPlaceId.value,
    ) ?? null
  );
});

function openPlace(placeId: number) {
  selectedPlaceId.value = placeId;
}

function closePlace() {
  selectedPlaceId.value = null;
}
</script>

<template>
  <div class="saved-page">
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
        <div class="place-overlay-content" @click.stop>
          <PlaceCard :place="selectedPlace" />
          <div class="place-overlay-actions">
            <v-btn
              icon="mdi-close"
              variant="text"
              color="white"
              @click="closePlace"
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
  </div>
</template>

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
  background: #eef3f9;
}

.saved-tile-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 14px 14px 12px;
  background: linear-gradient(
    to top,
    rgba(15, 23, 42, 0.78),
    rgba(15, 23, 42, 0.28),
    rgba(15, 23, 42, 0)
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
  background: rgba(15, 23, 42, 0.42);
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
  margin-top: 12px;
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
    opacity: 0.88;
  }
}
</style>
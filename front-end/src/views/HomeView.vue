<template>
  <div class="home-page">
    <div v-if="currentPlace" class="card-stage">
      <div class="card-column">
        <transition :name="slideDirection" mode="out-in">
          <PlaceCard :key="currentPlace.id" :place="currentPlace" />
        </transition>
      </div>

      <div class="stage-nav-row">
        <v-btn
          class="stage-nav-btn"
          icon="mdi-chevron-left"
          variant="outlined"
          rounded="xl"
          @click="previousPlace"
        />

        <v-btn
          class="stage-nav-btn"
          icon="mdi-chevron-right"
          variant="outlined"
          rounded="xl"
          @click="nextPlace"
        />
      </div>
    </div>

    <div v-else class="empty-state">
      <v-card rounded="xl" elevation="2" class="pa-8 text-center">
        <div class="text-h6 font-weight-bold mb-2">No places found</div>
        <div class="text-body-2 text-medium-emphasis mb-4">
          Try resetting your filters.
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import FilterFab from "../components/FilterFab.vue";
import PlaceCard from "../components/PlaceCard.vue";
import { usePlacesStore } from "../stores/placesStore";

const placesStore = usePlacesStore();

const slideDirection = ref("slide-left");
const currentIndex = ref(0);
const filterDialog = ref(false);
const hasPickedInitialPlace = ref(false);

// Shows the place at the current index from the filtered approved list.
const currentPlace = computed(() => {
  const places = placesStore.filteredPlaces;

  if (places.length === 0) return null;

  return places[currentIndex.value] ?? null;
});

// Keeps the selected index valid when filters or place data change.
watch(
  () => placesStore.filteredPlaces,
  (places) => {
    if (places.length === 0) {
      currentIndex.value = 0;
      hasPickedInitialPlace.value = false;
      return;
    }

    if (!hasPickedInitialPlace.value) {
      currentIndex.value = Math.floor(Math.random() * places.length);
      hasPickedInitialPlace.value = true;
      return;
    }

    if (currentIndex.value > places.length - 1) {
      currentIndex.value = 0;
    }
  },
  { immediate: true },
);

// Moves to the next filtered place and wraps back to the start.
function nextPlace() {
  const places = placesStore.filteredPlaces;
  if (places.length === 0) return;

  slideDirection.value = "slide-left";
  currentIndex.value = (currentIndex.value + 1) % places.length;
}

// Moves to the previous filtered place and wraps to the end.
function previousPlace() {
  const places = placesStore.filteredPlaces;
  if (places.length === 0) return;

  slideDirection.value = "slide-right";
  currentIndex.value =
    (currentIndex.value - 1 + places.length) % places.length;
}
</script>

<style scoped>
.home-page {
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

.empty-state {
  margin-top: 80px;
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
  color: rgb(47, 93, 159);
  border: 1px solid rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 8px 24px rgba(31, 45, 61, 0.08);
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.filter-fab:hover {
  background: rgba(255, 255, 255, 0.9);
  color: rgb(47, 93, 159);
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(47, 93, 159, 0.25);
}

.filter-fab:focus-visible {
  background: rgba(255, 255, 255, 0.9);
  color: rgb(47, 93, 159);
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
  }
}
</style>

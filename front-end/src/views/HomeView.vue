<script setup lang="ts">
import { computed, ref, watch } from "vue";
import FilterFab from "../components/FilterFab.vue";
import PlaceCard from "../components/PlaceCard.vue";
import { usePlacesStore } from "../stores/placesStore";

const slideDirection = ref("slide-left");
const currentIndex = ref(0);

const placesStore = usePlacesStore();

const filteredPlaces = computed(() => placesStore.filteredPlaces);

const currentPlace = computed(() => {
  if (filteredPlaces.value.length === 0) return null;
  return filteredPlaces.value[currentIndex.value] ?? null;
});

watch(
  filteredPlaces,
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

const nextPlace = () => {
  if (filteredPlaces.value.length === 0) return;
  slideDirection.value = "slide-left";
  currentIndex.value = (currentIndex.value + 1) % filteredPlaces.value.length;
};

const previousPlace = () => {
  if (filteredPlaces.value.length === 0) return;
  slideDirection.value = "slide-right";
  currentIndex.value =
    (currentIndex.value - 1 + filteredPlaces.value.length) %
    filteredPlaces.value.length;
};
</script>

<template>
  <div>
    <div v-if="currentPlace" class="card-stage">
      <v-btn
        class="stage-nav-btn stage-nav-left"
        icon="mdi-chevron-left"
        variant="outlined"
        rounded="xl"
        @click="previousPlace"
      />

      <div class="card-column">
        <transition :name="slideDirection" mode="out-in">
          <PlaceCard :key="currentPlace.id" :place="currentPlace" />
        </transition>
      </div>

      <v-btn
        class="stage-nav-btn stage-nav-right"
        icon="mdi-chevron-right"
        variant="outlined"
        rounded="xl"
        @click="nextPlace"
      />
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

    <FilterFab :store="placesStore" />
  </div>
</template>

<style scoped>
.card-stage {
  max-width: 1120px;
  margin: 42px auto 0;
  position: relative;
  min-height: 760px;
}

.card-column {
  width: min(100%, 560px);
  margin: 0 auto;
}

.stage-nav-btn {
  position: absolute;
  top: 280px;
  transform: translateY(-50%);
  z-index: 5;
}

.stage-nav-left {
  left: 24px;
}

.stage-nav-right {
  right: 24px;
}

.empty-state {
  max-width: 720px;
  margin: 80px auto 0;
  padding: 0 16px;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.32s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(60px) scale(0.98);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-60px) scale(0.98);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-60px) scale(0.98);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(60px) scale(0.98);
}

@media (max-width: 980px) {
  .card-stage {
    max-width: 640px;
    min-height: 760px;
    padding: 0 16px 90px;
  }

  .stage-nav-btn {
    top: auto;
    bottom: 0;
    transform: none;
  }

  .stage-nav-left {
    left: calc(50% - 68px);
  }

  .stage-nav-right {
    right: calc(50% - 68px);
  }
}
</style>

<template>
  <div>
    <v-btn
      icon="mdi-filter-variant"
      color="primary"
      size="large"
      elevation="8"
      class="filter-fab"
      @click="dialog = true"
    />

    <v-dialog v-model="dialog" max-width="420">
      <v-card rounded="xl">
        <v-card-title class="text-h6 font-weight-bold">
          Filter Places
        </v-card-title>

        <v-card-text class="pt-2">
          <v-text-field
            v-model="store.filters.location"
            label="Location"
            variant="outlined"
            rounded="lg"
            prepend-inner-icon="mdi-map-marker-outline"
            class="mb-4"
          />

          <v-select
            v-model="store.filters.rating"
            :items="ratingOptions"
            label="Minimum Rating"
            variant="outlined"
            rounded="lg"
            prepend-inner-icon="mdi-star-outline"
            clearable
          />
        </v-card-text>

        <v-card-actions class="px-6 pb-5">
          <v-btn variant="text" @click="store.resetFilters()"> Reset </v-btn>

          <v-spacer />

          <v-btn variant="text" @click="dialog = false"> Close </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

type FilterStore = {
  filters: {
    location: string;
    rating: number | null;
  };
  resetFilters: () => void;
};

defineProps<{
  store: FilterStore;
}>();

const dialog = ref(false);
const ratingOptions = [1, 2, 3, 4, 5];
</script>

<style scoped>
.filter-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1200;
}

@media (max-width: 600px) {
  .filter-fab {
    right: 16px;
    bottom: 16px;
  }
}
</style>

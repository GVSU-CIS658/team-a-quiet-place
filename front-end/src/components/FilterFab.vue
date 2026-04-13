<template>
  <v-dialog
    :model-value="modelValue"
    max-width="400"
    transition="dialog-bottom-transition"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card rounded="xl" class="filter-card">
      <div class="filter-topbar">
        <div class="filter-heading">
          <div class="filter-title">Filters</div>
          <div class="filter-subtitle">Refine your quiet place search</div>
        </div>

        <div class="filter-top-actions">
          <v-btn
            icon="mdi-refresh"
            variant="text"
            size="small"
            class="top-icon-btn"
            @click="store.resetFilters()"
          />
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            class="top-icon-btn"
            @click="emit('update:modelValue', false)"
          />
          <v-btn
            icon="mdi-content-save-outline"
            variant="text"
            size="small"
            class="top-icon-btn save-btn"
            @click="emit('update:modelValue', false)"
          />
        </div>
      </div>

      <v-card-text class="filter-body">
        <!-- ✅ LOCATION DROPDOWN -->
        <v-select
          v-model="store.filters.location"
          :items="locationOptions"
          label="Location"
          placeholder="Any"
          variant="outlined"
          rounded="lg"
          prepend-inner-icon="mdi-map-marker-outline"
          clearable
          hide-details="auto"
          class="field-spacing"
        />

        <!-- ✅ RATING -->
        <v-select
          v-model="store.filters.rating"
          :items="ratingOptions"
          label="Minimum Rating"
          placeholder="Any"
          variant="outlined"
          rounded="lg"
          prepend-inner-icon="mdi-star-outline"
          clearable
          hide-details="auto"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { type LocationType } from "../types/data";

type FilterStore = {
  filters: {
    location: LocationType | null;
    rating: number | null;
  };
  resetFilters: () => void;
};

defineProps<{
  modelValue: boolean;
  store: FilterStore;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

// ✅ dropdown options
const locationOptions: LocationType[] = ["Valley", "Pew", "Health"];

const ratingOptions = [1, 2, 3, 4, 5];
</script>

<style scoped>
.filter-card {
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
  background: #ffffff;
}

.filter-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 22px 10px;
}

.filter-heading {
  min-width: 0;
}

.filter-title {
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.2;
  color: #172033;
}

.filter-subtitle {
  margin-top: 4px;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #6b7280;
}

.filter-top-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.top-icon-btn {
  border-radius: 12px;
  background: transparent;
  color: rgba(23, 32, 51, 0.52);
  box-shadow: none;
  transition:
    background-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.top-icon-btn:hover {
  background: rgba(47, 93, 159, 0.1);
  color: rgb(47, 93, 159);
  transform: translateY(-1px);
}

.top-icon-btn:focus-visible {
  background: rgba(47, 93, 159, 0.12);
  color: rgb(47, 93, 159);
}

.save-btn:hover {
  background: rgba(47, 93, 159, 0.14);
  color: rgb(47, 93, 159);
}

.filter-body {
  padding: 8px 22px 22px;
}

.field-spacing {
  margin-bottom: 14px;
}

@media (max-width: 600px) {
  .filter-topbar {
    padding: 18px 18px 8px;
  }

  .filter-body {
    padding: 8px 18px 18px;
  }

  .filter-title {
    font-size: 1rem;
  }

  .filter-subtitle {
    font-size: 0.86rem;
  }
}
</style>
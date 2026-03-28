<template>
  <v-card class="place-card" rounded="xl" elevation="4">
    <div class="image-wrapper">
      <v-img :src="place.images[imageIndex]" height="430" cover>
        <div class="image-overlay">
          <div class="top-image-row">
            <div class="location-pill">
              {{ place.location }}
            </div>

            <div class="image-counter">
              {{ imageIndex + 1 }} / {{ place.images.length }}
            </div>
          </div>

          <div class="image-nav">
            <v-btn
              icon="mdi-chevron-left"
              size="small"
              variant="flat"
              class="nav-btn"
              @click.stop="previousImage"
            />
            <v-btn
              icon="mdi-chevron-right"
              size="small"
              variant="flat"
              class="nav-btn"
              @click.stop="nextImage"
            />
          </div>
        </div>
      </v-img>
    </div>

    <v-card-text class="pa-6">
      <div class="title-row mb-2">
        <div class="text-h5 font-weight-bold">
          {{ place.name }}
        </div>

        <v-btn
          :icon="isSaved ? 'mdi-heart' : 'mdi-heart-outline'"
          variant="text"
          color="primary"
          @click="toggleSaved"
        />
      </div>

      <div class="description-block mb-4">
        <span class="text-body-2 text-medium-emphasis">
          {{ displayedDescription }}
        </span>

        <button
          v-if="place.description.length > 120"
          class="load-more-btn"
          @click="expandedDescription = !expandedDescription"
        >
          {{ expandedDescription ? " show less" : " load more" }}
        </button>
      </div>

      <div class="d-flex align-center ga-3 mb-4 flex-wrap">
        <div class="d-flex align-center ga-2">
          <v-rating
            :model-value="displayRating"
            half-increments
            readonly
            density="compact"
            color="primary"
            size="small"
          />
          <span class="text-body-2 font-weight-medium">
            {{ displayRating }}
          </span>
          <span class="text-body-2 text-medium-emphasis">
            ({{ displayReviewCount }} reviews)
          </span>
        </div>
      </div>

      <div class="d-flex flex-wrap ga-2 mb-5">
        <v-chip
          v-for="tag in place.tags"
          :key="tag"
          size="small"
          variant="tonal"
          color="primary"
          rounded="lg"
        >
          {{ tag }}
        </v-chip>
      </div>

      <div class="review-toggle-row mb-3">
        <v-btn
          variant="tonal"
          color="primary"
          rounded="xl"
          @click="showReviews = !showReviews"
        >
          {{ showReviews ? "Hide reviews" : "Show reviews" }}
        </v-btn>
      </div>

      <v-expand-transition>
        <div v-show="showReviews">
          <ReviewSection :place-id="place.id" />
        </div>
      </v-expand-transition>

      <div class="helper-text">
        Browse freely. You’ll only need to sign in to save a place or post a
        review.
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import type { Place } from "../types/data";
import { useAuthStore } from "../stores/authStore";
import { useSavedPlacesStore } from "../stores/savedPlacesStore";
import { useReviewsStore } from "../stores/reviewsStore";
import ReviewSection from "./ReviewSection.vue";

const props = defineProps<{
  place: Place;
}>();

const router = useRouter();
const auth = useAuthStore();
const savedPlacesStore = useSavedPlacesStore();
const reviewsStore = useReviewsStore();
onMounted(async () => {
  await savedPlacesStore.getSavesDB();
});
const imageIndex = ref(0);
const showReviews = ref(false);
const expandedDescription = ref(false);

watch(
  () => props.place.id,
  () => {
    imageIndex.value = 0;
    showReviews.value = false;
    expandedDescription.value = false;
  },
);

const shortDescription = computed(() => {
  const text = props.place.description ?? "";
  const limit = 120;
  if (text.length <= limit) return text;
  return `${text.slice(0, limit).trim()}...`;
});

const displayedDescription = computed(() => {
  return expandedDescription.value
    ? props.place.description
    : shortDescription.value;
});

const isSaved = computed(() => {
  return savedPlacesStore.isSaved(props.place.id);
});

const reviewCountFromStore = computed(() => {
  return reviewsStore.getReviewCountForPlace(props.place.id);
});

const averageRatingFromStore = computed(() => {
  return reviewsStore.getAverageRatingForPlace(props.place.id);
});

const displayReviewCount = computed(() => {
  return reviewCountFromStore.value > 0
    ? reviewCountFromStore.value
    : props.place.reviews;
});

const displayRating = computed(() => {
  return averageRatingFromStore.value > 0
    ? averageRatingFromStore.value
    : props.place.rating;
});

const requireLogin = () => {
  router.push("/login");
};

const toggleSaved = () => {
  if (!auth.user) {
    requireLogin();
    return;
  }

  if (isSaved.value) {
    savedPlacesStore.removePlace(props.place.id);
  } else {
    savedPlacesStore.savePlace(props.place.id);
  }
};

const nextImage = () => {
  imageIndex.value = (imageIndex.value + 1) % props.place.images.length;
};

const previousImage = () => {
  imageIndex.value =
    (imageIndex.value - 1 + props.place.images.length) %
    props.place.images.length;
};
</script>

<style scoped>
.place-card {
  overflow: hidden;
  background: #ffffff;
  width: 100%;
}

.image-wrapper {
  position: relative;
}

.image-overlay {
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.22), rgba(0, 0, 0, 0.04));
}

.top-image-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.location-pill {
  background: rgba(255, 255, 255, 0.92);
  color: #1f2d3d;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 999px;
}

.image-counter {
  background: rgba(31, 45, 61, 0.72);
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 999px;
}

.image-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.9);
}

.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.description-block {
  line-height: 1.65;
}

.load-more-btn {
  border: none;
  background: transparent;
  color: #2f5d9f;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  font-size: 0.95rem;
}

.review-toggle-row {
  display: flex;
  justify-content: center;
}

.helper-text {
  margin-top: 16px;
  text-align: center;
  font-size: 0.88rem;
  color: #6b7280;
}
</style>

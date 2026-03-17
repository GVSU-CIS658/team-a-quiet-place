<template>
  <div class="review-section">
    <v-card variant="outlined" rounded="lg" class="review-form-card mb-4">
      <v-card-text class="pa-4">
        <div class="text-subtitle-2 font-weight-medium mb-3">
          Add your review
        </div>

        <div class="mb-3">
          <v-rating
            v-model="reviewRating"
            half-increments
            color="primary"
            density="compact"
          />
        </div>

        <v-textarea
          v-model="reviewText"
          label="Share how this place feels"
          variant="outlined"
          rounded="lg"
          rows="3"
          auto-grow
          hide-details
        />

        <div class="review-form-actions mt-3">
          <v-btn color="primary" rounded="xl" @click="submitReview">
            Post review
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <div class="review-list">
      <v-card
        v-for="review in sortedReviews"
        :key="review.id"
        variant="outlined"
        rounded="lg"
        class="mb-3 review-item"
      >
        <v-card-text class="pa-4">
          <div class="review-header mb-2">
            <div>
              <div class="review-user">
                {{ review.user }}
              </div>
              <div class="review-date">
                {{ formatReviewDate(review.createdAt) }}
              </div>
            </div>

            <v-rating
              :model-value="review.rating"
              readonly
              density="compact"
              size="x-small"
              color="primary"
            />
          </div>

          <div class="text-body-2 text-medium-emphasis">
            {{ review.text }}
          </div>
        </v-card-text>
      </v-card>

      <div v-if="sortedReviews.length === 0" class="empty-review-text">
        No reviews yet.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import { useReviewsStore } from "../stores/reviewsStore";

const props = defineProps<{
  placeId: number;
}>();

const router = useRouter();
const auth = useAuthStore();
const reviewsStore = useReviewsStore();

const reviewText = ref("");
const reviewRating = ref(4);

const sortedReviews = computed(() => {
  return reviewsStore.getReviewsForPlace(props.placeId);
});

const requireLogin = () => {
  router.push("/login");
};

const submitReview = () => {
  if (!auth.user) {
    requireLogin();
    return;
  }

  if (!reviewText.value.trim()) return;

  reviewsStore.addReview({
    placeId: props.placeId,
    user: auth.user.email ?? "You",
    rating: reviewRating.value,
    text: reviewText.value.trim(),
  });

  reviewText.value = "";
  reviewRating.value = 4;
};

const formatReviewDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
</script>

<style scoped>
.review-section {
  margin-top: 8px;
}

.review-form-card,
.review-item {
  background: #fbfcfe;
}

.review-form-actions {
  display: flex;
  justify-content: flex-end;
}

.review-list {
  display: flex;
  flex-direction: column;
}

.review-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.review-user {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2d3d;
}

.review-date {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 2px;
}

.empty-review-text {
  text-align: center;
  color: #6b7280;
  font-size: 0.92rem;
  padding: 12px 0;
}
</style>

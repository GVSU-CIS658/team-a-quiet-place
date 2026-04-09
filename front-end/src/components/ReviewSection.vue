<template>
  <div class="review-section">
    <v-card variant="outlined" rounded="lg" class="review-form-card mb-4">
      <v-card-text class="pa-4">
        <div class="text-subtitle-2 font-weight-medium mb-3">
          Add your review
        </div>

        <v-form ref="formRef" @submit.prevent="submitReview">
          <div class="mb-3">
            <v-rating
              v-model="reviewRating"
              half-increments
              color="primary"
              density="compact"
            />
            <div v-if="!isRatingValid" class="input-error-text mt-1">
              Please choose a rating.
            </div>
          </div>

          <v-textarea
            v-model="reviewText"
            label="Share how this place feels"
            variant="outlined"
            rounded="lg"
            rows="3"
            auto-grow
            hide-details="auto"
            :rules="[rules.required, rules.minReview, rules.maxReview]"
          />

          <div class="review-form-actions mt-3">
            <v-btn
              color="primary"
              rounded="xl"
              type="submit"
              :loading="reviewsStore.isSubmitting"
              :disabled="!canSubmit"
            >
              Post review
            </v-btn>
          </div>
        </v-form>
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
              half-increments
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
import { useAuthStore } from "../stores/authStore";
import { useReviewsStore } from "../stores/reviewsStore";

const props = defineProps<{
  placeId: string;
}>();

const auth = useAuthStore();
const reviewsStore = useReviewsStore();

const formRef = ref();

const reviewText = ref("");
const reviewRating = ref(4);

const rules = {
  required: (value: string) => !!value?.trim() || "Review text is required.",
  minReview: (value: string) =>
    value.trim().length >= 8 || "Review must be at least 8 characters.",
  maxReview: (value: string) =>
    value.trim().length <= 300 || "Review cannot exceed 300 characters.",
};

const sortedReviews = computed(() => {
  return reviewsStore.getReviewsForPlace(props.placeId);
});

const isRatingValid = computed(() => reviewRating.value > 0);

const canSubmit = computed(() => {
  return isRatingValid.value && !reviewsStore.isSubmitting;
});

async function requireLogin() {
  try {
    await auth.signInWithGoogle();
  } catch (error) {
    console.error("Google sign-in failed:", error);
  }
}

async function submitReview() {
  if (!auth.user) {
    await requireLogin();

    if (!auth.user) return;
  }

  const result = await formRef.value?.validate();

  if (!result?.valid || !isRatingValid.value) return;

  await reviewsStore.addReview({
    placeId: props.placeId,
    rating: reviewRating.value,
    text: reviewText.value.trim(),
  });

  reviewText.value = "";
  reviewRating.value = 4;
  formRef.value?.resetValidation();
}

function formatReviewDate(dateValue: number) {
  return new Date(dateValue).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
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

.input-error-text {
  color: rgb(var(--v-theme-error));
  font-size: 0.75rem;
}
</style>
<template>
  <div class="add-place-page">
    <div class="editor-shell">
      <v-form ref="formRef" @submit.prevent="handleSubmit">
        <v-card class="place-card" rounded="xl" elevation="4">
          <div class="image-wrapper">
            <v-carousel
              v-model="imageIndex"
              height="430"
              hide-delimiter-background
              :show-arrows="displayedImages.length > 1 ? 'hover' : false"
              class="place-carousel"
            >
              <v-carousel-item
                v-for="(image, index) in displayedImages"
                :key="`${image}-${index}`"
                :src="image"
                cover
              >
                <div class="image-overlay">
                  <div class="top-image-row">
                    <div class="location-select-wrap">
                      <v-select
                        v-model="location"
                        :items="locationOptions"
                        variant="solo"
                        density="compact"
                        hide-details
                        flat
                        rounded="pill"
                        bg-color="rgba(255, 255, 255, 0.92)"
                        class="location-pill-select"
                      />
                    </div>

                    <div class="image-counter-wrap">
                      <v-btn
                        icon="mdi-trash-can"
                        size="small"
                        variant="flat"
                        class="delete-btn"
                        :disabled="!hasUploadedImages"
                        @click="deleteImage"
                      />

                      <v-btn
                        icon="mdi-camera-plus-outline"
                        size="small"
                        variant="flat"
                        class="upload-btn"
                        @click="triggerImageUpload"
                      />

                      <div class="image-counter">
                        {{ imageIndex + 1 }} / {{ displayedImages.length }}
                      </div>
                    </div>
                  </div>
                </div>
              </v-carousel-item>
            </v-carousel>

            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden-file-input"
              @change="handleImageSelected"
            />
          </div>

          <v-card-text class="card-body">
            <div class="title-row">
              <div class="title-edit-area">
                <template v-if="editingField === 'name'">
                  <v-text-field
                    v-model="name"
                    variant="outlined"
                    rounded="lg"
                    density="comfortable"
                    hide-details="auto"
                    autofocus
                    :rules="[rules.required, rules.minName]"
                    @blur="stopEditing"
                    @keydown.enter.prevent="stopEditing"
                  />
                </template>

                <template v-else>
                  <div
                    class="text-h5 font-weight-bold editable-hover editable-title"
                    @click="startEditing('name')"
                  >
                    {{ name }}
                  </div>
                </template>
              </div>

              <v-btn
                :icon="heartIcon"
                variant="text"
                color="primary"
                disabled
              />
            </div>

            <div class="description-block">
              <template v-if="editingField === 'description'">
                <v-textarea
                  v-model="description"
                  variant="outlined"
                  rounded="lg"
                  rows="4"
                  auto-grow
                  hide-details="auto"
                  autofocus
                  :rules="[
                    rules.required,
                    rules.minDescription,
                    rules.maxDescription,
                  ]"
                  @blur="stopEditing"
                />
              </template>

              <template v-else>
                <div
                  class="text-body-2 text-medium-emphasis editable-description editable-hover"
                  @click="startEditing('description')"
                >
                  {{ description }}
                </div>
              </template>
            </div>

            <div class="d-flex flex-wrap ga-2 mb-1">
              <v-chip
                v-for="tag in tags"
                :key="tag"
                size="small"
                variant="tonal"
                color="primary"
                rounded="lg"
                closable
                @click:close="removeTag(tag)"
              >
                {{ tag }}
              </v-chip>

              <div class="tag-input-wrap">
                <v-text-field
                  v-model="tagInput"
                  placeholder="Add tag"
                  density="compact"
                  variant="outlined"
                  rounded="lg"
                  hide-details
                  @keydown.enter.prevent="addTag"
                />
              </div>

              <div v-if="!hasAtLeastOneTag" class="text-caption text-error">
                Add at least one tag.
              </div>
            </div>

            <v-card variant="outlined" rounded="lg" class="first-review-card">
              <v-card-text class="pa-4">
                <div class="text-subtitle-2 font-weight-medium mb-3">
                  Add the first review (optional)
                </div>

                <div class="mb-3">
                  <v-rating
                    v-model="firstReviewRating"
                    half-increments
                    color="primary"
                    density="compact"
                  />
                </div>

                <v-textarea
                  v-model="firstReviewText"
                  label="Share how this place feels"
                  variant="outlined"
                  rounded="lg"
                  rows="3"
                  auto-grow
                  hide-details="auto"
                  :rules="[
                    firstReviewRules.optionalMinReview,
                    firstReviewRules.maxReview,
                  ]"
                />
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>

        <div class="actions-row">
          <div class="submit-note">
            New places stay pending until an admin approves them for the main feed.
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            color="grey"
            @click="router.push({ name: 'home' })"
          />

          <v-btn
            icon="mdi-check"
            variant="flat"
            color="primary"
            :loading="isSubmitting"
            :disabled="!canSubmit"
            @click="handleSubmit"
          />
        </div>
      </v-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { useRouter } from "vue-router";
import { usePlacesStore } from "../stores/placesStore";
import { useReviewsStore } from "../stores/reviewsStore";
import { useAuthStore } from "../stores/authStore";
import { useSavedPlacesStore } from "../stores/savedPlacesStore";
import type { Place, LocationType } from "../types/data";

type EditableField = "name" | "description" | null;
type PlaceFormPayload = Pick<
  Place,
  "name" | "location" | "description" | "images" | "tags"
>;

const router = useRouter();
const placesStore = usePlacesStore();
const reviewsStore = useReviewsStore();
const savedPlacesStore = useSavedPlacesStore();
const auth = useAuthStore();

const formRef = ref();

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80";

const defaultName = "New Quiet Place";
const defaultDescription =
  "Describe what makes this place calm, comfortable, or good for studying.";

const locationOptions: LocationType[] = ["Valley", "Pew", "Health"];

const name = ref(defaultName);
const location = ref<LocationType>("Valley");
const description = ref(defaultDescription);

const tags = ref<string[]>(["quiet"]);
const tagInput = ref("");

const firstReviewText = ref("");
const firstReviewRating = ref(4);

const imageFiles = ref<File[]>([]);
const imagePreviewUrls = ref<string[]>([]);
const imageIndex = ref(0);

const editingField = ref<EditableField>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

const wasCreatedAndSaved = ref(false);

const rules = {
  required: (value: string) => !!value?.trim() || "This field is required.",
  minName: (value: string) =>
    value.trim().length >= 3 || "Name must be at least 3 characters.",
  minDescription: (value: string) =>
    value.trim().length >= 15 || "Description must be at least 15 characters.",
  maxDescription: (value: string) =>
    value.trim().length <= 500 || "Description cannot exceed 500 characters.",
};

const firstReviewRules = {
  optionalMinReview: (value: string) =>
    !value.trim() ||
    value.trim().length >= 8 ||
    "Review must be at least 8 characters.",
  maxReview: (value: string) =>
    value.trim().length <= 300 || "Review cannot exceed 300 characters.",
};

const displayedImages = computed(() =>
  imagePreviewUrls.value.length > 0 ? imagePreviewUrls.value : [DEFAULT_IMAGE],
);

const hasUploadedImages = computed(() => imageFiles.value.length > 0);
const hasAtLeastOneTag = computed(() => tags.value.length > 0);
const hasFirstReview = computed(() => firstReviewText.value.trim().length > 0);

const isSubmitting = computed(() => {
  return placesStore.isSubmitting || reviewsStore.isSubmitting;
});

const canSubmit = computed(() => {
  return hasAtLeastOneTag.value && !isSubmitting.value;
});

const heartIcon = computed(() => {
  return wasCreatedAndSaved.value ? "mdi-heart" : "mdi-heart-outline";
});

function startEditing(field: EditableField) {
  editingField.value = field;
}

function stopEditing() {
  editingField.value = null;

  if (!name.value.trim()) name.value = defaultName;
  if (!description.value.trim()) description.value = defaultDescription;
}

function triggerImageUpload() {
  fileInputRef.value?.click();
}

function deleteImage() {
  if (!hasUploadedImages.value) return;

  const removedPreviewUrl = imagePreviewUrls.value[imageIndex.value];
  if (removedPreviewUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(removedPreviewUrl);
  }

  imagePreviewUrls.value.splice(imageIndex.value, 1);
  imageFiles.value.splice(imageIndex.value, 1);

  if (imagePreviewUrls.value.length === 0) {
    imageIndex.value = 0;
    return;
  }

  if (imageIndex.value >= imagePreviewUrls.value.length) {
    imageIndex.value = imagePreviewUrls.value.length - 1;
  }
}

function handleImageSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  const isDuplicate = imageFiles.value.some(
    (existingFile) =>
      existingFile.name === file.name &&
      existingFile.size === file.size &&
      existingFile.lastModified === file.lastModified,
  );

  if (!isDuplicate) {
    imageFiles.value.push(file);
    imagePreviewUrls.value.push(URL.createObjectURL(file));
    imageIndex.value = imagePreviewUrls.value.length - 1;
  }

  target.value = "";
}

function addTag() {
  const value = tagInput.value.trim().toLowerCase();
  if (!value) return;

  if (!tags.value.includes(value)) {
    tags.value.push(value);
  }

  tagInput.value = "";
}

function removeTag(tag: string) {
  tags.value = tags.value.filter((t) => t !== tag);
}

function buildPlacePayload(images: string[]): PlaceFormPayload {
  return {
    name: name.value.trim(),
    location: location.value,
    description: description.value.trim(),
    images,
    tags: [...tags.value],
  };
}

async function requireLogin() {
  try {
    await auth.signInWithGoogle();
  } catch (error) {
    console.error("Google sign-in failed:", error);
  }
}

async function handleSubmit() {
  if (!auth.user) {
    await requireLogin();

    if (!auth.user) return;
  }

  const result = await formRef.value?.validate();

  if (!result?.valid || !hasAtLeastOneTag.value) return;

  try {
    const imageUrls =
      imageFiles.value.length > 0
        ? await Promise.all(
            imageFiles.value.map((file) => placesStore.uploadImage(file)),
          )
        : [DEFAULT_IMAGE];

    const createdPlaceId = await placesStore.createPlace(
      buildPlacePayload(imageUrls),
    );

    await savedPlacesStore.savePlace(createdPlaceId);
    wasCreatedAndSaved.value = true;

    if (hasFirstReview.value) {
      await reviewsStore.addReview({
        placeId: createdPlaceId,
        rating: firstReviewRating.value,
        text: firstReviewText.value.trim(),
      });
    }

    router.push({ name: "saved" });
  } catch (error) {
    console.error("Failed to create place flow:", error);
  }
}

onBeforeUnmount(() => {
  for (const url of imagePreviewUrls.value) {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }
});
</script>

<style scoped>
.add-place-page {
  min-height: 100%;
  padding: 0px 0 36px;
}

.editor-shell {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
}

.place-card {
  overflow: hidden;
  background: #ffffff;
  width: 100%;
}

.image-wrapper {
  position: relative;
}

.place-carousel {
  border-radius: 0;
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

.location-select-wrap {
  min-width: 170px;
  max-width: 230px;
}

.location-pill-select {
  border-radius: 999px;
}

.location-pill-select :deep(.v-field) {
  border-radius: 999px !important;
  box-shadow: none !important;
}

.location-pill-select :deep(.v-field__overlay) {
  display: none;
}

.location-pill-select :deep(.v-field__input) {
  min-height: 38px;
  padding-top: 0;
  padding-bottom: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1f2d3d;
}

.location-pill-select :deep(.v-select__selection) {
  color: #1f2d3d;
}

.location-pill-select :deep(.v-field__append-inner) {
  padding-top: 0;
  align-items: center;
}

.image-counter-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-btn,
.delete-btn {
  background: rgba(255, 255, 255, 0.92);
}

.image-counter {
  background: rgba(31, 45, 61, 0.72);
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 999px;
}

.card-body {
  padding: 24px !important;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.title-edit-area {
  flex: 1;
  min-width: 0;
}

.description-block {
  line-height: 1.65;
}

.editable-title {
  line-height: 1.3;
}

.editable-description {
  min-height: 72px;
  white-space: pre-wrap;
}

.editable-hover {
  border-radius: 10px;
  transition: background 0.18s ease;
}

.editable-hover:hover {
  background: rgba(47, 93, 159, 0.06);
}

.tag-input-wrap {
  min-width: 140px;
  max-width: 220px;
}

.first-review-card {
  background: #fbfcfe;
}

.actions-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 20px;
}

.submit-note {
  flex: 1;
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.45;
}

.actions-row :deep(.v-btn) {
  width: 52px;
  height: 52px;
  border-radius: 16px;
}

.hidden-file-input {
  display: none;
}

@media (max-width: 640px) {
  .add-place-page {
    padding: 12px 0 28px;
  }

  .card-body {
    padding: 20px !important;
    gap: 16px;
  }

  .actions-row {
    flex-direction: column;
    align-items: stretch;
    margin-top: 16px;
  }

  .submit-note {
    width: 100%;
    font-size: 0.84rem;
  }

  .actions-row :deep(.v-btn) {
    width: 100%;
  }

  .tag-input-wrap {
    max-width: none;
  }

  .location-select-wrap {
    min-width: 140px;
    max-width: 180px;
  }
}
</style>

<template>
  <div class="add-place-page">
    <div v-if="!auth.user" class="empty-state">
      <v-card rounded="xl" elevation="2" class="pa-8 text-center">
        <div class="text-h6 font-weight-bold mb-2">Sign in required</div>
        <div class="text-body-2 text-medium-emphasis mb-4">
          Sign in first to add a quiet place.
        </div>

        <v-btn color="primary" rounded="xl" @click="signIn">
          Sign in with Google
        </v-btn>
      </v-card>
    </div>

    <div v-else class="editor-shell">
      <v-dialog v-model="showSubmittedDialog" max-width="420" persistent>
        <v-card rounded="xl">
          <v-card-title class="text-h6 pt-6 px-6">
            Submitted for review
          </v-card-title>

          <v-card-text class="px-6 pb-2">
            <div class="text-body-2 text-medium-emphasis">
              Your place was saved and sent to the admin review queue. It will appear
              in the main feed after approval.
            </div>
          </v-card-text>

          <v-card-actions class="px-6 pb-6">
            <v-spacer />
            <v-btn color="primary" rounded="xl" @click="goToHomeAfterSubmit">
              Back to home
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-form ref="formRef" @submit.prevent="handleSubmit">
        <v-card class="place-card" rounded="xl" elevation="4">
          <div class="image-wrapper">
            <v-carousel
              v-if="hasUploadedImages"
              v-model="imageIndex"
              height="430"
              hide-delimiter-background
              :show-arrows="displayedImages.length > 1 ? 'hover' : false"
              class="place-carousel"
            >
              <v-carousel-item
                v-for="(image, index) in displayedImages"
                :key="`${image}-${index}`"
              >
                <v-img :src="image" height="430" contain class="place-image" />
              </v-carousel-item>
            </v-carousel>
            <button
              v-else
              type="button"
              class="image-placeholder"
              @click="triggerImageUpload"
            >
              <v-icon icon="mdi-camera-plus-outline" size="40" />
              <span>Add at least one image</span>
            </button>

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
                    type="button"
                    size="small"
                    variant="flat"
                    class="delete-btn"
                    :disabled="!hasUploadedImages"
                    @click="deleteImage"
                  />

                  <v-btn
                    icon="mdi-camera-plus-outline"
                    type="button"
                    size="small"
                    variant="flat"
                    class="upload-btn"
                    @click="triggerImageUpload"
                  />

                  <div v-if="hasUploadedImages" class="image-counter">
                    {{ imageIndex + 1 }} / {{ displayedImages.length }}
                  </div>
                </div>
              </div>

            </div>

            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              multiple
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
                    variant="plain"
                    hide-details="auto"
                    autofocus
                    class="title-edit-field"
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

            </div>

            <div class="description-block">
              <template v-if="editingField === 'description'">
                <textarea
                  v-model="description"
                  autofocus
                  class="description-edit-field"
                  @blur="stopEditing"
                />
                <div
                  v-if="!isDescriptionValid"
                  class="text-caption text-error mt-1"
                >
                  Description must be 15-500 characters.
                </div>
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
                  variant="plain"
                  rounded="lg"
                  hide-details
                  class="tag-input"
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
            type="button"
            class="action-btn reject-btn"
            variant="outlined"
            rounded="xl"
            @click="router.push({ name: 'home' })"
          />

          <v-btn
            icon="mdi-check"
            type="submit"
            class="action-btn approve-btn"
            variant="flat"
            color="primary"
            rounded="xl"
            :loading="isSubmitting"
            :disabled="!canSubmit"
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

const defaultName = "New Quiet Place";
const defaultDescription =
  "Describe what makes this place calm, comfortable, or good for studying.";

const locationOptions: LocationType[] = ["Valley", "Pew", "Health"];
const starterTagOptions = [
  "quiet",
  "study",
  "cozy",
  "sunny",
  "outlets",
  "spacious",
  "natural light",
  "low traffic",
  "group friendly",
  "solo study",
  "comfortable seating",
  "near coffee",
];

// Picks a fresh starter set so new forms do not always begin with the same tags.
function getRandomStarterTags(count: number) {
  return [...starterTagOptions]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

const name = ref(defaultName);
const location = ref<LocationType>("Valley");
const description = ref(defaultDescription);

const tags = ref<string[]>(getRandomStarterTags(5));
const tagInput = ref("");

const firstReviewText = ref("");
const firstReviewRating = ref(4);

const imageFiles = ref<File[]>([]);
const imagePreviewUrls = ref<string[]>([]);
const imageIndex = ref(0);

const editingField = ref<EditableField>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

const showSubmittedDialog = ref(false);

const rules = {
  required: (value: string) => !!value?.trim() || "This field is required.",
  minName: (value: string) =>
    value.trim().length >= 3 || "Name must be at least 3 characters.",
};

const firstReviewRules = {
  optionalMinReview: (value: string) =>
    !value.trim() ||
    value.trim().length >= 8 ||
    "Review must be at least 8 characters.",
  maxReview: (value: string) =>
    value.trim().length <= 300 || "Review cannot exceed 300 characters.",
};

const displayedImages = computed(() => imagePreviewUrls.value);

const hasUploadedImages = computed(() => imageFiles.value.length > 0);
const hasAtLeastOneTag = computed(() => tags.value.length > 0);
const hasFirstReview = computed(() => firstReviewText.value.trim().length > 0);
const isDescriptionValid = computed(() => {
  const length = description.value.trim().length;

  return length >= 15 && length <= 500;
});

const isSubmitting = computed(() => {
  return placesStore.isSubmitting || reviewsStore.isSubmitting;
});

// Requires an image, at least one tag, a valid description, and no active submit.
const canSubmit = computed(() => {
  return (
    hasUploadedImages.value &&
    hasAtLeastOneTag.value &&
    isDescriptionValid.value &&
    !isSubmitting.value
  );
});

// Switches a display field into inline editing mode.
function startEditing(field: EditableField) {
  editingField.value = field;
}

// Leaves inline editing and restores fallback copy if required fields are blank.
function stopEditing() {
  editingField.value = null;

  if (!name.value.trim()) name.value = defaultName;
  if (!description.value.trim()) description.value = defaultDescription;
}

// Opens the hidden file input from the camera button or image placeholder.
function triggerImageUpload() {
  fileInputRef.value?.click();
}

// Removes the currently selected image and releases its preview URL.
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

// Adds newly selected image files and creates local preview URLs for the carousel.
function handleImageSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files ?? []);

  if (files.length === 0) return;

  let addedCount = 0;

  for (const file of files) {
    const isDuplicate = imageFiles.value.some(
      (existingFile) =>
        existingFile.name === file.name &&
        existingFile.size === file.size &&
        existingFile.lastModified === file.lastModified,
    );

    if (isDuplicate) continue;

    imageFiles.value.push(file);
    imagePreviewUrls.value.push(URL.createObjectURL(file));
    addedCount += 1;
  }

  if (addedCount > 0) {
    imageIndex.value = imagePreviewUrls.value.length - 1;
  }

  target.value = "";
}

// Adds a unique, normalized tag from the tag input.
function addTag() {
  const value = tagInput.value.trim().toLowerCase();
  if (!value) return;

  if (!tags.value.includes(value)) {
    tags.value.push(value);
  }

  tagInput.value = "";
}

// Removes a tag chip from the form.
function removeTag(tag: string) {
  tags.value = tags.value.filter((t) => t !== tag);
}

// Builds the payload shape expected by the places store create action.
function buildPlacePayload(images: string[]): PlaceFormPayload {
  return {
    name: name.value.trim(),
    location: location.value,
    description: description.value.trim(),
    images,
    tags: [...tags.value],
  };
}

// Starts Google sign-in from the signed-out state or submit flow.
async function signIn() {
  try {
    await auth.signInWithGoogle();
  } catch (error) {
    console.error("Google sign-in failed:", error);
  }
}

// Validates the form, uploads images, creates the place, saves it, and adds an optional first review.
async function handleSubmit() {
  if (!auth.user) {
    await signIn();

    if (!auth.user) return;
  }

  const result = await formRef.value?.validate();

  if (
    !result?.valid ||
    !hasUploadedImages.value ||
    !hasAtLeastOneTag.value ||
    !isDescriptionValid.value
  ) {
    return;
  }

  try {
    const imageUrls = await Promise.all(
      imageFiles.value.map((file) => placesStore.uploadImage(file)),
    );

    const createdPlaceId = await placesStore.createPlace(
      buildPlacePayload(imageUrls),
    );

    await savedPlacesStore.savePlace(createdPlaceId);

    if (hasFirstReview.value) {
      await reviewsStore.addReview({
        placeId: createdPlaceId,
        rating: firstReviewRating.value,
        text: firstReviewText.value.trim(),
      });
    }

    showSubmittedDialog.value = true;
  } catch (error) {
    console.error("Failed to create place flow:", error);
  }
}

// Closes the submitted dialog and returns the user to the home feed.
function goToHomeAfterSubmit() {
  showSubmittedDialog.value = false;
  router.push({ name: "home" });
}

// Cleans up local object URLs created for image previews.
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

.empty-state {
  max-width: 720px;
  margin: 80px auto 0;
  padding: 0 16px;
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

.place-image {
  background: linear-gradient(180deg, #EEF4FF 0%, #D9E6FF 100%);
}

.image-placeholder {
  width: 100%;
  height: 430px;
  border: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(180deg, #EEF4FF 0%, #D9E6FF 100%);
  color: #0032A0;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.image-overlay {
  position: absolute;
  inset: 0;
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.22), rgba(0, 0, 0, 0.04));
  pointer-events: none;
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
  pointer-events: auto;
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
  color: #13155C;
}

.location-pill-select :deep(.v-select__selection) {
  color: #13155C;
}

.location-pill-select :deep(.v-field__append-inner) {
  padding-top: 0;
  align-items: center;
}

.image-counter-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: auto;
}

.upload-btn,
.delete-btn {
  background: rgba(255, 255, 255, 0.92);
}

.image-counter {
  background: rgba(19, 21, 92, 0.72);
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

.title-edit-field :deep(.v-field) {
  padding: 0;
}

.title-edit-field :deep(.v-field__input) {
  min-height: auto;
  padding: 0;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.3;
  color: #13155C;
}

.editable-description {
  min-height: 72px;
  white-space: pre-wrap;
}

.description-edit-field {
  width: 100%;
  min-height: 96px;
  border: 0;
  outline: none;
  resize: vertical;
  padding: 0;
  background: transparent;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  font: inherit;
  font-size: 0.875rem;
  line-height: 1.65;
}

.editable-hover {
  border-radius: 10px;
  transition: background 0.18s ease;
}

.editable-hover:hover {
  background: rgba(0, 50, 160, 0.06);
}

.tag-input-wrap {
  min-width: 140px;
  max-width: 220px;
}

.tag-input {
  border-radius: 8px;
  background: rgba(0, 50, 160, 0.1);
}

.tag-input :deep(.v-field) {
  padding: 0 10px;
}

.tag-input :deep(.v-field__input) {
  min-height: 28px;
  padding: 0;
  font-size: 0.8125rem;
  color: rgb(0, 50, 160);
}

.tag-input :deep(input::placeholder) {
  color: rgba(0, 50, 160, 0.72);
  opacity: 1;
}

.first-review-card {
  background: #F8FBFF;
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
  color: #4F638C;
  font-size: 0.9rem;
  line-height: 1.45;
}

.actions-row :deep(.v-btn) {
  width: 52px;
  height: 52px;
  border-radius: 16px;
}

.action-btn {
  transform: none;
}

.approve-btn {
  box-shadow: 0 12px 30px rgba(0, 50, 160, 0.22);
}

.reject-btn {
  color: #9B1C1C;
  border-color: rgba(155, 28, 28, 0.22);
  background: rgba(155, 28, 28, 0.04);
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
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 16px;
  }

  .submit-note {
    flex: 0 0 100%;
    width: 100%;
    font-size: 0.84rem;
    text-align: center;
  }

  .actions-row :deep(.v-btn) {
    width: 52px;
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

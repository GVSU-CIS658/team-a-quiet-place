<template>
  <div class="add-place-page">
    <div class="editor-shell">
      <v-form ref="formRef" @submit.prevent="handleSubmit">
        <v-card class="place-card" rounded="xl" elevation="4">
          <div class="image-wrapper">
            <v-img :src="imagePreviewUrl" height="430" cover>
              <div class="image-overlay">
                <div class="top-image-row">
                  <template v-if="editingField === 'location'">
                    <div class="location-edit-wrap">
                      <v-text-field
                        v-model="location"
                        variant="solo-filled"
                        density="compact"
                        hide-details="auto"
                        autofocus
                        :rules="[rules.required, rules.minLocation]"
                        @blur="stopEditing"
                        @keydown.enter.prevent="stopEditing"
                      />
                    </div>
                  </template>

                  <template v-else>
                    <div
                      class="location-pill editable-hover"
                      @click="startEditing('location')"
                    >
                      {{ location }}
                    </div>
                  </template>

                  <div class="image-counter-wrap">
                    <v-btn
                      icon="mdi-camera-plus-outline"
                      size="small"
                      variant="flat"
                      class="upload-btn"
                      @click="triggerImageUpload"
                    />

                    <div class="image-counter">1 / 1</div>
                  </div>
                </div>

                <div class="image-nav">
                  <v-btn
                    icon="mdi-chevron-left"
                    size="small"
                    variant="flat"
                    class="nav-btn"
                    disabled
                  />
                  <v-btn
                    icon="mdi-chevron-right"
                    size="small"
                    variant="flat"
                    class="nav-btn"
                    disabled
                  />
                </div>
              </div>
            </v-img>

            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden-file-input"
              @change="handleImageSelected"
            />
          </div>

          <v-card-text class="pa-6">
            <div class="title-row mb-2">
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

              <v-btn icon="mdi-heart" variant="text" color="primary" />
            </div>

            <div class="description-block mb-4">
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
            </div>

            <div v-if="!hasAtLeastOneTag" class="text-caption text-error mb-4">
              Add at least one tag.
            </div>

            <div v-else class="mb-4"></div>

            <div class="review-toggle-row mb-3">
              <v-btn variant="tonal" color="primary" rounded="xl" disabled>
                Add a review
              </v-btn>
            </div>

            <div class="d-flex align-center ga-3 mb-4 flex-wrap">
              <div class="d-flex align-center ga-2">
                <v-rating
                  v-model="reviewRating"
                  half-increments
                  density="compact"
                  color="primary"
                  size="small"
                />
                <span class="text-body-2 font-weight-medium">{{ reviewRating }}</span>
                <span class="text-body-2 text-medium-emphasis">
                  (0 reviews)
                </span>
              </div>
            </div>

            <div class="first-review-box mb-3">
              <template v-if="editingField === 'review'">
                <v-textarea
                  v-model="firstReview"
                  variant="outlined"
                  rounded="lg"
                  rows="3"
                  auto-grow
                  hide-details="auto"
                  autofocus
                  placeholder="Write the first review for this place..."
                  :rules="[rules.maxReview]"
                  @blur="stopEditing"
                />
              </template>

              <template v-else>
                <div
                  class="first-review-placeholder editable-hover"
                  @click="startEditing('review')"
                >
                  {{
                    firstReview ||
                    "Click here to add the first review for this place."
                  }}
                </div>
              </template>
            </div>

            <div class="helper-text">
              Click directly on the card to edit its content.
            </div>
          </v-card-text>
        </v-card>

        <div class="actions-row">
          <v-btn
            variant="text"
            rounded="xl"
            @click="router.push({ name: 'home' })"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            rounded="xl"
            type="submit"
            :loading="addPlaceStore.isSubmitting"
            :disabled="!canSubmit"
          >
            Add Place
          </v-btn>
        </div>
      </v-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { useRouter } from "vue-router";
import { useAddPlaceStore } from "../stores/addPlaceStore";

const router = useRouter();
const addPlaceStore = useAddPlaceStore();

const formRef = ref();

const name = ref("New Quiet Place");
const location = ref("Campus location");
const description = ref(
  "Describe what makes this place calm, comfortable, or good for studying.",
);
const reviewRating = ref(5)
const firstReview = ref("");

const tags = ref<string[]>(["quiet"]);
const tagInput = ref("");

const imagePreviewUrl = ref(
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
);

const editingField = ref<"name" | "location" | "description" | "review" | null>(
  null,
);

const fileInputRef = ref<HTMLInputElement | null>(null);

const defaultName = "New Quiet Place";
const defaultLocation = "Campus location";
const defaultDescription =
  "Describe what makes this place calm, comfortable, or good for studying.";

const rules = {
  required: (value: string) => !!value?.trim() || "This field is required.",
  minName: (value: string) =>
    value.trim().length >= 3 || "Name must be at least 3 characters.",
  minLocation: (value: string) =>
    value.trim().length >= 3 || "Location must be at least 3 characters.",
  minDescription: (value: string) =>
    value.trim().length >= 15 || "Description must be at least 15 characters.",
  maxDescription: (value: string) =>
    value.trim().length <= 500 || "Description cannot exceed 500 characters.",
  maxReview: (value: string) =>
    value.trim().length <= 300 || "Review cannot exceed 300 characters.",
};

const isNameValid = computed(() => name.value.trim().length >= 3);
const isLocationValid = computed(() => location.value.trim().length >= 3);
const isDescriptionValid = computed(() => {
  const len = description.value.trim().length;
  return len >= 15 && len <= 500;
});
const isReviewValid = computed(() => firstReview.value.trim().length <= 300);
const hasAtLeastOneTag = computed(() => tags.value.length > 0);

const canSubmit = computed(() => {
  return (
    isNameValid.value &&
    isLocationValid.value &&
    isDescriptionValid.value &&
    isReviewValid.value &&
    hasAtLeastOneTag.value &&
    !addPlaceStore.isSubmitting
  );
});

function startEditing(field: "name" | "location" | "description" | "review") {
  editingField.value = field;
}

function stopEditing() {
  editingField.value = null;

  if (!name.value.trim()) name.value = defaultName;
  if (!location.value.trim()) location.value = defaultLocation;
  if (!description.value.trim()) description.value = defaultDescription;
}

function triggerImageUpload() {
  fileInputRef.value?.click();
}

function handleImageSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (imagePreviewUrl.value.startsWith("blob:")) {
    URL.revokeObjectURL(imagePreviewUrl.value);
  }

  imagePreviewUrl.value = URL.createObjectURL(file);
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

async function handleSubmit() {
  const result = await formRef.value?.validate();

  if (!result?.valid) return;
  if (!hasAtLeastOneTag.value) return;

  await addPlaceStore.createPlace({
    name: name.value.trim(),
    location: location.value.trim(),
    description: description.value.trim(),
    images: [imagePreviewUrl.value],
    tags: tags.value,
    firstReview: firstReview.value.trim(),
    firstReviewScore: reviewRating.value
  });

  router.push({ name: "home" });
}

onBeforeUnmount(() => {
  if (imagePreviewUrl.value.startsWith("blob:")) {
    URL.revokeObjectURL(imagePreviewUrl.value);
  }
});
</script>


<style scoped>
.add-place-page {
  min-height: 100%;
  padding: 12px 16px 32px;
}

.editor-shell {
  max-width: 560px;
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
  cursor: text;
}

.location-edit-wrap {
  min-width: 180px;
  max-width: 240px;
}

.image-counter-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-btn {
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

.title-edit-area {
  flex: 1;
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
  min-width: 120px;
  flex: 1 1 140px;
}

.review-toggle-row {
  display: flex;
  justify-content: center;
}

.first-review-box {
  min-height: 76px;
}

.first-review-placeholder {
  padding: 12px 14px;
  border-radius: 14px;
  background: #f7f9fc;
  color: #6b7280;
  cursor: text;
  line-height: 1.55;
  white-space: pre-wrap;
}

.helper-text {
  margin-top: 16px;
  text-align: center;
  font-size: 0.88rem;
  color: #6b7280;
}

.actions-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 18px;
}

.hidden-file-input {
  display: none;
}

@media (max-width: 640px) {
  .actions-row {
    flex-direction: column-reverse;
  }

  .actions-row :deep(.v-btn) {
    width: 100%;
  }

  .location-edit-wrap {
    min-width: 140px;
    max-width: 180px;
  }
}
</style>

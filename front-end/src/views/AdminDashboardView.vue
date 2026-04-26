<template>
  <div class="admin-dashboard-page">
    <div v-if="!auth.user" class="empty-state">
      <v-card rounded="xl" elevation="2" class="pa-8 text-center">
        <div class="text-h6 font-weight-bold mb-2">Sign in required</div>
        <div class="text-body-2 text-medium-emphasis mb-4">
          Sign in first to manage places.
        </div>

        <v-btn color="primary" rounded="xl" @click="signIn">
          Sign in with Google
        </v-btn>
      </v-card>
    </div>

    <div v-else-if="isCheckingAdmin" class="empty-state">
      <v-card rounded="xl" elevation="2" class="pa-8 text-center">
        <div class="text-h6 font-weight-bold mb-2">Checking access</div>
        <div class="text-body-2 text-medium-emphasis">
          Verifying your admin membership.
        </div>
      </v-card>
    </div>

    <div v-else-if="!isAdmin" class="empty-state">
      <v-card rounded="xl" elevation="2" class="pa-8 text-center">
        <div class="text-h6 font-weight-bold mb-2">Admin access required</div>
        <div class="text-body-2 text-medium-emphasis">
          Your account is signed in, but it is not active in the `admins` collection.
        </div>
      </v-card>
    </div>

    <template v-else>
      <section class="stats-grid">
        <v-card rounded="xl" elevation="2" class="stat-card">
          <div class="stat-label">Places</div>
          <div class="stat-value">{{ placesStore.places.length }}</div>
        </v-card>

        <v-card rounded="xl" elevation="2" class="stat-card">
          <div class="stat-label">Reviews</div>
          <div class="stat-value">{{ totalReviewCount }}</div>
        </v-card>

        <v-card rounded="xl" elevation="2" class="stat-card">
          <div class="stat-label">Approved</div>
          <div class="stat-value">{{ placesStore.approvedPlaces.length }}</div>
        </v-card>

        <v-card rounded="xl" elevation="2" class="stat-card">
          <div class="stat-label">Rejected</div>
          <div class="stat-value">{{ rejectedPlaces.length }}</div>
        </v-card>
      </section>

      <v-card rounded="xl" elevation="2" class="dashboard-card">
        <div class="dashboard-toolbar">
          <div class="toolbar-copy">
            <div class="toolbar-title">Content dashboard</div>
            <div class="toolbar-subtitle">
              Review all places, toggle whether they can be shown, or permanently
              delete a place and its related data.
            </div>
          </div>

        </div>

        <div class="table-wrap">
          <v-table class="admin-table">
            <thead>
              <tr>
                <th>
                  <button class="sort-header" type="button" @click="setSort('name')">
                    Place
                    <v-icon :icon="sortIcon('name')" size="small" />
                  </button>
                </th>
                <th>
                  <button class="sort-header" type="button" @click="setSort('status')">
                    Status
                    <v-icon :icon="sortIcon('status')" size="small" />
                  </button>
                </th>
                <th>
                  <button class="sort-header" type="button" @click="setSort('rating')">
                    Rating
                    <v-icon :icon="sortIcon('rating')" size="small" />
                  </button>
                </th>
                <th>
                  <button class="sort-header" type="button" @click="setSort('reviews')">
                    Reviews
                    <v-icon :icon="sortIcon('reviews')" size="small" />
                  </button>
                </th>
                <th>
                  <button class="sort-header" type="button" @click="setSort('creator')">
                    Creator
                    <v-icon :icon="sortIcon('creator')" size="small" />
                  </button>
                </th>
                <th>
                  <button class="sort-header" type="button" @click="setSort('createdAt')">
                    Created
                    <v-icon :icon="sortIcon('createdAt')" size="small" />
                  </button>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="place in filteredPlaces" :key="place.id">
                <td class="place-cell">
                  <div class="place-summary">
                    <img
                      :src="place.images[0]"
                      :alt="place.name"
                      class="place-thumb"
                    >

                    <div class="place-copy">
                      <div class="place-name">{{ place.name }}</div>
                      <div class="place-meta">
                        {{ place.location }} · {{ place.tags.join(", ") || "No tags" }}
                      </div>
                    </div>
                  </div>
                </td>

                <td>
                  <v-chip
                    size="small"
                    rounded="lg"
                    :color="statusColorMap[place.approvalStatus]"
                    variant="tonal"
                  >
                    {{ place.approvalStatus }}
                  </v-chip>
                </td>

                <td>{{ place.rating.toFixed(1) }}</td>
                <td>{{ place.reviews }}</td>
                <td>{{ place.createdByName || "Unknown" }}</td>
                <td>{{ formatCreatedAt(place.createdAt) }}</td>
                <td>
                  <div class="action-buttons">
                    <v-btn
                      size="small"
                      icon="mdi-check"
                      rounded="lg"
                      variant="tonal"
                      color="primary"
                      :disabled="place.approvalStatus === 'approved' || placesStore.isSubmitting"
                      @click="setPlaceStatus(place.id, 'approved')"
                    />

                    <v-btn
                      size="small"
                      icon="mdi-close"
                      rounded="lg"
                      variant="tonal"
                      color="error"
                      :disabled="place.approvalStatus === 'rejected' || placesStore.isSubmitting"
                      @click="setPlaceStatus(place.id, 'rejected')"
                    />

                    <v-btn
                      size="small"
                      icon="mdi-trash-can-outline"
                      rounded="lg"
                      variant="text"
                      color="error"
                      :disabled="placesStore.isSubmitting"
                      @click="openDeleteDialog(place)"
                    />
                  </div>
                </td>
              </tr>

              <tr v-if="filteredPlaces.length === 0">
                <td colspan="7" class="empty-row">
                  No places match the current filters.
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card>
    </template>

    <v-dialog v-model="deleteDialog" max-width="460">
      <v-card rounded="xl">
        <v-card-title class="text-h6 pt-6 px-6">
          Delete place
        </v-card-title>

        <v-card-text class="px-6 pb-2">
          <div class="text-body-2 text-medium-emphasis">
            This will permanently delete
            <strong>{{ placePendingDelete?.name }}</strong>, its reviews, saved
            references, and any uploaded Firebase Storage images tied to it.
          </div>
        </v-card-text>

        <v-card-actions class="px-6 pb-6">
          <v-spacer />
          <v-btn rounded="xl" variant="text" @click="deleteDialog = false">
            Cancel
          </v-btn>
          <v-btn
            rounded="xl"
            color="error"
            :loading="placesStore.isSubmitting"
            @click="confirmDelete"
          >
            Delete forever
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { ApprovalStatus, Place } from "../types/data";
import { useAdminStore } from "../stores/adminStore";
import { useAuthStore } from "../stores/authStore";
import { usePlacesStore } from "../stores/placesStore";

type DashboardSortKey =
  | "name"
  | "status"
  | "rating"
  | "reviews"
  | "creator"
  | "createdAt";
type SortDirection = "asc" | "desc";

const auth = useAuthStore();
const adminStore = useAdminStore();
const placesStore = usePlacesStore();

const isAdmin = computed(() => adminStore.isAdmin);
const isCheckingAdmin = computed(() => adminStore.isChecking);
const isUnlocked = computed(() => adminStore.isUnlocked);

// Starts Google sign-in from the signed-out dashboard state.
async function signIn() {
  try {
    await auth.signInWithGoogle();
  } catch (error) {
    console.error("Google sign-in failed:", error);
  }
}

const sortKey = ref<DashboardSortKey>("createdAt");
const sortDirection = ref<SortDirection>("desc");
const deleteDialog = ref(false);
const placePendingDelete = ref<Place | null>(null);

const statusColorMap: Record<ApprovalStatus, string> = {
  approved: "primary",
  pending: "warning",
  rejected: "error",
};

const rejectedPlaces = computed(() => {
  return placesStore.places.filter((place) => place.approvalStatus === "rejected");
});

// Sums the review counts already stored on each place record.
const totalReviewCount = computed(() => {
  return placesStore.places.reduce((total, place) => total + place.reviews, 0);
});

// Returns a sorted copy so the store's original place order is not mutated.
const filteredPlaces = computed(() => {
  return [...placesStore.places].sort(comparePlaces);
});

// Compares text without caring about capitalization.
function compareText(left: string, right: string) {
  return left.localeCompare(right, undefined, { sensitivity: "base" });
}

// Applies the active sort key and direction to two place rows.
function comparePlaces(left: Place, right: Place) {
  const direction = sortDirection.value === "asc" ? 1 : -1;
  let result = 0;

  if (sortKey.value === "name") {
    result = compareText(left.name, right.name);
  } else if (sortKey.value === "status") {
    result = compareText(left.approvalStatus, right.approvalStatus);
  } else if (sortKey.value === "rating") {
    result = left.rating - right.rating;
  } else if (sortKey.value === "reviews") {
    result = left.reviews - right.reviews;
  } else if (sortKey.value === "creator") {
    result = compareText(left.createdByName || "Unknown", right.createdByName || "Unknown");
  } else {
    result = (left.createdAt ?? 0) - (right.createdAt ?? 0);
  }

  return result * direction;
}

// Changes the active sort column, or toggles direction when clicking it again.
function setSort(key: DashboardSortKey) {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
    return;
  }

  sortKey.value = key;
  sortDirection.value =
    key === "rating" || key === "reviews" || key === "createdAt" ? "desc" : "asc";
}

// Picks the icon shown beside each sortable table header.
function sortIcon(key: DashboardSortKey) {
  if (sortKey.value !== key) return "mdi-swap-vertical";

  return sortDirection.value === "asc" ? "mdi-arrow-up" : "mdi-arrow-down";
}

// Updates a place moderation status through the admin-only store action.
async function setPlaceStatus(placeId: string, approvalStatus: ApprovalStatus) {
  if (!isUnlocked.value) return;

  try {
    await placesStore.adminUpdateApprovalStatus(placeId, approvalStatus);
  } catch (error) {
    console.error("Failed to update place status:", error);
  }
}

// Opens the confirmation dialog for deleting a place.
function openDeleteDialog(place: Place) {
  placePendingDelete.value = place;
  deleteDialog.value = true;
}

// Deletes the selected place after confirmation.
async function confirmDelete() {
  if (!placePendingDelete.value || !isUnlocked.value) return;

  try {
    await placesStore.adminDeletePlace(placePendingDelete.value.id);
    deleteDialog.value = false;
    placePendingDelete.value = null;
  } catch (error) {
    console.error("Failed to delete place:", error);
  }
}

// Formats Firestore millisecond timestamps for the table.
function formatCreatedAt(createdAt?: number) {
  if (!createdAt) return "Unknown";

  return new Date(createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
</script>

<style scoped>
.admin-dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  padding-bottom: 28px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.stat-card {
  padding: 18px 20px;
  background: rgba(255, 255, 255, 0.92);
}

.stat-label {
  font-size: 0.88rem;
  color: #4F638C;
}

.stat-value {
  margin-top: 8px;
  font-size: 1.7rem;
  font-weight: 700;
  color: #13155C;
}

.dashboard-card {
  overflow: hidden;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 22px 50px rgba(19, 21, 92, 0.08);
}

.dashboard-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 22px 12px;
}

.toolbar-copy {
  max-width: 520px;
}

.toolbar-title {
  font-size: 1.08rem;
  font-weight: 700;
  color: #13155C;
}

.toolbar-subtitle {
  margin-top: 6px;
  line-height: 1.5;
  color: #4F638C;
}

.table-wrap {
  overflow-x: auto;
}

.admin-table {
  min-width: 1180px;
}

.sort-header {
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  cursor: pointer;
}

.sort-header:hover {
  color: rgb(0, 50, 160);
}

.place-cell {
  min-width: 280px;
}

.place-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
}

.place-thumb {
  width: 68px;
  height: 68px;
  object-fit: cover;
  border-radius: 14px;
  background: #EEF4FF;
}

.place-copy {
  min-width: 0;
}

.place-name {
  font-weight: 700;
  color: #13155C;
}

.place-meta {
  margin-top: 4px;
  font-size: 0.88rem;
  line-height: 1.4;
  color: #4F638C;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-buttons :deep(.v-btn) {
  width: 34px;
  height: 34px;
}

.empty-row {
  text-align: center;
  padding: 26px 12px;
  color: #4F638C;
}

.empty-state {
  margin-top: 80px;
}

</style>

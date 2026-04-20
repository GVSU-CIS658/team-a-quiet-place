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

          <div class="toolbar-actions">
            <v-text-field
              v-model="searchText"
              label="Search places"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              hide-details
              prepend-inner-icon="mdi-magnify"
              class="search-field"
            />

            <v-select
              v-model="statusFilter"
              :items="statusOptions"
              label="Status"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              hide-details
              class="status-field"
            />
          </div>
        </div>

        <div class="table-wrap">
          <v-table class="admin-table">
            <thead>
              <tr>
                <th>Place</th>
                <th>Status</th>
                <th>Rating</th>
                <th>Reviews</th>
                <th>Creator</th>
                <th>Created</th>
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
                      rounded="lg"
                      variant="tonal"
                      color="primary"
                      :disabled="place.approvalStatus === 'approved' || placesStore.isSubmitting"
                      @click="setPlaceStatus(place.id, 'approved')"
                    >
                      Allow
                    </v-btn>

                    <v-btn
                      size="small"
                      rounded="lg"
                      variant="tonal"
                      color="error"
                      :disabled="place.approvalStatus === 'rejected' || placesStore.isSubmitting"
                      @click="setPlaceStatus(place.id, 'rejected')"
                    >
                      Reject
                    </v-btn>

                    <v-btn
                      size="small"
                      rounded="lg"
                      variant="text"
                      color="error"
                      :disabled="placesStore.isSubmitting"
                      @click="openDeleteDialog(place)"
                    >
                      Delete
                    </v-btn>
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

type DashboardStatusFilter =
  | "all"
  | "approved"
  | "pending"
  | "rejected"
  | "not-rejected";

const auth = useAuthStore();
const adminStore = useAdminStore();
const placesStore = usePlacesStore();

const isAdmin = computed(() => adminStore.isAdmin);
const isCheckingAdmin = computed(() => adminStore.isChecking);
const isUnlocked = computed(() => adminStore.isUnlocked);

async function signIn() {
  try {
    await auth.signInWithGoogle();
  } catch (error) {
    console.error("Google sign-in failed:", error);
  }
}

const searchText = ref("");
const statusFilter = ref<DashboardStatusFilter>("all");
const deleteDialog = ref(false);
const placePendingDelete = ref<Place | null>(null);

const statusOptions = [
  { title: "All places", value: "all" },
  { title: "Not rejected", value: "not-rejected" },
  { title: "Approved", value: "approved" },
  { title: "Pending", value: "pending" },
  { title: "Rejected", value: "rejected" },
];

const statusColorMap: Record<ApprovalStatus, string> = {
  approved: "primary",
  pending: "warning",
  rejected: "error",
};

const rejectedPlaces = computed(() => {
  return placesStore.places.filter((place) => place.approvalStatus === "rejected");
});

const totalReviewCount = computed(() => {
  return placesStore.places.reduce((total, place) => total + place.reviews, 0);
});

const filteredPlaces = computed(() => {
  const query = searchText.value.trim().toLowerCase();

  return placesStore.places.filter((place) => {
    const matchesStatus =
      statusFilter.value === "all" ||
      (statusFilter.value === "not-rejected" &&
        place.approvalStatus !== "rejected") ||
      place.approvalStatus === statusFilter.value;

    const matchesSearch =
      query.length === 0 ||
      place.name.toLowerCase().includes(query) ||
      place.location.toLowerCase().includes(query) ||
      place.tags.some((tag) => tag.toLowerCase().includes(query)) ||
      (place.createdByName ?? "").toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });
});

async function setPlaceStatus(placeId: string, approvalStatus: ApprovalStatus) {
  if (!isUnlocked.value) return;

  try {
    await placesStore.adminUpdateApprovalStatus(placeId, approvalStatus);
  } catch (error) {
    console.error("Failed to update place status:", error);
  }
}

function openDeleteDialog(place: Place) {
  placePendingDelete.value = place;
  deleteDialog.value = true;
}

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
  color: #6b7280;
}

.stat-value {
  margin-top: 8px;
  font-size: 1.7rem;
  font-weight: 700;
  color: #172033;
}

.dashboard-card {
  overflow: hidden;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 22px 50px rgba(31, 45, 61, 0.08);
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
  color: #172033;
}

.toolbar-subtitle {
  margin-top: 6px;
  line-height: 1.5;
  color: #6b7280;
}

.toolbar-actions {
  display: flex;
  gap: 12px;
  width: min(100%, 460px);
}

.search-field {
  flex: 1;
}

.status-field {
  width: 170px;
}

.table-wrap {
  overflow-x: auto;
}

.admin-table {
  min-width: 1180px;
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
  background: #eef3f9;
}

.place-copy {
  min-width: 0;
}

.place-name {
  font-weight: 700;
  color: #172033;
}

.place-meta {
  margin-top: 4px;
  font-size: 0.88rem;
  line-height: 1.4;
  color: #6b7280;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.empty-row {
  text-align: center;
  padding: 26px 12px;
  color: #6b7280;
}

.empty-state {
  margin-top: 80px;
}

@media (max-width: 960px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-toolbar {
    flex-direction: column;
  }

  .toolbar-actions {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .toolbar-actions {
    flex-direction: column;
  }

  .status-field {
    width: 100%;
  }
}
</style>

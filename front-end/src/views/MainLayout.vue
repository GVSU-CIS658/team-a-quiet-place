<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import AppDrawer from "../components/AppDrawer.vue";
import { usePlacesStore } from "../stores/placesStore";
import { useReviewsStore } from "../stores/reviewsStore";
import { useSavedPlacesStore } from "../stores/savedPlacesStore";
import { useAuthStore } from "../stores/authStore";

const drawer = ref(false);
const route = useRoute();

const authStore = useAuthStore();
const placesStore = usePlacesStore();
const reviewsStore = useReviewsStore();
const savedPlacesStore = useSavedPlacesStore();

onMounted(() => {
  placesStore.readPlaces();
  reviewsStore.readReviews();

  if (authStore.user) {
    savedPlacesStore.readSaves();
  }
});

watch(
  () => authStore.user,
  (user) => {
    savedPlacesStore.stopReading();
    savedPlacesStore.clearSaved();

    if (user) {
      savedPlacesStore.readSaves();
    }
  },
);

onBeforeUnmount(() => {
  placesStore.stopReading();
  reviewsStore.stopReading();
  savedPlacesStore.stopReading();
});
</script>

<template>
  <div class="app-shell">
    <AppDrawer v-model="drawer" />

    <v-main class="main-area">
      <div class="layout-shell">
        <header class="top-bar">
          <v-btn
            class="menu-btn"
            icon="mdi-menu"
            variant="tonal"
            color="primary"
            @click="drawer = true"
          />

          <div class="top-bar-title-wrap">
            <div class="app-title">A Quiet Place</div>
            <div class="app-subtitle">
              {{ route.meta.subtitle || "Find a calm corner on campus" }}
            </div>
          </div>

          <div class="top-bar-spacer" />
        </header>

        <section class="page-content">
          <router-view />
        </section>
      </div>
    </v-main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f7f9fc, #eef3f9);
}

.main-area {
  min-height: 100vh;
}

.layout-shell {
  width: min(100%, 640px);
  margin: 0 auto;
  padding: 12px 16px 32px;
}

.top-bar {
  position: sticky;
  top: 12px;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  margin: 0px 12px 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(31, 45, 61, 0.08);
}

.menu-btn {
  flex: 0 0 auto;
  border-radius: 14px;
}

.top-bar-title-wrap {
  flex: 1;
  text-align: center;
  min-width: 0;
  padding: 0 12px;
}

.top-bar-spacer {
  width: 40px;
  flex: 0 0 40px;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
  color: #1f2d3d;
}

.app-subtitle {
  margin-top: 4px;
  font-size: 0.92rem;
  line-height: 1.35;
  color: #6b7280;
}

.page-content {
  min-height: calc(100vh - 140px);
}

@media (max-width: 640px) {
  .layout-shell {
    padding: 12px 16px 24px;
  }

  .top-bar {
    top: 8px;
    margin-bottom: 20px;
    border-radius: 18px;
    padding: 8px 10px;
  }

  .app-title {
    font-size: 1.12rem;
  }

  .app-subtitle {
    font-size: 0.88rem;
  }
}
</style>
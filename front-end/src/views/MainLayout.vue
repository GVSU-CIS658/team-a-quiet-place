<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useRoute } from "vue-router";
import AppDrawer from "../components/AppDrawer.vue";
import { useAdminStore } from "../stores/adminStore";
import { usePlacesStore } from "../stores/placesStore";
import { useSavedPlacesStore } from "../stores/savedPlacesStore";
import { useAuthStore } from "../stores/authStore";

const drawer = ref(false);
const route = useRoute();

const authStore = useAuthStore();
const adminStore = useAdminStore();
const placesStore = usePlacesStore();
const savedPlacesStore = useSavedPlacesStore();

// Maps route names to the labels shown in the breadcrumb trail.
const pageTitleMap: Record<string, string> = {
  home: "Home",
  saved: "Saved Places",
  "add-place": "Add a Place",
  "admin-review": "Admin Review",
  "admin-dashboard": "Admin Dashboard",
};

const isWideLayout = computed(() => route.meta.layout === "wide");
const isAdminRoute = computed(() => String(route.name ?? "").startsWith("admin"));

// Looks up the current route's human-readable page title.
const currentPageTitle = computed(() => {
  const routeName = String(route.name ?? "");

  return pageTitleMap[routeName] ?? "Home";
});

// Builds the Vuetify breadcrumb items for the current route.
const breadcrumbs = computed(() => {
  if (route.name === "home") {
    return [{ title: "Home", disabled: true }];
  }

  return [
    { title: "Home", to: { name: "home" } },
    { title: currentPageTitle.value, disabled: true },
  ];
});

// Decides what places Firestore listener should be active:
// - normal users should only listen to approved places
// - admins should listen to all places when they are unlocked.
function syncPlaceReadMode() {
  if (isAdminRoute.value && adminStore.isUnlocked) {
    placesStore.readPlaces("all");
    return;
  }

  placesStore.readPlaces("approved");
}

watch(
  // watch the user login/logout to start/stop reading their saved places
  () => authStore.user,
  (user) => {
    savedPlacesStore.stopReading();
    savedPlacesStore.clearSaved();

    if (user) {
      savedPlacesStore.readSaves();
    }
  },
  { immediate: true },
);

watch(
  // watch the route and admin store states to determine which places to read
  [() => route.name, () => adminStore.isUnlocked, () => adminStore.isChecking],
  () => {
    if (isAdminRoute.value && adminStore.isChecking) return;
    syncPlaceReadMode();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  placesStore.stopReading();
  savedPlacesStore.stopReading();
});
</script>

<template>
  <div class="app-shell">
    <AppDrawer v-model="drawer" />

    <v-main class="main-area">
      <div :class="['layout-shell', { 'layout-shell-wide': isWideLayout }]">
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

        <v-breadcrumbs
          :items="breadcrumbs"
          density="compact"
          class="breadcrumbs"
        >
          <template #divider>
            <v-icon icon="mdi-chevron-right" size="small" />
          </template>
        </v-breadcrumbs>

        <section :class="['page-content', { 'page-content-wide': isWideLayout }]">
          <router-view />
        </section>
      </div>
    </v-main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: linear-gradient(to bottom, #F7FAFF, #EEF4FF);
}

.main-area {
  min-height: 100vh;
}

.layout-shell {
  width: min(100%, 640px);
  margin: 0 auto;
  padding: 12px 16px 32px;
}

.layout-shell-wide {
  width: min(100%, 1480px);
  padding-left: 20px;
  padding-right: 20px;
}

.top-bar {
  position: sticky;
  top: 12px;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  margin: 0px 0px 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(19, 21, 92, 0.08);
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
  color: #13155C;
}

.app-subtitle {
  margin-top: 4px;
  font-size: 0.92rem;
  line-height: 1.35;
  color: #4F638C;
}

.breadcrumbs {
  padding: 0 4px 12px;
  color: #4F638C;
  font-size: 0.86rem;
}

.breadcrumbs :deep(.v-breadcrumbs-item) {
  color: inherit;
}

.breadcrumbs :deep(.v-breadcrumbs-item--disabled) {
  color: #13155C;
  opacity: 1;
  font-weight: 600;
}

.page-content {
  min-height: calc(100vh - 140px);
}

.page-content-wide {
  padding: 4px 0px 0;
}

@media (max-width: 640px) {
  .layout-shell {
    padding: 12px 16px 24px;
  }

  .layout-shell-wide {
    padding-left: 12px;
    padding-right: 12px;
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

  .page-content-wide {
    padding: 0;
  }
}
</style>

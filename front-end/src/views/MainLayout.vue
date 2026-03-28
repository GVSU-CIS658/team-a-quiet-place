<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import AppDrawer from "../components/AppDrawer.vue";

const drawer = ref(false);
const route = useRoute();
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
  padding: 20px 16px 32px;
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  margin-bottom: 24px;
  padding: 8px 0;
  background: rgba(247, 249, 252, 0.92);
  backdrop-filter: blur(10px);
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
    padding: 16px 16px 24px;
  }

  .top-bar {
    margin-bottom: 20px;
  }

  .app-title {
    font-size: 1.12rem;
  }

  .app-subtitle {
    font-size: 0.88rem;
  }
}
</style>

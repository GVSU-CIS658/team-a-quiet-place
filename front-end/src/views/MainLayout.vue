<script setup lang="ts">
import { ref } from "vue";
import AppDrawer from "../components/AppDrawer.vue";
import { useRoute } from "vue-router";

const drawer = ref(false);
const route = useRoute();
</script>

<template>
  <div class="app-shell">
    <AppDrawer v-model="drawer" />

    <v-main>
      <v-container class="layout-page py-6">
        <div class="top-bar mb-6">
          <v-btn
            class="menu-btn"
            icon="mdi-menu"
            variant="text"
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
        </div>

        <router-view />
      </v-container>
    </v-main>
  </div>
</template>

<style scoped>
.layout-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f7f9fc, #eef3f9);
}

.top-bar {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 8px;
  display: flex;
  align-items: center;
  min-height: 56px;
}

.menu-btn {
  flex: 0 0 auto;
}

.top-bar-title-wrap {
  flex: 1;
  text-align: center;
}

.top-bar-spacer {
  width: 40px;
  flex: 0 0 40px;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2d3d;
}

.app-subtitle {
  font-size: 0.95rem;
  color: #6b7280;
}
</style>

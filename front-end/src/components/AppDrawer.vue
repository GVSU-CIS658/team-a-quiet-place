<template>
  <v-navigation-drawer
    v-model="drawerModel"
    temporary
    location="left"
    width="300"
  >
    <div class="drawer-content d-flex flex-column h-100">
      <div class="pa-4">
        <div class="drawer-title">Menu</div>
        <div class="drawer-subtitle">Browse the app</div>
      </div>

      <v-divider />

      <v-list nav class="pt-2">
        <v-list-item
          prepend-icon="mdi-home-outline"
          title="Home"
          :to="{ name: 'home' }"
          rounded="xl"
          @click="drawerModel = false"
        />
        <v-list-item
          prepend-icon="mdi-heart-outline"
          title="Saved"
          :to="{ name: 'saved' }"
          rounded="xl"
          @click="drawerModel = false"
        />
      </v-list>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
const drawerModel = defineModel<boolean>({ default: false });
</script>

<style scoped>
.drawer-content {
  background: #ffffff;
}

.drawer-title {
  font-size: 1.1rem;
  font-weight: 700;
}

.drawer-subtitle {
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.55);
  margin-top: 4px;
}
</style>

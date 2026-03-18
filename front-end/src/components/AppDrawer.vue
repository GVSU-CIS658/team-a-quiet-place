<template>
  <v-navigation-drawer
    :model-value="modelValue"
    temporary
    location="left"
    width="300"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="drawer-content d-flex flex-column h-100">
      <div>
        <div class="pa-4">
          <div class="drawer-title">Menu</div>
          <div class="drawer-subtitle">Browse the app</div>
        </div>

        <v-divider />

        <v-list nav class="pt-2">
          <v-list-item
            prepend-icon="mdi-home-outline"
            title="Home"
            rounded="xl"
            @click="goTo('home')"
          />

          <v-list-item
            v-if="isLoggedIn"
            prepend-icon="mdi-heart-outline"
            title="Saved Places"
            rounded="xl"
            @click="goTo('saved')"
          />

          <v-list-item
            v-if="isLoggedIn"
            prepend-icon="mdi-plus-circle-outline"
            title="Add a Place"
            rounded="xl"
            @click="goTo('add-place')"
          />
        </v-list>
      </div>

      <div class="mt-auto pa-4">
        <v-divider class="mb-4" />

        <v-btn
          v-if="isLoggedIn"
          block
          variant="outlined"
          color="primary"
          rounded="xl"
          prepend-icon="mdi-logout"
          @click="handleLogout"
        >
          Log out
        </v-btn>

        <v-btn
          v-else
          block
          color="primary"
          rounded="xl"
          prepend-icon="mdi-login"
          @click="goTo('login')"
        >
          Sign In
        </v-btn>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/authStore";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const auth = useAuthStore();
const router = useRouter();

const isLoggedIn = computed(() => !!auth.user);

function closeDrawer() {
  emit("update:modelValue", false);
}

function goTo(name: string) {
  closeDrawer();
  router.push({ name });
}

async function handleLogout() {
  try {
    await auth.logout();
    closeDrawer();
    router.push({ name: "home" });
  } catch (error) {
    console.error("Logout failed:", error);
  }
}
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

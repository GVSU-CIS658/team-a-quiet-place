<template>
  <v-navigation-drawer
    :model-value="modelValue"
    temporary
    location="left"
    width="300"
    class="app-drawer"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="drawer-content d-flex flex-column h-100">
      <div>
        <div class="drawer-header">
          <div class="drawer-badge">
            <v-icon size="18">mdi-menu</v-icon>
          </div>

          <div>
            <div class="drawer-title">Menu</div>
            <div class="drawer-subtitle">Browse the app</div>
          </div>
        </div>

        <v-divider />

        <v-list nav class="drawer-list">
          <v-list-item
            prepend-icon="mdi-home-outline"
            title="Home"
            rounded="xl"
            class="drawer-item"
            @click="goTo('home')"
          />

          <v-list-item
            v-if="isLoggedIn"
            prepend-icon="mdi-heart-outline"
            title="Saved Places"
            rounded="xl"
            class="drawer-item"
            @click="goTo('saved')"
          />

          <v-list-item
            v-if="isLoggedIn"
            prepend-icon="mdi-plus-circle-outline"
            title="Add a Place"
            rounded="xl"
            class="drawer-item"
            @click="goTo('add-place')"
          />

          <v-list-item
            v-if="isLoggedIn"
            prepend-icon="mdi-account-box-edit-outline"
            title="Account"
            rounded="xl"
            class="drawer-item"
            @click="goTo('account-page')"
          />
        </v-list>
      </div>

      <div class="drawer-footer">
        <v-divider class="mb-4" />

        <v-btn
          v-if="isLoggedIn"
          block
          variant="outlined"
          color="primary"
          rounded="xl"
          prepend-icon="mdi-logout"
          class="drawer-action-btn"
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
          class="drawer-action-btn"
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

defineProps<{
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
.app-drawer :deep(.v-navigation-drawer__content) {
  background: #ffffff;
}

.drawer-content {
  background: #ffffff;
}

.drawer-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 22px 20px 18px;
}

.drawer-badge {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(47, 93, 159, 0.08);
  color: rgb(47, 93, 159);
  flex-shrink: 0;
}

.drawer-title {
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.2;
  color: #172033;
}

.drawer-subtitle {
  margin-top: 4px;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #6b7280;
}

.drawer-list {
  padding: 10px 12px 0;
}

.drawer-item {
  margin-bottom: 6px;
}

.drawer-footer {
  margin-top: auto;
  padding: 16px 20px 20px;
}

.drawer-action-btn {
  text-transform: none;
  font-weight: 600;
}
</style>

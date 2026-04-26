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

          <!-- Saved Places is available after login -->
          <v-list-item
            v-if="isLoggedIn"
            prepend-icon="mdi-heart-outline"
            title="Saved Places"
            rounded="xl"
            class="drawer-item"
            @click="goTo('saved')"
          />

          <!-- Add a Place is available after login -->
          <v-list-item
            v-if="isLoggedIn"
            prepend-icon="mdi-plus-circle-outline"
            title="Add a Place"
            rounded="xl"
            class="drawer-item"
            @click="goTo('add-place')"
          />

          <!-- Admin Review is available for admins only -->
          <v-list-item
            v-if="isAdmin"
            prepend-icon="mdi-shield-check-outline"
            title="Admin Review"
            rounded="xl"
            class="drawer-item"
            @click="goTo('admin-review')"
          />

          <!-- Admin Dashboard is available for admins only -->
          <v-list-item
            v-if="isAdmin"
            prepend-icon="mdi-view-dashboard-outline"
            title="Admin Dashboard"
            rounded="xl"
            class="drawer-item"
            @click="goTo('admin-dashboard')"
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
          prepend-icon="mdi-google"
          class="drawer-action-btn"
          @click="handleLogin"
        >
          Sign in with Google
        </v-btn>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAdminStore } from "../stores/adminStore";
import { useAuthStore } from "../stores/authStore";

// "open or closed" state from MainLayout.vue
defineProps<{
  modelValue: boolean;
}>();

// When moving to a new page, we want to close the drawer
// child components can communicate with parent components using emits
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const auth = useAuthStore();
const adminStore = useAdminStore();
const router = useRouter();

const isLoggedIn = computed(() => !!auth.user);
const isAdmin = computed(() => adminStore.isAdmin);

function closeDrawer() {
  emit("update:modelValue", false);
}

function goTo(name: string) {
  closeDrawer();
  router.push({ name });
}

const handleLogin = () => {
  auth.signInWithGoogle();
};

const handleLogout = () => {
  auth.logout();
};
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

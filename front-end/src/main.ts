import { createApp } from "vue";
import App from "./App.vue";

// State managment
import { createPinia } from "pinia";

// Vue Router
import router from "./nav/navigation";

// UI components
import vuetify from "./vueti/vuetify";

// Icons
import '@mdi/font/css/materialdesignicons.css';

// Check - in
import { useAuthStore } from "./stores/authStore";
import { useAdminStore } from "./stores/adminStore";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(vuetify);

const authStore = useAuthStore();
const adminStore = useAdminStore();
authStore.init();
adminStore.init();

app.mount("#app");

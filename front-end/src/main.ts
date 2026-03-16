import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './nav/navigation'
import vuetify from './vueti/vuetify'

import { useAuthStore } from './pinia/authentication'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app')
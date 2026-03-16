<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../pinia/authentication'

const auth = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await auth.logout()
  router.push('/login')
}

const handleConnor = async () => {
  router.push('/connor')
}
</script>

<template>
  <v-btn color="primary" variant="text" @click="handleLogout">
    Log out
  </v-btn>

  <v-btn color="primary" variant="text" @click="handleConnor">
    Connor Murphy
  </v-btn>
</template>
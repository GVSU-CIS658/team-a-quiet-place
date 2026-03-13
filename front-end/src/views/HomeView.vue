<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <v-btn color="primary" variant="text" @click="handleLogout">
    Log out
  </v-btn>
</template>
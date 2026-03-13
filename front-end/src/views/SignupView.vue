<template>
  <v-container fluid class="auth-page d-flex align-center justify-center">
    <v-card class="auth-card pa-6" rounded="xl" elevation="6">
      <div class="text-h5 font-weight-bold mb-2">Create account</div>
      <div class="text-body-2 text-medium-emphasis mb-6">
        Save your favorite quiet spots and build your own list.
      </div>

      <v-alert
        v-if="auth.error"
        type="error"
        variant="tonal"
        class="mb-4"
      >
        {{ auth.error }}
      </v-alert>

      <v-form @submit.prevent="handleSignup">
        <v-text-field
          v-model="email"
          label="Email"
          type="email"
          variant="outlined"
          rounded="lg"
          class="mb-3"
          required
        />

        <v-text-field
          v-model="password"
          label="Password"
          type="password"
          variant="outlined"
          rounded="lg"
          class="mb-3"
          required
        />

        <v-text-field
          v-model="confirmPassword"
          label="Confirm Password"
          type="password"
          variant="outlined"
          rounded="lg"
          class="mb-4"
          required
        />

        <v-alert
          v-if="localError"
          type="warning"
          variant="tonal"
          class="mb-4"
        >
          {{ localError }}
        </v-alert>

        <v-btn
          type="submit"
          block
          color="primary"
          size="large"
          rounded="xl"
          :loading="auth.loading"
        >
          Sign up
        </v-btn>
      </v-form>

      <div class="text-body-2 mt-4">
        Already have an account?
        <RouterLink to="/login">Log in</RouterLink>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const localError = ref('')

const handleSignup = async () => {
  localError.value = ''

  if (password.value !== confirmPassword.value) {
    localError.value = 'Passwords do not match.'
    return
  }

  try {
    await auth.signup(email.value, password.value)
    router.push('/')
  } catch {
    // store already handles firebase errors
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(76, 132, 255, 0.12), transparent 35%),
    linear-gradient(180deg, #f7faff 0%, #eef4ff 100%);
}

.auth-card {
  width: 100%;
  max-width: 460px;
}
</style>
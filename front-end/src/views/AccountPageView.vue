<template>
  <v-container fluid class="auth-page d-flex align-center justify-center">
    <v-card class="auth-card pa-6" rounded="xl" elevation="6">
      <div class="text-h5 font-weight-bold mb-2">Greetings {{ user?.displayName??"" }}</div>
      <div class="text-body-2 text-medium-emphasis mb-6">
        Edit your account details.
      </div>
      <v-alert v-if="auth.error" type="error" variant="tonal" class="mb-4">
        {{ auth.error }}
      </v-alert>

      <v-form @submit.prevent="editAccount">
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
          v-model="username"
          label="Username"
          type="text"
          variant="outlined"
          rounded="lg"
          class="mb-3"
        />

        <v-text-field
          v-model="college"
          label="College"
          type="text"
          variant="outlined"
          rounded="lg"
          class="mb-3"
        />

        <v-text-field
          v-model="ePassword"
          label="Password"
          type="password"
          variant="outlined"
          rounded="lg"
          class="mb-3"
        />

        <v-alert v-if="localError" type="warning" variant="tonal" class="mb-4">
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
          Save changes
        </v-btn>
      </v-form>
    </v-card>
    <v-card class="auth-card pa-6" rounded="xl" elevation="6">
      <div class="text-h5 font-weight-bold mb-2">Greetings {{}}</div>
      <div class="text-body-2 text-medium-emphasis mb-6">
        Edit your account details.
      </div>
      <v-alert v-if="auth.error" type="error" variant="tonal" class="mb-4">
        {{ auth.error }}
      </v-alert>

      <v-form @submit.prevent="changePassword">
        <v-text-field
          v-model="password"
          label="Password"
          type="password"
          variant="outlined"
          rounded="lg"
          class="mb-3"
        />

        <v-text-field
          v-model="confirmPassword"
          label="Confirm Password"
          type="password"
          variant="outlined"
          rounded="lg"
          class="mb-4"
        />

        <v-alert v-if="localError" type="warning" variant="tonal" class="mb-4">
          {{ localErrorPass }}
        </v-alert>

        <v-btn
          type="submit"
          block
          color="primary"
          size="large"
          rounded="xl"
          :loading="auth.loading"
        >
          change password
        </v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
      //require old password to change password
      //be able to set college.
      //make it so email is reactive to current user email.
      //make it so you don't get logged out on page refresh.
import { ref, computed} from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/authStore";
const router = useRouter();
const auth = useAuthStore();
const user = computed(() => auth.user)
const email = ref(user.value?.email??"");
const username = ref(user.value?.displayName??"");
const college = ref("");
const password = ref("");
const ePassword = ref("");
const confirmPassword = ref("");
const localError = ref("");
const localErrorPass = ref("");

const editAccount = async () => {
    localError.value = "";
    if (email.value !== user.value?.email && !ePassword.value) {
        localError.value = "Please enter your password to change email.";
        return;
    }


    if (email.value != user.value?.email){
         try {
            await auth.editAccount(email.value, username.value, "", ePassword.value);
            router.push("/");
        } catch {
            //store already handles firebase errors
        }
    } else{
        try {
            await auth.editAccount(email.value, username.value, "", "");
            router.push("/");
        } catch {
            //store already handles firebase errors
        }
    }
    

  
};

const changePassword = async () => {
  localErrorPass.value = "";

  if (password.value !== confirmPassword.value) {
    localErrorPass.value = "Passwords do not match.";
    return;
  }

  try {
    //await auth.signup(email.value, password.value, username.value);
    router.push("/");
  } catch {
    // store already handles firebase errors
  }
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background:linear-gradient(to bottom, #f7f9fc, #eef3f9);
}

.auth-card {
  width: 100%;
  max-width: 460px;
}
</style>
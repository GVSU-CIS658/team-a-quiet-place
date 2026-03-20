<template>
  <v-container fluid class="auth-page d-flex align-center justify-center">
    <v-card class="auth-card pa-6" rounded="xl" elevation="6">
      <div class="text-h5 font-weight-bold mb-2">Greetings {{ header }}</div>
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
          v-if="emailChanged"
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

        <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
          {{ successMessage }}
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
      <div class="text-body-2 text-medium-emphasis mb-6">
        Change your Password
      </div>
      <v-alert v-if="auth.error" type="error" variant="tonal" class="mb-4">
        {{ auth.error }}
      </v-alert>

      <v-form @submit.prevent="changePassword">
        <v-text-field
          v-model="newPassword"
          label="New Password"
          type="password"
          variant="outlined"
          rounded="lg"
          class="mb-3"
        />

        <v-text-field
          v-model="confirmNewPassword"
          label="Confirm New Password"
          type="password"
          variant="outlined"
          rounded="lg"
          class="mb-4"
        />

        <v-text-field
          v-model="oldPassword"
          label="Old Password"
          type="password"
          variant="outlined"
          rounded="lg"
          class="mb-4"
        />

        <v-alert v-if="localErrorPass" type="warning" variant="tonal" class="mb-4">
          {{ localErrorPass }}
        </v-alert>

        <v-alert v-if="successMessagePass" type="success" variant="tonal" class="mb-4">
          {{ successMessagePass }}
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
      //TO DO:
      //be able to set college.

import { ref, computed, onMounted} from "vue";
import { useAuthStore } from "../stores/authStore";

const auth = useAuthStore();
const user = computed(() => auth.user)
const email = ref(user.value?.email??"");
const username = ref(user.value?.displayName??"");
const header = ref(user.value?.displayName??"");
const college = ref("")

onMounted(async () => {
  college.value = await auth.getCollege() ?? ""
})
const newPassword = ref("");
const ePassword = ref("");
const confirmNewPassword = ref("");
const oldPassword = ref("")
const localError = ref("");
const localErrorPass = ref("");
const successMessage = ref("");
const successMessagePass = ref("");

const emailChanged = computed(() => {
  return email.value !== (user.value?.email);
});


const editAccount = async () => {
    localError.value = "";
    successMessage.value = "";

    if(email.value == user.value?.email && 
    username.value == user.value?.displayName &&
    college.value == await auth.getCollege()){
      localError.value = "No value was changed.";
      return;
    }

    if (email.value !== user.value?.email && !ePassword.value) {
        localError.value = "Please enter your password to change email.";
        return;
    }

    try {
      await auth.editAccount(email.value, username.value, college.value, ePassword.value);
      if (email.value !== user.value?.email){
        successMessage.value = "A verification E-mail has been sent to your new account E-mail. Click on the link provided to finalize the change."
        email.value = user.value?.email??"";
        ePassword.value = "";
      } else{
        successMessage.value = "Your account data has been changed"
      }
      header.value = user.value?.displayName??"";
    } catch {
      //store already handles firebase errors
    }
};

const changePassword = async () => {
  localErrorPass.value = "";
  if(!newPassword.value || !confirmNewPassword.value || !oldPassword.value){
    localErrorPass.value = "all feilds are required to change your password.";
    return;
  }

  if (newPassword.value !== confirmNewPassword.value) {
    localErrorPass.value = "Passwords do not match.";
    return;
  }

  if (newPassword.value == oldPassword.value) {
    localErrorPass.value = "new and old passwords are the same";
    return;
  }

  try {
    await auth.changePassword(newPassword.value, oldPassword.value);
    newPassword.value = "";
    oldPassword.value = "";
    confirmNewPassword.value = "";
    successMessagePass.value = "Password changed"
  } catch {
     //store already handles firebase errors
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
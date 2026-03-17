// src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth } from '../firebase/firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const initialized = ref(false)
  const error = ref('')

  const isAuthenticated = computed(() => !!user.value)

  function initAuth() {
    onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser
      initialized.value = true
    })
  }

  async function login(email: string, password: string) {
    loading.value = true
    error.value = ''

    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      error.value = mapFirebaseError(err?.code)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function signup(email: string, password: string) {
    loading.value = true
    error.value = ''

    try {
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      error.value = mapFirebaseError(err?.code)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await signOut(auth)
  }

  function mapFirebaseError(code?: string) {
    switch (code) {
      case 'auth/invalid-email':
        return 'Invalid email address.'
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password.'
      case 'auth/email-already-in-use':
        return 'That email is already in use.'
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.'
      default:
        return 'Something went wrong. Please try again.'
    }
  }

  return {
    user,
    loading,
    initialized,
    error,
    isAuthenticated,
    initAuth,
    login,
    signup,
    logout,
  }
})
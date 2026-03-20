// src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  updateProfile,
  verifyBeforeUpdateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword
} from 'firebase/auth'
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { auth, db } from '../firebase/firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const initialized = ref(false)
  const error = ref('')
  const showLogoutDialog = ref(false)

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
      if(!password){
        error.value += " Please provide a password."
      }
      if(!email){
        error.value += " Please provide an email."
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  async function signup(email: string, password: string, username: string) {
    loading.value = true
    error.value = ''

    try {
      const newUser = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(newUser.user, {
        displayName: username
      })

      await setDoc(doc(db, "users", newUser.user.uid), {
        email,
        college: "",
      })
    } catch (err: any) {
      error.value = mapFirebaseError(err?.code)
      throw err
    } finally {
      loading.value = false
    }

  }

  async function editAccount(email: string, username: string, college: string, password: string) {
    loading.value = true
    error.value = ''
    try {
      if (auth.currentUser) {
        if (email && auth.currentUser.email && auth.currentUser.email != email){
          const credential = EmailAuthProvider.credential(
            auth.currentUser.email!,
            password
          )
          await reauthenticateWithCredential(auth.currentUser, credential)
          await verifyBeforeUpdateEmail(auth.currentUser, email)
        }
        await updateProfile(auth.currentUser, {
          displayName: username
        })
        const uid = auth.currentUser.uid;

        await updateDoc(doc(db, "users", uid), {
          email,
          college
        });
        

      }
      
    } catch (err: any) {
      error.value = mapFirebaseError(err?.code)
      throw err
    } finally {
      loading.value = false
    }

  }

  async function changePassword( newPassword: string, oldPassword: string) {
    loading.value = true
    error.value = ''
    try {
      if (auth.currentUser) {
          const credential = EmailAuthProvider.credential(
            auth.currentUser.email!,
            oldPassword
          )
          await reauthenticateWithCredential(auth.currentUser, credential)
          await updatePassword(auth.currentUser, newPassword)
      }
      
    } catch (err: any) {
      error.value = mapFirebaseError(err?.code)
      throw err
    } finally {
      loading.value = false
    }

  }


  async function logout() {
    await signOut(auth)
    showLogoutDialog.value = true;

  }

  async function getCollege(){
    loading.value = true
    error.value = ''
    try {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const table = await getDoc(doc(db, "users", uid));

        if (table.exists()) {
          return table.data().college;
        }
      }
    }catch (err: any) {
      error.value = mapFirebaseError(err?.code)
      throw err
    } finally {
      loading.value = false
    }
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
    showLogoutDialog,
    initAuth,
    login,
    signup,
    logout,
    editAccount,
    changePassword,
    getCollege,
  }
})
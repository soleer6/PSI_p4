import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // Token en MEMORIA — no se persiste en localStorage (requisito P4).
  const token = ref(null)
  const username = ref(null)

  const isAuthenticated = computed(() => Boolean(token.value))

  async function login(credentials) {
    const data = await apiFetch('/token/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    token.value = data.auth_token
    username.value = credentials.username
    return data
  }

  async function logout() {
    if (!token.value) return
    try {
      await apiFetch('/token/logout/', {
        method: 'POST',
        parseJson: false,
      })
    } catch {
      // Aunque falle el backend, limpiamos sesión localmente.
    } finally {
      token.value = null
      username.value = null
    }
  }

  function clear() {
    token.value = null
    username.value = null
  }

  return {
    token,
    username,
    isAuthenticated,
    login,
    logout,
    clear,
  }
})

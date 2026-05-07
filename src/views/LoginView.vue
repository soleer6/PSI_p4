<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/services/api'

defineOptions({ name: 'login-view' })

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const submitting = ref(false)

const auth = useAuthStore()
const router = useRouter()

async function handleSubmit() {
  errorMessage.value = ''
  submitting.value = true
  try {
    await auth.login({
      username: username.value,
      password: password.value,
    })
    router.push({ name: 'home' })
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 400 || err.status === 401) {
        errorMessage.value = 'Usuario o contraseña incorrectos. Inténtalo de nuevo.'
      } else {
        errorMessage.value = `Error al iniciar sesión (HTTP ${err.status}).`
      }
    } else {
      errorMessage.value = 'No se pudo contactar con el servidor.'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="row justify-content-center" data-cy="login-view">
    <div class="col-md-6 col-lg-4">
      <div class="card shadow-sm">
        <div class="card-body">
          <h1 class="h4 mb-3">Iniciar sesión</h1>
          <form
            method="post"
            action="/log-in"
            data-cy="login-form"
            @submit.prevent="handleSubmit"
          >
            <div class="mb-3">
              <label for="username" class="form-label">Usuario</label>
              <input
                id="username"
                v-model="username"
                name="username"
                type="text"
                class="form-control"
                autocomplete="username"
                required
                data-cy="username"
              >
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Contraseña</label>
              <input
                id="password"
                v-model="password"
                name="password"
                type="password"
                class="form-control"
                autocomplete="current-password"
                required
                data-cy="password"
              >
            </div>
            <div
              v-if="errorMessage"
              class="alert alert-danger"
              data-cy="login-error"
            >
              {{ errorMessage }}
            </div>
            <button
              type="submit"
              class="btn btn-primary w-100"
              :disabled="submitting"
              data-cy="login-button"
            >
              {{ submitting ? 'Entrando…' : 'Entrar' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineOptions({ name: 'logout-view' })

const REDIRECT_SECONDS = 5

const router = useRouter()
const auth = useAuthStore()

const countdown = ref(REDIRECT_SECONDS)
const status = ref('closing')
let tickTimer = null
let redirectTimer = null

onMounted(async () => {
  await auth.logout()
  status.value = 'closed'

  tickTimer = setInterval(() => {
    if (countdown.value > 0) countdown.value -= 1
  }, 1000)

  redirectTimer = setTimeout(() => {
    router.push({ name: 'home' })
  }, REDIRECT_SECONDS * 1000)
})

onUnmounted(() => {
  if (tickTimer) clearInterval(tickTimer)
  if (redirectTimer) clearTimeout(redirectTimer)
})
</script>

<template>
  <section class="text-center py-5" data-cy="logout-view">
    <div class="mx-auto" style="max-width: 480px">
      <h1 class="h3 mb-3">Cerrando sesión</h1>

      <p v-if="status === 'closing'" class="text-muted" data-cy="logout-status">
        Cerrando tu sesión…
      </p>
      <div
        v-else
        class="alert alert-success"
        data-cy="logout-status"
      >
        Sesión cerrada correctamente. Serás redirigido en
        <strong data-cy="logout-countdown">{{ countdown }}</strong>
        segundos.
      </div>

      <RouterLink to="/" class="btn btn-outline-primary" data-cy="logout-home-now">
        Ir al inicio ahora
      </RouterLink>
    </div>
  </section>
</template>

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './assets/app.css'

import App from './App.vue'
import router from './router'
import { _registerTokenGetter } from './services/api'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Registrar getter de token en memoria (sin localStorage).
// Se llama aquí, después de createPinia(), para que useAuthStore() sea accesible.
_registerTokenGetter(() => {
  try {
    return useAuthStore().token || ''
  } catch {
    return ''
  }
})

// Devtools activos en producción (criterio de evaluación P4).
app.config.devtools = true

app.mount('#app')

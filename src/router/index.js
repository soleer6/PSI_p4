import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import LogoutView from '@/views/LogoutView.vue'
import PlayView from '@/views/PlayView.vue'
import FaqView from '@/views/FaqView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const SITE_NAME = 'SongProject'
const BASE_DESCRIPTION =
  'SongProject — aprende idiomas rellenando los huecos de letras de canciones al ritmo de la música.'
const BASE_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'Inicio',
        description: BASE_DESCRIPTION,
      },
    },
    {
      path: '/log-in',
      name: 'login',
      component: LoginView,
      meta: {
        hideIfAuth: true,
        title: 'Iniciar sesión',
        description: 'Inicia sesión en SongProject para guardar tu progreso.',
      },
    },
    {
      path: '/log-out',
      name: 'logout',
      component: LogoutView,
      meta: {
        requiresAuth: true,
        title: 'Cerrando sesión',
        description: 'Cerrando tu sesión en SongProject.',
        robots: 'noindex, nofollow',
      },
    },
    {
      path: '/songs/:id',
      name: 'play',
      component: PlayView,
      props: true,
      meta: {
        title: 'Jugar canción',
        description: 'Rellena los huecos de la letra mientras suena la canción.',
      },
    },
    {
      path: '/faq',
      name: 'faq',
      component: FaqView,
      meta: {
        title: 'Preguntas frecuentes',
        description: 'Resuelve tus dudas sobre cómo funciona SongProject.',
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
      meta: {
        title: 'Página no encontrada',
        description: 'La página solicitada no existe en SongProject.',
        robots: 'noindex, follow',
      },
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' }
  }
  if (to.meta.hideIfAuth && auth.isAuthenticated) {
    return { name: 'home' }
  }
  return true
})

function setMeta(name, value, attr = 'name') {
  if (typeof document === 'undefined') return
  let el = document.head.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

function setLink(rel, href) {
  if (typeof document === 'undefined') return
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

router.afterEach((to) => {
  const pageTitle = to.meta.title || 'Aprende idiomas cantando'
  const fullTitle = `${pageTitle} · ${SITE_NAME}`
  const description = to.meta.description || BASE_DESCRIPTION
  const robots = to.meta.robots || 'index, follow'
  const canonical = `${BASE_URL}${to.fullPath}`

  if (typeof document !== 'undefined') {
    document.title = fullTitle
  }

  setMeta('description', description)
  setMeta('robots', robots)
  setMeta('og:title', fullTitle, 'property')
  setMeta('og:description', description, 'property')
  setMeta('og:url', canonical, 'property')
  setMeta('twitter:title', fullTitle)
  setMeta('twitter:description', description)
  setLink('canonical', canonical)
})

export default router

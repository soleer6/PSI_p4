<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

defineOptions({ name: 'app-root' })

const auth = useAuthStore()
const { isAuthenticated, username } = storeToRefs(auth)
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <a class="skip-link" href="#main-content">Saltar al contenido</a>

    <nav
      class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm"
      data-cy="main-nav"
    >
      <div class="container">
        <RouterLink to="/" class="navbar-brand fw-bold" data-cy="nav-brand">
          SongProject
        </RouterLink>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Abrir menú principal"
        >
          <span class="navbar-toggler-icon" />
        </button>
        <div id="mainNav" class="collapse navbar-collapse">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <RouterLink to="/" class="nav-link" data-cy="home-cypress-test">
                Inicio
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/faq" class="nav-link" data-cy="nav-faq">
                FAQ
              </RouterLink>
            </li>
          </ul>
          <ul class="navbar-nav">
            <li v-if="!isAuthenticated" class="nav-item">
              <RouterLink to="/log-in" class="nav-link" data-cy="login-cypress-test">
                Log in
              </RouterLink>
            </li>
            <template v-else>
              <li class="nav-item">
                <span class="nav-link disabled" data-cy="nav-username">
                  {{ username }}
                </span>
              </li>
              <li class="nav-item">
                <RouterLink to="/log-out" class="nav-link" data-cy="nav-logout">
                  Log out
                </RouterLink>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>

    <main
      id="main-content"
      class="container page-container"
      data-cy="main-content"
      tabindex="-1"
    >
      <RouterView />
    </main>

    <footer
      class="bg-light border-top text-center py-3 text-muted small"
      data-cy="main-footer"
    >
      SongProject — Práctica 4 PSI · Pareja 12 · Grupo 2321 · 2026
    </footer>
  </div>
</template>

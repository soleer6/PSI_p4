<script setup>
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark px-3">
    <RouterLink class="navbar-brand" to="/">SongProject</RouterLink>
    <div class="navbar-nav ms-auto d-flex flex-row gap-3">
      <RouterLink class="nav-link" data-cy="home-cypress-test" to="/"
        >Home</RouterLink
      >
      <RouterLink class="nav-link" to="/faq">FAQ</RouterLink>
      <template v-if="auth.token">
        <span class="nav-link text-light">{{ auth.username }}</span>
        <RouterLink class="nav-link" to="/log-out">Logout</RouterLink>
      </template>
      <template v-else>
        <RouterLink class="nav-link" data-cy="login-cypress-test" to="/log-in"
          >Login</RouterLink
        >
      </template>
    </div>
  </nav>
</template>

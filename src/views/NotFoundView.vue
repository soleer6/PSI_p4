<script setup>
defineOptions({ name: 'not-found-view' })
</script>

<template>
  <section class="text-center py-5" data-cy="not-found-view">
    <h1 class="display-1 fw-bold">404</h1>
    <p class="lead">La página que buscas no existe.</p>
    <RouterLink to="/" class="btn btn-primary" data-cy="not-found-home">
      Volver al inicio
    </RouterLink>
  </section>
</template>

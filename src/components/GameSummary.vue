<script setup>
import { computed } from 'vue'

defineOptions({ name: 'game-summary' })

const props = defineProps({
  correctGuesses: {
    type: Number,
    default: 0,
  },
  wrongGuesses: {
    type: Number,
    default: 0,
  },
  totalGaps: {
    type: Number,
    default: 0,
  },
  visible: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['replay', 'home'])

const percent = computed(() => {
  const total = props.correctGuesses + props.wrongGuesses
  if (!total) return 0
  return Math.round((props.correctGuesses / total) * 100)
})
</script>

<template>
  <div
    v-if="visible"
    class="summary-overlay"
    data-cy="summary-modal"
  >
    <div class="summary-card card shadow">
      <div class="card-body text-center">
        <h2 class="h4 mb-3">
          🎉 Partida terminada
        </h2>
        <div class="display-6 mb-3">
          <span class="text-success" data-cy="summary-correct">
            {{ correctGuesses }}
          </span>
          /
          <span class="text-danger" data-cy="summary-wrong">
            {{ wrongGuesses }}
          </span>
        </div>
        <p class="text-muted" data-cy="summary-percent">
          Aciertos: <strong>{{ percent }}%</strong>
          de {{ totalGaps }} huecos
        </p>
        <div class="d-flex gap-2 justify-content-center mt-4">
          <button
            type="button"
            class="btn btn-primary"
            data-cy="summary-replay"
            @click="$emit('replay')"
          >
            Volver a jugar
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary"
            data-cy="summary-home"
            @click="$emit('home')"
          >
            Inicio
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.summary-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1060;
}
.summary-card {
  min-width: 320px;
  max-width: 480px;
  width: 90%;
  background: #fff;
  border-radius: 0.75rem;
}
</style>

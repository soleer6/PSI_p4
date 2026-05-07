<script setup>
defineOptions({ name: 'faq-view' })

const questions = [
  {
    id: 'what-is',
    q: '¿Qué es SongProject?',
    a: 'Una aplicación al estilo LyricsTraining para aprender idiomas rellenando los huecos de las letras de canciones al ritmo de la música.',
  },
  {
    id: 'how-to-play',
    q: '¿Cómo se juega?',
    a: 'Selecciona una canción del listado, pulsa reproducir y escribe en los huecos la palabra que escuchas antes de que la línea termine.',
  },
  {
    id: 'login',
    q: '¿Necesito iniciar sesión?',
    a: 'Sí, para guardar tu progreso y contabilizar aciertos/fallos. El registro lo hace el profesor mediante el admin de Django.',
  },
  {
    id: 'random',
    q: '¿Cómo funciona el botón aleatorio?',
    a: 'Llama al endpoint /songs/random/ que devuelve una canción al azar de la base de datos.',
  },
  {
    id: 'top',
    q: '¿Qué es el Top N?',
    a: 'Un ranking de las N canciones más reproducidas. El contador se incrementa cada vez que juegas una canción.',
  },
]
</script>

<template>
  <section data-cy="faq-view">
    <h1 class="h3 mb-4">Preguntas frecuentes</h1>

    <div id="faqAccordion" class="accordion" data-cy="faq-accordion">
      <div
        v-for="(item, idx) in questions"
        :key="item.id"
        class="accordion-item"
      >
        <h2 :id="`faq-heading-${item.id}`" class="accordion-header">
          <button
            :class="['accordion-button', idx === 0 ? '' : 'collapsed']"
            type="button"
            data-bs-toggle="collapse"
            :data-bs-target="`#faq-collapse-${item.id}`"
            :aria-expanded="idx === 0 ? 'true' : 'false'"
            :aria-controls="`faq-collapse-${item.id}`"
            :data-cy="`faq-q-${item.id}`"
          >
            {{ item.q }}
          </button>
        </h2>
        <div
          :id="`faq-collapse-${item.id}`"
          :class="['accordion-collapse collapse', idx === 0 ? 'show' : '']"
          :aria-labelledby="`faq-heading-${item.id}`"
          data-bs-parent="#faqAccordion"
        >
          <div class="accordion-body" :data-cy="`faq-a-${item.id}`">
            {{ item.a }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

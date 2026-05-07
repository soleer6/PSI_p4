<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { mediaUrl } from '@/services/api'

defineOptions({ name: 'song-card' })

const props = defineProps({
  song: {
    type: Object,
    required: true,
  },
  useTitleAsCy: {
    type: Boolean,
    default: false,
  },
})

const router = useRouter()

const coverSrc = computed(() => mediaUrl(props.song.background_image))

const cardCy = computed(() =>
  props.useTitleAsCy ? props.song.title : `song-card-${props.song.id}`
)

function play() {
  router.push({ name: 'play', params: { id: props.song.id } })
}
</script>

<template>
  <article
    class="card song-card h-100 shadow-sm"
    :data-cy="cardCy"
    @click="play"
  >
    <img
      class="cover"
      :src="coverSrc"
      :alt="`Portada de ${song.title}`"
      loading="lazy"
      decoding="async"
      :data-cy="`song-cover-${song.id}`"
    >
    <div class="card-body">
      <h3
        class="card-title h5 mb-1"
        :data-cy="`song-title-${song.id}`"
      >
        {{ song.title }}
      </h3>
      <p
        class="card-text text-muted small mb-2"
        :data-cy="`song-artist-${song.id}`"
      >
        {{ song.artist }}
      </p>
      <div class="d-flex gap-2 flex-wrap mb-3">
        <span
          class="badge text-bg-secondary"
          :data-cy="`song-language-${song.id}`"
        >
          {{ song.language }}
        </span>
        <span
          class="badge text-bg-info"
          :data-cy="`song-category-${song.id}`"
        >
          {{ song.category }}
        </span>
        <span
          class="badge text-bg-warning"
          :data-cy="`song-plays-${song.id}`"
        >
          ▶ {{ song.number_times_played }}
        </span>
      </div>
      <button
        type="button"
        class="btn btn-primary btn-sm w-100"
        :data-cy="`play-song-${song.id}`"
        @click.stop="play"
      >
        Jugar
      </button>
    </div>
  </article>
</template>

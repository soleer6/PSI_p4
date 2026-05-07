<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSongsStore } from '@/stores/songs'
import SongCard from '@/components/SongCard.vue'

defineOptions({ name: 'home-view' })

const songsStore = useSongsStore()
const router = useRouter()
const {
  list,
  page,
  count,
  next,
  previous,
  loading,
  error,
  topList,
  searchResults,
  searchQuery,
  searchLoading,
  searchError,
} = storeToRefs(songsStore)

const pageSize = 3
const totalPages = computed(() =>
  count.value ? Math.ceil(count.value / pageSize) : 1
)

const topN = ref(3)
const searchInput = ref('')

onMounted(async () => {
  await Promise.all([
    songsStore.fetchPage(1),
    songsStore.fetchTop(topN.value),
  ])
})

function prevPage() {
  if (previous.value) songsStore.fetchPage(page.value - 1)
}
function nextPage() {
  if (next.value) songsStore.fetchPage(page.value + 1)
}

async function handleSearch() {
  await songsStore.search(searchInput.value.trim())
}

async function handleTopChange() {
  const n = Math.max(1, Number(topN.value) || 3)
  topN.value = n
  await songsStore.fetchTop(n)
}

async function handleRandom() {
  const song = await songsStore.fetchRandom()
  if (song && song.id) {
    router.push({ name: 'play', params: { id: song.id } })
  }
}
</script>

<template>
  <section class="home-view" data-cy="home-view">
    <div class="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-2">
      <h1 class="h3 mb-0">Canciones</h1>
      <button
        type="button"
        class="btn btn-warning"
        data-cy="random-btn"
        @click="handleRandom"
      >
        🎲 Random song
      </button>
    </div>

    <!-- Búsqueda -->
    <div class="card shadow-sm mb-4" data-cy="search-section">
      <div class="card-body">
        <label for="search-input" class="form-label h5 mb-3 d-block">
          Buscar por título
        </label>
        <form class="d-flex gap-2" data-cy="search-form" @submit.prevent="handleSearch">
          <input
            id="search-input"
            v-model="searchInput"
            type="search"
            class="form-control"
            placeholder="Ej: Here In The Real World"
            aria-label="Buscar canciones por título"
            data-cy="search_text"
          >
          <button
            type="submit"
            class="btn btn-outline-primary"
            data-cy="search_button"
          >
            Buscar
          </button>
        </form>
        <div v-if="searchLoading" class="text-muted mt-3">Buscando…</div>
        <div
          v-else-if="searchError"
          class="alert alert-warning mt-3 mb-0"
          data-cy="search-error"
        >
          {{ searchError }}
        </div>
        <div
          v-else-if="searchQuery && searchResults.length"
          class="row g-3 mt-2"
          data-cy="search-results"
        >
          <div
            v-for="song in searchResults"
            :key="`search-${song.id}`"
            class="col-sm-6 col-md-4"
          >
            <SongCard :song="song" :use-title-as-cy="true" />
          </div>
        </div>
        <div
          v-else-if="searchQuery && !searchResults.length"
          class="alert alert-info mt-3 mb-0"
          data-cy="search-empty"
        >
          No se encontraron canciones para <strong>"{{ searchQuery }}"</strong>.
        </div>
      </div>
    </div>

    <!-- Top N -->
    <div class="card shadow-sm mb-4" data-cy="top-section">
      <div class="card-body">
        <div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
          <h2 class="h5 mb-0 me-auto">Top canciones más jugadas</h2>
          <label for="top-n" class="form-label mb-0 small">Mostrar</label>
          <input
            id="top-n"
            v-model.number="topN"
            type="number"
            min="1"
            max="50"
            class="form-control form-control-sm"
            style="width: 80px"
            aria-label="Número de canciones a mostrar en el top"
            title="Número de canciones a mostrar"
            data-cy="top-n-input"
            @change="handleTopChange"
          >
          <span class="form-label mb-0 small text-muted">canciones</span>
        </div>
        <div v-if="topList.length === 0" class="text-muted" data-cy="top-empty">
          Aún no hay canciones en el top.
        </div>
        <div v-else class="row g-3" data-cy="top-results">
          <div
            v-for="song in topList"
            :key="`top-${song.id}`"
            class="col-sm-6 col-md-4"
          >
            <SongCard :song="song" />
          </div>
        </div>
      </div>
    </div>

    <!-- Listado paginado -->
    <div class="card shadow-sm" data-cy="list-section">
      <div class="card-body">
        <h2 class="h5 mb-3">Todas las canciones</h2>

        <div
          v-if="loading"
          class="row g-3"
          data-cy="list-loading"
          aria-live="polite"
          aria-busy="true"
        >
          <div v-for="n in 3" :key="`skeleton-${n}`" class="col-sm-6 col-md-4">
            <div class="card song-card h-100 shadow-sm skeleton-card">
              <div class="cover skeleton-shimmer" />
              <div class="card-body">
                <div class="skeleton-line skeleton-shimmer mb-2" />
                <div class="skeleton-line skeleton-shimmer mb-2" style="width: 60%" />
                <div class="skeleton-line-sm skeleton-shimmer" />
              </div>
            </div>
          </div>
          <p class="text-center text-muted small mt-2 mb-0">
            Cargando canciones… (primer arranque puede tardar unos segundos en Render free tier)
          </p>
        </div>
        <div v-else-if="error" class="alert alert-danger" data-cy="list-error">
          {{ error }}
        </div>
        <div v-else-if="list.length === 0" class="text-muted" data-cy="list-empty">
          No hay canciones disponibles.
        </div>
        <div v-else class="row g-3" data-cy="list-results">
          <div
            v-for="song in list"
            :key="`list-${song.id}`"
            class="col-sm-6 col-md-4"
          >
            <SongCard :song="song" />
          </div>
        </div>

        <nav
          v-if="count > pageSize"
          class="mt-4 d-flex align-items-center justify-content-between"
          data-cy="list-pagination"
        >
          <button
            type="button"
            class="btn btn-outline-secondary"
            :disabled="!previous"
            data-cy="page-prev"
            @click="prevPage"
          >
            ← Anterior
          </button>
          <span data-cy="page-info">
            Página <strong>{{ page }}</strong> de <strong>{{ totalPages }}</strong>
          </span>
          <button
            type="button"
            class="btn btn-outline-secondary"
            :disabled="!next"
            data-cy="page-next"
            @click="nextPage"
          >
            Siguiente →
          </button>
        </nav>
      </div>
    </div>
  </section>
</template>

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from '@/services/api'

export const useSongsStore = defineStore('songs', () => {
  const list = ref([])
  const page = ref(1)
  const count = ref(0)
  const next = ref(null)
  const previous = ref(null)
  const loading = ref(false)
  const error = ref('')

  const topList = ref([])
  const searchResults = ref([])
  const searchQuery = ref('')
  const searchLoading = ref(false)
  const searchError = ref('')
  const randomSong = ref(null)

  async function fetchPage(p = 1) {
    loading.value = true
    error.value = ''
    try {
      const data = await apiFetch(`/songs/?page=${p}`)
      list.value = data.results || []
      count.value = data.count || 0
      next.value = data.next
      previous.value = data.previous
      page.value = p
    } catch (e) {
      error.value = 'No se pudieron cargar las canciones.'
      list.value = []
      count.value = 0
      next.value = null
      previous.value = null
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchTop(n = 3) {
    try {
      const data = await apiFetch(`/songs/top/?n=${n}`)
      topList.value = Array.isArray(data) ? data : []
    } catch (e) {
      topList.value = []
      console.error(e)
    }
  }

  async function fetchRandom() {
    try {
      const data = await apiFetch('/songs/random/')
      randomSong.value = data
      return data
    } catch (e) {
      randomSong.value = null
      console.error(e)
      return null
    }
  }

  async function search(query) {
    searchQuery.value = query
    if (!query || !query.trim()) {
      searchResults.value = []
      searchError.value = ''
      return
    }
    searchLoading.value = true
    searchError.value = ''
    try {
      const data = await apiFetch(
        `/songs/search/?title=${encodeURIComponent(query)}`
      )
      searchResults.value = Array.isArray(data) ? data : []
    } catch (e) {
      searchResults.value = []
      if (e.status === 404) {
        searchError.value = 'No se encontraron canciones con ese título.'
      } else {
        searchError.value = 'Error al buscar canciones.'
      }
    } finally {
      searchLoading.value = false
    }
  }

  async function fetchById(id) {
    return apiFetch(`/songs/${id}/`)
  }

  return {
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
    randomSong,
    fetchPage,
    fetchTop,
    fetchRandom,
    search,
    fetchById,
  }
})

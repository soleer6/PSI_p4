<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const API = import.meta.env.VITE_API_BASE_URL;
const router = useRouter();

const topSongs = ref([]);
const searchText = ref("");
const searchResults = ref([]);
const searchError = ref("");
const loadingTop = ref(true);

onMounted(async () => {
  try {
    const res = await fetch(`${API}/songs/top/?n=3`);
    const data = await res.json();
    topSongs.value = data;
  } finally {
    loadingTop.value = false;
  }
});

async function search() {
  searchError.value = "";
  searchResults.value = [];
  if (!searchText.value.trim()) return;
  try {
    const res = await fetch(
      `${API}/songs/search/?title=${encodeURIComponent(searchText.value)}`
    );
    if (res.status === 404) {
      searchError.value = "No songs found.";
      return;
    }
    if (!res.ok) {
      searchError.value = "Search error.";
      return;
    }
    const data = await res.json();
    if (Array.isArray(data)) {
      searchResults.value = data;
    } else if (data.results !== undefined) {
      searchResults.value = Array.isArray(data.results)
        ? data.results
        : [data.results];
    } else {
      searchResults.value = [data];
    }
  } catch {
    searchError.value = "Network error.";
  }
}

async function playRandom() {
  const res = await fetch(`${API}/songs/random/`);
  const data = await res.json();
  router.push({ name: "play", params: { id: data.id } });
}

function playSong(id) {
  router.push({ name: "play", params: { id } });
}
</script>

<template>
  <div>
    <h1 class="mb-4">SongProject</h1>

    <section class="mb-5">
      <h2 class="h4 mb-3">Top Songs</h2>
      <div v-if="loadingTop" class="text-muted">Loading…</div>
      <ul v-else class="list-group mb-3">
        <li
          v-for="song in topSongs"
          :key="song.id"
          class="list-group-item list-group-item-action"
          style="cursor: pointer"
          :data-cy="song.title"
          @click="playSong(song.id)"
        >
          {{ song.title }} — {{ song.artist }}
        </li>
      </ul>
      <button class="btn btn-secondary" @click="playRandom">Random song</button>
    </section>

    <section>
      <h2 class="h4 mb-3">Search</h2>
      <div class="input-group mb-3">
        <input
          v-model="searchText"
          class="form-control"
          data-cy="search_text"
          placeholder="Song title…"
          @keyup.enter="search"
        />
        <button class="btn btn-primary" data-cy="search_button" @click="search">
          Search
        </button>
      </div>
      <div v-if="searchError" class="text-danger">{{ searchError }}</div>
      <ul v-if="searchResults.length" class="list-group">
        <li
          v-for="song in searchResults"
          :key="song.id"
          class="list-group-item list-group-item-action"
          style="cursor: pointer"
          :data-cy="song.title"
          @click="playSong(song.id)"
        >
          {{ song.title }} — {{ song.artist }}
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AudioPlayer from "@/components/AudioPlayer.vue";
import LyricsDisplay from "@/components/LyricsDisplay.vue";

const API = import.meta.env.VITE_API_BASE_URL;
const route = useRoute();
const auth = useAuthStore();

const song = ref(null);
const lrcContent = ref(null);
const loading = ref(true);
const error = ref("");
const stopAudio = ref(false);
const audioTime = ref(0);

onMounted(async () => {
  try {
    const res = await fetch(`${API}/songs/${route.params.id}/`);
    if (!res.ok) throw new Error("Song not found");
    const data = await res.json();
    song.value = data;

    if (data.lrc_file) {
      const lrcRes = await fetch(data.lrc_file);
      if (lrcRes.ok) lrcContent.value = await lrcRes.text();
    }
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});

function onTimeUpdate(t) {
  audioTime.value = t;
}

function onStopAudio(val) {
  stopAudio.value = val;
}

function onStartAudio() {
  stopAudio.value = false;
}

async function onSummary({ correct, wrong }) {
  if (auth.token && song.value) {
    try {
      await fetch(`${API}/songusers/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${auth.token}`,
        },
        body: JSON.stringify({
          song: song.value.id,
          correct_guesses: correct,
          wrong_guesses: wrong,
        }),
      });
    } catch {
      // best-effort
    }
  }
}
</script>

<template>
  <div>
    <div v-if="loading" class="text-muted">Loading song…</div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    <template v-else-if="song">
      <h1 class="mb-1">{{ song.title }}</h1>
      <p class="text-muted mb-3">{{ song.artist }}</p>

      <AudioPlayer
        :song="song"
        :stopAudio="stopAudio"
        @onTimeUpdate="onTimeUpdate"
      />

      <LyricsDisplay
        :song="song"
        :lrcContent="lrcContent"
        :onTimeUpdate="audioTime"
        @stopAudio="onStopAudio"
        @startAudio="onStartAudio"
        @summary="onSummary"
      />
    </template>
  </div>
</template>

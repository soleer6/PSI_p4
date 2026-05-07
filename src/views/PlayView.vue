<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSongsStore } from '@/stores/songs'
import { useAuthStore } from '@/stores/auth'
import { apiFetch, mediaUrl } from '@/services/api'
import { parseLrc, wordsEqual } from '@/utils/lrcParser'
import AudioPlayer from '@/components/AudioPlayer.vue'
import LyricsDisplay from '@/components/LyricsDisplay.vue'
import GameSummary from '@/components/GameSummary.vue'

defineOptions({ name: 'play-view' })

const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
})

const router = useRouter()
const songsStore = useSongsStore()
const authStore = useAuthStore()

const playerRef = ref(null)
const song = ref(null)
const lyrics = ref({ metadata: {}, lines: [] })
const loading = ref(true)
const error = ref('')
const currentTime = ref(0)

// Mapa lineIdx -> { value, status }
const gapState = reactive({})
const correctGuesses = ref(0)
const wrongGuesses = ref(0)
const summaryVisible = ref(false)
const submitMessage = ref('')

const wrongCountedGaps = new Set()

const pausedForGap = ref(false)
const pausedGapIdx = ref(-1)

const totalGaps = computed(
  () => lyrics.value.lines.filter((l) => l.gap != null).length
)

const audioSrc = computed(() =>
  song.value ? mediaUrl(song.value.audio_file) : ''
)

const coverStyle = computed(() => {
  if (!song.value || !song.value.background_image) return {}
  return {
    backgroundImage: `url('${mediaUrl(song.value.background_image)}')`,
  }
})

async function loadSong() {
  loading.value = true
  error.value = ''
  pausedForGap.value = false
  pausedGapIdx.value = -1
  try {
    const data = await songsStore.fetchById(props.id)
    song.value = data

    const lrcUrl = mediaUrl(data.lrc_file)
    const resp = await fetch(lrcUrl)
    if (!resp.ok) throw new Error(`LRC HTTP ${resp.status}`)
    const text = await resp.text()
    lyrics.value = parseLrc(text)

    Object.keys(gapState).forEach((k) => delete gapState[k])
    lyrics.value.lines.forEach((line, idx) => {
      if (line.gap != null) {
        gapState[idx] = { value: '', status: 'pending' }
      }
    })
    correctGuesses.value = 0
    wrongGuesses.value = 0
    wrongCountedGaps.clear()
    summaryVisible.value = false
  } catch (e) {
    console.error(e)
    error.value = 'No se pudo cargar la cancion.'
  } finally {
    loading.value = false
  }
}

function audioEl() {
  return playerRef.value?.audioRef ?? null
}

function pauseAudio() {
  const el = audioEl()
  if (el && !el.paused) el.pause()
}

function playAudio() {
  const el = audioEl()
  if (!el) return
  el.play().catch(() => {})
}

function handleTimeUpdate(t) {
  currentTime.value = t
  if (pausedForGap.value || summaryVisible.value) return

  const lines = lyrics.value.lines
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].gap == null) continue
    const gs = gapState[i]
    if (!gs || gs.status === 'correct' || gs.status === 'skipped') continue

    const endTime = i + 1 < lines.length ? lines[i + 1].time : Infinity

    if (t >= endTime) {
      pauseAudio()
      pausedForGap.value = true
      pausedGapIdx.value = i
      return
    }
  }
}

function handleAudioPlay() {
  if (pausedForGap.value) {
    pauseAudio()
  }
}

function allGapsResolved() {
  return lyrics.value.lines.every((line, idx) => {
    if (line.gap == null) return true
    const gs = gapState[idx]
    return gs && (gs.status === 'correct' || gs.status === 'skipped')
  })
}

function audioHasEnded() {
  const el = playerRef.value?.audioRef
  return !!(el && (el.ended || (el.duration && el.currentTime >= el.duration - 0.05)))
}

function onGapSubmit({ lineIdx, correctWord }) {
  const current = gapState[lineIdx]
  if (!current || current.status === 'correct' || current.status === 'skipped') return

  const value = (current.value ?? '').trim()
  if (!value) return

  if (wordsEqual(value, correctWord)) {
    gapState[lineIdx] = { value: correctWord, status: 'correct' }
    correctGuesses.value += 1

    if (pausedForGap.value && pausedGapIdx.value === lineIdx) {
      pausedForGap.value = false
      pausedGapIdx.value = -1
      if (audioHasEnded() && allGapsResolved()) {
        finishGame()
      } else {
        playAudio()
      }
    } else if (audioHasEnded() && allGapsResolved()) {
      finishGame()
    }
  } else {
    gapState[lineIdx] = { value, status: 'wrong' }
    wrongCountedGaps.add(lineIdx)
    wrongGuesses.value += 1

    pauseAudio()
    pausedForGap.value = true
    pausedGapIdx.value = lineIdx
  }
}

function onGapInput({ lineIdx, value }) {
  if (!gapState[lineIdx]) {
    gapState[lineIdx] = { value: '', status: 'pending' }
  }
  gapState[lineIdx].value = value
  if (gapState[lineIdx].status === 'wrong') {
    gapState[lineIdx].status = 'pending'
  }
}

function skipCurrentGap() {
  if (summaryVisible.value) return

  let targetIdx = pausedGapIdx.value
  if (targetIdx < 0) {
    const firstPending = lyrics.value.lines.findIndex((line, i) => {
      if (line.gap == null) return false
      const gs = gapState[i]
      return !gs || gs.status === 'pending' || gs.status === 'wrong'
    })
    if (firstPending < 0) return
    targetIdx = firstPending
  }

  const line = lyrics.value.lines[targetIdx]
  if (!line) return

  gapState[targetIdx] = { value: line.gap, status: 'skipped' }
  wrongCountedGaps.add(targetIdx)
  wrongGuesses.value += 1

  const wasPaused = pausedForGap.value
  pausedForGap.value = false
  pausedGapIdx.value = -1

  if (audioHasEnded() && allGapsResolved()) {
    finishGame()
    return
  }
  if (allGapsResolved()) {
    if (wasPaused) playAudio()
    return
  }

  const el = audioEl()
  if (wasPaused || (el && el.paused)) {
    playAudio()
  }
}

function onAudioEnded() {
  const pendingEntry = Object.entries(gapState).find(
    ([, g]) => g.status === 'pending' || g.status === 'wrong'
  )
  if (pendingEntry) {
    const idx = Number(pendingEntry[0])
    pausedForGap.value = true
    pausedGapIdx.value = idx
    return
  }
  finishGame()
}

async function finishGame() {
  lyrics.value.lines.forEach((line, idx) => {
    if (line.gap == null) return
    const gs = gapState[idx]
    if (gs && gs.status !== 'correct' && gs.status !== 'skipped') {
      gapState[idx] = { value: line.gap, status: 'skipped' }
      wrongCountedGaps.add(idx)
      wrongGuesses.value += 1
    }
  })

  pauseAudio()
  pausedForGap.value = false
  pausedGapIdx.value = -1

  summaryVisible.value = true
  submitMessage.value = ''
  if (!authStore.isAuthenticated) {
    submitMessage.value = 'No has iniciado sesion; el resultado no se ha guardado.'
    return
  }
  try {
    await apiFetch('/songusers/', {
      method: 'POST',
      body: JSON.stringify({
        song: Number(props.id),
        correct_guesses: correctGuesses.value,
        wrong_guesses: wrongGuesses.value,
      }),
    })
    submitMessage.value = 'Resultado guardado correctamente.'
  } catch (e) {
    console.error(e)
    submitMessage.value = 'No se pudo guardar el resultado en el servidor.'
  }
}

function replay() {
  loadSong()
}

function goHome() {
  router.push({ name: 'home' })
}

onMounted(loadSong)
watch(() => props.id, loadSong)
</script>

<template>
  <section class="play-view" data-cy="play-view">
    <div v-if="loading" class="text-muted" data-cy="play-loading">
      Cargando cancion...
    </div>

    <div v-else-if="error" class="alert alert-danger" data-cy="play-error">
      {{ error }}
    </div>

    <div v-else-if="song" class="row g-4">
      <div class="col-md-5">
        <div
          class="cover song-card"
          :style="coverStyle"
          style="border-radius: 0.75rem"
          data-cy="play-cover"
        />
        <h1 class="h4 mt-3 mb-1" data-cy="play-title">
          {{ song.title }}
        </h1>
        <p class="text-muted mb-3" data-cy="play-artist">
          {{ song.artist }}
        </p>

        <AudioPlayer
          ref="playerRef"
          :src="audioSrc"
          data-cy="play-audio"
          @timeupdate="handleTimeUpdate"
          @ended="onAudioEnded"
          @play="handleAudioPlay"
        />

        <div
          v-if="pausedForGap"
          class="alert alert-warning mt-2 mb-0 py-2 px-3 small"
          data-cy="paused-banner"
          role="status"
          aria-live="polite"
        >
          <strong>⏸ Pausado:</strong>
          escribe la palabra y pulsa <kbd>Enter</kbd>,
          o pulsa <strong>Saltar palabra</strong> para continuar.
        </div>

        <div class="mt-3 d-flex gap-2 flex-wrap">
          <button
            type="button"
            class="btn btn-outline-warning"
            data-cy="skip"
            @click="skipCurrentGap"
          >
            Saltar palabra
          </button>
          <button
            type="button"
            class="btn btn-success"
            data-cy="finish-btn"
            @click="finishGame"
          >
            Terminar y enviar
          </button>
        </div>

        <div class="mt-3 d-flex gap-3" data-cy="play-counters">
          <span class="text-success">
            &#10003; <strong data-cy="counter-correct">{{ correctGuesses }}</strong>
          </span>
          <span class="text-danger">
            &#10007; <strong data-cy="counter-wrong">{{ wrongGuesses }}</strong>
          </span>
          <span class="text-muted">
            de <strong data-cy="counter-total">{{ totalGaps }}</strong> huecos
          </span>
        </div>

        <p class="mt-2 small fw-semibold" data-cy="result-text">
          Correct answers: {{ correctGuesses }} - Wrong answers: {{ wrongGuesses }}
        </p>
      </div>

      <div class="col-md-7">
        <LyricsDisplay
          :lines="lyrics.lines"
          :current-time="currentTime"
          :gap-state="gapState"
          :disabled="summaryVisible"
          @gap-input="onGapInput"
          @gap-submit="onGapSubmit"
        />
      </div>
    </div>

    <GameSummary
      :visible="summaryVisible"
      :correct-guesses="correctGuesses"
      :wrong-guesses="wrongGuesses"
      :total-gaps="totalGaps"
      @replay="replay"
      @home="goHome"
    />

    <p
      v-if="submitMessage && summaryVisible"
      class="mt-3 text-center small text-muted"
      data-cy="submit-message"
    >
      {{ submitMessage }}
    </p>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'

defineOptions({ name: 'audio-player' })

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['timeupdate', 'ended', 'play', 'pause'])

const audioRef = ref(null)
const duration = ref(0)
const currentTime = ref(0)
const isPlaying = ref(false)

function onLoadedMetadata() {
  if (audioRef.value) {
    duration.value = audioRef.value.duration || 0
  }
}

function onTimeUpdate() {
  if (!audioRef.value) return
  currentTime.value = audioRef.value.currentTime
  emit('timeupdate', audioRef.value.currentTime)
}

function onPlay() {
  isPlaying.value = true
  emit('play')
}

function onPause() {
  isPlaying.value = false
  emit('pause')
}

function onEnded() {
  isPlaying.value = false
  emit('ended')
}

function togglePlay() {
  if (!audioRef.value) return
  if (audioRef.value.paused) audioRef.value.play().catch(() => {})
  else audioRef.value.pause()
}

function formatTime(t) {
  const secs = Math.max(0, Math.floor(t))
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

watch(
  () => props.src,
  () => {
    currentTime.value = 0
    duration.value = 0
  }
)

function pause() {
  audioRef.value?.pause()
}

function play() {
  audioRef.value?.play().catch(() => {})
}

defineExpose({ audioRef, play, pause })
</script>

<template>
  <div class="audio-player card shadow-sm" data-cy="audio-player">
    <div class="card-body">
      <audio
        id="my-audio"
        ref="audioRef"
        :src="src"
        controls
        preload="metadata"
        class="w-100"
        data-cy="audio-element"
        @loadedmetadata="onLoadedMetadata"
        @timeupdate="onTimeUpdate"
        @play="onPlay"
        @pause="onPause"
        @ended="onEnded"
      />
      <div class="d-flex justify-content-between align-items-center mt-2 small text-muted">
        <span data-cy="audio-current-time">{{ formatTime(currentTime) }}</span>
        <button
          type="button"
          class="btn btn-sm btn-primary"
          data-cy="audio-toggle"
          @click="togglePlay"
        >
          {{ isPlaying ? '&#9208; Pausa' : '&#9654; Reproducir' }}
        </button>
        <span data-cy="audio-duration">{{ formatTime(duration) }}</span>
      </div>
    </div>
  </div>
</template>

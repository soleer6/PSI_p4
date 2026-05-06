<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  song: { type: Object, default: null },
  stopAudio: { type: Boolean, default: false },
});

const emit = defineEmits(["onTimeUpdate"]);

const audioEl = ref(null);

watch(
  () => props.stopAudio,
  (val) => {
    if (!audioEl.value) return;
    if (val) {
      audioEl.value.pause();
    } else {
      audioEl.value.play().catch(() => {});
    }
  }
);

function onTimeUpdate() {
  if (audioEl.value) emit("onTimeUpdate", audioEl.value.currentTime);
}
</script>

<template>
  <div class="my-3">
    <audio
      v-if="song"
      id="my-audio"
      ref="audioEl"
      controls
      :src="song.audio_file"
      @timeupdate="onTimeUpdate"
    ></audio>
  </div>
</template>

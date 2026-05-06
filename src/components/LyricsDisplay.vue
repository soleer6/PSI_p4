<script setup>
import { ref, reactive, computed, watch } from "vue";
import { parseLrc } from "@/utils/lrcParser";

const props = defineProps({
  song: { type: Object, default: null },
  lrcContent: { type: String, default: null },
  onTimeUpdate: { type: Number, default: 0 },
});

const emit = defineEmits(["stopAudio", "startAudio", "summary"]);

const lines = computed(() =>
  props.lrcContent ? parseLrc(props.lrcContent) : []
);
const blankIndices = computed(() =>
  lines.value.map((l, i) => (l.blank !== null ? i : -1)).filter((i) => i >= 0)
);

const displayLineIdx = ref(-1);
const answeredSet = reactive(new Set());
const waitingForAnswer = ref(false);
const correctCount = ref(0);
const wrongCount = ref(0);
const summaryShown = ref(false);
const inputVal = ref("");

const prevLine = computed(() =>
  displayLineIdx.value > 0 ? lines.value[displayLineIdx.value - 1] : null
);
const curLine = computed(() =>
  displayLineIdx.value >= 0 ? lines.value[displayLineIdx.value] : null
);
const nextLine = computed(() =>
  displayLineIdx.value >= 0 && displayLineIdx.value + 1 < lines.value.length
    ? lines.value[displayLineIdx.value + 1]
    : null
);
const showInput = computed(
  () =>
    !summaryShown.value &&
    curLine.value !== null &&
    curLine.value.blank !== null &&
    !answeredSet.has(displayLineIdx.value)
);

function checkSummary() {
  if (
    blankIndices.value.length > 0 &&
    blankIndices.value.every((i) => answeredSet.has(i))
  ) {
    summaryShown.value = true;
    emit("summary", { correct: correctCount.value, wrong: wrongCount.value });
  }
}

watch(
  () => props.onTimeUpdate,
  (t) => {
    if (summaryShown.value || waitingForAnswer.value) return;

    // Determine which line index corresponds to time t
    let idx = -1;
    for (let i = 0; i < lines.value.length; i++) {
      if (lines.value[i].time <= t) idx = i;
      else break;
    }
    if (idx < 0) return;

    // Advance displayLineIdx toward idx, pausing at unanswered blanks
    while (displayLineIdx.value < idx) {
      const guard =
        displayLineIdx.value >= 0 ? lines.value[displayLineIdx.value] : null;
      if (
        guard &&
        guard.blank !== null &&
        !answeredSet.has(displayLineIdx.value)
      ) {
        // Current line has unanswered blank — pause before advancing
        waitingForAnswer.value = true;
        emit("stopAudio", true);
        return;
      }
      displayLineIdx.value += 1;
    }
  }
);

// Reset when song or LRC content changes
watch(
  () => [props.song?.id, props.lrcContent],
  () => {
    displayLineIdx.value = -1;
    answeredSet.clear();
    waitingForAnswer.value = false;
    correctCount.value = 0;
    wrongCount.value = 0;
    summaryShown.value = false;
    inputVal.value = "";
  }
);

function submitAnswer() {
  if (!showInput.value) return;
  const answer = inputVal.value.trim().toLowerCase();
  const expected = (curLine.value.blank || "").trim().toLowerCase();
  inputVal.value = "";

  if (answer === expected) {
    correctCount.value += 1;
    answeredSet.add(displayLineIdx.value);
    waitingForAnswer.value = false;
    checkSummary();
    if (!summaryShown.value) emit("startAudio");
  } else {
    wrongCount.value += 1;
    // Pause (may already be paused if line ended without answer)
    waitingForAnswer.value = true;
    emit("stopAudio", true);
  }
}

function skip() {
  if (!showInput.value) return;
  wrongCount.value += 1;
  answeredSet.add(displayLineIdx.value);
  inputVal.value = "";
  waitingForAnswer.value = false;
  checkSummary();
  if (!summaryShown.value) emit("startAudio");
}
</script>

<template>
  <div>
    <div v-if="song && lines.length" class="lyrics-display mb-3">
      <div class="lyric-line prev text-muted small">
        {{ prevLine ? prevLine.text : "" }}
      </div>
      <div class="lyric-line current fw-bold fs-5 text-primary">
        {{ curLine ? curLine.text : "…" }}
      </div>
      <div class="lyric-line next text-muted small">
        {{ nextLine ? nextLine.text : "" }}
      </div>
    </div>

    <div v-if="showInput" class="d-flex gap-2 align-items-center mt-3">
      <input
        v-model="inputVal"
        class="form-control w-auto"
        data-cy="blankInput"
        type="text"
        placeholder="Type the missing word…"
        autofocus
        @keyup.enter="submitAnswer"
      />
      <button class="btn btn-warning" data-cy="skip" @click="skip">Skip</button>
    </div>

    <div v-if="summaryShown" class="alert alert-info mt-4 fs-5">
      Correct answers: {{ correctCount }} - Wrong answers: {{ wrongCount }}
    </div>
  </div>
</template>

<style scoped>
.lyrics-display {
  border-left: 4px solid #0d6efd;
  padding: 0.5rem 1rem;
}
.lyric-line {
  min-height: 1.5rem;
}
</style>

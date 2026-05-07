<script setup>
import { computed, ref } from 'vue'
import { activeLineIndex, wordsEqual } from '@/utils/lrcParser'

defineOptions({ name: 'lyrics-display' })

const props = defineProps({
  lines: {
    type: Array,
    required: true,
  },
  currentTime: {
    type: Number,
    default: 0,
  },
  gapState: {
    type: Object,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['gap-input', 'gap-submit'])

const containerRef = ref(null)
const activeIdx = computed(() =>
  activeLineIndex(props.lines, props.currentTime)
)

const gapNumbers = computed(() => {
  const map = {}
  let count = 0
  props.lines.forEach((line, idx) => {
    if (line.gap != null) {
      count += 1
      map[idx] = count
    }
  })
  return { map, total: count }
})

function gapAriaLabel(lineIdx) {
  const { map, total } = gapNumbers.value
  const n = map[lineIdx]
  if (!n || !total) return `Hueco línea ${lineIdx + 1}`
  return `Hueco ${n} de ${total}`
}

function onInput(lineIdx, event) {
  emit('gap-input', { lineIdx, value: event.target.value })
}

function onEnter(lineIdx, correctWord) {
  emit('gap-submit', { lineIdx, correctWord })
}

function gapStatus(lineIdx) {
  return props.gapState[lineIdx]?.status || 'pending'
}

function gapValue(lineIdx) {
  return props.gapState[lineIdx]?.value || ''
}

function gapInputClass(lineIdx) {
  const status = gapStatus(lineIdx)
  return [
    'gap-input',
    status === 'correct' ? 'correct' : '',
    status === 'wrong' ? 'wrong' : '',
    status === 'skipped' ? 'skipped' : '',
  ]
}

function gapWidth(word) {
  const chars = Math.max(3, (word || '').length)
  return `${chars + 1}ch`
}

function isGapDisabled(lineIdx) {
  if (props.disabled) return true
  const st = gapStatus(lineIdx)
  return st === 'correct' || st === 'skipped'
}

function shouldAutofocus(idx) {
  return idx === activeIdx.value
}

// Sólo el primer hueco pendiente/wrong lleva data-cy="blankInput"
const activeGapIdx = computed(() => {
  for (let i = 0; i < props.lines.length; i++) {
    const line = props.lines[i]
    if (line.gap == null) continue
    const gs = props.gapState[i]
    if (!gs || gs.status === 'pending' || gs.status === 'wrong') return i
  }
  return -1
})

function gapDataCy(idx) {
  return idx === activeGapIdx.value ? 'blankInput' : `blankInput-${idx}`
}

// Ventana de 3 líneas: anterior / actual / siguiente
const visibleRange = computed(() => {
  const total = props.lines.length
  if (total === 0) return { start: 0, end: -1 }

  const center = activeIdx.value < 0 ? 0 : activeIdx.value
  let start = Math.max(0, center - 1)
  let end = Math.min(total - 1, center + 1)

  const gapIdx = activeGapIdx.value
  if (gapIdx >= 0) {
    if (gapIdx < start) start = gapIdx
    if (gapIdx > end) end = gapIdx
  }

  if (total >= 3) {
    while (end - start < 2 && end < total - 1) end += 1
    while (end - start < 2 && start > 0) start -= 1
  }

  return { start, end }
})

const visibleLines = computed(() => {
  const { start, end } = visibleRange.value
  const out = []
  for (let i = start; i <= end; i++) {
    out.push({ line: props.lines[i], idx: i })
  }
  return out
})

defineExpose({ wordsEqual })
</script>

<template>
  <div
    ref="containerRef"
    class="lyrics-display card shadow-sm"
    data-cy="lyrics-display"
  >
    <div class="card-body lyrics-window">
      <p
        v-for="entry in visibleLines"
        :key="`line-${entry.idx}`"
        :class="['lyrics-line', entry.idx === activeIdx ? 'active' : '']"
        :data-line-idx="entry.idx"
        :data-cy="`lyrics-line-${entry.idx}`"
      >
        <template
          v-for="(seg, sIdx) in entry.line.segments"
          :key="`seg-${entry.idx}-${sIdx}`"
        >
          <span v-if="seg.type === 'text'">{{ seg.value }}</span>
          <input
            v-else
            :value="gapValue(entry.idx)"
            type="text"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            :class="gapInputClass(entry.idx)"
            :style="{ width: gapWidth(seg.value) }"
            :disabled="isGapDisabled(entry.idx)"
            :aria-label="gapAriaLabel(entry.idx)"
            :data-cy="gapDataCy(entry.idx)"
            :data-gap-idx="entry.idx"
            :data-gap-correct="seg.value"
            :autofocus="shouldAutofocus(entry.idx)"
            @input="onInput(entry.idx, $event)"
            @keyup.enter="onEnter(entry.idx, seg.value)"
          >
        </template>
      </p>

      <p
        v-if="!lines.length"
        class="text-muted"
        data-cy="lyrics-empty"
      >
        No hay letra disponible para esta cancion.
      </p>
    </div>
  </div>
</template>

<style scoped>
.lyrics-window {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 11rem;
  justify-content: center;
}
.lyrics-line {
  margin: 0;
  text-align: center;
}
</style>

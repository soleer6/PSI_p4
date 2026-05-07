/**
 * Parser LRC para SongProject.
 *
 * Formato soportado:
 *   - Cabecera opcional tipo [ti:título], [ar:artista], [length:mm:ss]
 *   - Líneas con timestamp [mm:ss.xx]Texto
 *   - Huecos marcados con {palabra} que el usuario debe rellenar
 *   - Máximo un hueco por línea
 *
 * Salida:
 *   {
 *     metadata: { ti, ar, length, ... },
 *     lines: [
 *       {
 *         time: 11.33,              // en segundos
 *         rawText: "Cowboys don't cry, and {heroes} don't die",
 *         segments: [
 *           { type: 'text', value: "Cowboys don't cry, and " },
 *           { type: 'gap',  value: 'heroes' },
 *           { type: 'text', value: " don't die" },
 *         ],
 *         gap: 'heroes' | null,
 *         plainText: "Cowboys don't cry, and heroes don't die",
 *       },
 *       ...
 *     ]
 *   }
 */

const TIMESTAMP_RE = /^\[(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?\]/
const META_RE = /^\[([a-zA-Z][a-zA-Z0-9_-]*)\s*:\s*([^\]]*)\]$/

export function parseLrc(raw) {
  const metadata = {}
  const lines = []

  if (!raw || typeof raw !== 'string') {
    return { metadata, lines }
  }

  const rawLines = raw.split(/\r?\n/)

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim()
    if (!trimmed) continue

    if (!TIMESTAMP_RE.test(trimmed)) {
      const metaMatch = trimmed.match(META_RE)
      if (metaMatch) {
        metadata[metaMatch[1].toLowerCase()] = metaMatch[2].trim()
      }
      continue
    }

    const tsMatch = trimmed.match(TIMESTAMP_RE)
    if (!tsMatch) continue

    const minutes = parseInt(tsMatch[1], 10)
    const seconds = parseInt(tsMatch[2], 10)
    const fracRaw = tsMatch[3] || '0'
    const frac = parseFloat(`0.${fracRaw}`)
    const time = minutes * 60 + seconds + frac

    const text = trimmed.slice(tsMatch[0].length)
    const segments = tokenizeLine(text)
    const gap = findGap(segments)
    const plainText = segments
      .map((s) => s.value)
      .join('')
      .trim()

    lines.push({
      time,
      rawText: text,
      segments,
      gap,
      plainText,
    })
  }

  lines.sort((a, b) => a.time - b.time)

  return { metadata, lines }
}

function tokenizeLine(text) {
  const segments = []
  let i = 0
  let buffer = ''

  while (i < text.length) {
    const ch = text[i]
    if (ch === '{') {
      const close = text.indexOf('}', i)
      if (close === -1) {
        buffer += ch
        i += 1
        continue
      }
      if (buffer) {
        segments.push({ type: 'text', value: buffer })
        buffer = ''
      }
      const gapValue = text.slice(i + 1, close)
      segments.push({ type: 'gap', value: gapValue })
      i = close + 1
    } else {
      buffer += ch
      i += 1
    }
  }

  if (buffer) {
    segments.push({ type: 'text', value: buffer })
  }

  return segments
}

function findGap(segments) {
  const gap = segments.find((s) => s.type === 'gap')
  return gap ? gap.value : null
}

/**
 * Dado un array de lines y un currentTime (s),
 * devuelve el índice de la línea activa (última cuya time <= currentTime)
 * o -1 si aún no ha empezado ninguna.
 */
export function activeLineIndex(lines, currentTime) {
  if (!Array.isArray(lines) || lines.length === 0) return -1
  let idx = -1
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].time <= currentTime) idx = i
    else break
  }
  return idx
}

/**
 * Comparación tolerante: ignora mayúsculas, acentos, espacios y puntuación.
 */
export function wordsEqual(a, b) {
  if (a == null || b == null) return false
  const normalize = (s) =>
    String(s)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[.,!?¿¡;:"'`]/g, '')
      .trim()
  return normalize(a) === normalize(b)
}

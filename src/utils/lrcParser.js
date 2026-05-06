/**
 * Parse an LRC string into an array of line objects.
 *
 * Each returned object:
 *   { time: Number (seconds), text: String, blank: String|null }
 *
 * Metadata tags ([ti:...] etc.) and lines without a valid timestamp are ignored.
 * Only lines with a single {word} blank are supported.
 */
export function parseLrc(lrc) {
  const lines = [];
  const timeRe = /^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)$/;

  for (const raw of lrc.split("\n")) {
    const m = raw.trim().match(timeRe);
    if (!m) continue;

    const minutes = parseInt(m[1], 10);
    const seconds = parseInt(m[2], 10);
    const centis =
      m[3].length === 2 ? parseInt(m[3], 10) / 100 : parseInt(m[3], 10) / 1000;
    const time = minutes * 60 + seconds + centis;

    const content = m[4];
    const blankMatch = content.match(/\{([^}]+)\}/);
    const blank = blankMatch ? blankMatch[1] : null;
    const text = content.replace(/\{([^}]+)\}/, "_____");

    lines.push({ time, text, blank });
  }

  return lines;
}

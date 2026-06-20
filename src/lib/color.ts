/** Convert a hex color to an "r, g, b" string for use in rgba(). */
export function hexToRgb(hex: string): string {
  let h = hex.replace("#", "").trim()
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("")
  }
  const num = Number.parseInt(h, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `${r}, ${g}, ${b}`
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)))
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")}`
}

function hslToHex(h: number, s: number, l: number): string {
  const sat = s / 100
  const light = l / 100
  const c = (1 - Math.abs(2 * light - 1)) * sat
  const hp = h / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  let [r1, g1, b1] = [0, 0, 0]

  if (hp >= 0 && hp < 1) [r1, g1, b1] = [c, x, 0]
  else if (hp < 2) [r1, g1, b1] = [x, c, 0]
  else if (hp < 3) [r1, g1, b1] = [0, c, x]
  else if (hp < 4) [r1, g1, b1] = [0, x, c]
  else if (hp < 5) [r1, g1, b1] = [x, 0, c]
  else [r1, g1, b1] = [c, 0, x]

  const m = light - c / 2
  return rgbToHex((r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255)
}

export function hashString(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function tagToHex(tag: string): string {
  const h = hashString(tag.toLowerCase().trim()) % 360
  return hslToHex(h, 72, 56)
}

export function readableTextColor(hex: string): string {
  const rgb = hexToRgb(hex).split(",").map((v) => Number(v.trim()))
  const [r, g, b] = rgb
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return luminance > 0.6 ? "#111425" : "#ffffff"
}

export function mixHexColors(hexes: string[]): string {
  const valid = hexes.filter(Boolean)
  if (!valid.length) return "#5b8cff"
  const totals = valid.reduce(
    (acc, hex) => {
      const [r, g, b] = hexToRgb(hex).split(",").map((v) => Number(v.trim()))
      acc.r += r
      acc.g += g
      acc.b += b
      return acc
    },
    { r: 0, g: 0, b: 0 },
  )
  return rgbToHex(totals.r / valid.length, totals.g / valid.length, totals.b / valid.length)
}

export function resolveAppAccent(app: { accent: string; tags: string[] }): string {
  if (app.tags.length) return mixHexColors(app.tags.map(tagToHex))
  return app.accent || "#5b8cff"
}

/** Build the full accent CSS variable set from a single hex color. */
export function accentVars(hex: string): Record<string, string> {
  const rgb = hexToRgb(hex)
  return {
    "--accent": hex,
    "--accent-soft": `rgba(${rgb}, 0.16)`,
    "--accent-glow": `rgba(${rgb}, 0.4)`,
    "--accent-rgb": rgb,
  }
}

export function tagTheme(tag: string) {
  const hex = tagToHex(tag)
  return {
    hex,
    rgb: hexToRgb(hex),
    text: readableTextColor(hex),
  }
}

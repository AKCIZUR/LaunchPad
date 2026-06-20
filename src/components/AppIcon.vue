<script setup lang="ts">
import { computed, ref } from "vue"
import { hexToRgb } from "@/lib/color"
import type { AppEntry } from "@/types"

const props = defineProps<{ app: AppEntry; size?: number }>()

const dim     = computed(() => props.size ?? 80)
const rgb     = computed(() => hexToRgb(props.app.accent))
const initial = computed(() => props.app.name.charAt(0).toUpperCase())
const radius  = computed(() => `${Math.round(dim.value * 0.225)}px`)

// Derive domain from URL
const domain = computed(() => {
  try { return new URL(props.app.url).hostname.replace(/^www\./, "") }
  catch { return props.app.url }
})

// Curated HD icons — all transparent-background PNGs/SVGs
// Sources: official brand assets, Wikipedia SVG exports (512px), icon.horse overrides
const curatedIcons: Record<string, string> = {
  // Official transparent SVGs → rendered as sharp PNG by browser
  spotify:  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/512px-Spotify_logo_without_text.svg.png",
  figma:    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Figma-logo.svg/400px-Figma-logo.svg.png",
  slack:    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/512px-Slack_icon_2019.svg.png",
  github:   "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Octicons-mark-github.svg/512px-Octicons-mark-github.svg.png",
  notion:   "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/512px-Notion-logo.svg.png",
  linear:   "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Linear_app_logo.svg/512px-Linear_app_logo.svg.png",
  youtube:  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/512px-YouTube_full-color_icon_%282017%29.svg.png",
  gmail:    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/512px-Gmail_icon_%282020%29.svg.png",
  discord:  "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a69f118df70ad7828d4_icon_clyde_blurple_RGB.svg",
  vercel:   "https://assets.vercel.com/image/upload/front/favicon/vercel/512x512.png",
  x:        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/X_icon_2.svg/512px-X_icon_2.svg.png",
  maps:     "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Google_Maps_icon_%282020%29.svg/512px-Google_Maps_icon_%282020%29.svg.png",
  arc:      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Arc_%28browser%29_logo.svg/512px-Arc_%28browser%29_logo.svg.png",
  calendar: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/512px-Google_Calendar_icon_%282020%29.svg.png",
}

// Priority: curated → icon.horse (domain-based 512px PNG) → Clearbit → Google favicon
const tryOrder = computed<string[]>(() => {
  const sources: string[] = []
  if (curatedIcons[props.app.id]) sources.push(curatedIcons[props.app.id])
  sources.push(`https://icon.horse/icon/${domain.value}`)
  sources.push(`https://logo.clearbit.com/${domain.value}`)
  sources.push(`https://www.google.com/s2/favicons?domain=${domain.value}&sz=128`)
  return sources
})

const srcIndex = ref(0)
const imgFailed = ref(false)

const iconSrc = computed(() =>
  srcIndex.value < tryOrder.value.length ? tryOrder.value[srcIndex.value] : null
)

function onError() {
  srcIndex.value += 1
  if (srcIndex.value >= tryOrder.value.length) imgFailed.value = true
}
</script>

<template>
  <div
    class="icon"
    :style="{
      width:        `${dim}px`,
      height:       `${dim}px`,
      '--c-rgb':    rgb,
    }"
    aria-hidden="true"
  >
    <!-- HD icon image — contained strictly in the 1:1 square -->
    <img
      v-if="!imgFailed && iconSrc"
      :src="iconSrc"
      :alt="app.name"
      class="icon-img"
      draggable="false"
      @error="onError"
    />
    <!-- Letter fallback if every source fails -->
    <span
      v-else
      class="glyph"
      :style="{
        fontSize:     `${Math.round(dim * 0.44)}px`,
        borderRadius: radius,
        background:   `linear-gradient(145deg, rgba(${rgb},1) 0%, rgba(${rgb},0.55) 100%)`,
      }"
    >{{ initial }}</span>
  </div>
</template>

<style scoped>
/* Strict 1:1 square — clips image to exact bounds, no overflow */
.icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  position: relative;
  /* Clip any image that tries to escape the square */
  overflow: hidden;
}

/* Image fills the square exactly, padded 10% so logos breathe */
.icon-img {
  width: 80%;
  height: 80%;
  object-fit: contain;
  display: block;
  user-select: none;
  /* shadow on image not wrapper — won't bleed outside the cell */
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.28));
}

/* Letter fallback */
.glyph {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  font-family: var(--font-sans);
  font-weight: 750;
  letter-spacing: -0.02em;
  color: #fff;
  text-shadow:
    0 1px 3px rgba(0, 0, 0, 0.32),
    0 3px 8px rgba(0, 0, 0, 0.18);
}
</style>

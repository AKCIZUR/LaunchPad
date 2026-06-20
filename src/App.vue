<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import AmbientBackground from "./components/AmbientBackground.vue"
import AppGrid from "./components/AppGrid.vue"
import TagDock from "./components/TagDock.vue"
import SearchOverlay from "./components/SearchOverlay.vue"
import SettingsModal from "./components/SettingsModal.vue"
import AppModal from "./components/AppModal.vue"
import UiIcon from "./components/UiIcon.vue"
import { useApps } from "./composables/useApps"
import { accentVars, mixHexColors, resolveAppAccent, tagToHex } from "./lib/color"
import type { AppEntry } from "./types"

const { apps, allTags, filterBy } = useApps()

type Theme = "dark" | "light"
type Language = "cz" | "en"

const selectedTags = ref<string[]>([])
const searchOpen = ref(false)
const searchQuery = ref("")
const selected = ref<AppEntry | null>(null)
const hoveredApp = ref<AppEntry | null>(null)
const tagsMenuOpen = ref(false)
const settingsOpen = ref(false)
const theme = ref<Theme>((localStorage.getItem("airmode-theme") as Theme | null) ?? "dark")
const language = ref<Language>((localStorage.getItem("airmode-language") as Language | null) ?? "cz")
const iconSize = ref(Number(localStorage.getItem("airmode-icon-size") ?? 80))
const gridMin = ref(Number(localStorage.getItem("airmode-grid-min") ?? 112))

const now = ref(new Date())
let clockTimer: number

const gridApps = computed(() => filterBy("", selectedTags.value))
const searchResults = computed(() => filterBy(searchQuery.value, selectedTags.value))
const locale = computed(() => (language.value === "cz" ? "cs-CZ" : "en-US"))

const ui = computed(() => {
  if (language.value === "cz") {
    return {
      search: "Hledat",
      settings: "Nastavení",
      searchPlaceholder: "Hledej aplikace…",
      hintSearch: "⌘K pro hledání",
      hintSettings: "Settings otevírá modal",
      noApps: "Žádná aplikace",
      noAppsHint: "Zkus jiný název nebo štítek.",
      week: "Týden",
      dayOfYear: "Den",
      yearSuffix: "v roce",
    }
  }
  return {
    search: "Search",
    settings: "Settings",
    searchPlaceholder: "Search apps…",
    hintSearch: "⌘K for search",
    hintSettings: "Settings opens the modal",
    noApps: "No apps",
    noAppsHint: "Try a different name or tag.",
    week: "Week",
    dayOfYear: "Day",
    yearSuffix: "of year",
  }
})

const timeLabelWithSeconds = computed(() =>
  now.value.toLocaleTimeString(locale.value, { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
)
const dateLabel = computed(() =>
  new Intl.DateTimeFormat(locale.value, { day: "2-digit", month: "long", year: "numeric" }).format(now.value),
)
const weekdayLabel = computed(() =>
  new Intl.DateTimeFormat(locale.value, { weekday: "long" }).format(now.value),
)
const weekNumberLabel = computed(() => `${ui.value.week} ${getISOWeek(now.value)}`)
const dayOfYearLabel = computed(() => {
  const day = getDayOfYear(now.value)
  return `${ui.value.dayOfYear} ${day} ${ui.value.yearSuffix}`
})
const timezoneLabel = computed(() => {
  const offsetMinutes = -now.value.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? "+" : "-"
  const abs = Math.abs(offsetMinutes)
  const hours = String(Math.floor(abs / 60)).padStart(2, "0")
  const minutes = String(abs % 60).padStart(2, "0")
  return `UTC${sign}${hours}:${minutes}`
})

const activeAccent = computed(() => {
  if (selectedTags.value.length) return mixHexColors(selectedTags.value.map(tagToHex))
  if (selected.value) return resolveAppAccent(selected.value)
  if (hoveredApp.value) return resolveAppAccent(hoveredApp.value)
  return apps.value[0]?.accent ?? "#5b8cff"
})

function getISOWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

function getDayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / 86400000)
}

watch(
  activeAccent,
  (hex) => {
    const vars = accentVars(hex)
    const root = document.documentElement
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
  },
  { immediate: true },
)

watch(
  theme,
  (t) => {
    document.documentElement.setAttribute("data-theme", t)
    document.documentElement.style.colorScheme = t
    localStorage.setItem("airmode-theme", t)
  },
  { immediate: true },
)

watch(language, (value) => {
  localStorage.setItem("airmode-language", value)
})
watch(iconSize, (value) => {
  localStorage.setItem("airmode-icon-size", String(value))
})
watch(gridMin, (value) => {
  localStorage.setItem("airmode-grid-min", String(value))
})

function focusApp(app: AppEntry) {
  hoveredApp.value = app
}

function toggleTag(tag: string) {
  const idx = selectedTags.value.indexOf(tag)
  if (idx >= 0) selectedTags.value.splice(idx, 1)
  else selectedTags.value.push(tag)
}

function clearTags() {
  selectedTags.value = []
}

function openApp(app: AppEntry) {
  selected.value = app
  hoveredApp.value = app
  searchOpen.value = false
  tagsMenuOpen.value = false
  settingsOpen.value = false
}

function openSettings() {
  settingsOpen.value = true
  searchOpen.value = false
  tagsMenuOpen.value = false
}

function openSearch() {
  searchOpen.value = true
  settingsOpen.value = false
  tagsMenuOpen.value = false
}

function closeAllPanels() {
  searchOpen.value = false
  settingsOpen.value = false
  tagsMenuOpen.value = false
}

function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault()
    searchOpen.value = !searchOpen.value
    if (searchOpen.value) {
      settingsOpen.value = false
      tagsMenuOpen.value = false
    }
    return
  }
  if (e.key === "Escape") {
    if (selected.value) selected.value = null
    else if (searchOpen.value) searchOpen.value = false
    else if (settingsOpen.value) settingsOpen.value = false
    else if (tagsMenuOpen.value) tagsMenuOpen.value = false
    return
  }
  if (searchOpen.value || selected.value || tagsMenuOpen.value || settingsOpen.value) return
  const tag = (e.target as HTMLElement)?.tagName
  if (tag === "INPUT" || tag === "TEXTAREA") return
}

onMounted(() => {
  window.addEventListener("keydown", onKeydown)
  clockTimer = window.setInterval(() => (now.value = new Date()), 1000)
})
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown)
  window.clearInterval(clockTimer)
})
</script>

<template>
  <div class="app">
    <AmbientBackground />

    <section class="status-bar" aria-label="Časové informace">
      <div class="status-side status-left">
        <span class="status-item">{{ weekdayLabel }}</span>
        <span class="status-sep">·</span>
        <span class="status-item">{{ dateLabel }}</span>
      </div>
      <div class="status-center">
        <span class="status-clock">{{ timeLabelWithSeconds }}</span>
      </div>
      <div class="status-side status-right">
        <span class="status-item">{{ weekNumberLabel }}</span>
        <span class="status-sep">·</span>
        <span class="status-item">{{ dayOfYearLabel }}</span>
        <span class="status-sep">·</span>
        <span class="status-item">{{ timezoneLabel }}</span>
      </div>
    </section>

    <main class="shell">
      <header class="topbar">
        <div class="brand">
          <span class="dot" />
          <span class="wordmark">AirMode</span>
        </div>
        <div class="actions">
          <button class="pill-trigger search-trigger" @click="openSearch">
            <UiIcon name="search" :size="16" />
            <span>{{ ui.search }}</span>
            <kbd>⌘K</kbd>
          </button>
          <button class="pill-trigger settings-trigger icon-only" :aria-label="ui.settings" @click="openSettings">
            <UiIcon name="wrench" :size="18" />
          </button>
        </div>
      </header>

      <div class="dock-wrap">
        <TagDock
          :tags="allTags"
          :selected="selectedTags"
          v-model:mobileOpen="tagsMenuOpen"
          @toggle="toggleTag"
          @clear="clearTags"
        />
      </div>

      <section class="grid-wrap">
        <AppGrid :apps="gridApps" :icon-size="iconSize" :cell-min="gridMin" @open="openApp" @focus="focusApp" />
      </section>

      <footer class="hint">
        {{ ui.hintSearch }} · {{ ui.hintSettings }}
      </footer>
    </main>

    <SearchOverlay
      :open="searchOpen"
      :results="searchResults"
      :query="searchQuery"
      :placeholder="ui.searchPlaceholder"
      @update:query="searchQuery = $event"
      @open="openApp"
      @close="searchOpen = false"
    />

    <SettingsModal
      :open="settingsOpen"
      :theme="theme"
      :language="language"
      :icon-size="iconSize"
      :grid-min="gridMin"
      @update:open="settingsOpen = $event"
      @update:theme="theme = $event"
      @update:language="language = $event"
      @update:iconSize="iconSize = $event"
      @update:gridMin="gridMin = $event"
    />

    <AppModal
      :app="selected"
      :selected-tags="selectedTags"
      @toggle-tag="toggleTag"
      @clear-tags="clearTags"
      @close="selected = null"
    />
  </div>
</template>

<style scoped>
.app {
  position: relative;
  height: 100dvh;
  width: 100%;
}

.shell {
  position: relative;
  z-index: 1;
  height: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 56px clamp(18px, 4vw, 52px) 168px;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  margin-bottom: 12px;
}

.status-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
  height: 34px;
  padding: 0 max(16px, env(safe-area-inset-right)) 0 max(16px, env(safe-area-inset-left));
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  background: #000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.84);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
.status-side {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
}
.status-left { justify-content: flex-start; }
.status-center { display: flex; justify-content: center; padding: 0 12px; }
.status-right { justify-content: flex-end; }
.status-item,
.status-clock {
  text-overflow: ellipsis;
  overflow: hidden;
}
.status-clock {
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
}
.status-sep {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.26);
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 10px 2px var(--accent-glow);
  transition:
    background  var(--dur) var(--ease),
    box-shadow  var(--dur) var(--ease);
}
.wordmark {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.015em;
  color: var(--text);
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pill-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 16px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-muted);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.030)),
    rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.10),
    0 10px 24px -18px rgba(0, 0, 0, 0.38);
  transition:
    color        0.20s var(--ease),
    background   0.20s var(--ease),
    border-color 0.20s var(--ease),
    transform    0.20s var(--ease),
    box-shadow   0.20s var(--ease);
}
.pill-trigger:hover {
  color: var(--text);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.045)),
    rgba(255, 255, 255, 0.060);
  border-color: rgba(255, 255, 255, 0.16);
  transform: translateY(-1px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 14px 28px -20px rgba(0, 0, 0, 0.48);
}

:root[data-theme="light"] .status-bar {
  background: rgba(255, 255, 255, 0.90);
  color: rgba(17, 20, 35, 0.82);
  border-bottom-color: rgba(17, 20, 35, 0.08);
  box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.8);
}
:root[data-theme="light"] .status-clock {
  color: var(--text);
}
:root[data-theme="light"] .status-sep {
  color: rgba(17, 20, 35, 0.22);
}
:root[data-theme="light"] .wordmark {
  color: var(--text);
}
:root[data-theme="light"] .pill-trigger {
  color: var(--text-muted);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.72)),
    rgba(255, 255, 255, 0.66);
  border-color: rgba(17, 20, 35, 0.10);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.75),
    0 10px 24px -18px rgba(17, 20, 35, 0.20);
}
:root[data-theme="light"] .pill-trigger:hover {
  color: var(--text);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 248, 252, 0.90)),
    rgba(255, 255, 255, 0.86);
  border-color: rgba(17, 20, 35, 0.14);
}
:root[data-theme="light"] .pill-trigger kbd {
  color: var(--text-muted);
  background: rgba(17, 20, 35, 0.05);
  border-color: rgba(17, 20, 35, 0.08);
}
.pill-trigger.icon-only {
  width: 44px;
  padding: 0;
  justify-content: center;
}
.pill-trigger kbd,
.hint kbd {
  font-family: var(--font-mono);
  font-size: 9.5px;
  padding: 2px 6px;
  border-radius: 999px;
  color: var(--text-faint);
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.08);
  line-height: 1.5;
}

.dock-wrap {
  margin-top: auto;
  padding-top: 24px;
}

.grid-wrap {
  margin-top: 30px;
  flex: 1;
  min-height: 0;
}

.hint {
  margin-top: 18px;
  padding-bottom: 10px;
  text-align: center;
  font-size: 12px;
  color: var(--text-faint);
}

@media (max-width: 720px) {
  .shell {
    padding: 54px 16px 158px;
  }

  :root[data-theme="light"] .pill-trigger {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.78)),
      rgba(255, 255, 255, 0.72);
  }

  .actions {
    gap: 8px;
  }

  .search-trigger span,
  .search-trigger kbd {
    display: none;
  }

  .search-trigger {
    min-width: 44px;
    width: 44px;
    justify-content: center;
    padding: 0;
  }
}

@media (max-width: 540px) {
  .status-bar {
    font-size: 10px;
    height: 32px;
  }
  .status-right {
    gap: 6px;
  }
  .wordmark {
    display: none;
  }
  .shell {
    padding-top: 50px;
  }
  .grid-wrap {
    margin-top: 24px;
  }
}
</style>

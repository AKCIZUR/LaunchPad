<script setup lang="ts">
import { ref, watch, computed, nextTick } from "vue"
import { hexToRgb, resolveAppAccent } from "@/lib/color"
import AppIcon from "./AppIcon.vue"
import UiIcon from "./UiIcon.vue"
import type { AppEntry } from "@/types"

const props = defineProps<{ open: boolean; results: AppEntry[]; query: string; placeholder?: string }>()
const emit  = defineEmits<{
  (e: "update:query", value: string): void
  (e: "open",  app: AppEntry): void
  (e: "close"): void
}>()

const inputEl = ref<HTMLInputElement | null>(null)
const active  = ref(0)

watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    active.value = 0
    await nextTick()
    inputEl.value?.focus()
  }
})

watch(() => props.results, () => { active.value = 0 })

const hasResults = computed(() => props.results.length > 0)

function onKeydown(e: KeyboardEvent) {
  if (e.key === "ArrowDown") {
    e.preventDefault()
    active.value = Math.min(active.value + 1, props.results.length - 1)
    scrollActive()
  } else if (e.key === "ArrowUp") {
    e.preventDefault()
    active.value = Math.max(active.value - 1, 0)
    scrollActive()
  } else if (e.key === "Enter") {
    e.preventDefault()
    const app = props.results[active.value]
    if (app) emit("open", app)
  }
}

function scrollActive() {
  nextTick(() => {
    (document.querySelector(".result.active") as HTMLElement | null)
      ?.scrollIntoView({ block: "nearest" })
  })
}
</script>

<template>
  <Transition name="overlay">
    <div v-if="open" class="scrim" @click.self="emit('close')">
      <div
        class="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Hledat aplikace"
      >
        <div class="search-row">
          <UiIcon name="search" class="search-icon" :size="16" />
          <input
            ref="inputEl"
            :value="query"
            class="search-input"
            :placeholder="placeholder ?? 'Hledej aplikace…'"
            spellcheck="false"
            autocomplete="off"
            @input="emit('update:query', ($event.target as HTMLInputElement).value)"
            @keydown="onKeydown"
            @keydown.esc="emit('close')"
          />
          <kbd class="esc-key">esc</kbd>
        </div>

        <div v-if="hasResults" class="results">
          <button
            v-for="(app, i) in results"
            :key="app.id"
            class="result"
            :class="{ active: i === active }"
            :style="{ '--c-rgb': hexToRgb(resolveAppAccent(app)) }"
            @click="emit('open', app)"
            @mousemove="active = i"
          >
            <AppIcon :app="app" :size="36" />
            <div class="result-meta">
              <span class="result-name">{{ app.name }}</span>
              <span class="result-tagline">{{ app.tagline }}</span>
            </div>
            <div class="result-right">
              <span class="result-tag" v-if="app.tags[0]">{{ app.tags[0] }}</span>
              <UiIcon name="external-link" class="result-arrow" :size="12" />
            </div>
          </button>
        </div>

        <div v-else class="no-results">
          <span>Žádné výsledky pro</span>
          <em>&ldquo;{{ query }}&rdquo;</em>
        </div>

        <div class="footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> pohyb</span>
          <span><kbd>↵</kbd> otevřít</span>
          <span><kbd>esc</kbd> zavřít</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.scrim {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  justify-content: center;
  padding: 12vh 16px 16px;
  background: rgba(0, 0, 0, 0.34);
  backdrop-filter: blur(14px) saturate(150%);
  -webkit-backdrop-filter: blur(14px) saturate(150%);
}

.palette {
  width: min(640px, 92vw);
  height: fit-content;
  max-height: 66vh;
  display: flex;
  flex-direction: column;
  border-radius: 32px;
  background: rgba(13, 13, 21, 0.48);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 44px 96px -28px rgba(0, 0, 0, 0.58),
    0 12px 32px -12px rgba(0, 0, 0, 0.32),
    inset 0  1px  0   rgba(255, 255, 255, 0.12),
    inset 0 -1px  0   rgba(0, 0, 0, 0.12);
  overflow: hidden;
  will-change: transform, opacity;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 11px;
  margin: 12px 12px 8px;
  padding: 13px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.056);
  border: 1px solid rgba(255, 255, 255, 0.10);
  flex-shrink: 0;
}
.search-icon {
  color: var(--text-faint);
  flex-shrink: 0;
}
.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 15px;
  font-weight: 400;
  letter-spacing: -0.01em;
  caret-color: var(--accent);
}
.search-input::placeholder { color: var(--text-faint); }
.esc-key {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 3px 7px;
  border-radius: 999px;
  color: var(--text-faint);
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
  line-height: 1.5;
}

.results {
  overflow-y: auto;
  padding: 6px 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  -webkit-mask-image: linear-gradient(180deg, transparent, #000 8px, #000 calc(100% - 8px), transparent);
  mask-image: linear-gradient(180deg, transparent, #000 8px, #000 calc(100% - 8px), transparent);
}
.result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 999px;
  text-align: left;
  border: 1px solid transparent;
  transition: background 0.14s ease, border-color 0.14s ease, transform 0.14s ease;
}
.result.active {
  background: rgba(var(--c-rgb), 0.09);
  border-color: rgba(var(--c-rgb), 0.16);
}
.result-meta {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: 1px;
}
.result-name {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.01em;
}
.result-tagline {
  font-size: 11.5px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.result-right {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
}
.result-tag {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-faint);
  text-transform: capitalize;
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.07);
}
.result-arrow {
  color: rgba(var(--c-rgb), 0.85);
}
.result:hover { transform: translateY(-1px); }

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 34px 22px 28px;
  color: var(--text-muted);
  text-align: center;
}
.no-results em {
  color: var(--text);
  font-style: normal;
}
.footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px 14px 14px;
  font-size: 11px;
  color: var(--text-faint);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
}
.footer span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.footer kbd {
  font-family: var(--font-mono);
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 999px;
  color: var(--text-faint);
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(255, 255, 255, 0.08);
  line-height: 1.5;
}


:root[data-theme="light"] .scrim {
  background: rgba(10, 10, 28, 0.16);
}
:root[data-theme="light"] .palette {
  background: rgba(255, 255, 255, 0.90);
  border-color: rgba(17, 20, 35, 0.10);
  box-shadow:
    0 44px 96px -28px rgba(17, 20, 35, 0.22),
    0 12px 32px -12px rgba(17, 20, 35, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.90),
    inset 0 -1px 0 rgba(17, 20, 35, 0.08);
}
:root[data-theme="light"] .search-row,
:root[data-theme="light"] .result-tag,
:root[data-theme="light"] .esc-key {
  background: rgba(255, 255, 255, 0.86);
  border-color: rgba(17, 20, 35, 0.10);
}
:root[data-theme="light"] .search-input,
:root[data-theme="light"] .result-name,
:root[data-theme="light"] .footer,
:root[data-theme="light"] .no-results em {
  color: var(--text);
}
:root[data-theme="light"] .search-input::placeholder,
:root[data-theme="light"] .result-tagline,
:root[data-theme="light"] .result-tag,
:root[data-theme="light"] .no-results,
:root[data-theme="light"] .footer,
:root[data-theme="light"] .search-icon,
:root[data-theme="light"] .result-arrow {
  color: var(--text-muted);
}
:root[data-theme="light"] .result.active {
  background: rgba(var(--c-rgb), 0.08);
  border-color: rgba(var(--c-rgb), 0.16);
}
:root[data-theme="light"] .footer {
  border-top-color: rgba(17, 20, 35, 0.08);
  background: rgba(255, 255, 255, 0.72);
}
:root[data-theme="light"] .footer kbd,
:root[data-theme="light"] .esc-key,
:root[data-theme="light"] .result-tag {
  color: var(--text-muted);
}

@media (max-width: 520px) {
  .scrim {
    padding-top: 10vh;
  }

  .palette {
    width: min(100vw - 20px, 640px);
    border-radius: 26px;
  }

  .search-row {
    margin: 10px 10px 8px;
    padding: 12px 14px;
  }

  .result {
    padding: 9px 12px;
  }
}

.overlay-enter-active { transition: opacity 0.26s var(--ease-out); }
.overlay-leave-active { transition: opacity 0.18s var(--ease-in); }
.overlay-enter-from,
.overlay-leave-to { opacity: 0; }
.overlay-enter-active .palette {
  transition: transform 0.32s var(--ease), opacity 0.26s var(--ease-out);
}
.overlay-leave-active .palette {
  transition: transform 0.20s var(--ease-in), opacity 0.18s var(--ease-in);
}
.overlay-enter-from .palette { transform: translateY(22px) scale(0.94); opacity: 0; }
.overlay-leave-to .palette { transform: translateY(10px) scale(0.97); opacity: 0; }
</style>
